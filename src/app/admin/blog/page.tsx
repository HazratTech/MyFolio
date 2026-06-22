"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Eye, Zap, Sparkles, Link2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

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
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedSort, setSelectedSort] = useState("recent");
    const [categories, setCategories] = useState<string[]>([]);

    // Custom AI Generation States
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [affiliateLinks, setAffiliateLinks] = useState("");
    const [generating, setGenerating] = useState(false);
    const [genStep, setGenStep] = useState(0);
    const [genError, setGenError] = useState("");
    const [genSuccessSlug, setGenSuccessSlug] = useState("");

    const steps = [
        "Analyzing product niche and search intent...",
        "Drafting bulletproof sales copy with Gemini 2.5 Flash...",
        "Organically injecting your affiliate links...",
        "Generating cover art via gpt-image-1...",
        "Generating inline concept illustrations...",
        "Publishing article to your database..."
    ];

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        setGenError("");
        setGenSuccessSlug("");
        setGenStep(0);

        // Advance progress bar steps over time
        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < steps.length - 1) {
                currentStep++;
                setGenStep(currentStep);
            }
        }, 12000); // 1.2 minutes average generation time

        try {
            const res = await fetch("/api/admin/generate-affiliate-post", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, affiliateLinks }),
            });
            
            let data: any = {};
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                data = { error: text || "Request failed" };
            }
            clearInterval(interval);

            if (!res.ok) {
                throw new Error(data.error || data.details || "Failed to generate post");
            }

            setGenStep(steps.length); // complete
            setGenSuccessSlug(data.slug);
            setPrompt("");
            setAffiliateLinks("");
            fetchPosts();
        } catch (err: any) {
            clearInterval(interval);
            setGenError(err.message || "An unexpected error occurred");
        } finally {
            setGenerating(false);
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search,
                status: selectedStatus,
                category: selectedCategory === "all" ? "" : selectedCategory,
                sort: selectedSort
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
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/blog/categories");
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data.map((c: any) => c.name));
                }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [selectedCategory, selectedStatus, selectedSort]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchPosts();
        }, 500); // Debounce search
        return () => clearTimeout(timeout);
    }, [search, page, selectedCategory, selectedStatus, selectedSort]);

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

            <div className="flex flex-col md:flex-row items-center gap-4 bg-muted/40 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 bg-transparent w-full md:w-auto flex-1">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="Search posts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground w-full"
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-w-[120px]"
                    >
                        <option value="all">All Statuses</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>

                    {/* Sorting Filter */}
                    <select
                        value={selectedSort}
                        onChange={(e) => setSelectedSort(e.target.value)}
                        className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-w-[120px]"
                    >
                        <option value="recent">Recent</option>
                        <option value="oldest">Oldest</option>
                    </select>
                </div>
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
                                        <div className="flex flex-col">
                                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                            <span className="text-[10px] opacity-75">{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
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

            {/* Floating Action Button (FAB) */}
            <div className="fixed bottom-8 right-8 z-40">
                <Button
                    onClick={() => {
                        setIsFabOpen(true);
                        setGenError("");
                        setGenSuccessSlug("");
                        setGenStep(0);
                    }}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-2xl shadow-primary/30 hover:scale-110 hover:shadow-primary/50 transition-all flex items-center justify-center p-0 border border-white/10"
                    aria-label="Generate Custom Affiliate Post"
                >
                    <Zap className="w-6 h-6 animate-pulse" />
                </Button>
            </div>

            {/* Slide-over Drawer / Sheet */}
            <Sheet open={isFabOpen} onOpenChange={setIsFabOpen}>
                <SheetContent side="right" className="w-[95vw] sm:max-w-[480px] bg-background/95 border-l border-white/10 text-foreground p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between">
                    <div>
                        <SheetHeader className="p-0 mb-6">
                            <SheetTitle className="text-2xl font-bold flex items-center gap-2 font-heading">
                                <Sparkles className="w-6 h-6 text-primary" />
                                Affiliate Writer
                            </SheetTitle>
                            <SheetDescription className="text-muted-foreground text-sm leading-relaxed mt-2">
                                Provide a brief topic/product prompt and your affiliate links. The system will build a highly-detailed review with a conversion-focused sales copy mindset, guarantee your exact affiliate links are injected, and generate gpt-image-1 cover/inline art.
                            </SheetDescription>
                        </SheetHeader>

                        {genError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">
                                <strong>Error:</strong> {genError}
                            </div>
                        )}

                        {genSuccessSlug && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg text-sm mb-6 flex flex-col gap-2">
                                <span className="font-semibold">✓ Post generated and published successfully!</span>
                                <div className="flex gap-2 mt-1">
                                    <Link href={`/blog/${genSuccessSlug}`} target="_blank" className="text-primary underline font-medium flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5" /> View Post
                                    </Link>
                                    <span className="text-white/20">|</span>
                                    <Link href={`/admin/blog/${genSuccessSlug}`} className="text-primary underline font-medium flex items-center gap-1">
                                        <Edit className="w-3.5 h-3.5" /> Edit Post
                                    </Link>
                                </div>
                            </div>
                        )}

                        {generating ? (
                            <div className="space-y-6 py-4">
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                    <span className="font-medium text-sm text-gray-700">Generating Affiliate Content...</span>
                                </div>

                                <div className="space-y-3">
                                    {steps.map((step, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs">
                                            <div className={`w-2.5 h-2.5 rounded-full flex items-center justify-center ${
                                                idx < genStep 
                                                    ? "bg-green-500 text-white" 
                                                    : idx === genStep 
                                                        ? "bg-primary animate-ping" 
                                                        : "bg-white/10"
                                            }`}>
                                                {idx < genStep && <span className="text-[6px]">✓</span>}
                                            </div>
                                            <span className={idx === genStep ? "text-primary font-medium" : idx < genStep ? "text-muted-foreground line-through" : "text-muted-foreground/60"}>
                                                {step}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-primary h-full transition-all duration-1000 ease-out" 
                                        style={{ width: `${Math.min(100, (genStep / steps.length) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleGenerate} className="space-y-5">
                                <div className="space-y-2">
                                    <label htmlFor="prompt-field" className="text-sm font-semibold text-foreground">Review Topic or Product Brief</label>
                                    <Textarea
                                        id="prompt-field"
                                        placeholder="e.g. Hostinger VPS Hosting review, compare it with AWS Lightsail, emphasize speed, pricing and reliability..."
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        required
                                        className="bg-muted/50 border-white/10 focus:border-primary/50 text-sm min-h-[100px] resize-none rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="links-field" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                        <Link2 className="w-4 h-4 text-primary" />
                                        Affiliate Link(s)
                                    </label>
                                    <Textarea
                                        id="links-field"
                                        placeholder="Paste your links here (one per line, e.g. https://www.hostinger.com/partner...)"
                                        value={affiliateLinks}
                                        onChange={(e) => setAffiliateLinks(e.target.value)}
                                        className="bg-muted/50 border-white/10 focus:border-primary/50 text-sm min-h-[80px] font-mono resize-none rounded-xl"
                                    />
                                    <p className="text-[10px] text-muted-foreground">The AI will seamlessly embed these URLs. Failsafes guarantee they will be present.</p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={generating || !prompt.trim()}
                                    className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/95 hover:to-blue-600/95 text-white font-medium h-11 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    <Zap className="w-4 h-4" />
                                    Generate and Publish
                                </Button>
                            </form>
                        )}
                    </div>

                    <div className="pt-6 border-t border-white/5 text-[10px] text-muted-foreground flex justify-between">
                        <span>Powered by Gemini 2.5 Flash</span>
                        <span>Gpt Image 1</span>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
