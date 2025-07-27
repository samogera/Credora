
"use client";

import { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface UserContextType {
    avatarUrl: string | null;
    setAvatarUrl: Dispatch<SetStateAction<string | null>>;
}

export const UserContext = createContext<UserContextType>({
    avatarUrl: null,
    setAvatarUrl: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    return (
        <UserContext.Provider value={{ avatarUrl, setAvatarUrl }}>
            {children}
        </UserContext.Provider>
    );
};
