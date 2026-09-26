import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import PostCard from "@/components/blog/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Eye, ArrowRight, Sparkles, FileText, Terminal, Mail, CheckCircle2 } from "lucide-react";
import { cn, getCleanSlug } from "@/lib/utils";

export async function generateMetadata({
    searchParams,
}: {
    searchParams: { q?: string; category?: string; page?: string };
}): Promise<Metadata> {
    const page = Number(searchParams.page) || 1;
    const category = searchParams.category || "";
    const search = searchParams.q || "";

    const urlParams = new URLSearchParams();
    if (page > 1) urlParams.set("page", page.toString());
    if (category) urlParams.set("category", category);
    if (search) urlParams.set("q", search);

    const queryString = urlParams.toString();
    const canonicalPath = queryString ? `/blog?${queryString}` : '/blog';
    const absoluteUrl = `https://relayworks.dev${canonicalPath}`;

    let title = "RelayWorks Dispatches | Technical Architecture & Engineering Guides";
    let description = "Deep-dive tutorials, system architectures, and developer insights on Native Android, iOS, Discord bots, high-throughput cloud backends, and AI automations by Hazrat Ummar Shaikh.";

    if (category) {
        title = `${category} Tutorials & Architecture | RelayWorks`;
        description = `Browse the latest guides, tutorials, and developer insights on ${category} on RelayWorks Dispatches.`;
    } else if (search) {
        title = `Search Results for "${search}" | RelayWorks`;
        description = `Find article writeups, tutorials, and guides matching the search term "${search}" on RelayWorks Dispatches.`;
    }

    if (page > 1) {
        title = `${title.split(" | ")[0]} - Page ${page} | RelayWorks`;
        description = `${description} (Page ${page})`;
    }

    return {
        title,
        description,
        alternates: {
            canonical: canonicalPath,
        },
        openGraph: {
            title,
            description,
            url: absoluteUrl,
            type: "website",
            images: [
                {
                    url: "/logo-brand.png",
                    width: 1200,
                    height: 630,
                    alt: "RelayWorks Tech Blog",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/logo-brand.png"],
        }
    };
}

async function getFeaturedPost() {
    await dbConnect();
    const featured = await Post.findOne({ status: "published", featured: true })
        .sort({ publishedAt: -1, createdAt: -1 })
        .lean();
    if (featured) return featured;

    return Post.findOne({ status: "published" })
        .sort({ publishedAt: -1, createdAt: -1 })
        .lean();
}

async function getPosts(search?: string, category?: string, page: number = 1, excludeId?: string) {
    await dbConnect();
    const limit = 12; // 12 posts per page reduces pagination depth and improves Googlebot crawl discovery
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
        .limit(4)
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

    // 4. Fetch trending posts
    const trendingPosts = await getTrendingPosts();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "RelayWorks Dispatches | Architecture & Engineering Guides",
        "description": "Production guides on Native Android, iOS, Kotlin Multiplatform, Spring Boot, Discord bots, and AI automation.",
        "url": "https://relayworks.dev/blog",
        "publisher": {
            "@type": "Organization",
            "name": "RelayWorks",
            "url": "https://relayworks.dev",
            "logo": {
                "@type": "ImageObject",
                "url": "https://relayworks.dev/icon.png"
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#fafaf9] [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] pt-4 pb-20 relative">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                
                {/* ─── HEADER SECTION ─── */}
                <div className="pt-6 pb-12 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Engineering Architecture & Technical Dispatches</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-heading tracking-tight text-slate-950 mb-4">
                        RelayWorks <span style={{ color: "#2563eb" }}>Dispatches</span>
                    </h1>

                    <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8">
                        Deep-dive tutorials, system architectures, and developer insights on Native Android, iOS, Discord bots, and high-throughput cloud backends by Hazrat Ummar Shaikh.
                    </p>

                    {/* Quick Credibility Stats Row */}
                    <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-2 pb-2 px-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span><strong className="text-slate-900 font-bold">70+</strong> Technical Guides</span>
                        </div>
                        <div className="hidden sm:block h-3.5 w-px bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span><strong className="text-slate-900 font-bold">Production</strong> Code Tested</span>
                        </div>
                        <div className="hidden sm:block h-3.5 w-px bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span><strong className="text-slate-900 font-bold">100% Free</strong> Knowledge</span>
                        </div>
                    </div>
                </div>

                {/* ─── 1. FEATURED ARTICLE HERO (Page 1 Unfiltered Only) ─── */}
                {featuredPost && (
                    <div className="mb-14 bg-white border border-slate-200/90 rounded-3xl overflow-hidden hover:border-blue-300 hover:shadow-[0_20px_50px_rgba(37,99,235,0.06)] transition-all duration-300 group">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-8 items-center">
                            {/* Left: Featured Image */}
                            <div className="lg:col-span-7 relative h-72 lg:h-[400px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-60" />
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-blue-50/60 text-blue-600">
                                        <FileText className="w-16 h-16 stroke-[1.2]" />
                                    </div>
                                )}
                                
                                <div className="absolute top-4 left-4 z-10">
                                    <span 
                                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                        className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-xs"
                                    >
                                        Featured Architecture Guide
                                    </span>
                                </div>
                            </div>

                            {/* Right: Featured Text Details */}
                            <div className="lg:col-span-5 flex flex-col justify-between h-full py-2">
                                <div>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 font-mono">
                                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold">
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

                                    <Link href={`/blog/${getCleanSlug(featuredPost.slug)}`}>
                                        <h2 className="text-2xl md:text-3xl font-black font-heading leading-tight text-slate-950 mb-4 group-hover:text-blue-600 transition-colors duration-200">
                                            {featuredPost.title}
                                        </h2>
                                    </Link>

                                    <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-6 line-clamp-4">
                                        {featuredPost.excerpt || featuredPost.content.replace(/<[^>]*>?/gm, "").substring(0, 200) + "..."}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                                    <div className="flex gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {featuredPost.readingTime ? `${featuredPost.readingTime} min read` : "5 min read"}
                                        </span>
                                        {featuredPost.views >= 1000 && (
                                            <span className="flex items-center gap-1.5">
                                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                                {featuredPost.views} {featuredPost.views === 1 ? 'view' : 'views'}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <Link href={`/blog/${getCleanSlug(featuredPost.slug)}`}>
                                        <Button 
                                            style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                            className="hover:opacity-90 text-white shadow-xs rounded-xl gap-2 font-semibold text-xs px-4 h-10 transition-opacity"
                                        >
                                            <span>Read Article</span>
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── 2. MAIN GRID & SIDEBAR LAYOUT ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* Left: main articles list (8 columns) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Interactive Categories Bar */}
                        <div className="flex flex-wrap gap-2 pb-6 border-b border-slate-200/80">
                            <Link href="/blog">
                                <Button
                                    variant={!category ? "default" : "outline"}
                                    size="sm"
                                    style={!category ? { backgroundColor: "#2563eb", color: "#ffffff" } : {}}
                                    className={cn(
                                        "text-xs font-semibold rounded-lg h-8 px-3 transition-colors",
                                        !category 
                                            ? "text-white shadow-xs border-transparent" 
                                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
                                    )}
                                >
                                    All ({total + (featuredPost ? 1 : 0)})
                                </Button>
                            </Link>
                            {categories.map((cat: any) => (
                                <Link key={cat._id} href={search ? `/blog?category=${encodeURIComponent(cat.name)}&q=${encodeURIComponent(search)}` : `/blog/category/${encodeURIComponent(cat.name)}`}>
                                    <Button
                                        variant={category === cat.name ? "default" : "outline"}
                                        size="sm"
                                        style={category === cat.name ? { backgroundColor: "#2563eb", color: "#ffffff" } : {}}
                                        className={cn(
                                            "text-xs font-semibold rounded-lg h-8 px-3 transition-colors",
                                            category === cat.name 
                                                ? "text-white shadow-xs border-transparent" 
                                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
                                        )}
                                    >
                                        {cat.name} ({cat.count})
                                    </Button>
                                </Link>
                            ))}
                        </div>

                        {/* Search or category filter indicator */}
                        {(search || category) && (
                            <div className="text-slate-600 text-sm flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-2xs">
                                <span>
                                    Found <strong className="text-slate-950 font-bold">{total}</strong> article{total !== 1 ? "s" : ""} 
                                    {category ? ` in category "${category}"` : ""}
                                    {search ? ` matching "${search}"` : ""}
                                </span>
                                <Link href="/blog" className="text-blue-600 font-semibold hover:underline text-xs">
                                    Clear Filters
                                </Link>
                            </div>
                        )}

                        {/* Card Grid */}
                        {posts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {posts.map((post: any) => (
                                    <div key={post._id} className="h-full">
                                        <PostCard post={post} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed p-8">
                                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2 font-heading">No articles found</h3>
                                <p className="text-slate-500 text-sm mb-4">Adjust your filters or try a different search keyword.</p>
                                {(search || category) && (
                                    <Link href="/blog">
                                        <Button variant="outline" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
                                            Clear Filters
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="flex justify-center items-center gap-2 pt-8">
                                {page > 1 && (
                                    <Link href={`/blog?page=${page - 1}${search ? `&q=${search}` : ''}${category ? `&category=${category}` : ''}`}>
                                        <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 px-4 rounded-lg shadow-2xs">
                                            Previous
                                        </Button>
                                    </Link>
                                )}
                                <div className="flex items-center px-4 font-mono text-xs text-slate-600">
                                    Page {page} of {pages}
                                </div>
                                {page < pages && (
                                    <Link href={`/blog?page=${page + 1}${search ? `&q=${search}` : ''}${category ? `&category=${category}` : ''}`}>
                                        <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 px-4 rounded-lg shadow-2xs">
                                            Next
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Sticky Sidebar (4 columns) */}
                    <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
                        
                        {/* Search Card */}
                        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5 font-sans">
                                Search Articles
                            </h3>
                            <form action="/blog" method="GET" className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    name="q"
                                    placeholder="Keywords e.g. Kotlin, Docker..."
                                    defaultValue={search}
                                    className="pl-9 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 text-slate-900 text-sm rounded-xl h-11 transition-all"
                                />
                                {category && <input type="hidden" name="category" value={category} />}
                            </form>
                        </div>

                        {/* Trending Posts Card */}
                        {trendingPosts.length > 0 && (
                            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-sans flex items-center justify-between">
                                    <span>Popular Dispatches</span>
                                    <span className="text-[10px] font-mono text-blue-600 font-semibold uppercase">High Readership</span>
                                </h3>
                                <div className="space-y-4">
                                    {trendingPosts.map((trendPost: any, index: number) => (
                                        <div key={trendPost._id} className="flex gap-3.5 items-start group">
                                            <span className="text-xl font-black font-mono text-blue-600 shrink-0 w-6">
                                                0{index + 1}
                                            </span>
                                            <div className="flex-grow min-w-0">
                                                <Link href={`/blog/${getCleanSlug(trendPost.slug)}`}>
                                                    <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                                                        {trendPost.title}
                                                    </h4>
                                                </Link>
                                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                                                    {trendPost.views >= 1000 && (
                                                        <>
                                                            <span>{trendPost.views} views</span>
                                                            <span>•</span>
                                                        </>
                                                    )}
                                                    <span>{trendPost.readingTime ? `${trendPost.readingTime}m read` : "5m read"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Categories List Card */}
                        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5 font-sans">
                                Categories
                            </h3>
                            <div className="space-y-2">
                                {categories.map((cat: any) => (
                                    <Link 
                                        key={cat._id} 
                                        href={`/blog?category=${cat.name}${search ? `&q=${search}` : ""}`}
                                        className={cn(
                                            "flex items-center justify-between text-sm py-2 px-2.5 rounded-lg transition-colors group",
                                            category === cat.name 
                                                ? "bg-blue-50 text-blue-700 font-bold" 
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <span className="capitalize">{cat.name}</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-mono border transition-colors",
                                            category === cat.name
                                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                                : "bg-slate-100 text-slate-600 border-slate-200/60 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200"
                                        )}>
                                            {cat.count}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Senior Builder Advisory Direct Card */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 border border-blue-200/80 shadow-xs space-y-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                                <Terminal className="w-3 h-3 text-blue-700" />
                                <span>Senior Engineering Studio</span>
                            </div>

                            <div>
                                <h4 className="text-base font-bold text-slate-950 font-heading">
                                    Need Custom Architecture?
                                </h4>
                                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                                    Skip junior agency bureaucracy. Work directly with founder Hazrat Ummar Shaikh on production native mobile apps, cloud APIs, and AI integrations.
                                </p>
                            </div>

                            <div className="space-y-2 pt-1">
                                <Link href="/services">
                                    <Button 
                                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                        className="w-full hover:opacity-90 text-white font-semibold text-xs h-10 rounded-xl shadow-xs transition-opacity"
                                    >
                                        View Sprints & Capabilities
                                    </Button>
                                </Link>
                                <a 
                                    href="mailto:hazratummar9@gmail.com"
                                    className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 py-2 transition-colors"
                                >
                                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                                    <span>hazratummar9@gmail.com</span>
                                </a>
                            </div>
                        </div>

                    </aside>

                </div>

            </div>
        </div>
    );
}
