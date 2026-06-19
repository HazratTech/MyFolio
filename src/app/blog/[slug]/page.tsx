import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import { Calendar, Eye, Clock, ArrowLeft, Tag, User } from "lucide-react";
import ViewCounter from "@/components/blog/ViewCounter";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/blog/PostCard";
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import { AdBanner } from "@/components/blog/AdBanner";

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
                            className="object-cover"
                            priority
                            sizes="100vw"
                        />
                        {/* Multi-layer gradient overlay for text legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/30" />
                        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
                )}

                {/* Back button on hero */}
                <div className="absolute top-6 left-0 right-0 px-6 md:px-12 z-10">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 transition-all hover:bg-black/50 hover:border-white/40"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>
                </div>

                {/* Hero text overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-10 z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="bg-primary text-white shadow-lg shadow-primary/30 text-xs font-semibold px-3 py-1">
                                {post.category || "Development"}
                            </Badge>
                            {post.tags?.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-white/70 border-white/20 bg-black/30 backdrop-blur-sm text-xs">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold font-heading leading-tight text-white drop-shadow-2xl mb-4">
                            {post.title}
                        </h1>
                        {post.excerpt && (
                        <p className="text-slate-700 text-base md:text-lg leading-relaxed max-w-3xl line-clamp-2">
                                {post.excerpt}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── META BAR ─── */}
            <div className="border-b border-white/10 bg-card/30 backdrop-blur-sm sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-6 md:px-12 py-3 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium text-foreground/80">Hazrat Ummar Shaikh</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {publishDate}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        {post.views} views
                    </span>
                    {post.readingTime && (
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            {post.readingTime} min read
                        </span>
                    )}
                </div>
            </div>

            {/* ─── ARTICLE BODY ─── */}
            <article className="max-w-4xl mx-auto px-6 md:px-12 pt-12 pb-16" id="article-content">
                <div
                    className="blog-prose"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Inline Post Ad banner */}
                <AdBanner slot="3829910482" format="rectangle" />

                {/* Tags at bottom */}
                {post.tags?.length > 0 && (
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

                {/* Author Card */}
                <div className="mt-12 p-6 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm flex gap-5 items-start">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0 flex items-center justify-center text-white font-bold text-xl font-heading">
                        H
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Written by</p>
                        <h3 className="font-bold text-lg font-heading text-foreground">Hazrat Ummar Shaikh</h3>
                        <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                            Native Android & Backend Developer passionate about building robust systems, clean code, and sharing developer insights through writing.
                        </p>
                    </div>
                </div>
            </article>

            {/* Middle horizontal ad slot before Related Posts */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 my-6">
                <AdBanner slot="9382019482" format="horizontal" />
            </div>

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
