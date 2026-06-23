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
    if (!hasAnalyticsConsent()) return;
    
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
        gtag("event", eventName, params);
    } else {
        // Fallback: If analytics is consent-approved but gtag script is still loading, push directly to dataLayer
        const dataLayer = (window as any).dataLayer || [];
        dataLayer.push({ event: eventName, ...params });
    }
}
