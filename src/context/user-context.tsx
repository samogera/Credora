
"use client";

import { createContext, useState, ReactNode, useEffect } from 'react';
import { ExplainRiskFactorsOutput } from '@/ai/flows/explain-risk-factors';
import { db, storage, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, query, where, getDocs, setDoc, deleteDoc, orderBy, writeBatch, documentId, getDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
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
    id: string;
    name: string;
    logo: string;
    description: string;
    products: LoanProduct[];
    website: string;
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
    };
    amount: number;
    status: 'Pending' | 'Approved' | 'Denied';
    aiExplanation?: ExplainRiskFactorsOutput | null;
    isExplaining?: boolean;
};

export type Notification = {
    id: string;
    for: 'user' | 'partner';
    userId: string; // ID of user or partner firm
    type: 'new_application' | 'approval' | 'denial' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
};

interface UserContextType {
    user: User | null;
    avatarUrl: string | null;
    setAvatarUrl: (url: string) => void;
    applications: Application[];
    addApplication: (app: Omit<Application, 'id' | 'user' | 'userId' >) => void;
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
}

const initialPartners: Partner[] = [
    {
      id: "partner-1",
      name: "Stellar Lend",
      logo: "https://placehold.co/40x40/111111/FFFFFF?text=SL",
      description: "Low-interest loans for Stellar ecosystem projects.",
      website: "https://stellarlend.finance",
      products: [
        { id: "sl-001", name: "Ecosystem Grant Loan", rate: "3.5%", maxAmount: 5000, term: 24, requirements: "Credit score above 750" },
        { id: "sl-002", name: "Stablecoin Personal Loan", rate: "5.0%", maxAmount: 10000, term: 12, requirements: "Credit score above 700" },
      ],
    },
    {
      id: "partner-2",
      name: "Aqua Finance",
      logo: "https://placehold.co/40x40/00ACFF/FFFFFF?text=AF",
      description: "DeFi lending powered by the AQUA token.",
      website: "https://aqua.network",
      products: [
          { id: "af-001", name: "AQUA-Backed Loan", rate: "4.2%", maxAmount: 7500, term: 18, requirements: "Credit score above 680" },
          { id: "af-002", name: "Liquidity Provider Loan", rate: "6.1%", maxAmount: 25000, term: 36, requirements: "Credit score above 720" },
      ],
    },
    {
      id: "partner-3",
      name: "Anchor Finance",
      logo: "https://placehold.co/40x40/FF4500/FFFFFF?text=AN",
      description: "Your anchor in the world of decentralized finance.",
      website: "https://anchor.finance",
      products: [
          { id: "an-001", name: "Small Business Loan", rate: "7.5%", maxAmount: 50000, term: 48, requirements: "Credit score above 650" },
      ],
    },
];

