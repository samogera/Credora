
"use client";

import { createContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { ExplainRiskFactorsOutput } from '@/ai/flows/explain-risk-factors';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, query, where, getDocs, setDoc, deleteDoc, writeBatch, getDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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
    partnerId: string;
    partnerName: string;
    userId: string;
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
    status: 'Pending' | 'Approved' | 'Denied' | 'Signed';
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
    emailLogin: (email: string, pass: string) => Promise<void>;
    googleLogin: () => Promise<void>;
    emailSignup: (email: string, pass: string, displayName: string) => Promise<void>;
    partnerLogin: (email: string, pass: string) => Promise<void>;
    partnerSignup: (email: string, pass: string, name: string, website: string) => Promise<void>;
    avatarUrl: string | null;
    setAvatarUrl: (url: string) => void;
    applications: Application[];
    addApplication: (app: Omit<Application, 'id' | 'user' | 'userId' | 'createdAt' | 'userAvatar'>) => Promise<void>;
    updateApplicationStatus: (appId: string, status: 'Approved' | 'Denied') => Promise<void>;
    userSignLoan: (appId: string) => Promise<void>;
    partners: Partner[];
    updatePartnerProfile: (profile: Partial<Omit<Partner, 'products' | 'description' | 'id'>>) => void;
    partnerProducts: LoanProduct[];
    addPartnerProduct: (product: Omit<LoanProduct, 'id'>) => void;
    removePartnerProduct: (id: string) => void;
    notifications: Notification[];
    markNotificationsAsRead: (role: 'user' | 'partner') => void;
    loanActivity: LoanActivityItem[];
}

