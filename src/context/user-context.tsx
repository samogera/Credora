

"use client";

import { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { ExplainRiskFactorsOutput } from '@/ai/flows/explain-risk-factors';

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
    name: string;
    logo: string;
    description: string;
    products: LoanProduct[];
    website: string;
};

export type Application = {
    id: string;
    user: string;
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
    for: 'user' | 'partner';
    type: 'new_application' | 'approval' | 'denial' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
};


interface UserContextType {
    avatarUrl: string | null;
    setAvatarUrl: Dispatch<SetStateAction<string | null>>;
    applications: Application[];
    addApplication: (app: Application) => void;
    updateApplicationStatus: (id: string, status: 'Approved' | 'Denied') => void;
    partners: Partner[];
    partnerProfile: Omit<Partner, 'products' | 'description'>;
    updatePartnerProfile: (profile: Partial<Omit<Partner, 'products' | 'description'>>) => void;
    partnerProducts: LoanProduct[];
    addPartnerProduct: (product: LoanProduct) => void;
    removePartnerProduct: (id: string) => void;
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    markNotificationsAsRead: (role: 'user' | 'partner') => void;
}

const initialPartners: Partner[] = [
    {
      name: "Stellar Lend",
      logo: "https://placehold.co/40x40",
      description: "Low-interest loans for Stellar ecosystem projects.",
      website: "https://stellarlend.finance",
      products: [
        { id: "sl-001", name: "Ecosystem Grant Loan", rate: "3.5%", maxAmount: 5000, term: 24, requirements: "Credit score above 750" },
        { id: "sl-002", name: "Stablecoin Personal Loan", rate: "5.0%", maxAmount: 10000, term: 12, requirements: "Credit score above 700" },
      ],
    },
    {
      name: "Aqua Finance",
      logo: "https://placehold.co/40x40",
      description: "DeFi lending powered by the AQUA token.",
      website: "https://aqua.network",
      products: [
          { id: "af-001", name: "AQUA-Backed Loan", rate: "4.2%", maxAmount: 7500, term: 18, requirements: "Credit score above 680" },
          { id: "af-002", name: "Liquidity Provider Loan", rate: "6.1%", maxAmount: 25000, term: 36, requirements: "Credit score above 720" },
      ],
    },
    {
      name: "Anchor Finance",
      logo: "https://placehold.co/40x40",
      description: "Your anchor in the world of decentralized finance.",
      website: "https://anchor.finance",
      products: [
          { id: "an-001", name: "Small Business Loan", rate: "7.5%", maxAmount: 50000, term: 48, requirements: "Credit score above 650" },
      ],
    },
];

const initialApplications: Application[] = [
    { id: 'app-003', user: 'Anonymous User #1A5D', score: 810, loan: { id: 'sl-001', name: 'Ecosystem Grant Loan', partnerName: 'Stellar Lend' }, amount: 5000, status: 'Approved' },
    { id: 'app-004', user: 'Anonymous User #C3E8', score: 560, loan: {id: 'an-001', name: 'Small Business Loan', partnerName: 'Anchor Finance'}, amount: 50000, status: 'Denied' },
];

const initialNotifications: Notification[] = [
    { for: 'user', type: 'info', title: 'New Partner Product', message: 'Anchor Finance just added a new Small Business Loan product.', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), read: true },
    { for: 'partner', type: 'info', title: 'Profile Updated', message: 'You successfully updated your public company profile.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), read: true }
]


export const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [applications, setApplications] = useState<Application[]>(initialApplications);
    const [partners, setPartners] = useState<Partner[]>(initialPartners);
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    // This simulates the single partner logged in
    const [partnerProfile, setPartnerProfile] = useState({ name: "Stellar Lend", logo: "https://placehold.co/40x40", website: "https://stellarlend.finance" });
    const [partnerProducts, setPartnerProducts] = useState<LoanProduct[]>(initialPartners[0].products);

    const addApplication = (app: Application) => {
        setApplications(prev => [...prev, app]);
    };

    const updateApplicationStatus = (id: string, status: 'Approved' | 'Denied') => {
        setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
    };
    
    const updatePartnerProfile = (profile: Partial<Omit<Partner, 'products' | 'description'>>) => {
        setPartnerProfile(prev => ({...prev, ...profile}));
    }
    
    const addPartnerProduct = (product: LoanProduct) => {
        setPartnerProducts(prev => [...prev, product]);
        setPartners(prevPartners => prevPartners.map(p => p.name === partnerProfile.name ? {...p, products: [...p.products, product]} : p));
    }
    
    const removePartnerProduct = (id: string) => {
        setPartnerProducts(prev => prev.filter(p => p.id !== id));
        setPartners(prevPartners => prevPartners.map(p => p.name === partnerProfile.name ? {...p, products: p.products.filter(prod => prod.id !== id)} : p));
    }

    const addNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
    }

    const markNotificationsAsRead = (role: 'user' | 'partner') => {
        setNotifications(prev => prev.map(n => n.for === role ? {...n, read: true} : n));
    }

    const contextValue = {
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
