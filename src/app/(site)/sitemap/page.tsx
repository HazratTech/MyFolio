import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import { 
    Layers, 
    FileText, 
    ArrowRight, 
    Compass, 
    Calendar, 
    Clock, 
    Sparkles, 
    ChevronRight,
    Code2,
    CheckCircle2
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Sitemap & Engineering Architecture Index | RelayWorks",
    description: "Complete architectural index of RelayWorks. Browse all 50+ technical dispatches, production guides, core software engineering capabilities, and topic categories.",
    alternates: {
        canonical: "https://relayworks.dev/sitemap",
    },
    openGraph: {
        title: "RelayWorks Architecture Index & Sitemap",
        description: "Complete archive of all 50+ production engineering articles, category hubs, and technical capabilities by Hazrat Ummar Shaikh.",
        url: "https://relayworks.dev/sitemap",
        type: "website",
    }
};

const CORE_PAGES = [
    {
        title: "Home",
        href: "/",
        description: "Studio overview, featured commercial systems, engineering metrics, and contact terminal."
    },
    {
        title: "About Hazrat Ummar Shaikh",
        href: "/about",
        description: "Lead engineer bio, technical background, architecture philosophy, and verified client credentials."
    },
    {
        title: "Engineering Services & Sprints",
        href: "/services",
        description: "End-to-end software development sprints, backend APIs, and microservices architecture."
    },
    {
        title: "Production Projects Portfolio",
        href: "/projects",
        description: "Shipped mobile apps, cloud architectures, AI tools, and developer utilities."
    },
    {
        title: "Direct Engineering Contact",
        href: "/contact",
        description: "Schedule technical discovery calls, sprint inquiries, or direct contract requests."
    },
    {
        title: "Engineering Dispatches & Blog",
        href: "/blog",
        description: "Technical publications, system design writeups, and debugging case studies."
    }
];

const SPECIALIZED_SOLUTIONS = [
    {
        title: "Native Mobile App Development",
        href: "/mobile-app-development",
        badge: "Android & KMP",
        description: "Modern Jetpack Compose, Kotlin Multiplatform, and Swift native development with offline-first storage."
    },
    {
        title: "AI Chatbot & Assistant Engineering",
        href: "/ai-chatbot-development",
        badge: "RAG & Agents",
        description: "Deterministic LLM agents, vector embeddings, customer support copilots, and tool calling."
    },
    {
        title: "Custom Discord Bot Architecture",
        href: "/discord-bot",
        badge: "Automation",
        description: "High-throughput Discord bot clusters, payment verification, and community automations."
    }
];

const LEGAL_PAGES = [
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Terms of Service", href: "/terms-of-service" },
    { title: "Cookie Policy", href: "/cookie-policy" },
    { title: "RSS Feed (XML)", href: "/blog/feed.xml" }
];

