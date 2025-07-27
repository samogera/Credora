
"use client";

import { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { ExplainRiskFactorsOutput } from '@/ai/flows/explain-risk-factors';
import { db, storage, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, query, where, getDocs, setDoc, deleteDoc, writeBatch, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged, User, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

// Types
export type LoanProduct = {
    id: string;
    name: string;
    rate: string;
    maxAmount: number;
    term: number;
    requirements?: string;
};

export type Partner = {
    id: string; // This will be the Firebase Auth UID
    name: string;
    logo: string;
    description: string;
    website: string;
    products: LoanProduct[];
};

export type LoanActivityItem = {
    id: string;
    user: {
        displayName: string;
    };
    amount: number;
    repaid?: number;
    interestAccrued?: number;
    status: 'Active' | 'Paid Off' | 'Delinquent';
    createdAt: Date;
};

export type Application = {
    id:string;
    userId: string;
    user: {
        displayName: string;
        avatarUrl?: string | null;
    };
    score: number;
    loan: {
        id: string;
        name: string;
        partnerName: string;
        partnerId: string;
    };
    amount: number;
    status: 'Pending' | 'Approved' | 'Denied';
    aiExplanation?: ExplainRiskFactorsOutput | null;
    isExplaining?: boolean;
    createdAt: any;
};

export type Notification = {
    id: string;
    for: 'user' | 'partner';
    userId: string; // ID of user (Firebase UID) or partner (Firebase UID)
    type: 'new_application' | 'approval' | 'denial' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
};

interface UserContextType {
    user: User | null;
    partner: Partner | null;
    isPartner: boolean;
    loading: boolean;
    logout: () => Promise<void>;
    partnerLogin: (email: string, pass: string) => Promise<void>;
    partnerSignup: (email: string, pass: string, name: string, website: string) => Promise<void>;
    avatarUrl: string | null;
    setAvatarUrl: (url: string) => void;
    applications: Application[];
    addApplication: (app: Omit<Application, 'id' | 'user' | 'userId' | 'score' | 'loan' | 'createdAt'> & { loan: Omit<Application['loan'], 'partnerId'>}) => Promise<void>;
    updateApplicationStatus: (id: string, status: 'Approved' | 'Denied') => void;
    partners: Partner[];
    partnerProfile: Omit<Partner, 'products' | 'description' | 'id'>;
    updatePartnerProfile: (profile: Partial<Omit<Partner, 'products' | 'description' | 'id'>>) => void;
    partnerProducts: LoanProduct[];
    addPartnerProduct: (product: Omit<LoanProduct, 'id'>) => void;
    removePartnerProduct: (id: string) => void;
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    markNotificationsAsRead: (role: 'user' | 'partner') => void;
    loanActivity: LoanActivityItem[];
}

export const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [partner, setPartner] = useState<Partner | null>(null);
    const [isPartner, setIsPartner] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const [avatarUrl, setAvatarUrlState] = useState<string | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loanActivity, setLoanActivity] = useState<LoanActivityItem[]>([]);
    
    const [partnerProfile, setPartnerProfileState] = useState<Omit<Partner, 'products' | 'description' | 'id'>>({ name: "", logo: "", website: ""});
    const [partnerProducts, setPartnerProducts] = useState<LoanProduct[]>([]);

     const setupAnonymousUser = useCallback(async () => {
        if (!auth.currentUser) {
            try {
                const cred = await signInAnonymously(auth);
                const userDocRef = doc(db, "users", cred.user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (!userDocSnap.exists()) {
                    await setDoc(userDocRef, {
                        displayName: `User #${cred.user.uid.substring(0, 4)}`,
                        avatarUrl: null,
                        createdAt: serverTimestamp()
                    });
                }
            } catch (error) {
                console.error("Anonymous sign-in failed: ", error);
            }
        }
    }, []);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                setUser(currentUser);
                const partnerDocRef = doc(db, "partners", currentUser.uid);
                const partnerDocSnap = await getDoc(partnerDocRef);
                if (partnerDocSnap.exists()) {
                    setIsPartner(true);
                    setPartner({ id: currentUser.uid, ...partnerDocSnap.data() } as Partner);
                } else {
                    setIsPartner(false);
                    setPartner(null);
                    if (currentUser.isAnonymous) {
                         const userDocRef = doc(db, "users", currentUser.uid);
                         const userDocSnap = await getDoc(userDocRef);
                         if (!userDocSnap.exists()) {
                            await setDoc(userDocRef, {
                                displayName: `User #${currentUser.uid.substring(0, 4)}`,
                                avatarUrl: null,
                                createdAt: serverTimestamp()
                            });
                         }
                    }
                }
            } else {
                setUser(null);
                setIsPartner(false);
                setPartner(null);
                await setupAnonymousUser();
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [setupAnonymousUser]);
    
    // Listener for all data - requires authenticated user
    useEffect(() => {
        if (loading) return;

        const unsubPartners = onSnapshot(collection(db, "partners"), async (snapshot) => {
            const partnerList: Partner[] = [];
            for (const pDoc of snapshot.docs) {
                const partnerData = pDoc.data();
                const productsRef = collection(db, "partners", pDoc.id, "products");
                const productsSnap = await getDocs(productsRef);
                const products = productsSnap.docs.map(prodDoc => ({id: prodDoc.id, ...prodDoc.data()}) as LoanProduct);
                partnerList.push({
                    id: pDoc.id,
                    ...partnerData,
                    products,
                } as Partner);
            }
            setPartners(partnerList);
        }, (error) => console.error("Partner listener error: ", error));

        let unsubUserApps: () => void = () => {};
        let unsubUser: () => void = () => {};
        let unsubPartnerProfile: () => void = () => {};
        let unsubPartnerProducts: () => void = () => {};
        let unsubPartnerApps: () => void = () => {};
        let unsubLoanActivity: () => void = () => {};


        if (isPartner && partner) {
             unsubPartnerProfile = onSnapshot(doc(db, "partners", partner.id), (doc) => {
                if(doc.exists()){
                    const data = doc.data();
                    setPartnerProfileState({name: data.name, logo: data.logo, website: data.website});
                }
            });

             unsubPartnerProducts = onSnapshot(collection(db, "partners", partner.id, "products"), (snapshot) => {
                 setPartnerProducts(snapshot.docs.map(d => ({id: d.id, ...d.data()}) as LoanProduct));
            });
            
             const partnerAppsQuery = query(collection(db, "applications"), where("loan.partnerId", "==", partner.id));
             unsubPartnerApps = onSnapshot(partnerAppsQuery, async (snapshot) => {
                const appPromises = snapshot.docs.map(async (d) => {
                    const appData = d.data() as Omit<Application, 'id'>;
                    const userSnap = await getDoc(doc(db, 'users', appData.userId));
                    const userData = userSnap.data();
                    return {
                        id: d.id,
                        ...appData,
                        user: {
                            displayName: userData?.displayName || 'Unknown User',
                            avatarUrl: userData?.avatarUrl || null,
                        }
                    } as Application;
                });
                const appsData = await Promise.all(appPromises);
                setApplications(appsData);
             }, (error) => console.error("Partner apps listener error: ", error));
             
             unsubLoanActivity = onSnapshot(collection(db, "loanActivity"), (snapshot) => {
                setLoanActivity(snapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt.toDate()}) as LoanActivityItem));
             }, (error) => console.error("Loan activity listener error: ", error));


        } else if(user && !isPartner) {
            const userAppsQuery = query(collection(db, "applications"), where("userId", "==", user.uid));
             unsubUserApps = onSnapshot(userAppsQuery, (snapshot) => {
                const appsData = snapshot.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt.toDate() } as Application));
                setApplications(appsData);
            }, (error) => console.error("User apps listener error: ", error));
            
             unsubUser = onSnapshot(doc(db, "users", user.uid), (doc) => {
                if (doc.exists()) {
                    setAvatarUrlState(doc.data().avatarUrl || null);
                }
            });
        }

        return () => { 
            unsubPartners();
            unsubUserApps();
            unsubUser();
            unsubPartnerProfile();
            unsubPartnerProducts();
            unsubPartnerApps();
            unsubLoanActivity();
        }
    }, [user, isPartner, partner, loading]);
    
    // Notifications listener
    useEffect(() => {
        if (!user) return;
        
        const relevantId = isPartner ? partner?.id : user.uid;
        if (!relevantId) return;

        const notifsQuery = query(collection(db, "notifications"), where("userId", "==", relevantId), where("for", "==", isPartner ? "partner" : "user"));
        const unsubNotifs = onSnapshot(notifsQuery, (snapshot) => {
            const allNotifs = snapshot.docs.map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp.toDate() } as Notification)).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
            setNotifications(allNotifs);
        }, (error) => console.error("Notifications listener error: ", error));

        return () => unsubNotifs();
    }, [user, isPartner, partner]);

    const setAvatarUrl = async (url: string) => {
        if (!user || user.isAnonymous) return;
        const userDocRef = doc(db, "users", user.uid);
        try {
            let downloadUrl = url;
            if (url.startsWith('data:image')) {
                const storageRef = ref(storage, `users/${user.uid}/avatar.png`);
                const snapshot = await uploadString(storageRef, url, 'data_url');
                downloadUrl = await getDownloadURL(snapshot.ref);
            }
            await updateDoc(userDocRef, { avatarUrl: downloadUrl });
            setAvatarUrlState(downloadUrl);
        } catch (error) {
            console.error("Error updating avatar:", error);
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not update your avatar.' });
        }
    }

    const addApplication = async (app: Omit<Application, 'id' | 'user' | 'userId' | 'score' | 'createdAt'>) => {
        if (!user || user.isAnonymous) {
            toast({ variant: 'destructive', title: 'Login Required', description: 'You must be logged in to apply.' });
            return;
        }
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
             toast({ variant: 'destructive', title: 'Error', description: 'User profile not found.' });
            return;
        }

        const targetPartner = partners.find(p => p.name === app.loan.partnerName);
        if (!targetPartner) {
            toast({ variant: 'destructive', title: 'Error', description: 'Lending partner not found.' });
            return;
        }
        
        const newApp = {
            ...app,
            score: Math.floor(Math.random() * (850 - 550 + 1)) + 550,
            userId: user.uid,
            user: {
                displayName: userDoc.data()?.displayName || `User #${user.uid.substring(0,4)}`,
                avatarUrl: userDoc.data()?.avatarUrl || null
            },
            loan: { ...app.loan, partnerId: targetPartner.id },
            createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "applications"), newApp);
    };

    const updateApplicationStatus = async (appId: string, status: 'Approved' | 'Denied') => {
        const appRef = doc(db, "applications", appId);
        const appToUpdate = applications.find(a => a.id === appId);
        if (!appToUpdate) return;
        
        await updateDoc(appRef, { status });

        if (status === 'Approved') {
            await addDoc(collection(db, 'loanActivity'), {
                user: { displayName: appToUpdate.user.displayName },
                amount: appToUpdate.amount,
                repaid: 0,
                interestAccrued: 0,
                status: 'Active',
                createdAt: new Date(),
                partnerId: appToUpdate.loan.partnerId,
                userId: appToUpdate.userId,
            });
        }
    };
    
    const updatePartnerProfile = async (profile: Partial<Omit<Partner, 'products' | 'description' | 'id'>>) => {
        if (!partner) return;
        const partnerRef = doc(db, "partners", partner.id);

        try {
            let profileToUpdate = {...profile};
            if (profile.logo && profile.logo.startsWith('data:image')) {
                const storageRef = ref(storage, `partners/${partner.id}/logo.png`);
                const snapshot = await uploadString(storageRef, profile.logo, 'data_url');
                profileToUpdate.logo = await getDownloadURL(snapshot.ref);
            }

            await updateDoc(partnerRef, profileToUpdate);
            toast({ title: "Profile Saved!", description: "Your public profile has been updated."})
        } catch(error) {
            console.error("Error updating partner profile:", error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not update your profile.' });
        }
    }
    
    const addPartnerProduct = async (product: Omit<LoanProduct, 'id'>) => {
        if (!partner) return;
        await addDoc(collection(db, "partners", partner.id, "products"), product);
    }
    
    const removePartnerProduct = async (id: string) => {
        if (!partner) return;
        await deleteDoc(doc(db, "partners", partner.id, "products", id));
        toast({ title: "Product Removed", variant: "destructive" });
    }

    const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp'>) => {
        await addDoc(collection(db, 'notifications'), { ...notification, timestamp: serverTimestamp() });
    }

    const markNotificationsAsRead = async (role: 'user' | 'partner') => {
       const relevantId = isPartner ? partner?.id : user?.uid;
       if (!relevantId) return;

       const notifsToMark = notifications.filter(n => n.for === role && n.userId === relevantId && !n.read);
       if (notifsToMark.length === 0) return;

       const batch = writeBatch(db);
       notifsToMark.forEach(n => {
           const docRef = doc(db, 'notifications', n.id);
           batch.update(docRef, { read: true });
       });
       await batch.commit();
    }
    
    const partnerSignup = async (email: string, pass: string, name: string, website: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newPartner = {
            name,
            website,
            logo: `https://placehold.co/40x40/111111/FFFFFF?text=${name.substring(0,2).toUpperCase()}`,
            description: `A new lending partner in the Credora ecosystem.`,
            createdAt: serverTimestamp()
        };
        await setDoc(doc(db, "partners", userCredential.user.uid), newPartner);
    }
    
    const partnerLogin = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    }

    const logout = async () => {
        const wasPartner = isPartner;
        await signOut(auth);
        setUser(null);
        setPartner(null);
        setIsPartner(false);
        setApplications([]);
        setNotifications([]);
        setLoanActivity([]);
        setPartnerProducts([]);
        setPartnerProfileState({ name: "", logo: "", website: ""});

        if (wasPartner) {
           await setupAnonymousUser();
        }
    };

    const contextValue = {
        user,
        partner,
        isPartner,
        loading,
        logout,
        partnerLogin,
        partnerSignup,
        avatarUrl,
        setAvatarUrl,
        applications,
        addApplication,
        updateApplicationStatus,
        partners,
        partnerProfile,
        updatePartnerProfile,
        partnerProducts,
        addPartnerProduct,
        removePartnerProduct,
        notifications,
        addNotification,
        markNotificationsAsRead,
        loanActivity,
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};
