"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SiteThemeController() {
    const pathname = usePathname();

    useEffect(() => {
        // Guarantee root HTML element always maintains light theme
        if (typeof document !== "undefined") {
            document.documentElement.classList.remove("dark");
        }
    }, [pathname]);

    return null;
}
