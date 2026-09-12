import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import { Calendar, Eye, Clock, ArrowLeft, ArrowRight, Tag, User } from "lucide-react";
import ViewCounter from "@/components/blog/ViewCounter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/blog/PostCard";
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import BlogComments from "@/components/blog/BlogComments";
import MermaidRenderer from "@/components/blog/MermaidRenderer";

async function getPost(slug: string, isPreview: boolean = false) {
    await dbConnect();
    const query: any = { slug };
    if (!isPreview) {
        query.status = "published";
    }
    const post = await Post.findOne(query).lean();
    return post;
}

async function getRelatedPosts(category: string, currentSlug: string) {
    await dbConnect();
    return Post.find({
        category,
        slug: { $ne: currentSlug },
        status: "published"
    })
        .sort({ views: -1 })
        .limit(3)
        .lean();
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const post = await getPost(params.slug);
    if (!post) {
        return { title: "Post Not Found" };
    }

    let imageUrl = post.coverImage || "https://relayworks.dev/og-banner.png";
    if (imageUrl && !imageUrl.startsWith("http")) {
        imageUrl = `https://relayworks.dev${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    }

    return {
        title: `${post.title} | RelayWorks Dispatches`,
        description: post.excerpt || post.content.substring(0, 160),
        alternates: {
            canonical: `/blog/${params.slug}`,
        },
        openGraph: {
            title: post.title,
            description: post.excerpt,
            url: `https://relayworks.dev/blog/${params.slug}`,
            type: "article",
            publishedTime: post.publishedAt?.toString(),
            authors: ["Hazrat Ummar Shaikh"],
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
            images: [imageUrl],
        }
    };
}

