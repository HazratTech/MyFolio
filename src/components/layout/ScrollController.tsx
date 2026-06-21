"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const ScrollController = () => {
    const pathname = usePathname();

    useEffect(() => {
        // If pathname is root, scroll to the top of the viewport
        if (pathname === "/" || pathname === "") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        // Get the target section name from the URL path (e.g. /about -> about)
        const sectionId = pathname.replace("/", "");
        const element = document.getElementById(sectionId);
        
        if (element) {
            // Add a micro-timeout to allow page transitions/layout changes to stabilize
            const timer = setTimeout(() => {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

    return null;
};
