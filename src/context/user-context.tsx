
"use client";

import { createContext, useState, ReactNode, useEffect, useCallback, useMemo, useContext } from 'react';
import { ExplainRiskFactorsOutput } from '@/ai/flows/explain-risk-factors';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, query, where, getDocs, setDoc, deleteDoc, writeBatch, getDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
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
                    setUser(currentUser); // Regular user
                }
            } else {
                setUser(null);
                setPartner(null);
                setIsPartner(false);
            }
            setLoading(false);
        });
        
        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
        if (!user || isPartner) return;

        const unsubUser = onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
                setAvatarUrlState(doc.data().avatarUrl || null);
            }
        }, (error) => console.error("User listener error: ", error));

        const qApps = query(collection(db, "applications"), where("userId", "==", user.uid));
        const unsubApps = onSnapshot(qApps, (snapshot) => {
             const appsData = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate(),
            }) as Application);
            setApplications(appsData);
        }, (error) => console.error("User Applications listener error: ", error));

        return () => { 
            unsubUser();
            unsubApps();
        }
    }, [user, isPartner]);

    useEffect(() => {
        if (!partner || !isPartner) return;

        const unsubPartnerProducts = onSnapshot(collection(db, "partners", partner.id, "products"), (snapshot) => {
            setPartnerProducts(snapshot.docs.map(d => ({id: d.id, ...d.data()}) as LoanProduct));
       }, (error) => console.error("Partner products listener error: ", error));
       
       const unsubLoanActivity = onSnapshot(query(collection(db, "loanActivity"), where("partnerId", "==", partner.id)), (snapshot) => {
           setLoanActivity(snapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt.toDate()}) as LoanActivityItem));
        }, (error) => console.error("Loan activity listener error: ", error));

        const qApps = query(collection(db, "applications"), where("loan.partnerId", "==", partner.id));
        const unsubApps = onSnapshot(qApps, async (snapshot) => {
            const appPromises = snapshot.docs.map(async (d) => {
                const appData = d.data();
                const userSnap = await getDoc(doc(db, 'users', appData.userId));
                const userData = userSnap.exists() ? {
                    displayName: userSnap.data()?.displayName || 'Unknown User',
                    avatarUrl: userSnap.data()?.avatarUrl || null,
                } : { displayName: 'Unknown User', avatarUrl: null };

                return {
                    id: d.id,
                    ...appData,
                    createdAt: appData.createdAt?.toDate(),
                    user: userData
                } as Application;
            });
            const appsData = await Promise.all(appPromises);
            setApplications(appsData);
        }, (error) => console.error("Partner Applications listener error: ", error));


       return () => {
           unsubPartnerProducts();
           unsubLoanActivity();
           unsubApps();
       }
    }, [partner, isPartner]);
    
    useEffect(() => {
        const unsubPartners = onSnapshot(collection(db, "partners"), async (snapshot) => {
            const partnerListPromises = snapshot.docs.map(async (pDoc) => {
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
            const partnerList = await Promise.all(partnerListPromises);
            setPartners(partnerList);
        }, (error) => console.error("Partner listener error: ", error));

        return () => unsubPartners();
    }, []);

    useEffect(() => {
        if (!user) return;
        const relevantId = isPartner ? partner?.id : user.uid;
        if (!relevantId) return;

        const notifsQuery = query(collection(db, "notifications"), where("userId", "==", relevantId));
        const unsubNotifs = onSnapshot(notifsQuery, (snapshot) => {
            const allNotifs = snapshot.docs
                .map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp.toDate() } as Notification))
                .sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
            setNotifications(allNotifs);
        }, (error) => console.error("Notifications listener error: ", error));

        return () => unsubNotifs();
    }, [user, isPartner, partner]);

    const setAvatarUrl = useCallback(async (url: string) => {
        if (!user) return;
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { avatarUrl: url });
        setAvatarUrlState(url);
    }, [user]);

    const addApplication = useCallback(async (app: Omit<Application, 'id' | 'user' | 'userId' | 'createdAt'>) => {
        if (!user) throw new Error("User not logged in.");
        
        const userDocSnap = await getDoc(doc(db, 'users', user.uid));
        if (!userDocSnap.exists()) await setDoc(doc(db, 'users', user.uid), { displayName: `User-${user.uid.substring(0,5)}`, avatarUrl: null, createdAt: serverTimestamp()});

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        const targetPartner = partners.find(p => p.name === app.loan.partnerName);
        if (!targetPartner) throw new Error("Lending partner not found.");
            
        const newApp = {
            ...app,
            userId: user.uid,
            user: {
                displayName: userData?.displayName || `User #${user.uid.substring(0,4)}`,
                avatarUrl: userData?.avatarUrl || null
            },
            loan: { ...app.loan, partnerId: targetPartner.id },
            createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "applications"), newApp);
    }, [user, partners]);

    const updateApplicationStatus = useCallback(async (appId: string, status: 'Approved' | 'Denied') => {
        const appRef = doc(db, "applications", appId);
        await updateDoc(appRef, { status });

        if (status === 'Approved') {
            const appToUpdate = applications.find(a => a.id === appId);
            if (!appToUpdate) return;
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
        await updateDoc(partnerRef, profile);
        toast({ title: "Profile Saved!", description: "Your public profile has been updated."})
    }, [partner]);
    
    const addPartnerProduct = useCallback(async (product: Omit<LoanProduct, 'id'>) => {
        if (!partner) return;
        await addDoc(collection(db, "partners", partner.id, "products"), product);
    }, [partner]);
    
    const removePartnerProduct = useCallback(async (id: string) => {
        if (!partner) return;
        await deleteDoc(doc(db, "partners", partner.id, "products", id));
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
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newPartner = {
            name: name.trim(),
            website: website.trim(),
            logo: `https://placehold.co/40x40/111111/FFFFFF?text=${name.substring(0,2).toUpperCase()}`,
            description: `A new lending partner in the Credora ecosystem.`,
            createdAt: serverTimestamp()
        };
        await setDoc(doc(db, "partners", userCredential.user.uid), newPartner);
    }, []);
    
    const partnerLogin = useCallback(async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    }, []);

    const logout = useCallback(async () => {
        await signOut(auth);
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

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};

    