export const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [partner, setPartner] = useState<Partner | null>(null);
    const [isPartner, setIsPartner] = useState(false);
    const [authInitialized, setAuthInitialized] = useState(false);
    
    const [avatarUrl, setAvatarUrlState] = useState<string | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loanActivity, setLoanActivity] = useState<LoanActivityItem[]>([]);
    const [partnerProducts, setPartnerProducts] = useState<LoanProduct[]>([]);

    const loading = !authInitialized;

    const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp'>) => {
        try {
            await addDoc(collection(db, 'notifications'), { ...notification, timestamp: serverTimestamp() });
        } catch (error) {
            console.error("Error adding notification:", error);
        }
    }, []);

    const userSignLoan = useCallback(async (appId: string) => {
        const appToSign = applications.find(a => a.id === appId);
        if (!appToSign || appToSign.status !== 'Approved') {
            throw new Error("This loan cannot be signed at this time.");
        }

        const batch = writeBatch(db);

        const appRef = doc(db, "applications", appId);
        batch.update(appRef, { status: 'Signed' });

        const loanActivityRef = doc(collection(db, 'loanActivity'));
        batch.set(loanActivityRef, {
            user: { displayName: appToSign.user.displayName || 'Unknown User' },
            userId: appToSign.userId,
            partnerId: appToSign.loan.partnerId,
            partnerName: appToSign.loan.partnerName,
            amount: appToSign.amount,
            repaid: 0,
            interestAccrued: 0,
            status: 'Active',
            createdAt: serverTimestamp(),
        });
        
        await batch.commit();

        await addNotification({
            for: 'partner',
            userId: appToSign.loan.partnerId,
            type: 'info',
            title: 'Loan Activated',
            message: `${appToSign.user.displayName} has signed the contract. The loan is now active.`,
            read: false,
        });
        await addNotification({
            for: 'user',
            userId: appToSign.userId,
            type: 'info',
            title: 'Funds Disbursed!',
            message: `Funds for your ${appToSign.loan.name} have been disbursed. You can track your loan in the 'My Loans' section.`,
            read: false
        })

    }, [applications, addNotification]);

    const updateApplicationStatus = useCallback(async (appId: string, status: 'Approved' | 'Denied') => {
        const appRef = doc(db, "applications", appId);
        await updateDoc(appRef, { status });

        const appToUpdate = applications.find(a => a.id === appId);
        if (!appToUpdate) throw new Error("Application not found");
        
        if (status === 'Approved') {
            await addNotification({
                for: 'user',
                userId: appToUpdate.userId,
                type: 'approval',
                title: `Loan Approved`,
                message: `Your application for the ${appToUpdate.loan.name} is approved! Please sign the contract on your dashboard to receive your funds.`,
                read: false,
            });
        } else { // Denied
            await addNotification({
                for: 'user',
                userId: appToUpdate.userId,
                type: 'denial',
                title: `Loan Denied`,
                message: `Your application for the ${appToUpdate.loan.name} has been denied.`,
                read: false,
            });
        }
    }, [applications, addNotification]);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(null);
            setPartner(null);
            setIsPartner(false);
            setApplications([]);
            setLoanActivity([]);
            setNotifications([]);
            setPartnerProducts([]);

            if (currentUser) {
                const partnerDocRef = doc(db, "partners", currentUser.uid);
                const partnerDocSnap = await getDoc(partnerDocRef);

                if (partnerDocSnap.exists()) {
                    setIsPartner(true);
                    setPartner({ id: currentUser.uid, ...partnerDocSnap.data() } as Partner);
                    setUser(currentUser);
                } else {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (!userDocSnap.exists()) {
                        await setDoc(userDocRef, { 
                            displayName: currentUser.displayName || `User-${currentUser.uid.substring(0,5)}`, 
                            email: currentUser.email,
                            avatarUrl: currentUser.photoURL, 
                            createdAt: serverTimestamp()
                        });
                    }
                    setIsPartner(false);
                    setUser(currentUser);
                }
            }
            setAuthInitialized(true);
        });
        
        return () => unsubscribe();
    }, []);
    
    // Listener for general user data (avatar)
    useEffect(() => {
        if (!user || isPartner) {
            setAvatarUrlState(null)
            return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const unsubUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setAvatarUrlState(doc.data().avatarUrl || null);
            }
        });

        return () => unsubUser();
    }, [user, isPartner]);

    // Listener for user-specific data (their applications and loans)
    useEffect(() => {
        if (!user || isPartner) {
            setApplications([]);
            setLoanActivity([]);
            return;
        };

        const qApps = query(collection(db, "applications"), where("userId", "==", user.uid));
        const unsubApps = onSnapshot(qApps, (snapshot) => {
             const appsData = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate(),
            }) as Application);
            setApplications(appsData);
        }, (error) => console.error("User Applications listener error: ", error));
        
        const qUserLoans = query(collection(db, "loanActivity"), where("userId", "==", user.uid));
        const unsubUserLoans = onSnapshot(qUserLoans, (snapshot) => {
           setLoanActivity(snapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date()}) as LoanActivityItem));
        }, (error) => console.error("User Loan activity listener error: ", error));

        return () => { 
            unsubApps();
            unsubUserLoans();
        }
    }, [user, isPartner]);

    // Listener for partner-specific data
    useEffect(() => {
        if (!partner || !isPartner) {
            setPartnerProducts([]);
            setLoanActivity([]);
            setApplications([]);
            return;
        }

        const unsubPartnerProducts = onSnapshot(collection(db, "partners", partner.id, "products"), (snapshot) => {
            setPartnerProducts(snapshot.docs.map(d => ({id: d.id, ...d.data()}) as LoanProduct));
       }, (error) => console.error("Partner products listener error: ", error));
       
       const qLoanActivity = query(collection(db, "loanActivity"), where("partnerId", "==", partner.id));
       const unsubLoanActivity = onSnapshot(qLoanActivity, (snapshot) => {
           setLoanActivity(snapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date()}) as LoanActivityItem));
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
    
    // Listener for ALL partners (for user view)
    useEffect(() => {
        if (isPartner) {
            setPartners([]);
            return;
        }
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
    }, [isPartner]);

    // Listener for notifications
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }
        const relevantId = isPartner ? partner?.id : user.uid;
        if (!relevantId) return;

        const notifsQuery = query(collection(db, "notifications"), where("userId", "==", relevantId));
        const unsubNotifs = onSnapshot(notifsQuery, (snapshot) => {
            const allNotifs = snapshot.docs
                .map(d => {
                    const data = d.data();
                    return ({ 
                        id: d.id, 
                        ...data, 
                        timestamp: data.timestamp ? data.timestamp.toDate() : new Date() 
                    } as Notification)
                })
                .sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
            setNotifications(allNotifs);
        }, (error) => console.error("Notifications listener error: ", error));

        return () => unsubNotifs();
    }, [user, isPartner, partner]);
    
    const setAvatarUrl = useCallback(async (url: string) => {
        if (!user) return;
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { avatarUrl: url });
    }, [user]);

    const addApplication = useCallback(async (app: Omit<Application, 'id' | 'user' | 'userId' | 'createdAt' | 'userAvatar'>) => {
        if (!user) throw new Error("User not logged in.");
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        const targetPartner = partners.find(p => p.name === app.loan.partnerName);
        if (!targetPartner) throw new Error("Lending partner not found.");
            
        const newApp = {
            ...app,
            userId: user.uid,
            user: {
                displayName: userDocSnap.data()?.displayName || 'Anonymous User',
                avatarUrl: userDocSnap.data()?.avatarUrl || null,
            },
            loan: { ...app.loan, partnerId: targetPartner.id },
            createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "applications"), newApp);

         await addNotification({
            for: 'partner',
            userId: targetPartner.id,
            type: 'new_application',
            title: 'New Application',
            message: `${newApp.user.displayName} applied for $${newApp.amount.toLocaleString()} (${newApp.loan.name}).`,
            read: false,
        })
    }, [user, partners, addNotification]);
    
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
    
    const emailSignup = useCallback(async (email: string, pass: string, displayName: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", userCredential.user.uid), {
            displayName: displayName.trim(),
            email: userCredential.user.email,
            avatarUrl: null,
            createdAt: serverTimestamp()
        });
    }, []);

    const googleLogin = useCallback(async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    }, []);
    
    const emailLogin = useCallback(async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    }, []);
    
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
        emailLogin,
        googleLogin,
        emailSignup,
        partnerLogin,
        partnerSignup,
        avatarUrl,
        setAvatarUrl,
        applications,
        addApplication,
        updateApplicationStatus,
        userSignLoan,
        partners,
        updatePartnerProfile,
        partnerProducts,
        addPartnerProduct,
        removePartnerProduct,
        notifications,
        markNotificationsAsRead,
        loanActivity,
    }), [
        user, partner, isPartner, loading, logout, emailLogin, googleLogin, emailSignup, partnerLogin, partnerSignup,
        avatarUrl, setAvatarUrl, applications, addApplication, updateApplicationStatus, userSignLoan,
        partners, updatePartnerProfile, partnerProducts, addPartnerProduct, removePartnerProduct,
        notifications, markNotificationsAsRead, loanActivity
    ]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};
