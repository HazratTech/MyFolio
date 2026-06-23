'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { trackEvent, getCookie } from '@/lib/analytics';

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

    useEffect(() => {
        if (!hasConsent) return;

        const handleGlobalClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target) return;

            // Find closest clickable element (anchor, button, role=button, or custom data-analytics)
            const clickable = target.closest('a, button, [role="button"], [data-analytics-id]');
            if (!clickable) return;

            const tagName = clickable.tagName.toLowerCase();
            const textContent = clickable.textContent?.trim() || '';
            const id = clickable.id || '';
            const label = clickable.getAttribute('data-analytics-label') || 
                          clickable.getAttribute('aria-label') || 
                          textContent || 
                          id;

            if (tagName === 'a') {
                const href = clickable.getAttribute('href');
                if (!href) return;

                // Determine outbound status
                const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
                let isOutbound = false;
                if (isExternal) {
                    try {
                        const url = new URL(href, window.location.origin);
                        isOutbound = url.host !== window.location.host;
                    } catch (e) {
                        isOutbound = true;
                    }
                }

                // Affiliate and specific monetization targets
                const isAffiliate = clickable.getAttribute('data-affiliate') === 'true' || 
                                    href.includes('sparkedhost.com') ||
                                    href.includes('fiverr.com') ||
                                    href.includes('upwork.com');

                if (isAffiliate) {
                    trackEvent('affiliate_click', {
                        link_url: href,
                        link_text: label,
                        element_id: id,
                    });
                } else if (isOutbound) {
                    trackEvent('outbound_click', {
                        link_url: href,
                        link_text: label,
                        element_id: id,
                    });
                } else {
                    // Section detection
                    const section = clickable.closest('header') ? 'header' : 
                                    clickable.closest('footer') ? 'footer' : 
                                    clickable.closest('nav') ? 'navigation' : 'body';
                    
                    trackEvent('internal_click', {
                        link_url: href,
                        link_text: label,
                        section: section,
                        element_id: id,
                    });
                }
            } else {
                // Button / Interactive controls
                const buttonType = clickable.getAttribute('type') || 'button';
                const section = clickable.closest('header') ? 'header' : 
                                clickable.closest('footer') ? 'footer' : 
                                clickable.closest('nav') ? 'navigation' : 'body';

                // Skip form submits that are handled by dedicated submit handlers to prevent duplication
                const parentForm = clickable.closest('form');
                if (buttonType === 'submit' && parentForm && (parentForm.id === 'contact-form' || parentForm.id === 'hire-form')) {
                    return;
                }

                trackEvent('button_click', {
                    button_text: label,
                    button_id: id,
                    section: section,
                });
            }
        };

        // Passive event listener for high scrolling and execution performance
        document.addEventListener('click', handleGlobalClick, { passive: true });
        return () => {
            document.removeEventListener('click', handleGlobalClick);
        };
    }, [hasConsent]);

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
