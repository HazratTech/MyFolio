import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import PostCard from "@/components/blog/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Eye, ArrowRight } from "lucide-react";
import { AdBanner } from "@/components/blog/AdBanner";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Tech Blog | Android, iOS, Backend & Discord Dev | Hazrat Ummar",
    description: "Deep-dive guides, tutorials, and developer insights on Native Android (Kotlin), iOS, Discord bot development, API backends, and software architecture.",
    alternates: {
        canonical: '/blog',
    },
    openGraph: {
        title: "Tech Blog | Android, iOS, Backend & Discord Dev | Hazrat Ummar",
        description: "Deep-dive guides, tutorials, and developer insights on Native Android (Kotlin), iOS, Discord bot development, API backends, and software architecture.",
        url: "https://hazratdev.top/blog",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Tech Blog | Android, iOS, Backend & Discord Dev | Hazrat Ummar",
        description: "Deep-dive guides, tutorials, and developer insights on Native Android (Kotlin), iOS, Discord bot development, API backends, and software architecture.",
    }
};

async function getFeaturedPost() {
    await dbConnect();
    return Post.findOne({ status: "published" })
        .sort({ publishedAt: -1, createdAt: -1 })
        .lean();
}

async function getPosts(search?: string, category?: string, page: number = 1, excludeId?: string) {
    await dbConnect();
    const limit = 6; // Fits perfectly in 2-column grid layout
    const skip = (page - 1) * limit;

    const query: any = { status: "published" };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
        ];
    }

    if (category) {
        query.category = category;
    }

    const posts = await Post.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Post.countDocuments(query);

    return { posts, total, pages: Math.ceil(total / limit) };
}

async function getTrendingPosts() {
    await dbConnect();
    return Post.find({ status: "published" })
        .sort({ views: -1 })
        .limit(3)
        .lean();
}

async function getCategoriesWithCounts() {
    await dbConnect();
    const categories = await Category.find({}).sort({ name: 1 }).lean();
    
    const categoriesWithCounts = await Promise.all(
        categories.map(async (cat: any) => {
            const count = await Post.countDocuments({
                status: "published",
                category: cat.name
            });
            return { ...cat, count };
        })
    );
    
    // Only show categories that have published posts
    return categoriesWithCounts.filter((cat: any) => cat.count > 0);
}

