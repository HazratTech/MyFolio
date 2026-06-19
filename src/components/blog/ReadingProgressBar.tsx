"use client";

import { useEffect, useState } from "react";

export default function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const article = document.getElementById("article-content");
            if (!article) return;

            const articleTop = article.getBoundingClientRect().top + window.scrollY;
            const articleHeight = article.offsetHeight;
            const scrolled = window.scrollY - articleTop;
            const pct = Math.min(Math.max((scrolled / articleHeight) * 100, 0), 100);
            setProgress(pct);
        };

        window.addEventListener("scroll", updateProgress, { passive: true });
        return () => window.removeEventListener("scroll", updateProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-primary via-secondary to-primary transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
