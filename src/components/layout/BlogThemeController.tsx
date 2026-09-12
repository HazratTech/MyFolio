"use client";

import { useEffect } from "react";

export function BlogThemeController() {
    useEffect(() => {
        document.documentElement.classList.remove("dark");
        return () => {
            document.documentElement.classList.add("dark");
        };
    }, []);

    return null;
}