export default async function BlogPostPage({ params, searchParams }: { params: { slug: string }, searchParams: { preview?: string } }) {
    const isPreview = searchParams.preview === 'true';
    const post: any = await getPost(params.slug, isPreview);

    if (!post) {
        notFound();
    }

    const relatedPosts: any[] = await getRelatedPosts(post.category, post.slug);

    const categoryLower = (post.category || "").toLowerCase();
    let ctaTitle = "Need a Senior Mobile & Backend Builder?";
    let ctaDescription = "I engineer high-performance native mobile apps (Android, iOS) and resilient cloud APIs (FastAPI, Spring Boot). Direct milestone sprints with 100% source ownership.";
    let ctaHref = "/services";
    let ctaBtnText = "Explore Capabilities & Sprints";

    if (categoryLower.includes("android")) {
        ctaTitle = "Need Native Android Architecture?";
        ctaDescription = "I build high-performance Native Android apps using Kotlin, Jetpack Compose, and offline-first SQLite architectures. Let's engineer your mobile application!";
        ctaHref = "/mobile-app-development";
        ctaBtnText = "Explore Mobile Development";
    } else if (categoryLower.includes("discord")) {
        ctaTitle = "Looking for Custom Discord Bot Architecture?";
        ctaDescription = "I engineer custom, highly scalable Discord bots, role verification engines, and ticket automation with 99.9% uptime. Zero agency middlemen.";
        ctaHref = "/discord-bot";
        ctaBtnText = "View Discord Bot Engineering";
    } else if (categoryLower.includes("ai") || categoryLower.includes("chatbot") || categoryLower.includes("mcp")) {
        ctaTitle = "Need Custom AI Assistants or Automation Agents?";
        ctaDescription = "I build deterministic AI agents, customer support copilots, and multi-platform workflows with tool calling and vector embeddings.";
        ctaHref = "/ai-chatbot-development";
        ctaBtnText = "View AI Assistant Services";
    } else if (categoryLower.includes("backend") || categoryLower.includes("api") || categoryLower.includes("database")) {
        ctaTitle = "Need Resilient Cloud APIs or Backend Microservices?";
        ctaDescription = "I build secure, high-throughput backend services and event-driven microservices using Spring Boot, FastAPI, Node.js, and PostgreSQL.";
        ctaHref = "/services";
        ctaBtnText = "View Backend & API Sprints";
    } else if (categoryLower.includes("ios") || categoryLower.includes("swift")) {
        ctaTitle = "Need Modern Native iOS Engineering?";
        ctaDescription = "I build fluid, offline-first native iOS applications using Swift, SwiftUI, and modern architecture patterns.";
        ctaHref = "/mobile-app-development";
        ctaBtnText = "Explore iOS Development";
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": post.coverImage ? [post.coverImage] : [],
        "datePublished": post.publishedAt || post.createdAt,
        "dateModified": post.updatedAt || post.publishedAt || post.createdAt,
        "author": {
            "@type": "Person",
            "name": "Hazrat Ummar Shaikh",
            "jobTitle": "Lead Software Engineer & Studio Founder",
            "worksFor": {
                "@type": "Organization",
                "name": "RelayWorks",
                "url": "https://relayworks.dev"
            },
            "sameAs": [
                "https://github.com/ihazratummar",
                "https://www.linkedin.com/in/hazrat-ummar-shaikh/",
                "https://x.com/ihazratummar9"
            ]
        },
        "publisher": {
            "@type": "Organization",
            "name": "RelayWorks",
            "url": "https://relayworks.dev",
            "logo": {
                "@type": "ImageObject",
                "url": "https://relayworks.dev/logo-brand.png"
            }
        },
        "description": post.excerpt || post.content.replace(/<[^>]*>/g, "").substring(0, 160)
    };

    const publishDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-[#fafaf9] [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] pb-16">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {!isPreview && <ViewCounter slug={params.slug} />}

            {/* Reading Progress Bar */}
            <ReadingProgressBar />

            {/* ─── HERO HEADER SECTION ─── */}
            {post.coverImage ? (
                <div className="relative w-full" style={{ height: 'min(70vh, 520px)' }}>
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#fafaf9] via-[#fafaf9]/75 to-slate-900/30" />
                    
                    <div className="absolute bottom-0 left-0 right-0 py-8 px-6 md:px-12">
                        <div className="max-w-4xl mx-auto">
                            <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 mb-4 transition-colors gap-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to All Dispatches</span>
                            </Link>
                            
                            <div className="flex flex-wrap gap-2 items-center mb-3">
                                <span className="bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-3 py-0.5 rounded-full text-xs shadow-2xs">
                                    {post.category}
                                </span>
                                <span className="text-slate-600 text-xs flex items-center gap-1 font-mono">
                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                    {post.readingTime || 5} min read
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black font-heading text-slate-950 tracking-tight mb-4 leading-tight">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 font-sans">
                                <span className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                                        H
                                    </span>
                                    Hazrat Ummar Shaikh (Lead Builder)
                                </span>
                                <span className="flex items-center gap-1.5 font-mono">
                                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                    {publishDate}
                                </span>
                                {!isPreview && (
                                    <span className="flex items-center gap-1.5 font-mono">
                                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                                        <span>{post.views || 0} views</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="pt-8 pb-4 px-6 md:px-12 max-w-4xl mx-auto">
                    <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 mb-6 transition-colors gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to All Dispatches</span>
                    </Link>
                    
                    <div className="flex flex-wrap gap-2 items-center mb-3">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-3 py-0.5 rounded-full text-xs shadow-2xs">
                            {post.category}
                        </span>
                        <span className="text-slate-500 text-xs flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {post.readingTime || 5} min read
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black font-heading text-slate-950 tracking-tight mb-4 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 font-sans pb-6 border-b border-slate-200">
                        <span className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                                H
                            </span>
                            Hazrat Ummar Shaikh (Lead Builder)
                        </span>
                        <span className="flex items-center gap-1.5 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            {publishDate}
                        </span>
                        {!isPreview && (
                            <span className="flex items-center gap-1.5 font-mono">
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                                <span>{post.views || 0} views</span>
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* ─── ARTICLE CONTENT ─── */}
            <article className="max-w-4xl mx-auto px-6 py-8 md:py-12">
                <div 
                    id="article-content"
                    className="blog-prose"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
                <MermaidRenderer />

                {/* Tags Section */}
                {post.tags && post.tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="w-4 h-4 text-slate-400" />
                            {post.tags.map((tag: string) => (
                                <Link
                                    key={tag}
                                    href={`/blog/tag/${tag}`}
                                    className="text-xs font-mono uppercase bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 px-3 py-1 rounded-md transition-colors shadow-2xs"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Visual Call To Action (CTA) */}
                <div className="mt-14 mb-12 p-8 rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/60 shadow-xs text-center relative overflow-hidden">
                    <h3 className="text-xl md:text-2xl font-black font-heading text-slate-950 mb-2">
                        {ctaTitle}
                    </h3>
                    <p className="text-slate-600 text-sm max-w-xl mx-auto mb-6 font-sans leading-relaxed">
                        {ctaDescription}
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link href={ctaHref}>
                            <Button 
                                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                className="hover:opacity-90 text-white font-semibold rounded-xl px-6 h-11 shadow-xs flex items-center gap-2 transition-opacity text-sm"
                            >
                                <span>{ctaBtnText}</span>
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="outline" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl px-5 h-11 shadow-2xs text-sm">
                                Book Free Consultation
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Author Card */}
                <div className="mt-12 p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex gap-5 items-start">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-blue-50 flex items-center justify-center">
                        <Image src="/images/founder.jpg" alt="Hazrat Ummar Shaikh" width={56} height={56} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1 font-mono">Senior Builder & Author</p>
                        <h3 className="font-bold text-base md:text-lg font-heading text-slate-950">
                            Hazrat Ummar Shaikh <span className="text-xs font-normal text-slate-500 ml-1">· Lead Engineer & Studio Founder</span>
                        </h3>
                        <p className="text-slate-600 text-sm mt-1 leading-relaxed font-sans">
                            Systems engineer with 4+ years shipping production Native Android applications (Kotlin, Compose), resilient cloud backends (FastAPI, Spring Boot), custom Discord bot infrastructure, and deterministic AI automations.
                        </p>
                    </div>
                </div>

                {/* Comments Section */}
                <BlogComments postId={post._id.toString()} />
            </article>

            {/* ─── RELATED POSTS ─── */}
            {relatedPosts.length > 0 && (
                <section className="border-t border-slate-200 pt-16 pb-12 px-6 md:px-12 bg-white/60">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="h-px flex-1 bg-slate-200" />
                            <h2 className="text-2xl font-black font-heading text-slate-950 whitespace-nowrap">Related Technical Dispatches</h2>
                            <div className="h-px flex-1 bg-slate-200" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedPosts.map((relatedPost) => (
                                <div key={relatedPost._id} className="h-full">
                                    <PostCard post={relatedPost} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
