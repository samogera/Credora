

"use client";

import { createContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { ExplainRiskFactorsOutput } from '@/ai/flows/explain-risk-factors';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, query, where, getDocs, setDoc, deleteDoc, writeBatch, getDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, deleteUser } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
// TODO: REPLACE WITH REAL SOROBAN CALL
import { createLoan, getLoan, repayLoan } from '@/lib/soroban-mock';

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
    id: string; // Firestore doc ID
    sorobanLoanId?: string; // ID from the mock/real Soroban contract
    user: {
        displayName: string;
    };
    amount: number;
    repaid?: number;
    interestAccrued?: number;
    status: 'Active' | 'Paid Off' | 'Delinquent' | 'active' | 'repaid' | 'defaulted';
    createdAt: any;
    partnerId: string;
    partnerName: string;
    userId: string;
    term: number;
    interestRate: number;
};

export type Application = {
    id:string;
    userId: string;
    user?: {
        displayName: string;
        avatarUrl?: string | null;
        walletAddress?: string;
    };
    score: number;
    loan: {
        id: string;
        name: string;
        partnerName: string;
        partnerId: string;
        interestRate: number;
        term: number;
    };
    amount: number;
    status: 'Pending' | 'Approved' | 'Denied' | 'Signed';
    aiExplanation?: ExplainRiskFactorsOutput | null;
    isExplaining?: boolean;
    createdAt?: any;
    partnerId: string;
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
    isPartner: boolean | null; // Can be null during initial auth check
    loading: boolean;
    dataLoading: boolean;
    logout: () => Promise<void>;
    emailLogin: (email: string, pass: string) => Promise<void>;
    emailSignup: (email: string, pass: string, displayName: string) => Promise<void>;
    partnerLogin: (email: string, pass: string) => Promise<void>;
    partnerSignup: (email: string, pass: string, name: string, website: string) => Promise<void>;
    deleteAccount: () => Promise<void>;
    score: number | null;
    setScore: (score: number | null, walletAddr?: string) => void;
    connectWalletAndSetScore: () => void;
    avatarUrl: string | null;
    setAvatarUrl: (url: string) => void;
    walletAddress: string | null;
    applications: Application[];
    addApplication: (app: Omit<Application, 'id' | 'user' | 'userId' | 'createdAt' | 'score' | 'partnerId' >) => Promise<void>;
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
    refreshLoanActivity: () => Promise<void>;
}

