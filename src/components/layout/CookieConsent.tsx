"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Shield, Settings, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConsentSettings {
    necessary: boolean;
    analytics: boolean;
    advertising: boolean;
}

const COOKIE_NAME = "cookie_consent";
const EVENT_NAME = "cookieConsentUpdated";

// Helper to get cookie on the client side
function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

// Helper to set cookie on the client side
function setCookie(name: string, value: string, days: number = 365) {
    if (typeof document === "undefined") return;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `; expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax; Secure`;
}

export function CookieConsent() {
    const [isOpen, setIsOpen] = useState(false);
    const [showCustomize, setShowCustomize] = useState(false);
    const [preferences, setPreferences] = useState<ConsentSettings>({
        necessary: true,
        analytics: false,
        advertising: false,
    });

    useEffect(() => {
        // Check if user already consented
        const savedConsent = getCookie(COOKIE_NAME);
        if (!savedConsent) {
            // No consent cookie found, show banner after a short delay
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        } else {
            try {
                const parsed = JSON.parse(savedConsent) as ConsentSettings;
                // Dispatch event so that analytics / ads can check loaded preference
                window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: parsed }));
            } catch (e) {
                setIsOpen(true);
            }
        }
    }, []);

    // Listen for global href="#cookie-settings" clicks
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest("a");
            if (anchor && anchor.getAttribute("href") === "#cookie-settings") {
                e.preventDefault();
                const savedConsent = getCookie(COOKIE_NAME);
                if (savedConsent) {
                    try {
                        setPreferences(JSON.parse(savedConsent));
                    } catch (err) {}
                }
                setShowCustomize(true);
                setIsOpen(true);
            }
        };

        document.addEventListener("click", handleGlobalClick);
        return () => document.removeEventListener("click", handleGlobalClick);
    }, []);

    const savePreferences = (updatedPrefs: ConsentSettings) => {
        setCookie(COOKIE_NAME, JSON.stringify(updatedPrefs));
        setIsOpen(false);
        // Trigger page-wide event so scripts can immediately load/initialize
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updatedPrefs }));
    };

    const handleAcceptAll = () => {
        const allConsent = { necessary: true, analytics: true, advertising: true };
        savePreferences(allConsent);
    };

    const handleDeclineNonEssential = () => {
        const essentialOnly = { necessary: true, analytics: false, advertising: false };
        savePreferences(essentialOnly);
    };

    const handleSaveCustom = () => {
        savePreferences(preferences);
    };

    const togglePreference = (key: keyof ConsentSettings) => {
        if (key === "necessary") return; // Always true
        setPreferences((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 25 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[999] rounded-2xl border border-white/10 bg-card/90 backdrop-blur-md shadow-2xl p-6 text-foreground font-sans dark"
                >
                    <div className="flex gap-4 items-start mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary flex-shrink-0">
                            <Cookie className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-white mb-1 flex items-center gap-1.5 font-heading">
                                Cookie Consent
                                <Shield className="w-4 h-4 text-emerald-400" />
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                We use cookies to analyze site traffic, personalize content, and serve relevant ads. You can adjust your preferences below.
                            </p>
                        </div>
                    </div>

                    {showCustomize ? (
                        <div className="space-y-4 mb-5 pt-2 border-t border-white/5">
                            {/* Necessary Cookies */}
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                <div>
                                    <h5 className="font-semibold text-sm text-white flex items-center gap-1">
                                        Necessary
                                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full uppercase">Always Active</span>
                                    </h5>
                                    <p className="text-xs text-slate-300 mt-0.5">Required for user sessions and essential features.</p>
                                </div>
                                <div className="w-10 h-6 bg-primary/40 rounded-full flex items-center px-1 justify-end cursor-not-allowed">
                                    <div className="w-4 h-4 bg-white rounded-full" />
                                </div>
                            </div>

                            {/* Analytics Cookies */}
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                <div>
                                    <h5 className="font-semibold text-sm text-white">Analytics Cookies</h5>
                                    <p className="text-xs text-slate-300 mt-0.5">Allows us to analyze visitor behavior to optimize the website.</p>
                                </div>
                                <button
                                    onClick={() => togglePreference("analytics")}
                                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors duration-200 cursor-pointer ${
                                        preferences.analytics ? "bg-primary justify-end" : "bg-slate-700 justify-start"
                                    }`}
                                    aria-label="Toggle analytics cookies"
                                >
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                </button>
                            </div>

                            {/* Advertising Cookies */}
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                <div>
                                    <h5 className="font-semibold text-sm text-white">Advertising Cookies</h5>
                                    <p className="text-xs text-slate-300 mt-0.5">Google AdSense utilizes these to serve personalized, relevant ads.</p>
                                </div>
                                <button
                                    onClick={() => togglePreference("advertising")}
                                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors duration-200 cursor-pointer ${
                                        preferences.advertising ? "bg-primary justify-end" : "bg-slate-700 justify-start"
                                    }`}
                                    aria-label="Toggle advertising cookies"
                                >
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowCustomize(false)}
                                    className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl"
                                >
                                    Back
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveCustom}
                                    className="flex-1 bg-primary hover:bg-primary/95 text-white font-medium rounded-xl"
                                >
                                    Save Choices
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 mt-4 pt-2 border-t border-white/5">
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleAcceptAll}
                                    className="flex-1 bg-primary hover:bg-primary/95 text-white font-medium rounded-xl py-2"
                                >
                                    Accept All
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleDeclineNonEssential}
                                    className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl py-2"
                                >
                                    Decline Non-Essential
                                </Button>
                            </div>
                            <button
                                onClick={() => setShowCustomize(true)}
                                className="w-full text-slate-300 hover:text-white flex items-center justify-center gap-1.5 text-xs py-2 bg-transparent border-none cursor-pointer hover:underline transition-colors mt-1"
                            >
                                <Settings className="w-3.5 h-3.5 text-primary" />
                                Customize Settings
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