export default async function BlogPage({
    searchParams,
}: {
    searchParams: { q?: string; category?: string; page?: string };
}) {
    const page = Number(searchParams.page) || 1;
    const search = searchParams.q || "";
    const category = searchParams.category || "";

    // 1. Fetch featured post (only on first page when no search/filters are active)
    const isFirstPageAndNoFilter = page === 1 && !search && !category;
    let featuredPost = null;
    if (isFirstPageAndNoFilter) {
        featuredPost = await getFeaturedPost();
    }

    // 2. Fetch remaining posts (excluding the featured post if applicable)
    const { posts, total, pages } = await getPosts(
        search,
        category,
        page,
        featuredPost?._id?.toString()
    );

    // 3. Fetch categories with dynamic post counts
    const categories = await getCategoriesWithCounts();

    // 4. Fetch trending posts (top 3)
    const trendingPosts = await getTrendingPosts();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Tech Blog | Android, iOS, Backend & Discord Dev | Hazrat Ummar",
        "description": "Deep-dive guides, tutorials, and developer insights on Native Android (Kotlin), iOS, Discord bot development, API backends, and software architecture.",
        "url": "https://hazratdev.top/blog",
        "publisher": {
            "@type": "Person",
            "name": "Hazrat Ummar Shaikh",
            "url": "https://hazratdev.top"
        }
    };

    return (
        <div className="min-h-screen bg-background pt-2 pb-16 relative overflow-hidden">
            {/* Background glows matching hero styles */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[128px] pointer-events-none" />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                
                {/* Section Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4 tracking-tight">
                        My <span className="text-primary bg-clip-text bg-gradient-to-r from-primary to-blue-400">Blog</span>
                    </h1>
                    <p className="text-muted-foreground/80 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                        Deep-dive technical tutorials, guides, and developer insights on software engineering.
                    </p>
                </div>

                {/* 1. Featured Post Hero Layout (Only on page 1 of unfiltered feed) */}
                {featuredPost && (
                    <div className="mb-16 bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-primary/20 hover:bg-white/[0.04] transition-all duration-500 hover:shadow-[0_0_50px_rgba(59,130,246,0.05)] group relative">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-8 items-center">
                            {/* Left: Featured Image */}
                            <div className="lg:col-span-7 relative h-72 lg:h-[420px] rounded-2xl overflow-hidden bg-white/[0.02]">
                                {featuredPost.coverImage ? (
                                    <>
                                        <Image
                                            src={featuredPost.coverImage}
                                            alt={featuredPost.title}
                                            fill
                                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                                            priority
                                            sizes="(max-width: 1024px) 100vw, 60vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent opacity-85" />
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-secondary/10">
                                        <span className="text-6xl">📝</span>
                                    </div>
                                )}
                                
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="bg-primary/20 text-primary border border-primary/30 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
                                        Featured Article
                                    </span>
                                </div>
                            </div>

                            {/* Right: Featured Text Details */}
                            <div className="lg:col-span-5 flex flex-col justify-between h-full py-2">
                                <div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground/80 mb-4 font-mono">
                                        <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold">
                                            {featuredPost.category || "Development"}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                            })}
                                        </span>
                                    </div>

                                    <Link href={`/blog/${featuredPost.slug}`}>
                                        <h2 className="text-2xl md:text-3xl font-bold font-heading leading-tight text-white mb-4 group-hover:text-primary transition-colors duration-300">
                                            {featuredPost.title}
                                        </h2>
                                    </Link>

                                    <p className="text-muted-foreground/80 leading-relaxed text-sm md:text-base mb-6 line-clamp-4">
                                        {featuredPost.excerpt || featuredPost.content.replace(/<[^>]*>?/gm, "").substring(0, 200) + "..."}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                                    <div className="flex gap-4 text-xs text-muted-foreground/60">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-primary/70" />
                                            {featuredPost.readingTime ? `${featuredPost.readingTime} min read` : "5 min read"}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Eye className="w-3.5 h-3.5 text-primary/70" />
                                            {featuredPost.views} views
                                        </span>
                                    </div>
                                    
                                    <Link href={`/blog/${featuredPost.slug}`}>
                                        <Button className="bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 rounded-xl gap-2 font-medium">
                                            Read Article 
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Main content area: Main grid + Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* Left: main articles list (8 columns) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Interactive Categories Bar */}
                        <div className="flex flex-wrap gap-2 pb-6 border-b border-white/5">
                            <Link href="/blog">
                                <Button
                                    variant={!category ? "default" : "outline"}
                                    size="sm"
                                    className={!category 
                                        ? "bg-primary text-white border-transparent" 
                                        : "bg-white/[0.02] border-white/5 text-muted-foreground hover:text-white"
                                    }
                                >
                                    All ({total + (featuredPost ? 1 : 0)})
                                </Button>
                            </Link>
                            {categories.map((cat: any) => (
                                <Link key={cat._id} href={`/blog?category=${cat.name}${search ? `&q=${search}` : ''}`}>
                                    <Button
                                        variant={category === cat.name ? "default" : "outline"}
                                        size="sm"
                                        className={category === cat.name 
                                            ? "bg-primary text-white border-transparent" 
                                            : "bg-white/[0.02] border-white/5 text-muted-foreground hover:text-white"
                                        }
                                    >
                                        {cat.name} ({cat.count})
                                    </Button>
                                </Link>
                            ))}
                        </div>

                        {/* Search or category indicator */}
                        {(search || category) && (
                            <div className="text-muted-foreground/80 text-sm flex items-center justify-between">
                                <span>
                                    Found <strong className="text-foreground">{total}</strong> article{total !== 1 ? "s" : ""} 
                                    {category ? ` in category "${category}"` : ""}
                                    {search ? ` matching "${search}"` : ""}
                                </span>
                                <Link href="/blog" className="text-primary hover:underline text-xs">
                                    Clear Filters
                                </Link>
                            </div>
                        )}

                        {/* Card Grid */}
                        {posts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {posts.map((post: any) => (
                                    <div key={post._id} className="animate-in fade-in zoom-in-95 duration-500">
                                        <PostCard post={post} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-white/5 border-dashed">
                                <h3 className="text-2xl font-bold mb-2">No posts found</h3>
                                <p className="text-muted-foreground">Adjust your filters or search criteria.</p>
                                {(search || category) && (
                                    <Link href="/blog" className="mt-4 inline-block">
                                        <Button variant="outline">Clear Filters</Button>
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="flex justify-center gap-2 pt-10">
                                {page > 1 && (
                                    <Link href={`/blog?page=${page - 1}${search ? `&q=${search}` : ''}${category ? `&category=${category}` : ''}`}>
                                        <Button variant="outline">Previous</Button>
                                    </Link>
                                )}
                                <div className="flex items-center px-4 font-medium text-sm text-muted-foreground">
                                    Page {page} of {pages}
                                </div>
                                {page < pages && (
                                    <Link href={`/blog?page=${page + 1}${search ? `&q=${search}` : ''}${category ? `&category=${category}` : ''}`}>
                                        <Button variant="outline">Next</Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Sticky Sidebar (4 columns) */}
                    <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-28">
                        
                        {/* Search Card */}
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mb-4 font-mono">
                                Search Articles
                            </h3>
                            <form action="/blog" method="GET" className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                <Input
                                    name="q"
                                    placeholder="Type keyword..."
                                    defaultValue={search}
                                    className="pl-9 bg-black/40 border-white/5 focus:border-primary/50 text-sm transition-all rounded-xl h-11"
                                />
                                {category && <input type="hidden" name="category" value={category} />}
                            </form>
                        </div>

                        {/* Sidebar Ad Unit Placement */}
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <AdBanner slot="8293019284" format="rectangle" />
                        </div>

                        {/* Trending Posts Card */}
                        {trendingPosts.length > 0 && (
                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mb-5 font-mono">
                                    Trending Posts
                                </h3>
                                <div className="space-y-4">
                                    {trendingPosts.map((trendPost: any, index: number) => (
                                        <div key={trendPost._id} className="flex gap-4 items-start group">
                                            {/* Index number */}
                                            <span className="text-2xl font-bold font-heading text-primary/40 group-hover:text-primary transition-colors duration-300 w-6">
                                                0{index + 1}
                                            </span>
                                            <div className="flex-grow">
                                                <Link href={`/blog/${trendPost.slug}`}>
                                                    <h4 className="text-sm font-bold text-white/90 leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
                                                        {trendPost.title}
                                                    </h4>
                                                </Link>
                                                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground/60 font-mono">
                                                    <span>{trendPost.views} views</span>
                                                    <span>•</span>
                                                    <span>{trendPost.readingTime ? `${trendPost.readingTime}m read` : "5m read"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Categories List Card */}
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mb-4 font-mono">
                                Categories
                            </h3>
                            <div className="space-y-2.5">
                                {categories.map((cat: any) => (
                                    <Link 
                                        key={cat._id} 
                                        href={`/blog?category=${cat.name}${search ? `&q=${search}` : ""}`}
                                        className={cn(
                                            "flex items-center justify-between text-sm py-1.5 border-b border-white/5 hover:text-primary transition-colors group",
                                            category === cat.name ? "text-primary font-semibold" : "text-muted-foreground"
                                        )}
                                    >
                                        <span className="capitalize">{cat.name}</span>
                                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-[10px] font-mono group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/30 transition-all">
                                            {cat.count}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </aside>

                </div>

            </div>
        </div>
    );
}
