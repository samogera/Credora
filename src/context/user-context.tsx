
"use client";

import { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { ExplainRiskFactorsOutput } from '@/ai/flows/explain-risk-factors';
import { db, storage, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, query, where, getDocs, setDoc, deleteDoc, writeBatch, documentId, getDoc } from 'firebase/firestore';
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
    logout: () => void;
    partnerLogin: (email: string, pass: string) => Promise<void>;
    partnerSignup: (email: string, pass: string, name: string, website: string) => Promise<void>;
    avatarUrl: string | null;
    setAvatarUrl: (url: string) => void;
    applications: Application[];
    addApplication: (app: Omit<Application, 'id' | 'user' | 'userId' | 'score'>) => void;
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
    
    const [avatarUrl, setAvatarUrlState] = useState<string | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loanActivity, setLoanActivity] = useState<LoanActivityItem[]>([]);
    
    const [partnerProfile, setPartnerProfileState] = useState<Omit<Partner, 'products' | 'description' | 'id'>>({ name: "", logo: "", website: ""});
    const [partnerProducts, setPartnerProducts] = useState<LoanProduct[]>([]);

     const setupAnonymousUser = useCallback(async () => {
        if (!auth.currentUser) {
            const cred = await signInAnonymously(auth);
            const userDocRef = doc(db, "users", cred.user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) {
                await setDoc(userDocRef, {
                    displayName: `User #${cred.user.uid.substring(0, 4)}`,
                    avatarUrl: null
                });
            }
        }
    }, []);

    useEffect(() => {
        setupAnonymousUser();
    }, [setupAnonymousUser]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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
                }
            } else {
                setUser(null);
                setIsPartner(false);
                setPartner(null);
                // Ensure there's always a logged-in user for reads
                setupAnonymousUser();
            }
        });
        return () => unsubscribe();
    }, [setupAnonymousUser]);
    
    // Listeners for all data - requires authenticated user
    useEffect(() => {
        // Listener for all partners and their products (for user view)
        const unsubPartners = onSnapshot(collection(db, "partners"), (snapshot) => {
            const partnerPromises = snapshot.docs.map(async (pDoc) => {
                const partnerData = pDoc.data();
                const productsRef = collection(db, "partners", pDoc.id, "products");
                const productsSnap = await getDocs(productsRef);
                const products = productsSnap.docs.map(prodDoc => ({id: prodDoc.id, ...prodDoc.data()}) as LoanProduct);
                return {
                    id: pDoc.id,
                    ...partnerData,
                    products,
                } as Partner;
            });
            Promise.all(partnerPromises).then(setPartners);
        }, (error) => console.error("Partner listener error: ", error));

        if (isPartner && partner) {
            // Partner-specific listeners
            const unsubPartnerProfile = onSnapshot(doc(db, "partners", partner.id), (doc) => {
                if(doc.exists()){
                    const data = doc.data();
                    setPartnerProfileState({name: data.name, logo: data.logo, website: data.website});
                }
            });

            const unsubPartnerProducts = onSnapshot(collection(db, "partners", partner.id, "products"), (snapshot) => {
                 setPartnerProducts(snapshot.docs.map(d => ({id: d.id, ...d.data()}) as LoanProduct));
            });
            
             const partnerAppsQuery = query(collection(db, "applications"), where("loan.partnerId", "==", partner.id));
             const unsubPartnerApps = onSnapshot(partnerAppsQuery, (snapshot) => {
                 const appsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Application));
                 setApplications(appsData);
             }, (error) => console.error("Partner apps listener error: ", error));
             
             // Simple listener for all loans to derive partner's loan activity
             const unsubLoanActivity = onSnapshot(collection(db, "loanActivity"), (snapshot) => {
                setLoanActivity(snapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt.toDate()}) as LoanActivityItem));
             }, (error) => console.error("Loan activity listener error: ", error));


             return () => {
                unsubPartners();
                unsubPartnerProfile();
                unsubPartnerProducts();
                unsubPartnerApps();
                unsubLoanActivity();
             };

        } else if(user && !isPartner) {
            // User-specific listeners
            const userAppsQuery = query(collection(db, "applications"), where("userId", "==", user.uid));
            const unsubUserApps = onSnapshot(userAppsQuery, (snapshot) => {
                const appsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Application));
                setApplications(appsData);
            }, (error) => console.error("User apps listener error: ", error));
            
            const unsubUser = onSnapshot(doc(db, "users", user.uid), (doc) => {
                if (doc.exists()) {
                    setAvatarUrlState(doc.data().avatarUrl || null);
                }
            });

            return () => {
                unsubPartners();
                unsubUserApps();
                unsubUser();
            };
        }

        return () => { unsubPartners(); }
    }, [user, isPartner, partner]);
    
    // Notifications listener
    useEffect(() => {
        if (!user) return;
        
        const relevantId = isPartner ? partner?.id : user.uid;
        if (!relevantId) return;

        const notifsQuery = query(collection(db, "notifications"), where("userId", "==", relevantId));
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

    const addApplication = async (app: Omit<Application, 'id' | 'user' | 'userId' | 'score'>) => {
        if (!user || user.isAnonymous) {
            toast({ variant: 'destructive', title: 'Login Required', description: 'You must be logged in to apply.' });
            return;
        }
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
             toast({ variant: 'destructive', title: 'Error', description: 'User profile not found.' });
            return;
        }

        const newApp = {
            ...app,
            score: Math.floor(Math.random() * (850 - 550 + 1)) + 550, // Dummy score
            userId: user.uid,
            user: {
                displayName: userDoc.data()?.displayName || `User #${user.uid.substring(0,4)}`,
                avatarUrl: userDoc.data()?.avatarUrl || null
            }
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
            });
        }

        await addNotification({
            for: 'user',
            userId: appToUpdate.userId,
            type: status === 'Approved' ? 'approval' : 'denial',
            title: `Loan ${status}`,
            message: `Your application for the ${appToUpdate.loan.name} for $${appToUpdate.amount.toLocaleString()} has been ${status.toLowerCase()}.`,
            read: false,
        });
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
        await addDoc(collection(db, 'notifications'), { ...notification, timestamp: new Date() });
    }

    const markNotificationsAsRead = async (role: 'user' | 'partner') => {
       const relevantId = isPartner ? partner?.id : user?.uid;
       if (!relevantId) return;

       const notifsToMark = notifications.filter(n => n.userId === relevantId && !n.read);
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
            description: `A new lending partner in the Credora ecosystem.`
        };
        await setDoc(doc(db, "partners", userCredential.user.uid), newPartner);
    }
    
    const partnerLogin = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    }

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setPartner(null);
        setIsPartner(false);
        // re-establish anonymous user for public reads
        await setupAnonymousUser();
    };

    const contextValue = {
        user,
        partner,
        isPartner,
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
