"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Post {
    _id: string;
    title: string;
    slug: string;
    category: string;
    status: 'draft' | 'published';
    views: number;
    publishedAt: string;
    createdAt: string;
}

export default function BlogAdminPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search,
                status: "all" // fetch all
            });
            const res = await fetch(`/api/blog/posts?${query.toString()}`);
            const data = await res.json();
            setPosts(data.posts);
            setTotalPages(data.pagination.pages);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchPosts();
        }, 500); // Debounce search
        return () => clearTimeout(timeout);
    }, [search, page]);

    const handleDelete = async (slug: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            const res = await fetch(`/api/blog/posts/${slug}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchPosts();
            }
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-heading">Blog Posts</h1>
                <Link href="/admin/blog/new">
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        New Post
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-lg border border-border">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Search posts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
                />
            </div>

            <div className="border border-border rounded-lg overflow-hidden bg-card">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="border-border hover:bg-muted/50">
                            <TableHead className="text-foreground font-semibold">Title</TableHead>
                            <TableHead className="text-foreground font-semibold">Category</TableHead>
                            <TableHead className="text-foreground font-semibold">Status</TableHead>
                            <TableHead className="text-foreground font-semibold">Views</TableHead>
                            <TableHead className="text-foreground font-semibold">Date</TableHead>
                            <TableHead className="text-right text-foreground font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : posts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No posts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            posts.map((post) => (
                                <TableRow key={post._id} className="border-border hover:bg-muted/40">
                                    <TableCell className="font-medium text-foreground">{post.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-background border-border text-foreground">
                                            {post.category || "Uncategorized"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`${post.status === 'published'
                                                ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200'
                                                : 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-200'
                                                }`}
                                            variant="outline"
                                        >
                                            {post.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-foreground">{post.views}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/blog/${post.slug}?preview=true`} target="_blank">
                                                <Button variant="ghost" size="icon" className="hover:bg-muted text-muted-foreground hover:text-foreground">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/blog/${post.slug}`}>
                                                <Button variant="ghost" size="icon" className="hover:bg-muted text-muted-foreground hover:text-blue-600">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(post.slug)}
                                                className="hover:bg-muted text-muted-foreground hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