export default async function SitemapPage() {
    await dbConnect();

    const [posts, categories] = await Promise.all([
        Post.find({ status: "published" })
            .select("title slug category publishedAt createdAt updatedAt readingTime excerpt")
            .sort({ publishedAt: -1, createdAt: -1 })
            .lean(),
        Category.find({}).sort({ name: 1 }).lean()
    ]);

    // Group posts by category
    const postsByCategory: Record<string, any[]> = {};
    posts.forEach((post: any) => {
        const cat = post.category || "General";
        if (!postsByCategory[cat]) {
            postsByCategory[cat] = [];
        }
        postsByCategory[cat].push(post);
    });

    const categoryNames = Object.keys(postsByCategory).sort();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemPage",
        "name": "RelayWorks Sitemap & Architectural Index",
        "description": "Complete architectural index of all engineering guides, core capabilities, and topic categories.",
        "url": "https://relayworks.dev/sitemap",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://relayworks.dev"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Sitemap",
                    "item": "https://relayworks.dev/sitemap"
                }
            ]
        }
    };

    return (
        <div className="min-h-screen bg-[#fafaf9] text-slate-900 selection:bg-blue-600 selection:text-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* ─── 1. HERO SECTION (Identical to Core Pages) ─── */}
            <section 
                className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-white border-b border-slate-200/80"
                style={{ 
                    backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", 
                    backgroundSize: "24px 24px" 
                }}
            >
                <div className="container mx-auto px-6 max-w-6xl relative z-10">
                    
                    {/* Breadcrumbs */}
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-6">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-800 font-semibold">Sitemap &amp; Architectural Index</span>
                    </nav>

                    {/* Eyebrow Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold tracking-wide mb-6 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        <span>Complete Search &amp; Architectural Index</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-heading tracking-tight text-slate-950 max-w-4xl leading-[1.14] mb-6">
                        Site &amp; Architectural <span style={{ color: "#2563eb" }}>Archive</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed mb-8 font-normal">
                        A two-click crawl directory of all {posts.length} engineering dispatches, specialized sprint capabilities, and topic hubs published by RelayWorks.
                    </p>

                    {/* Credibility Stats Pill */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center gap-6 text-xs text-slate-700 font-medium">
                        <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <strong className="text-slate-950 font-bold">{posts.length}</strong> Technical Dispatches
                        </span>
                        <span className="hidden sm:inline text-slate-300">·</span>
                        <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <strong className="text-slate-950 font-bold">{categories.length}</strong> Category Hubs
                        </span>
                        <span className="hidden sm:inline text-slate-300">·</span>
                        <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <strong className="text-slate-950 font-bold">100%</strong> Crawlable Internal Linking
                        </span>
                    </div>

                </div>
            </section>

            {/* ─── 2. CONTENT ARCHIVE DIRECTORY ─── */}
            <div className="py-16 md:py-20 bg-[#fafaf9]">
                <div className="container mx-auto px-6 max-w-6xl space-y-16">
                    
                    {/* Section 1: Core Platform */}
                    <section>
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-200">
                            <Compass className="w-5 h-5 text-blue-600" />
                            <h2 className="text-2xl font-bold font-heading text-slate-950 tracking-tight">
                                Core Platform &amp; Services
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {CORE_PAGES.map((page) => (
                                <Link 
                                    key={page.href} 
                                    href={page.href}
                                    className="group p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-slate-950 group-hover:text-blue-600 transition-colors text-base font-heading">
                                                {page.title}
                                            </h3>
                                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                            {page.description}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                                        relayworks.dev{page.href}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Section 2: Specialized Solutions */}
                    <section>
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-200">
                            <Code2 className="w-5 h-5 text-blue-600" />
                            <h2 className="text-2xl font-bold font-heading text-slate-950 tracking-tight">
                                Engineering Disciplines
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {SPECIALIZED_SOLUTIONS.map((sol) => (
                                <Link 
                                    key={sol.href} 
                                    href={sol.href}
                                    className="group p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                {sol.badge}
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                                        </div>
                                        <h3 className="font-bold text-slate-950 group-hover:text-blue-600 transition-colors text-base font-heading mb-2">
                                            {sol.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                            {sol.description}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                                        relayworks.dev{sol.href}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Section 3: Topic Category Hubs */}
                    <section>
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-200">
                            <Layers className="w-5 h-5 text-blue-600" />
                            <h2 className="text-2xl font-bold font-heading text-slate-950 tracking-tight">
                                Category Archives &amp; Topic Hubs
                            </h2>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {categories.map((cat: any) => {
                                const count = postsByCategory[cat.name]?.length || 0;
                                return (
                                    <Link 
                                        key={cat._id} 
                                        href={`/blog/category/${encodeURIComponent(cat.name)}`}
                                        className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 hover:text-blue-600 hover:border-blue-300 hover:shadow-xs transition-all shadow-2xs"
                                    >
                                        <span>{cat.name}</span>
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] text-slate-600 font-mono">
                                            {count}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* Section 4: All 50 Technical Guides Grouped by Category */}
                    <section>
                        <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <h2 className="text-2xl font-bold font-heading text-slate-950 tracking-tight">
                                    Technical Dispatches ({posts.length})
                                </h2>
                            </div>
                            <span className="text-xs text-slate-500 font-mono">
                                Direct Internal Links
                            </span>
                        </div>

                        <div className="space-y-8">
                            {categoryNames.map((catName) => {
                                const catPosts = postsByCategory[catName] || [];
                                return (
                                    <div key={catName} className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-xs">
                                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                                <h3 className="font-bold text-slate-950 font-heading text-xl">
                                                    {catName}
                                                </h3>
                                                <span className="text-xs text-slate-500 font-mono">
                                                    ({catPosts.length} article{catPosts.length !== 1 ? 's' : ''})
                                                </span>
                                            </div>
                                            <Link 
                                                href={`/blog/category/${encodeURIComponent(catName)}`}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                                            >
                                                <span>View Hub</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>

                                        <ul className="divide-y divide-slate-100">
                                            {catPosts.map((post: any) => {
                                                const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric"
                                                });

                                                return (
                                                    <li key={post._id} className="py-3 first:pt-0 last:pb-0">
                                                        <Link 
                                                            href={`/blog/${post.slug}`}
                                                            className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-slate-50 -mx-3 px-3 py-2 rounded-xl transition-colors"
                                                        >
                                                            <div className="flex-1 min-w-0 pr-4">
                                                                <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors text-sm line-clamp-1">
                                                                    {post.title}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-xs text-slate-500 font-mono shrink-0">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                                    {post.readingTime || 5}m
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                    {formattedDate}
                                                                </span>
                                                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                                                            </div>
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Section 5: Legal & Feeds */}
                    <section className="pt-4">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Policies, Standards &amp; Syndication
                            </h2>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs">
                            {LEGAL_PAGES.map((legal) => (
                                <Link 
                                    key={legal.href} 
                                    href={legal.href}
                                    className="text-slate-600 hover:text-blue-600 transition-colors font-medium underline underline-offset-4 decoration-slate-200 hover:decoration-blue-400"
                                >
                                    {legal.title}
                                </Link>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
