
"use client";

import { createContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { ExplainRiskFactorsOutput } from '@/ai/flows/explain-risk-factors';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, query, where, getDocs, setDoc, deleteDoc, writeBatch, getDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithRedirect, getRedirectResult, updateProfile, deleteUser } from 'firebase/auth';
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
    walletAddress: string | null;
    applications: Application[];
    addApplication: (app: Omit<Application, 'id' | 'user' | 'userId' | 'userAvatar' | 'createdAt' | 'score' | 'partnerId' | 'walletAddress'>) => Promise<void>;
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
        setIsPartner(false);
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
    
    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                setUser(currentUser);
            } else {
                clearState();
                setUser(null);
                setLoading(false);
            }
        });

        getRedirectResult(auth).catch(error => {
            console.error("Google Sign-in redirect error:", error);
            toast({ variant: 'destructive', title: "Google Sign-in Failed", description: "Could not complete sign-in with Google." });
        });

        return () => unsubscribe();
    }, [clearState]);

    // Role checker and initial data fetch trigger
    useEffect(() => {
        if (!user) return;
    
        const checkUserRoleAndSetup = async () => {
            const partnerDocRef = doc(db, "partners", user.uid);
            const partnerDocSnap = await getDoc(partnerDocRef);
    
            if (partnerDocSnap.exists()) {
                setPartner({ id: user.uid, ...partnerDocSnap.data() } as Partner);
                setIsPartner(true);
            } else {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const data = userDocSnap.data();
                    setAvatarUrlState(data.avatarUrl || user.photoURL || null);
                    setScoreState(data.score === undefined ? null : data.score);
                    setWalletAddress(data.walletAddress || null);
                } else {
                     await setDoc(userDocRef, { 
                       displayName: user.displayName || `User-${user.uid.substring(0,5)}`, 
                       email: user.email,
                       avatarUrl: user.photoURL || null, 
                       score: null,
                       walletAddress: null,
                       createdAt: serverTimestamp()
                   });
                   setScoreState(null);
                   setAvatarUrlState(user.photoURL || null);
                   setWalletAddress(null);
                }
                setIsPartner(false);
            }
            setLoading(false); // Auth and role check complete
        };
    
        checkUserRoleAndSetup();
    }, [user]);

    // Data listeners based on role
    useEffect(() => {
        if (loading || !user) {
            setDataLoading(true);
            return;
        };

        setDataLoading(true);
        let unsubs: (() => void)[] = [];
        
        const setupListeners = async () => {
            // Universal listeners
            unsubs.push(onSnapshot(query(collection(db, "notifications"), where("userId", "==", user.uid)), (snapshot) => {
                setNotifications(snapshot.docs.map(d => ({ ...d.data(), id: d.id, timestamp: d.data().timestamp?.toDate() } as Notification))
                    .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)));
            }));
    
            if (isPartner) {
                // Partner-specific listeners
                unsubs.push(onSnapshot(doc(db, "partners", user.uid), (doc) => {
                    if (doc.exists()) setPartner({ id: user.uid, ...doc.data() } as Partner);
                }));

                unsubs.push(onSnapshot(collection(db, "partners", user.uid, "products"), (snapshot) => {
                    setPartnerProducts(snapshot.docs.map(d => ({id: d.id, ...d.data()}) as LoanProduct));
                }));
            
                unsubs.push(onSnapshot(query(collection(db, "loanActivity"), where("partnerId", "==", user.uid)), (snapshot) => {
                    setLoanActivity(snapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate()}) as LoanActivityItem)
                        .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)));
                }));
                
                unsubs.push(onSnapshot(query(collection(db, "applications"), where("partnerId", "==", user.uid)), async (snapshot) => {
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

            } else { // Regular user listeners
                 unsubs.push(onSnapshot(doc(db, "users", user.uid), (doc) => { // Listen to own user document
                    if (doc.exists()) {
                         const data = doc.data();
                         setAvatarUrlState(data.avatarUrl || user.photoURL || null);
                         setScoreState(data.score === undefined ? null : data.score);
                         setWalletAddress(data.walletAddress || null);
                    }
                }));

                unsubs.push(onSnapshot(query(collection(db, "applications"), where("userId", "==", user.uid)), (snapshot) => {
                    setApplications(snapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate() } as Application))
                        .sort((a,b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)));
                }));
                
                unsubs.push(onSnapshot(query(collection(db, "loanActivity"), where("userId", "==", user.uid)), (snapshot) => {
                   setLoanActivity(snapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate()}) as LoanActivityItem));
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
            }
            setDataLoading(false);
        }
        
        setupListeners();

        return () => {
            unsubs.forEach(unsub => unsub());
        }
    }, [user, isPartner, loading]);

    useEffect(() => {
       if(!loading && user) {
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

    const setScore = async (score: number | null, walletAddr?: string) => {
        if (!user || isPartner) return;
        const userDocRef = doc(db, "users", user.uid);
        try {
            await updateDoc(userDocRef, { score: score, walletAddress: walletAddr });
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

    const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        await addDoc(collection(db, 'notifications'), { ...notification, read: false, timestamp: serverTimestamp() });
    }, []);

    const addApplication = useCallback(async (app: Omit<Application, 'id' | 'user' | 'userId' | 'createdAt' | 'score' | 'partnerId' | 'walletAddress'>) => {
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
        const appRef = await addDoc(collection(db, "applications"), newApp);

        await addNotification({
            for: 'partner',
            userId: targetPartner.id,
            type: 'new_application',
            title: 'New Application',
            message: `${newApp.user.displayName} applied for $${newApp.amount.toLocaleString()} (${newApp.loan.name}).`,
            href: `/dashboard/partner-admin`
        });
    }, [user, score, partners, addNotification, avatarUrl, walletAddress]);
    
     const updateApplicationStatus = useCallback(async (appId: string, status: 'Approved' | 'Denied') => {
        const appRef = doc(db, "applications", appId);
        const appDoc = await getDoc(appRef);
        if (!appDoc.exists()) throw new Error("Application not found");

        const appToUpdate = { id: appDoc.id, ...appDoc.data() } as Application;
        
        await updateDoc(appRef, { status });
        
        const notificationType = status === 'Approved' ? 'approval' : 'denial';
        const notificationTitle = `Loan ${status}`;
        const notificationMessage = `Your application for the ${appToUpdate.loan.name} was ${status.toLowerCase()}.`;

        await addNotification({
            for: 'user',
            userId: appToUpdate.userId,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            href: '/dashboard/my-loans'
        });

        if (status === 'Approved') {
            const loanActivityData = {
                user: { displayName: appToUpdate.user.displayName || 'Unknown User' },
                userId: appToUpdate.userId,
                partnerId: appToUpdate.partnerId,
                partnerName: appToUpdate.loan.partnerName,
                amount: appToUpdate.amount,
                repaid: 0,
                interestAccrued: 0,
                status: 'Active',
                createdAt: serverTimestamp(),
            };
            await addDoc(collection(db, 'loanActivity'), loanActivityData);
        }
    }, [addNotification]);

    const userSignLoan = useCallback(async (appId: string) => {
        const appToSign = applications.find(a => a.id === appId);
        if (!appToSign) throw new Error("This loan cannot be signed.");

        const appRef = doc(db, "applications", appId);
        await updateDoc(appRef, { status: 'Signed' });
    }, [applications]);
    
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
        await signInWithRedirect(auth, provider);
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
        user, partner, isPartner, loading, dataLoading, logout, emailLogin, googleLogin, emailSignup, partnerLogin, partnerSignup, deleteAccount,
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
