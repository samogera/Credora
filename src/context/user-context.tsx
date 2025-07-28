
"use client";

import { createContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { ExplainRiskFactorsOutput } from '@/ai/flows/explain-risk-factors';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, query, where, getDocs, setDoc, deleteDoc, writeBatch, getDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, deleteUser } from 'firebase/auth';
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
    partnerId: string;
    user: {
        displayName: string;
        avatarUrl?: string | null;
        walletAddress?: string;
    };
    score: number;
    loan: {
        id: string;
        name: string;
        partnerName: string;
    };
    amount: number;
    status: 'Pending' | 'Approved' | 'Denied' | 'Signed';
    aiExplanation?: ExplainRiskFactorsOutput | null;
    isExplaining?: boolean;
    createdAt?: any;
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
    setScore: (score: number | null) => void;
    connectWalletAndSetScore: () => void;
    avatarUrl: string | null;
    setAvatarUrl: (url: string) => void;
    walletAddress: string | null;
    applications: Application[];
    addApplication: (app: Omit<Application, 'id' | 'user' | 'userId' | 'userAvatar' | 'createdAt' | 'score' | 'partnerId'>) => Promise<void>;
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
        setUser(null);
        setPartner(null);
        setIsPartner(null);
        setAvatarUrlState(null);
        setWalletAddress(null);
        setApplications([]);
        setNotifications([]);
        setLoanActivity([]);
        setPartnerProducts([]);
        setScoreState(null);
        setLoading(true);
        setDataLoading(true);
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
    
    // Auth state listener - determines user and their role
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            clearState(); // Clear all previous state on auth change
            if (currentUser) {
                setUser(currentUser);
                const partnerDocRef = doc(db, "partners", currentUser.uid);
                const partnerDocSnap = await getDoc(partnerDocRef);

                if (partnerDocSnap.exists()) {
                    setIsPartner(true);
                    setPartner({ id: partnerDocSnap.id, ...partnerDocSnap.data() } as Partner);
                } else {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    let userDocSnap = await getDoc(userDocRef);
                     if (!userDocSnap.exists()) {
                         await setDoc(userDocRef, { 
                           displayName: currentUser.displayName || `User-${currentUser.uid.substring(0,5)}`, 
                           email: currentUser.email,
                           avatarUrl: currentUser.photoURL || null, 
                           createdAt: serverTimestamp()
                       });
                       userDocSnap = await getDoc(userDocRef);
                    }
                    setIsPartner(false);
                    const userData = userDocSnap.data();
                    setAvatarUrlState(userData?.avatarUrl || null);
                    setScoreState(userData?.score === undefined ? null : userData.score);
                }
            } else {
                setIsPartner(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [clearState]);

    // Data listeners setup
    useEffect(() => {
        if (loading || isPartner === null || !user) {
            if(!loading && !user) setDataLoading(false);
            return;
        }
        
        setDataLoading(true);
        const unsubs: (() => void)[] = [];

        // USER-specific listeners
        if (isPartner === false) {
            // User profile listener
            unsubs.push(onSnapshot(doc(db, "users", user.uid), (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setAvatarUrlState(data.avatarUrl || user.photoURL || null);
                    setScoreState(data.score === undefined ? null : data.score);
                    setWalletAddress(data.walletAddress || null);
                }
            }));

            // User applications listener
            const qApps = query(collection(db, "applications"), where("userId", "==", user.uid));
            unsubs.push(onSnapshot(qApps, (snapshot) => {
                const userApps = snapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate() } as Application));
                setApplications(userApps.sort((a,b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)));
            }));
            
            // User loan activity listener
            const qUserLoans = query(collection(db, "loanActivity"), where("userId", "==", user.uid));
            unsubs.push(onSnapshot(qUserLoans, (snapshot) => {
                const userLoans = snapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate()}) as LoanActivityItem);
                setLoanActivity(userLoans.sort((a,b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)));
            }));

            // All partners listener for users
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

            // User notifications listener
            const qNotifs = query(collection(db, "notifications"), where("userId", "==", user.uid), where("for", "==", "user"));
            unsubs.push(onSnapshot(qNotifs, (snapshot) => {
                const userNotifs = snapshot.docs.map(d => ({ ...d.data(), id: d.id, timestamp: d.data().timestamp?.toDate() } as Notification));
                setNotifications(userNotifs.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)));
            }));
        }
        
        // PARTNER-specific listeners
        if (isPartner === true) {
            // Partner products listener
            unsubs.push(onSnapshot(collection(db, "partners", user.uid, "products"), (snapshot) => {
                setPartnerProducts(snapshot.docs.map(d => ({id: d.id, ...d.data()}) as LoanProduct));
            }));
        
            // Partner loan activity listener
            const qPartnerLoans = query(collection(db, "loanActivity"), where("partnerId", "==", user.uid));
            unsubs.push(onSnapshot(qPartnerLoans, (snapshot) => {
                const pLoans = snapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate()}) as LoanActivityItem);
                setLoanActivity(pLoans.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)));
            }));
            
            // Applications submitted TO this partner
            const qApps = query(collection(db, "partners", user.uid, "applications"));
            unsubs.push(onSnapshot(qApps, async (snapshot) => {
                const appPromises = snapshot.docs.map(async (d) => {
                    const appData = d.data();
                    const userSnap = await getDoc(doc(db, 'users', appData.userId));
                    const userData = userSnap.exists() ? {
                        displayName: userSnap.data()?.displayName || 'Unknown User',
                        avatarUrl: userSnap.data()?.avatarUrl || null,
                        walletAddress: userSnap.data()?.walletAddress || null,
                    } : { displayName: 'Unknown User', avatarUrl: null, walletAddress: null };
                    return { id: d.id, ...appData, createdAt: appData.createdAt?.toDate(), user: userData } as Application;
                });
                const appsData = await Promise.all(appPromises);
                setApplications(appsData.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)));
            }));

            // Partner notifications listener
            const qNotifs = query(collection(db, "notifications"), where("userId", "==", user.uid), where("for", "==", "partner"));
            unsubs.push(onSnapshot(qNotifs, (snapshot) => {
                const pNotifs = snapshot.docs.map(d => ({ ...d.data(), id: d.id, timestamp: d.data().timestamp?.toDate() } as Notification));
                setNotifications(pNotifs.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)));
            }));
        }

        setDataLoading(false);

        return () => { unsubs.forEach(unsub => unsub()) };

    }, [user, isPartner, loading]);

    // Redirection logic
    useEffect(() => {
       if(!loading && user && isPartner !== null) {
            if(isPartner) {
                router.push('/dashboard/partner-admin');
            } else {
                 if (score === null) {
                    router.push('/dashboard/data-sources');
                } else {
                    router.push('/dashboard');
                }
            }
       }
    },[user, isPartner, loading, router, score])

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
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const randomKey = Array.from({ length: 55 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        const newWalletAddress = 'G' + randomKey;
        await setScore(newScore, newWalletAddress);
    }, [user, isPartner]);
    
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

    const addApplication = useCallback(async (app: Omit<Application, 'id' | 'user' | 'userId' | 'createdAt' | 'score' | 'partnerId'>) => {
        if (!user || score === null) throw new Error("User not logged in or score not calculated.");
        
        const targetPartner = partners.find(p => p.name === app.loan.partnerName);
        if (!targetPartner) throw new Error("Lending partner not found.");
            
        const newApp = {
            ...app,
            score,
            userId: user.uid,
            partnerId: targetPartner.id,
            user: {
                displayName: user.displayName || 'Anonymous',
                avatarUrl: avatarUrl,
                walletAddress: walletAddress,
            },
            createdAt: serverTimestamp()
        };
        
        const batch = writeBatch(db);

        // 1. Create the user's application record
        const userAppRef = doc(collection(db, "applications"));
        batch.set(userAppRef, newApp);
        
        // 2. Create a copy for the partner
        const partnerAppRef = doc(collection(db, "partners", targetPartner.id, "applications"), userAppRef.id);
        batch.set(partnerAppRef, newApp);

        // 3. Create a notification for the partner
        const notificationData = {
            for: 'partner' as const,
            userId: targetPartner.id,
            type: 'new_application' as const,
            title: 'New Application',
            message: `${user.displayName || 'A user'} applied for $${newApp.amount.toLocaleString()} (${newApp.loan.name}).`,
            href: `/dashboard/partner-admin`,
            read: false, 
            timestamp: serverTimestamp()
        };
        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, notificationData);

        await batch.commit();

    }, [user, score, partners, avatarUrl, walletAddress]);
    
     const updateApplicationStatus = useCallback(async (appId: string, status: 'Approved' | 'Denied') => {
        if(!auth.currentUser || !isPartner) {
            toast({ variant: 'destructive', title: "Permission Denied" });
            return;
        }
        
        const partnerAppRef = doc(db, "partners", auth.currentUser.uid, "applications", appId);
        const partnerAppDoc = await getDoc(partnerAppRef);
        if (!partnerAppDoc.exists()) throw new Error("Application not found for this partner.");
        
        const appToUpdate = {id: partnerAppDoc.id, ...partnerAppDoc.data()} as Application;
        const userAppRef = doc(db, "applications", appId);
        
        const batch = writeBatch(db);

        // 1. Update the user's application if it exists
        batch.update(userAppRef, { status });

        // 2. Update the partner's copy
        batch.update(partnerAppRef, { status });
        
        // 3. Create notification for user
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

        // 4. If approved, create loan activity record
        if (status === 'Approved') {
            const userSnap = await getDoc(doc(db, 'users', appToUpdate.userId));
            if(userSnap.exists()){
                const loanActivityData = {
                    user: { displayName: userSnap.data()?.displayName || 'Unknown User' },
                    userId: appToUpdate.userId,
                    partnerId: appToUpdate.partnerId,
                    partnerName: appToUpdate.loan.partnerName,
                    amount: appToUpdate.amount,
                    repaid: 0,
                    interestAccrued: 0,
                    status: 'Active',
                    createdAt: serverTimestamp(),
                };
                const loanActivityRef = doc(collection(db, 'loanActivity'));
                batch.set(loanActivityRef, loanActivityData);
            }
        }
        
        await batch.commit();

    }, [isPartner]);

    const userSignLoan = useCallback(async (appId: string) => {
        const appRef = doc(db, "applications", appId);
        const appDoc = await getDoc(appRef);
        if (!appDoc.exists()) throw new Error("Application not found.");
        const appData = appDoc.data();

        const batch = writeBatch(db);
        batch.update(appRef, { status: 'Signed' });
        
        const partnerAppRef = doc(db, "partners", appData.partnerId, "applications", appId);
        batch.update(partnerAppRef, { status: 'Signed' });

        await batch.commit();

    }, []);
    
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
    }), [
        user, partner, isPartner, loading, dataLoading, logout, emailLogin, emailSignup, partnerLogin, partnerSignup, deleteAccount,
        score, connectWalletAndSetScore, avatarUrl, setAvatarUrl, walletAddress, applications, addApplication, updateApplicationStatus, userSignLoan,
        partners, updatePartnerProfile, partnerProducts, addPartnerProduct, removePartnerProduct,
        notifications, markNotificationsAsRead, loanActivity,
    ]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};
