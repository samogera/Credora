
"use client";

import { createContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { ExplainRiskFactorsOutput } from '@/ai/flows/explain-risk-factors';
import { db, auth } from '@/lib/firebase';
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
    addApplication: (app: Omit<Application, 'id' | 'user' | 'userId' | 'createdAt'>) => Promise<void>;
    updateApplicationStatus: (id: string, status: 'Approved' | 'Denied') => void;
    partners: Partner[];
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
    
    const [partnerProducts, setPartnerProducts] = useState<LoanProduct[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                const partnerDocRef = doc(db, "partners", currentUser.uid);
                const partnerDocSnap = await getDoc(partnerDocRef);

                if (partnerDocSnap.exists()) {
                    setIsPartner(true);
                    setPartner({ id: currentUser.uid, ...partnerDocSnap.data() } as Partner);
                    setUser(currentUser);
                } else {
                    setIsPartner(false);
                    setPartner(null);
                    setUser(currentUser); // Regular user or anonymous
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
                // No user logged in, sign in anonymously for public pages
                try {
                    const cred = await signInAnonymously(auth);
                    setUser(cred.user);
                } catch(e) {
                    console.error("Error signing in anonymously:", e);
                } finally {
                    setIsPartner(false);
                    setPartner(null);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    // Listener for all data - requires authenticated user
    useEffect(() => {
        if (loading || !user) return;

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
        let unsubPartnerProducts: () => void = () => {};
        let unsubPartnerApps: () => void = () => {};
        let unsubLoanActivity: () => void = () => {};


        if (isPartner && partner) {
             unsubPartnerProducts = onSnapshot(collection(db, "partners", partner.id, "products"), (snapshot) => {
                 setPartnerProducts(snapshot.docs.map(d => ({id: d.id, ...d.data()}) as LoanProduct));
            });
            
             const partnerAppsQuery = query(collection(db, "applications"), where("loan.partnerId", "==", partner.id));
             unsubPartnerApps = onSnapshot(partnerAppsQuery, async (snapshot) => {
                const appPromises = snapshot.docs.map(async (d) => {
                    const appData = d.data() as Omit<Application, 'id' | 'createdAt'>;
                    const userSnap = await getDoc(doc(db, 'users', appData.userId));
                    const userData = userSnap.data();
                    return {
                        id: d.id,
                        ...appData,
                        createdAt: appData.createdAt?.toDate(),
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

    const setAvatarUrl = useCallback(async (url: string) => {
        if (!user || user.isAnonymous) return;
        const userDocRef = doc(db, "users", user.uid);
        try {
            let downloadUrl = url;
            // Removed image upload logic for simplicity in this pass
            await updateDoc(userDocRef, { avatarUrl: downloadUrl });
            setAvatarUrlState(downloadUrl);
        } catch (error) {
            console.error("Error updating avatar:", error);
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not update your avatar.' });
        }
    }, [user]);

    const addApplication = useCallback(async (app: Omit<Application, 'id' | 'user' | 'userId' | 'createdAt'>) => {
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
            userId: user.uid,
            user: {
                displayName: userDoc.data()?.displayName || `User #${user.uid.substring(0,4)}`,
                avatarUrl: userDoc.data()?.avatarUrl || null
            },
            loan: { ...app.loan, partnerId: targetPartner.id },
            createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "applications"), newApp);
    }, [user, partners]);

    const updateApplicationStatus = useCallback(async (appId: string, status: 'Approved' | 'Denied') => {
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
    }, [applications]);
    
    const updatePartnerProfile = useCallback(async (profile: Partial<Omit<Partner, 'products' | 'description' | 'id'>>) => {
        if (!partner) return;
        const partnerRef = doc(db, "partners", partner.id);

        try {
            let profileToUpdate = {...profile};
            // Removed image upload logic for simplicity
            await updateDoc(partnerRef, profileToUpdate);
            toast({ title: "Profile Saved!", description: "Your public profile has been updated."})
        } catch(error) {
            console.error("Error updating partner profile:", error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not update your profile.' });
        }
    }, [partner]);
    
    const addPartnerProduct = useCallback(async (product: Omit<LoanProduct, 'id'>) => {
        if (!partner) return;
        await addDoc(collection(db, "partners", partner.id, "products"), product);
    }, [partner]);
    
    const removePartnerProduct = useCallback(async (id: string) => {
        if (!partner) return;
        await deleteDoc(doc(db, "partners", partner.id, "products", id));
        toast({ title: "Product Removed", variant: "destructive" });
    }, [partner]);

    const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp'>) => {
        await addDoc(collection(db, 'notifications'), { ...notification, timestamp: serverTimestamp() });
    }, []);

    const markNotificationsAsRead = useCallback(async (role: 'user' | 'partner') => {
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
    }, [isPartner, partner, user, notifications]);
    
    const partnerSignup = useCallback(async (email: string, pass: string, name: string, website: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const newPartner = {
                name,
                website,
                logo: `https://placehold.co/40x40/111111/FFFFFF?text=${name.substring(0,2).toUpperCase()}`,
                description: `A new lending partner in the Credora ecosystem.`,
                createdAt: serverTimestamp()
            };
            await setDoc(doc(db, "partners", userCredential.user.uid), newPartner);
            // onAuthStateChanged will handle setting the user/partner state
        } catch (error: any) {
            console.error("Error during partner signup:", error);
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('This email address is already in use by another account.');
            } else if (error.code === 'auth/weak-password') {
                throw new Error('The password is too weak. Please use at least 6 characters.');
            }
            throw new Error('An unexpected error occurred during signup. Please try again.');
        }
    }, []);
    
    const partnerLogin = useCallback(async (email: string, pass: string) => {
       try {
            await signInWithEmailAndPassword(auth, email, pass);
            // onAuthStateChanged will handle the rest
        } catch (error: any) {
            console.error("Error during partner login:", error);
            throw new Error("Login failed. Please check your email and password.");
        }
    }, []);

    const logout = useCallback(async () => {
        await signOut(auth);
        // onAuthStateChanged will handle signing in anonymously
    }, []);

    const contextValue = useMemo(() => ({
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
        updatePartnerProfile,
        partnerProducts,
        addPartnerProduct,
        removePartnerProduct,
        notifications,
        addNotification,
        markNotificationsAsRead,
        loanActivity,
    }), [
        user, partner, isPartner, loading, logout, partnerLogin, partnerSignup,
        avatarUrl, setAvatarUrl, applications, addApplication, updateApplicationStatus,
        partners, updatePartnerProfile, partnerProducts, addPartnerProduct, removePartnerProduct,
        notifications, addNotification, markNotificationsAsRead, loanActivity
    ]);


    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

    