"use client";

import React, { useState, useEffect } from "react";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default function EditPostPage({ params }: { params: { slug: string } }) {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/blog/posts/${params.slug}`);
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
    }, [params.slug]);

    if (loading) {
        return <div className="text-center py-20">Loading...</div>;
    }

    if (!post) {
        return <div className="text-center py-20">Post not found</div>;
    }

    return <BlogPostForm initialData={post} isEditing={true} />;
}
