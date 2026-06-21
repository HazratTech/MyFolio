"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

export function GoogleAdSense() {
    const [hasConsent, setHasConsent] = useState(false);

    useEffect(() => {
        // Initial check
        const savedConsent = getCookie("cookie_consent");
        if (savedConsent) {
            try {
                const parsed = JSON.parse(savedConsent);
                setHasConsent(!!parsed.advertising);
            } catch (e) {}
        }

        // Listener for dynamic consent updates
        const handleConsentUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            setHasConsent(!!customEvent.detail?.advertising);
        };

        window.addEventListener("cookieConsentUpdated", handleConsentUpdate);
        return () => window.removeEventListener("cookieConsentUpdated", handleConsentUpdate);
    }, []);

    if (!hasConsent) return null;

    return (
        <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2489956198626091"
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
}
export default GoogleAdSense;