export const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [partner, setPartner] = useState<Partner | null>(null);
    const [isPartner, setIsPartner] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(true);
    
    const [avatarUrl, setAvatarUrlState] = useState<string | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loanActivity, setLoanActivity] = useState<LoanActivityItem[]>([]);
    const [partnerProducts, setPartnerProducts] = useState<LoanProduct[]>([]);
    const [score, setScoreState] = useState<number | null>(null);
    
    const router = useRouter();

    const clearState = useCallback(() => {
        setPartner(null);
        setAvatarUrlState(null);
        setWalletAddress(null);
        setApplications([]);
        setNotifications([]);
        setLoanActivity([]);
        setPartnerProducts([]);
        setScoreState(null);
        setDataLoading(true);
    }, []);

    const logout = useCallback(async () => {
        await signOut(auth);
        clearState();
        setUser(null);
        setIsPartner(null);
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
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            clearState(); 
            if (currentUser) {
                const partnerDocRef = doc(db, "partners", currentUser.uid);
                const partnerDocSnap = await getDoc(partnerDocRef);
                
                setUser(currentUser);
                if (partnerDocSnap.exists()) {
                    setIsPartner(true);
                    setPartner({ id: partnerDocSnap.id, ...partnerDocSnap.data() } as Partner);
                } else {
                    setIsPartner(false);
                }
            } else {
                setUser(null);
                setIsPartner(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [clearState]);

    const refreshLoanActivity = useCallback(async () => {
        if (!user) return;
    
        const collectionRef = collection(db, "loanActivity");
        const q = isPartner 
            ? query(collectionRef, where("partnerId", "==", user.uid))
            : query(collectionRef, where("userId", "==", user.uid));
            
        const snapshot = await getDocs(q);
        
        const updatedLoanActivityPromises = snapshot.docs.map(async (doc) => {
            const loanData = doc.data() as Omit<LoanActivityItem, 'id' | 'createdAt'>;
            
            // Ensure sorobanLoanId is a clean number string before parsing
            const loanIdNum = parseInt(String(loanData.sorobanLoanId || '0'), 10);
            
            if (isNaN(loanIdNum) || loanIdNum === 0) {
                 return { ...loanData, id: doc.id, createdAt: loanData.createdAt?.toDate() } as LoanActivityItem;
            }
            
            // TODO: REPLACE WITH REAL SOROBAN CALL
            const onChainLoan = await getLoan(loanIdNum);
            
            return {
                ...loanData,
                id: doc.id,
                repaid: onChainLoan?.repaid ?? loanData.repaid,
                status: onChainLoan?.status ?? loanData.status,
                createdAt: loanData.createdAt?.toDate()
            } as LoanActivityItem;
        });
        
        const updatedLoanActivity = await Promise.all(updatedLoanActivityPromises);
    
        setLoanActivity(updatedLoanActivity.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)));
    
    }, [user, isPartner]);
    
     // Data fetching useEffect based on user role
    useEffect(() => {
        if (!user || isPartner === null) {
            setDataLoading(false);
            return;
        }

        setDataLoading(true);
        const unsubs: (() => void)[] = [];
        
        const refreshAndListen = () => {
            refreshLoanActivity();
            const loanActivityRef = collection(db, "loanActivity");
            const q = isPartner 
                ? query(loanActivityRef, where("partnerId", "==", user.uid))
                : query(loanActivityRef, where("userId", "==", user.uid));
            return onSnapshot(q, () => {
                refreshLoanActivity();
            });
        };

        if (isPartner === false) { // USER-specific listeners
            unsubs.push(onSnapshot(doc(db, "users", user.uid), (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setAvatarUrlState(data.avatarUrl || user.photoURL || null);
                    setScoreState(data.score === undefined ? null : data.score);
                    setWalletAddress(data.walletAddress || null);
                }
            }));
            const qApps = query(collection(db, "applications"), where("userId", "==", user.uid));
            unsubs.push(onSnapshot(qApps, (snapshot) => {
                const userApps = snapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate() } as Application));
                setApplications(userApps.sort((a,b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)));
            }));
            unsubs.push(onSnapshot(collection(db, "partners"), async (snapshot) => {
                const partnerListPromises = snapshot.docs.map(async (pDoc) => {
                    const productsRef = collection(db, "partners", pDoc.id, "products");
                    const productsSnap = await getDocs(productsRef);
                    const products = productsSnap.docs.map(prodDoc => ({id: prodDoc.id, ...prodDoc.data()}) as LoanProduct);
                    return { id: pDoc.id, ...pDoc.data(), products } as Partner;
                });
                const partnerList = await Promise.all(partnerListPromises);
                setPartners(partnerList);
            }));
            const qNotifs = query(collection(db, "notifications"), where("userId", "==", user.uid), where("for", "==", "user"));
            unsubs.push(onSnapshot(qNotifs, (snapshot) => {
                const userNotifs = snapshot.docs.map(d => ({ ...d.data(), id: d.id, timestamp: d.data().timestamp?.toDate() } as Notification));
                setNotifications(userNotifs.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)));
            }));
            unsubs.push(refreshAndListen());
        } else if (isPartner === true) { // PARTNER-specific listeners
            unsubs.push(onSnapshot(collection(db, "partners", user.uid, "products"), (snapshot) => {
                setPartnerProducts(snapshot.docs.map(d => ({id: d.id, ...d.data()}) as LoanProduct));
            }));
            const qPartnerApps = query(collection(db, "applications"), where("loan.partnerId", "==", user.uid));
            unsubs.push(onSnapshot(qPartnerApps, (snapshot) => {
                const appsDataPromises = snapshot.docs.map(async (d) => {
                    const app = {...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate() } as Application;
                    const userDoc = await getDoc(doc(db, 'users', app.userId));
                    if (userDoc.exists()) {
                        app.user = {
                            displayName: userDoc.data().displayName,
                            avatarUrl: userDoc.data().avatarUrl,
                            walletAddress: userDoc.data().walletAddress
                        }
                    }
                    return app;
                });
                Promise.all(appsDataPromises).then(appsData => {
                    setApplications(appsData.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)));
                });
            }));
            const qNotifs = query(collection(db, "notifications"), where("userId", "==", user.uid), where("for", "==", "partner"));
            unsubs.push(onSnapshot(qNotifs, (snapshot) => {
                const pNotifs = snapshot.docs.map(d => ({ ...d.data(), id: d.id, timestamp: d.data().timestamp?.toDate() } as Notification));
                setNotifications(pNotifs.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)));
            }));
             unsubs.push(refreshAndListen());
        }
        setDataLoading(false);
        return () => { unsubs.forEach(unsub => unsub()) };
    
    }, [user, isPartner, refreshLoanActivity]);
    
    useEffect(() => {
       if(!loading && user && isPartner !== null) {
            const currentPath = window.location.pathname;
            if (isPartner) {
                if (!currentPath.startsWith('/dashboard/partner-admin')) {
                    router.push('/dashboard/partner-admin');
                }
            } else {
                if (!currentPath.startsWith('/dashboard') || currentPath.startsWith('/dashboard/partner-admin')) {
                    router.push(score === null ? '/dashboard/connect-wallet' : '/dashboard');
                }
            }
       }
       if(!loading && !user) {
            const currentPath = window.location.pathname;
            if(currentPath.startsWith('/dashboard')) {
                router.push('/login');
            }
       }
    },[user, isPartner, loading, router, score]);

    const setScore = async (newScore: number | null, walletAddr?: string) => {
        if (!user || isPartner) return;
        const userDocRef = doc(db, "users", user.uid);
        try {
            await updateDoc(userDocRef, { score: newScore, walletAddress: walletAddr });
        } catch (error) {
            console.error("Error setting score:", error);
        }
    };

    const connectWalletAndSetScore = useCallback(async () => {
        if (!user || isPartner) return;
        const newScore = Math.floor(Math.random() * (850 - 550 + 1)) + 550;
        const newWalletAddress = 'GUSERWALLETMOCK'; 
        await setScore(newScore, newWalletAddress);
        toast({
          title: "Soroban Auth",
          description: "Please sign the SEP-10 transaction to authenticate your wallet.",
        });
    }, [user, isPartner]);
    
    const setAvatarUrl = useCallback(async (url: string) => {
        if (!user || isPartner) return;
        setAvatarUrlState(url); 
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { avatarUrl: url });
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL: url });
        }
        toast({ title: "Avatar updated!" });
    }, [user, isPartner]);

    const addApplication = useCallback(async (app: Omit<Application, 'id' | 'user' | 'userId' | 'createdAt' | 'score' | 'partnerId' >) => {
        if (!user || score === null) throw new Error("User not logged in or score not calculated.");
        
        const targetPartner = partners.find(p => p.name === app.loan.partnerName);
        if (!targetPartner) throw new Error("Lending partner not found.");
            
        const newApp: Omit<Application, 'id' | 'aiExplanation' | 'isExplaining'> = {
            ...app,
            score,
            userId: user.uid,
            loan: {
                ...app.loan,
                partnerId: targetPartner.id,
            },
            partnerId: targetPartner.id,
            createdAt: serverTimestamp()
        };
        
        const batch = writeBatch(db);
        const appRef = doc(collection(db, "applications"));
        batch.set(appRef, newApp);

        const notificationData = {
            for: 'partner' as const,
            userId: targetPartner.id,
            type: 'new_application'as const,
            title: 'New Application',
            message: `${user.displayName || 'A user'} applied for $${newApp.amount.toLocaleString()} (${newApp.loan.name}).`,
            href: `/dashboard/partner-admin`,
            read: false, 
            timestamp: serverTimestamp()
        };
        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, notificationData);

        await batch.commit();

    }, [user, score, partners]);
    
    const updateApplicationStatus = useCallback(async (appId: string, status: 'Approved' | 'Denied') => {
        if(!auth.currentUser || !isPartner) {
            toast({ variant: 'destructive', title: "Permission Denied" });
            return;
        }
        
        const appRef = doc(db, "applications", appId);
        const appDoc = await getDoc(appRef);
        if (!appDoc.exists()) throw new Error("Application not found.");
        const appToUpdate = appDoc.data() as Application;

        if(appToUpdate.loan.partnerId !== auth.currentUser.uid) {
             toast({ variant: 'destructive', title: "Permission Denied" });
             return;
        }
        
        const batch = writeBatch(db);
        batch.update(appRef, { status });
        
        const notificationType = status === 'Approved' ? 'approval' : 'denial';
        const notificationTitle = `Loan ${status}`;
        const notificationMessage = `Your application for the ${appToUpdate.loan.name} from ${appToUpdate.loan.partnerName} was ${status.toLowerCase()}.`;
        const userNotifRef = doc(collection(db, 'notifications'));
        batch.set(userNotifRef, {
            for: 'user',
            userId: appToUpdate.userId,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            href: '/dashboard/my-loans',
            read: false,
            timestamp: serverTimestamp()
        });
        
        await batch.commit();
    }, [isPartner]);

    const userSignLoan = useCallback(async (appId: string) => {
        if (!user || isPartner) return;
        
        const appRef = doc(db, "applications", appId);
        const appDoc = await getDoc(appRef);
        if (!appDoc.exists() || appDoc.data().userId !== user.uid) {
            throw new Error("Application not found or permission denied.");
        }
        
        const appData = appDoc.data() as Application;
        
        try {
            // TODO: REPLACE WITH REAL SOROBAN CALL
            const txHash = await createLoan(
                appData.loan.partnerId, 
                appData.user?.walletAddress || '', 
                appData.amount,
                appData.loan.interestRate,
                appData.loan.term
            );
            
            const loanIdString = txHash.split('-').pop(); 
            if(!loanIdString || isNaN(parseInt(loanIdString))) {
                throw new Error("Invalid loan ID returned from mock Soroban.");
            }
            const loanId = parseInt(loanIdString, 10);

            const rate = appData.loan.interestRate / 100 / 12;
            const term = appData.loan.term;
            const monthlyPayment = term > 0 ? (appData.amount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1) : appData.amount;
            const totalRepayment = term > 0 ? monthlyPayment * term : appData.amount;
            const totalInterest = totalRepayment - appData.amount;

            const loanActivityData: Omit<LoanActivityItem, 'id' | 'createdAt'> = {
                sorobanLoanId: String(loanId),
                user: { displayName: appData.user?.displayName || 'Unknown User' },
                userId: appData.userId,
                partnerId: appData.loan.partnerId,
                partnerName: appData.loan.partnerName,
                amount: appData.amount,
                repaid: 0,
                interestAccrued: totalInterest,
                status: 'Active',
                term: appData.loan.term,
                interestRate: appData.loan.interestRate
            };

            const batch = writeBatch(db);
            batch.update(appRef, { status: 'Signed' });
            
            const loanActivityRef = doc(collection(db, 'loanActivity'));
            batch.set(loanActivityRef, {...loanActivityData, createdAt: serverTimestamp()});

            await batch.commit();
            await refreshLoanActivity();

        } catch (e: any) {
            console.error("Mock Soroban error:", e);
            toast({
                title: "Soroban Mock Error",
                description: e.message || "Could not create loan on the mock Soroban network.",
                variant: 'destructive',
            });
            throw e; // re-throw to be caught in component
        }
    }, [user, isPartner, refreshLoanActivity]);
    
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
        await updateProfile(userCredential.user, { displayName: displayName.trim(), photoURL: `https://placehold.co/100x100/50D890/FFFFFF?text=${displayName.substring(0,2).toUpperCase()}` });
        await setDoc(doc(db, "users", userCredential.user.uid), {
            displayName: displayName.trim(),
            email: userCredential.user.email,
            avatarUrl: `https://placehold.co/100x100/50D890/FFFFFF?text=${displayName.substring(0,2).toUpperCase()}`,
            createdAt: serverTimestamp()
        });
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
        emailSignup,
        partnerLogin,
        partnerSignup,
        deleteAccount,
        score,
        setScore,
        connectWalletAndSetScore,
        avatarUrl,
        setAvatarUrl,
        walletAddress,
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
        refreshLoanActivity,
    }), [
        user, partner, isPartner, loading, dataLoading, logout, emailLogin, emailSignup, partnerLogin, partnerSignup, deleteAccount,
        score, connectWalletAndSetScore, avatarUrl, setAvatarUrl, walletAddress, applications, addApplication, updateApplicationStatus, userSignLoan,
        partners, updatePartnerProfile, partnerProducts, addPartnerProduct, removePartnerProduct,
        notifications, markNotificationsAsRead, loanActivity, refreshLoanActivity
    ]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};
