
"use client";

import { createContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { ExplainRiskFactorsOutput } from '@/ai/flows/explain-risk-factors';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, query, where, getDocs, setDoc, deleteDoc, writeBatch, getDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, updateProfile, deleteUser } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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
    href: string;
};

interface UserContextType {
    user: User | null;
    partner: Partner | null;
    isPartner: boolean;
    loading: boolean;
    dataLoading: boolean;
    logout: () => Promise<void>;
    emailLogin: (email: string, pass: string) => Promise<void>;
    googleLogin: () => Promise<void>;
    emailSignup: (email: string, pass: string, displayName: string) => Promise<void>;
    partnerLogin: (email: string, pass: string) => Promise<void>;
    partnerSignup: (email: string, pass: string, name: string, website: string) => Promise<void>;
    deleteAccount: () => Promise<void>;
    score: number | null;
    setScore: (score: number | null) => void;
    connectWalletAndSetScore: () => void;
    avatarUrl: string | null;
    setAvatarUrl: (url: string) => void;
    applications: Application[];
    addApplication: (app: Omit<Application, 'id' | 'user' | 'userId' | 'createdAt' | 'score'>) => Promise<void>;
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
    const [dataLoading, setDataLoading] = useState(true);
    
    const [avatarUrl, setAvatarUrlState] = useState<string | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loanActivity, setLoanActivity] = useState<LoanActivityItem[]>([]);
    const [partnerProducts, setPartnerProducts] = useState<LoanProduct[]>([]);
    const [score, setScoreState] = useState<number | null>(null);

    const loading = !authInitialized || dataLoading;
    const router = useRouter();

    const clearState = useCallback(() => {
        setUser(null);
        setPartner(null);
        setIsPartner(false);
        setAvatarUrlState(null);
        setApplications([]);
        setPartners([]);
        setNotifications([]);
        setLoanActivity([]);
        setPartnerProducts([]);
        setScoreState(null);
        setDataLoading(true);
        setAuthInitialized(false);
    }, []);

    const logout = useCallback(async () => {
        await signOut(auth);
        clearState();
        router.push('/login');
    }, [router, clearState]);

    const deleteAccount = useCallback(async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            toast({ variant: 'destructive', title: "Error", description: "You must be logged in to delete an account." });
            return;
        }
        try {
            const docRef = doc(db, isPartner ? "partners" : "users", currentUser.uid);
            await deleteDoc(docRef);

            await deleteUser(currentUser);
            toast({ title: "Account Deleted", description: "Your account has been permanently deleted." });
        } catch (error: any) {
            console.error("Error deleting account: ", error);
            if (error.code === 'auth/requires-recent-login') {
                toast({ variant: 'destructive', title: "Login Required", description: "This is a sensitive action. Please log in again before deleting your account." });
                await logout();
            } else {
                toast({ variant: 'destructive', title: "Deletion Failed", description: error.message || "An error occurred." });
            }
        }
    }, [isPartner, logout]);
    
    // Step 1: Handle Auth State Change
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                if (user?.uid !== currentUser.uid) { // only reset if user is different
                    clearState();
                    setUser(currentUser);
                } else {
                    setAuthInitialized(true); // User is the same, just ensure auth is initialized
                }
            } else {
                clearState();
                setAuthInitialized(true);
                setDataLoading(false);
            }
        });
        return () => unsubscribe();
    }, [user, clearState]);
    
    // Step 2: Determine user role and load initial data (user profile or partner profile)
    useEffect(() => {
        if (!user || !authInitialized) return;
    
        let isCancelled = false;
        const fetchRoleAndInitialData = async () => {
            setDataLoading(true);
            const partnerDocRef = doc(db, "partners", user.uid);
            const partnerDocSnap = await getDoc(partnerDocRef);
    
            if (isCancelled) return;
    
            if (partnerDocSnap.exists()) {
                setIsPartner(true);
                setPartner({ id: user.uid, ...partnerDocSnap.data() } as Partner);
            } else {
                setIsPartner(false);
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const data = userDocSnap.data();
                    setAvatarUrlState(data.avatarUrl || user.photoURL || null);
                    setScoreState(data.score === undefined ? null : data.score);
                } else {
                     await setDoc(userDocRef, { 
                       displayName: user.displayName || `User-${user.uid.substring(0,5)}`, 
                       email: user.email,
                       avatarUrl: user.photoURL || null, 
                       score: null,
                       createdAt: serverTimestamp()
                   });
                   setScoreState(null);
                   setAvatarUrlState(user.photoURL || null);
                }
            }
            setDataLoading(false);
        };
    
        fetchRoleAndInitialData();
    
        return () => {
            isCancelled = true;
        };
    }, [user, authInitialized]);

    // Step 3: Set up real-time data listeners based on user's role.
    useEffect(() => {
        if (!user || dataLoading) return; // Wait for auth and role check

        const unsubscribers: (() => void)[] = [];

        // Notifications listener (for both roles)
        const notifsQuery = query(collection(db, "notifications"), where("userId", "==", user.uid));
        unsubscribers.push(onSnapshot(notifsQuery, (snapshot) => {
            const allNotifs = snapshot.docs.map(d => ({ 
                id: d.id, 
                ...d.data(), 
                timestamp: d.data().timestamp ? d.data().timestamp.toDate() : new Date() 
            } as Notification));
            setNotifications(allNotifs.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()));
        }, (error) => console.error("Notifications listener error: ", error)));

        if (isPartner) {
             // Partner-specific listeners
            unsubscribers.push(onSnapshot(collection(db, "partners", user.uid, "products"), (snapshot) => {
                setPartnerProducts(snapshot.docs.map(d => ({id: d.id, ...d.data()}) as LoanProduct));
            }, (error) => console.error("Partner products listener error: ", error)));
        
            const qLoanActivity = query(collection(db, "loanActivity"), where("partnerId", "==", user.uid));
            unsubscribers.push(onSnapshot(qLoanActivity, (snapshot) => {
                setLoanActivity(snapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date()}) as LoanActivityItem));
            }, (error) => console.error("Loan activity listener error: ", error)));

            const qApps = query(collection(db, "applications"), where("loan.partnerId", "==", user.uid));
            unsubscribers.push(onSnapshot(qApps, async (snapshot) => {
                const appPromises = snapshot.docs.map(async (d) => {
                    const appData = d.data();
                    // Avoid fetching user data if it's already there
                    const existingApp = applications.find(a => a.id === d.id);
                    if (existingApp?.user) {
                         return { id: d.id, ...appData, createdAt: appData.createdAt?.toDate(), user: existingApp.user } as Application;
                    }
                    const userSnap = await getDoc(doc(db, 'users', appData.userId));
                    const userData = userSnap.exists() ? {
                        displayName: userSnap.data()?.displayName || 'Unknown User',
                        avatarUrl: userSnap.data()?.avatarUrl || null,
                    } : { displayName: 'Unknown User', avatarUrl: null };
                    return { id: d.id, ...appData, createdAt: appData.createdAt?.toDate(), user: userData } as Application;
                });
                const appsData = await Promise.all(appPromises);
                setApplications(appsData);
            }, (error) => console.error("Partner Applications listener error: ", error)));

        } else {
            // User-specific listeners
            const qApps = query(collection(db, "applications"), where("userId", "==", user.uid));
            unsubscribers.push(onSnapshot(qApps, (snapshot) => {
                setApplications(snapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate() } as Application)));
            }, (error) => console.error("User Applications listener error: ", error)));
            
            const qUserLoans = query(collection(db, "loanActivity"), where("userId", "==", user.uid));
            unsubscribers.push(onSnapshot(qUserLoans, (snapshot) => {
               setLoanActivity(snapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date()}) as LoanActivityItem));
            }, (error) => console.error("User Loan activity listener error: ", error)));

            unsubscribers.push(onSnapshot(collection(db, "partners"), async (snapshot) => {
                const partnerListPromises = snapshot.docs.map(async (pDoc) => {
                    const productsRef = collection(db, "partners", pDoc.id, "products");
                    const productsSnap = await getDocs(productsRef);
                    const products = productsSnap.docs.map(prodDoc => ({id: prodDoc.id, ...prodDoc.data()}) as LoanProduct);
                    return { id: pDoc.id, ...pDoc.data(), products } as Partner;
                });
                const partnerList = await Promise.all(partnerListPromises);
                setPartners(partnerList);
            }, (error) => console.error("Partner listener error: ", error)));
        }

        return () => { 
            unsubscribers.forEach(unsub => unsub());
        }
    }, [user, isPartner, dataLoading, applications]);
    
    const setScore = async (score: number | null) => {
        if (!user || isPartner) return;
        const userDocRef = doc(db, "users", user.uid);
        try {
            await updateDoc(userDocRef, { score: score });
            setScoreState(score);
        } catch (error) {
            console.error("Error setting score:", error);
        }
    };

    const connectWalletAndSetScore = useCallback(async () => {
        if (!user || isPartner) return;
        const newScore = Math.floor(Math.random() * (850 - 550 + 1)) + 550;
        await setScore(newScore);
        router.push('/dashboard');
    }, [user, isPartner, router]);

    const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        try {
            await addDoc(collection(db, 'notifications'), { ...notification, read: false, timestamp: serverTimestamp() });
        } catch (error) {
            console.error("Error adding notification:", error);
        }
    }, []);
    
    const setAvatarUrl = useCallback(async (url: string) => {
        if (!user || isPartner) return;
        setAvatarUrlState(url); // Optimistic update
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { avatarUrl: url });
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL: url });
        }
        toast({ title: "Avatar updated!" });
    }, [user, isPartner]);

    const addApplication = useCallback(async (app: Omit<Application, 'id' | 'user' | 'userId' | 'createdAt' | 'score'>) => {
        if (!user || score === null) throw new Error("User not logged in or score not calculated.");
        
        const targetPartner = partners.find(p => p.name === app.loan.partnerName);
        if (!targetPartner) throw new Error("Lending partner not found.");
            
        const newApp = {
            ...app,
            score: score,
            userId: user.uid,
            loan: { ...app.loan, partnerId: targetPartner.id },
            createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "applications"), newApp);

        await addNotification({
            for: 'partner',
            userId: targetPartner.id,
            type: 'new_application',
            title: 'New Application',
            message: `${user.displayName || 'A new user'} applied for $${newApp.amount.toLocaleString()} (${newApp.loan.name}).`,
            href: '/dashboard/partner-admin'
        });
    }, [user, partners, addNotification, score]);
    
     const updateApplicationStatus = useCallback(async (appId: string, status: 'Approved' | 'Denied') => {
        const appRef = doc(db, "applications", appId);
        const appToUpdate = applications.find(a => a.id === appId);
        if (!appToUpdate) throw new Error("Application not found");

        await updateDoc(appRef, { status });
        
        if (status === 'Approved') {
            await addNotification({
                for: 'user',
                userId: appToUpdate.userId,
                type: 'approval',
                title: `Loan Approved`,
                message: `Your application for the ${appToUpdate.loan.name} is approved! Sign the contract to receive funds.`,
                href: '/dashboard'
            });
        } else { // Denied
            await addNotification({
                for: 'user',
                userId: appToUpdate.userId,
                type: 'denial',
                title: `Loan Denied`,
                message: `Your application for the ${appToUpdate.loan.name} has been denied.`,
                href: '/dashboard/my-loans'
            });
        }
    }, [applications, addNotification]);

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
            href: '/dashboard/partner-admin'
        });
        await addNotification({
            for: 'user',
            userId: appToSign.userId,
            type: 'info',
            title: 'Funds Disbursed!',
            message: `Your funds for your ${appToSign.loan.name} have been disbursed. You can track your loan in the 'My Loans' section.`,
            href: '/dashboard/my-loans'
        })

    }, [applications, addNotification]);
    
    const updatePartnerProfile = useCallback(async (profile: Partial<Omit<Partner, 'products' | 'description' | 'id'>>) => {
        if (!user || !isPartner) return;
        const partnerRef = doc(db, "partners", user.uid);
        await updateDoc(partnerRef, profile);
        toast({ title: "Profile Saved!", description: "Your public profile has been updated."})
    }, [user, isPartner]);
    
    const addPartnerProduct = useCallback(async (product: Omit<LoanProduct, 'id'>) => {
        if (!user || !isPartner) return;
        await addDoc(collection(db, "partners", user.uid, "products"), product);
    }, [user, isPartner]);
    
    const removePartnerProduct = useCallback(async (id: string) => {
        if (!user || !isPartner) return;
        await deleteDoc(doc(db, "partners", user.uid, "products", id));
    }, [user, isPartner]);

    const markNotificationsAsRead = useCallback(async (role: 'user' | 'partner') => {
       if (!user) return;
       const notifsToMark = notifications.filter(n => n.for === role && !n.read);
       if (notifsToMark.length === 0) return;

       const batch = writeBatch(db);
       notifsToMark.forEach(n => {
           const docRef = doc(db, 'notifications', n.id);
           batch.update(docRef, { read: true });
       });
       await batch.commit();
    }, [user, notifications]);

    const emailSignup = useCallback(async (email: string, pass: string, displayName: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(userCredential.user, { displayName: displayName.trim() });
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
        await updateProfile(userCredential.user, { displayName: name.trim() });
        const newPartner = {
            name: name.trim(),
            website: website.trim(),
            logo: `https://placehold.co/40x40/50D890/FFFFFF?text=${name.substring(0,2).toUpperCase()}`,
            description: `A new lending partner in the Credora ecosystem.`,
            createdAt: serverTimestamp()
        };
        await setDoc(doc(db, "partners", userCredential.user.uid), newPartner);
    }, []);
    
    const partnerLogin = useCallback(async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    }, []);
    
    const contextValue = useMemo(() => ({
        user,
        partner,
        isPartner,
        loading,
        dataLoading,
        logout,
        emailLogin,
        googleLogin,
        emailSignup,
        partnerLogin,
        partnerSignup,
        deleteAccount,
        score,
        setScore,
        connectWalletAndSetScore,
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
        user, partner, isPartner, loading, dataLoading, logout, emailLogin, googleLogin, emailSignup, partnerLogin, partnerSignup, deleteAccount,
        score, connectWalletAndSetScore, avatarUrl, setAvatarUrl, applications, addApplication, updateApplicationStatus, userSignLoan,
        partners, updatePartnerProfile, partnerProducts, addPartnerProduct, removePartnerProduct,
        notifications, markNotificationsAsRead, loanActivity,
    ]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

    