// components/SorobanMockBanner.tsx
export const SorobanMockBanner = () => {
    // Only show banner in development environment
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="bg-yellow-100 text-yellow-800 p-2 text-center text-sm font-semibold w-full z-50 fixed top-0">
            ⚠️ Using mock Soroban data - replace with real Stellar/Soroban integration
        </div>
    );
};
