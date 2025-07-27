export const Logo = ({ className }: { className?: string }) => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
        </defs>
        <circle cx="10" cy="10" r="7" stroke="url(#logo-gradient)" strokeWidth="1.5"/>
        <path d="M11.5 12.5C11.5 13.3284 10.8284 14 10 14C9.17157 14 8.5 13.3284 8.5 12.5" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8.5 7.5C8.5 6.67157 9.17157 6 10 6C10.8284 6 11.5 6.67157 11.5 7.5" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 6V14" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 8H8" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 12H8" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="14" cy="14" r="7" stroke="url(#logo-gradient)" strokeWidth="1.5"/>
        <path d="M15.5 16.5C15.5 17.3284 14.8284 18 14 18C13.1716 18 12.5 17.3284 12.5 16.5" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12.5 11.5C12.5 10.6716 13.1716 10 14 10C14.8284 10 15.5 10.6716 15.5 11.5" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 10V18" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 12H12" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 16H12" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
)
