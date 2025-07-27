
"use client";

import { createContext, useState, ReactNode, useEffect } from 'react';
import { ExplainRiskFactorsOutput } from '@/ai/flows/explain-risk-factors';
import { db, storage, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, query, where, getDocs, setDoc, deleteDoc, orderBy, writeBatch, documentId } from 'firebase/firestore';
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
    updatePartnerProfile: (profile: Partial<Omit<Partner, 'products' | 'description'>>) => void;
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

    // Ensure user is signed in anonymously for read access
    useEffect(() => {
        signInAnonymously(auth).catch((error) => {
            console.error("Anonymous sign-in failed:", error);
        });
    }, []);

    useEffect(() => {
        // Seed initial data if partners collection is empty
        const seedPartners = async () => {
            const partnersRef = collection(db, "partners");
            const q = query(partnersRef, where(documentId(), "in", initialPartners.map(p => p.id)));
            const snapshot = await getDocs(q);
            if (snapshot.size !== initialPartners.length) {
                console.log("Seeding partners...");
                const batch = writeBatch(db);
                initialPartners.forEach((partner) => {
                    const partnerDocRef = doc(db, "partners", partner.id);
                    batch.set(partnerDocRef, { name: partner.name, logo: partner.logo, description: partner.description, website: partner.website });
                    partner.products.forEach((product) => {
                        const productDocRef = doc(collection(db, "partners", partner.id, "products"), product.id);
                        batch.set(productDocRef, { ...product, id: undefined }); // Don't store id field inside doc
                    });
                });
                await batch.commit();
            }
        };
        seedPartners();
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser && !currentUser.isAnonymous) {
                const userDocRef = doc(db, "users", currentUser.uid);
                await setDoc(userDocRef, { 
                    email: currentUser.email, 
                    displayName: currentUser.displayName || `User #${currentUser.uid.substring(0,4)}` 
                }, { merge: true });
            }
        });
        return () => unsubscribe();
    }, []);
    

    // Listeners for user-specific data
    useEffect(() => {
        if (!user || user.isAnonymous) {
            setApplications([]);
            setNotifications(prev => prev.filter(n => n.for !== 'user'));
            return;
        }

        const qApps = query(collection(db, "applications"), where("userId", "==", user.uid));
        const unsubscribeApps = onSnapshot(qApps, (snapshot) => {
            const userApps = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Application));
            setApplications(userApps);
        }, (error) => console.error("User app listener error: ", error));

        const qNotifs = query(collection(db, "notifications"), where("userId", "==", user.uid), orderBy("timestamp", "desc"));
        const unsubscribeNotifs = onSnapshot(qNotifs, (snapshot) => {
            const userNotifs = snapshot.docs.map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp.toDate() } as Notification));
            setNotifications(prev => [...prev.filter(n => n.for !== 'user'), ...userNotifs]);
        }, (error) => console.error("User notification listener error: ", error));
        
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setAvatarUrlState(doc.data().avatarUrl || null);
            }
        });

        return () => {
            unsubscribeApps();
            unsubscribeNotifs();
            unsubscribeUser();
        };
    }, [user]);
    
    // Listener for all partners and their products (for user view)
    useEffect(() => {
        const unsubscribePartners = onSnapshot(collection(db, "partners"), (snapshot) => {
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

        return () => unsubscribePartners();
    }, [])

    // This effect is for the logged-in partner view
    useEffect(() => {
         const partnerId = "partner-1";

         const unsubProfile = onSnapshot(doc(db, "partners", partnerId), (doc) => {
            if(doc.exists()){
                const data = doc.data();
                setPartnerProfileState({name: data.name, logo: data.logo, website: data.website});
            }
         });

         const unsubProducts = onSnapshot(collection(db, "partners", partnerId, "products"), (snapshot) => {
             setPartnerProducts(snapshot.docs.map(d => ({id: d.id, ...d.data()}) as LoanProduct));
         });

         const qApps = query(collection(db, "applications"), orderBy("status", "desc"));
         const unsubscribeApps = onSnapshot(qApps, (snapshot) => {
             const appsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Application));
             setApplications(appsData);
         }, (error) => console.error("Partner app listener error: ", error));


         const qNotifs = query(collection(db, "notifications"), where("for", "==", 'partner'), orderBy("timestamp", "desc"));
         const unsubscribeNotifs = onSnapshot(qNotifs, (snapshot) => {
             const partnerNotifs = snapshot.docs.map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp.toDate() } as Notification));
             setNotifications(prev => [...prev.filter(n => n.for !== 'partner'), ...partnerNotifs]);
         }, (error) => console.error("Partner notif listener error: ", error));


         return () => {
            unsubProfile();
            unsubProducts();
            unsubscribeApps();
            unsubscribeNotifs();
         }
    }, [])

    const setAvatarUrl = async (url: string) => {
        if (!user || user.isAnonymous) return;
        const userDocRef = doc(db, "users", user.uid);
        try {
            if (url.startsWith('data:image')) {
                const storageRef = ref(storage, `users/${user.uid}/avatar.png`);
                const snapshot = await uploadString(storageRef, url, 'data_url');
                const downloadUrl = await getDownloadURL(snapshot.ref);
                await updateDoc(userDocRef, { avatarUrl: downloadUrl });
                setAvatarUrlState(downloadUrl);
            } else {
                 await updateDoc(userDocRef, { avatarUrl: url });
                 setAvatarUrlState(url);
            }
        } catch (error) {
            console.error("Error updating avatar:", error);
        }
    }

    const addApplication = async (app: Omit<Application, 'id' | 'user' | 'userId' >) => {
        if (!user || user.isAnonymous) return;
        const newApp = { 
            ...app, 
            userId: user.uid, 
            user: {
                displayName: user.displayName || `User #${user.uid.substring(0,4)}`,
                avatarUrl: avatarUrl
            }
        };
        await addDoc(collection(db, "applications"), newApp);
    };

    const updateApplicationStatus = async (id: string, status: 'Approved' | 'Denied') => {
        const appRef = doc(db, "applications", id);
        await updateDoc(appRef, { status });
    };
    
    const updatePartnerProfile = async (profile: Partial<Omit<Partner, 'products' | 'description' | 'id'>>) => {
        const partnerId = "partner-1";
        const partnerRef = doc(db, "partners", partnerId);

        if (profile.logo && profile.logo.startsWith('data:image')) {
            const storageRef = ref(storage, `partners/${partnerId}/logo.png`);
            const snapshot = await uploadString(storageRef, profile.logo, 'data_url');
            const downloadUrl = await getDownloadURL(snapshot.ref);
            profile.logo = downloadUrl;
        }

        await updateDoc(partnerRef, profile);
        toast({ title: "Profile Saved!", description: "Your public profile has been updated."})
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
       
       if (role === 'user' && user && !user.isAnonymous) {
           notifsToUpdateQuery = query(notifsRef, where("for", "==", "user"), where("userId", "==", user.uid), where("read", "==", false));
       } else if (role === 'partner') {
           notifsToUpdateQuery = query(notifsRef, where("for", "==", "partner"), where("read", "==", false));
       } else {
           return;
       }

       const snapshot = await getDocs(notifsToUpdateQuery);
       if (snapshot.empty) return;

       const batch = writeBatch(db);
       snapshot.docs.forEach(d => {
           batch.update(d.ref, { read: true });
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
