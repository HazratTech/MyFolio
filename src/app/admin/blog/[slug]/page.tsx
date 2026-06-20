"use client";

import React, { useState, useEffect } from "react";
import BlogPostForm from "@/components/admin/BlogPostForm";
import { useParams } from "next/navigation";

export default function EditPostPage() {
    const params = useParams();
    const slug = typeof params?.slug === "string" ? params.slug : "";
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/blog/posts/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setPost(data);
                }
            } catch (error) {
                console.error("Failed to fetch post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug]);

    if (loading) {
        return <div className="text-center py-20">Loading...</div>;
    }

    if (!post) {
        return <div className="text-center py-20">Post not found</div>;
    }

    return <BlogPostForm initialData={post} isEditing={true} />;
}
