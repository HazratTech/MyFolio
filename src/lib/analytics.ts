export function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

export function hasAnalyticsConsent(): boolean {
    const savedConsent = getCookie("cookie_consent");
    if (!savedConsent) return false;
    try {
        const parsed = JSON.parse(savedConsent);
        return !!parsed.analytics;
    } catch (e) {
        return false;
    }
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
    if (typeof window === "undefined") return;
    
    // Google Analytics and Facebook tracking
    const hasConsent = hasAnalyticsConsent();
    
    // Track Google Analytics if consent is given
    if (hasConsent) {
        const gtag = (window as any).gtag;
        if (typeof gtag === "function") {
            gtag("event", eventName, params);
        } else {
            const dataLayer = (window as any).dataLayer || [];
            dataLayer.push({ event: eventName, ...params });
        }
    }

    // Track Meta/Facebook Pixel if initialized
    const fbq = (window as any).fbq;
    if (typeof fbq === "function") {
        const leadEvents = ["discord_bot_lead_submit", "contact_form_submit", "hire_me_submit", "quote_wizard_submit"];
        if (leadEvents.includes(eventName)) {
            // Map actual successful form submissions to standard 'Lead' event
            fbq("track", "Lead", {
                content_category: "Form Submission",
                content_name: eventName,
                value: params?.value || 0,
                currency: params?.currency || "USD"
            });
        } else {
            // Track other interactions as custom events
            fbq("trackCustom", eventName, params);
        }
    }
}
