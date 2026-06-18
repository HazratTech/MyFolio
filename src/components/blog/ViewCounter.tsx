"use client";

import { useEffect } from "react";

export default function ViewCounter({ slug }: { slug: string }) {
    useEffect(() => {
        // Industry standard approach for unique views without requiring login
        const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts') || '[]');

        if (!viewedPosts.includes(slug)) {
            fetch(`/api/blog/posts/${slug}`, { cache: 'no-store' })
                .then(res => {
                    if (res.ok) {
                        viewedPosts.push(slug);
                        localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
                    }
                })
                .catch(err => console.error("Failed to update view count", err));
        }
    }, [slug]);

    return null; // Invisible component
}
