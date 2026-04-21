"use client";

import { useEffect } from "react";

export default function ViewCounter({ slug }: { slug: string }) {
    useEffect(() => {
        // Call the API to increment view count
        // We use the existing GET /api/blog/posts/[slug] which increments views
        // Or we could have a dedicated endpoint. 
        // Given the existing API implementation:
        // const post = await Post.findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true });
        // calling fetch matches that logic.

        fetch(`/api/blog/posts/${slug}`, { cache: 'no-store' }).catch(err => console.error(err));
    }, [slug]);

    return null; // Invisible component
}
