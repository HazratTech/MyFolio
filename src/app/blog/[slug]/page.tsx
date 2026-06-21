import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import { Calendar, Eye, Clock, ArrowLeft, Tag, User } from "lucide-react";
import ViewCounter from "@/components/blog/ViewCounter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/blog/PostCard";
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";

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

    return {
        title: `${post.title} | Hazrat Ummar Shaikh`,
        description: post.excerpt || post.content.substring(0, 160),
        alternates: {
            canonical: `/blog/${params.slug}`,
        },
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: "article",
            publishedTime: post.publishedAt?.toString(),
            authors: ["Hazrat Ummar Shaikh"],
            images: post.coverImage ? [post.coverImage] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
            images: post.coverImage ? [post.coverImage] : [],
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
    let ctaTitle = "Need a Professional Mobile & Backend Developer?";
    let ctaDescription = "I build premium native mobile apps (Android, iOS) and high-performance backend systems (FastAPI, Ktor). Let's collaborate on your next project!";

    if (categoryLower.includes("android")) {
        ctaTitle = "Need Help with Native Android Development?";
        ctaDescription = "I build high-performance Native Android apps using Kotlin, Jetpack Compose, and modern architecture. Let's collaborate to build a premium mobile experience!";
    } else if (categoryLower.includes("discord")) {
        ctaTitle = "Need Help with Custom Discord Bots or Server Automation?";
        ctaDescription = "I design and develop custom, highly scalable Discord bots and server automation systems with rich API integrations. Let's build something interactive!";
    } else if (categoryLower.includes("backend") || categoryLower.includes("api") || categoryLower.includes("database")) {
        ctaTitle = "Need Help with Custom APIs or Backend Systems?";
        ctaDescription = "I build robust, secure, and scalable backend services, databases, and microservices using FastAPI, Ktor, Node.js, and MongoDB. Let's build your server infrastructure!";
    } else if (categoryLower.includes("ios") || categoryLower.includes("swift")) {
        ctaTitle = "Need Help with iOS App Development?";
        ctaDescription = "I build modern, fluid, and high-performance native iOS applications using Swift and SwiftUI. Let's collaborate to launch your iOS app!";
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": post.coverImage ? [post.coverImage] : [],
        "datePublished": post.publishedAt,
        "dateModified": post.updatedAt,
        "author": [{
            "@type": "Person",
            "name": "Hazrat Ummar Shaikh",
            "url": "https://hazratdev.top"
        }]
    };

    const publishDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {!isPreview && <ViewCounter slug={params.slug} />}

            {/* Reading Progress Bar */}
            <ReadingProgressBar />

            {/* ─── HERO SECTION ─── */}
            <div className="relative w-full" style={{ height: 'min(75vh, 580px)' }}>
                {post.coverImage ? (
                    <>
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            priority
                            className="object-cover"
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
                )}

                {/* Hero Content (Overlaid on bottom of image) */}
                <div className="absolute bottom-0 left-0 right-0 py-8 px-6 md:px-12">
                    <div className="max-w-4xl mx-auto">
                        <Link href="/blog" className="inline-flex items-center text-primary hover:text-primary/80 font-medium mb-4 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Blog
                        </Link>
                        
                        <div className="flex flex-wrap gap-2 items-center mb-4">
                            <Badge className="bg-primary/20 text-primary border-primary/30 font-semibold px-3 py-0.5 rounded-full backdrop-blur-sm">
                                {post.category}
                            </Badge>
                            <span className="text-slate-400 text-xs flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {post.readingTime || 5} min read
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight mb-4 leading-tight drop-shadow-sm">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 font-sans">
                            <span className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-primary/25 border border-primary/40 flex items-center justify-center text-primary font-bold text-xs">
                                    H
                                </span>
                                Hazrat Ummar Shaikh
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-primary" />
                                {publishDate}
                            </span>
                            {!isPreview && (
                                <span className="flex items-center gap-1.5">
                                    <Eye className="w-4 h-4 text-primary" />
                                    <span>{post.views || 0} views</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── ARTICLE CONTENT ─── */}
            <article className="max-w-4xl mx-auto px-6 py-12 md:py-16">
                <div 
                    className="prose prose-invert max-w-none font-sans leading-relaxed text-slate-300 md:text-lg"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags Section */}
                {post.tags && post.tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            {post.tags.map((tag: string) => (
                                <Link
                                    key={tag}
                                    href={`/blog/tag/${tag}`}
                                    className="text-sm bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Visual Call To Action (CTA) */}
                <div className="mt-16 mb-12 p-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/50 to-secondary/10 backdrop-blur-sm text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-50 pointer-events-none" />
                    <h3 className="text-xl md:text-2xl font-bold font-heading text-white mb-2 relative z-10">
                        {ctaTitle}
                    </h3>
                    <p className="text-slate-300 text-sm max-w-xl mx-auto mb-6 relative z-10 font-sans leading-relaxed">
                        {ctaDescription}
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center relative z-10">
                        <Link href="/#contact">
                            <Button className="bg-primary hover:bg-primary/95 text-white font-medium rounded-xl px-5 shadow-lg shadow-primary/20">
                                Work With Me
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-medium rounded-xl px-5">
                                View Portfolio
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Author Card */}
                <div className="mt-12 p-6 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm flex gap-5 items-start">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0 flex items-center justify-center text-white font-bold text-xl font-heading">
                        H
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Written by</p>
                        <h3 className="font-bold text-lg font-heading text-foreground">Hazrat Ummar Shaikh</h3>
                        <p className="text-muted-foreground text-sm mt-1 leading-relaxed font-sans">
                            Android Developer with 4+ years of experience. Built production Android apps, Ktor backends, Discord bots, and SaaS products using Kotlin, Python, and MongoDB. Passionate about building robust systems and writing clean code.
                        </p>
                    </div>
                </div>
            </article>

            {/* ─── RELATED POSTS ─── */}
            {relatedPosts.length > 0 && (
                <section className="border-t border-white/10 pt-16 pb-20 px-6 md:px-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
                            <h2 className="text-2xl font-bold font-heading text-foreground whitespace-nowrap">Related Posts</h2>
                            <div className="h-px flex-1 bg-gradient-to-l from-primary/40 to-transparent" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedPosts.map((relatedPost) => (
                                <PostCard key={relatedPost._id} post={relatedPost} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
