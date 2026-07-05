"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const ScrollController = () => {
    const pathname = usePathname();

    useEffect(() => {
        if (pathname === "/" || pathname === "") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        const sectionId = pathname.replace("/", "");
        const element = document.getElementById(sectionId);
        
        if (element) {
            let timeoutId: NodeJS.Timeout;
            let resizeObserver: ResizeObserver;
            const startTime = Date.now();

            const scrollToElement = () => {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            };

            // Initial scroll
            timeoutId = setTimeout(scrollToElement, 100);

            // Re-scroll if the body height changes within the first 3 seconds (due to API fetches)
            resizeObserver = new ResizeObserver(() => {
                if (Date.now() - startTime < 3000) {
                    scrollToElement();
                } else {
                    resizeObserver.disconnect();
                }
            });

            resizeObserver.observe(document.body);

            return () => {
                clearTimeout(timeoutId);
                resizeObserver.disconnect();
            };
        }
    }, [pathname]);

    return null;
};