export const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [avatarUrl, setAvatarUrlState] = useState<string | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    // This simulates the single partner logged in - we'll assume partner-1
    const [partnerProfile, setPartnerProfileState] = useState({ name: "Stellar Lend", logo: "https://placehold.co/40x40/111111/FFFFFF?text=SL", website: "https://stellarlend.finance" });
    const [partnerProducts, setPartnerProducts] = useState<LoanProduct[]>([]);

    // Seed data and sign in anonymously on initial load
    useEffect(() => {
        const setup = async () => {
            try {
                // Ensure user is signed in anonymously for read/write access
                if (!auth.currentUser) {
                    await signInAnonymously(auth);
                }
                
                // Seed initial data if partners collection is empty
                const partnersRef = collection(db, "partners");
                const snapshot = await getDocs(partnersRef);

                if (snapshot.empty) {
                    console.log("Seeding partners...");
                    const batch = writeBatch(db);
                    initialPartners.forEach((partner) => {
                        const partnerDocRef = doc(db, "partners", partner.id);
                        batch.set(partnerDocRef, { name: partner.name, logo: partner.logo, description: partner.description, website: partner.website });
                        partner.products.forEach((product) => {
                            const productDocRef = doc(collection(db, "partners", partner.id, "products"), product.id);
                            const { id, ...productData } = product;
                            batch.set(productDocRef, productData);
                        });
                    });
                    await batch.commit();
                    console.log("Seeding complete.");
                }
            } catch (error) {
                console.error("Error during initial setup:", error);
            }
        };
        setup();
    }, []);

    // Set up auth state change listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser && !currentUser.isAnonymous) {
                // Create user doc if it doesn't exist
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (!userDocSnap.exists()) {
                    await setDoc(userDocRef, {
                        email: currentUser.email,
                        displayName: currentUser.displayName || `User #${currentUser.uid.substring(0,4)}`,
                        avatarUrl: null
                    }, { merge: true });
                }
            }
        });
        return () => unsubscribe();
    }, []);
    
    // Listeners for all data - requires authenticated user
    useEffect(() => {
        if (!user) return; // Don't run listeners until user is authenticated

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

        // This effect is for the logged-in partner view (partner-1)
        const partnerId = "partner-1"; 
        const unsubPartnerProfile = onSnapshot(doc(db, "partners", partnerId), (doc) => {
            if(doc.exists()){
                const data = doc.data();
                setPartnerProfileState({name: data.name, logo: data.logo, website: data.website});
            }
        });

        const unsubPartnerProducts = onSnapshot(collection(db, "partners", partnerId, "products"), (snapshot) => {
             setPartnerProducts(snapshot.docs.map(d => ({id: d.id, ...d.data()}) as LoanProduct));
        });

        // Listener for all applications (for partner view)
        const unsubApps = onSnapshot(query(collection(db, "applications"), orderBy("status", "asc")), (snapshot) => {
            const appsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Application));
            setApplications(appsData);
        }, (error) => console.error("All apps listener error: ", error));
        
        // Listener for all notifications (filtered on client)
        const unsubNotifs = onSnapshot(query(collection(db, "notifications"), orderBy("timestamp", "desc")), (snapshot) => {
            const allNotifs = snapshot.docs.map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp.toDate() } as Notification));
            setNotifications(allNotifs);
        }, (error) => console.error("All notifications listener error: ", error));

        // Listener for specific user's avatar
        let unsubUser: () => void = () => {};
        if (!user.isAnonymous) {
            const userDocRef = doc(db, "users", user.uid);
            unsubUser = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    setAvatarUrlState(doc.data().avatarUrl || null);
                }
            });
        }

        return () => {
            unsubPartners();
            unsubPartnerProfile();
            unsubPartnerProducts();
            unsubApps();
            unsubNotifs();
            unsubUser();
        };
    }, [user]);


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

    const addApplication = async (app: Omit<Application, 'id' | 'user' | 'userId' >) => {
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

        // Add notification for the user
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
        const partnerId = "partner-1";
        const partnerRef = doc(db, "partners", partnerId);

        try {
            let profileToUpdate = {...profile};
            if (profile.logo && profile.logo.startsWith('data:image')) {
                const storageRef = ref(storage, `partners/${partnerId}/logo.png`);
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
        const partnerId = "partner-1";
        await addDoc(collection(db, "partners", partnerId, "products"), product);
    }
    
    const removePartnerProduct = async (id: string) => {
        const partnerId = "partner-1";
        await deleteDoc(doc(db, "partners", partnerId, "products", id));
        toast({ title: "Product Removed", variant: "destructive" });
    }

    const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp'>) => {
        await addDoc(collection(db, 'notifications'), { ...notification, timestamp: new Date() });
    }

    const markNotificationsAsRead = async (role: 'user' | 'partner') => {
       let notifsToUpdateQuery;
       const notifsRef = collection(db, 'notifications');
       
       const relevantNotifications = notifications.filter(n => 
            n.for === role && 
            !n.read && 
            (role === 'partner' || (role === 'user' && user && n.userId === user.uid))
        );

       if (relevantNotifications.length === 0) return;

       const batch = writeBatch(db);
       relevantNotifications.forEach(n => {
           const docRef = doc(db, 'notifications', n.id);
           batch.update(docRef, { read: true });
       });
       await batch.commit();
    }

    const contextValue = {
        user,
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
        markNotificationsAsRead
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};
