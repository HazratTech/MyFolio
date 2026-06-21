'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

export const GoogleAnalytics = ({ gaId }: { gaId: string }) => {
    const pathname = usePathname();
    const [hasConsent, setHasConsent] = useState(false);

    useEffect(() => {
        // Initial check
        const savedConsent = getCookie("cookie_consent");
        if (savedConsent) {
            try {
                const parsed = JSON.parse(savedConsent);
                setHasConsent(!!parsed.analytics);
            } catch (e) {}
        }

        // Listener for dynamic consent updates
        const handleConsentUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            setHasConsent(!!customEvent.detail?.analytics);
        };

        window.addEventListener("cookieConsentUpdated", handleConsentUpdate);
        return () => window.removeEventListener("cookieConsentUpdated", handleConsentUpdate);
    }, []);

    useEffect(() => {
        if (hasConsent && typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('config', gaId, {
                page_path: pathname,
            });
        }
    }, [pathname, gaId, hasConsent]);

    if (!hasConsent) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${gaId}');
        `}
            </Script>
        </>
    );
};
