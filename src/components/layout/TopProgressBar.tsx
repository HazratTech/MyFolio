"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export const TopProgressBar = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const startProgress = () => {
        setIsLoading(true);
        setProgress(15);

        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

        // Simulated progressive trickling (like YouTube / GitHub)
        progressIntervalRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 85) {
                    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                    return 85;
                }
                // Slow down as it approaches 85%
                const step = Math.max(1, (85 - prev) * 0.15);
                return prev + step;
            });
        }, 120);

        // Safety fallback to complete if route hangs
        safetyTimeoutRef.current = setTimeout(() => {
            completeProgress();
        }, 8000);
    };

    const completeProgress = () => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

        setProgress(100);
        setTimeout(() => {
            setIsLoading(false);
            setTimeout(() => {
                setProgress(0);
            }, 250);
        }, 200);
    };

    // Route change completed
    useEffect(() => {
        completeProgress();
    }, [pathname, searchParams]);

    // Intercept all link clicks across the entire site
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // Find closest anchor tag
            const target = (e.target as HTMLElement)?.closest("a");
            if (!target) return;

            const href = target.getAttribute("href");
            const targetAttr = target.getAttribute("target");

            // Ignore external links, new tabs, mailto, tel, empty hrefs, or same-page anchors (#)
            if (
                !href ||
                targetAttr === "_blank" ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:") ||
                href.startsWith("#") ||
                href === "javascript:void(0)"
            ) {
                return;
            }

            try {
                const currentUrl = new URL(window.location.href);
                const destinationUrl = new URL(href, window.location.origin);

                // Only start progress if navigating to an internal page with a different pathname/search
                if (
                    destinationUrl.origin === currentUrl.origin &&
                    (destinationUrl.pathname !== currentUrl.pathname ||
                        destinationUrl.search !== currentUrl.search)
                ) {
                    startProgress();
                }
            } catch {
                // Ignore URL parse errors
            }
        };

        // Listen to browser back/forward buttons
        const handlePopState = () => {
            startProgress();
        };

        document.addEventListener("click", handleClick, { capture: true });
        window.addEventListener("popstate", handlePopState);

        return () => {
            document.removeEventListener("click", handleClick, { capture: true });
            window.removeEventListener("popstate", handlePopState);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
        };
    }, []);

    if (!isLoading && progress === 0) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-300"
            style={{ opacity: isLoading || progress === 100 ? 1 : 0 }}
        >
            {/* Top Glowing Progress Bar */}
            <div
                className="h-[3px] bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.9),0_0_5px_rgba(34,211,238,0.8)] transition-all duration-200 ease-out"
                style={{
                    width: `${progress}%`,
                }}
            />

            {/* Glowing Leading Edge Peg */}
            <div
                className="absolute top-0 right-0 h-full w-[100px] shadow-[0_0_15px_#38bdf8,0_0_8px_#3b82f6] opacity-100"
                style={{
                    transform: `translateX(${progress - 100}%)`,
                }}
            />
        </div>
    );
};
