import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import { Calendar, Eye, Tag, ArrowLeft } from "lucide-react";
import ViewCounter from "@/components/blog/ViewCounter";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/blog/PostCard"; // For related posts

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
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: `${post.title} | Hazrat Ummar Shaikh`,
        description: post.excerpt || post.content.substring(0, 160),
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

    // JSON-LD Schema for SEO
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

    return (
        <div className="min-h-screen bg-background pt-24 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {!isPreview && <ViewCounter slug={params.slug} />}

            <article className="container mx-auto px-6 max-w-4xl">
                <Link href="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Blog
                </Link>

                <header className="mb-12 text-center md:text-left">
                    <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/30 text-sm">
                            {post.category || "General"}
                        </Badge>
                        {post.tags?.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-white/60 border-white/10">
                                #{tag}
                            </Badge>
                        ))}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold font-heading mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm justify-center md:justify-start">
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        <span className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            {post.views} Views
                        </span>
                        {post.readingTime && (
                            <span className="flex items-center gap-2">
                                ⏱️ {post.readingTime} min read
                            </span>
                        )}
                    </div>
                </header>

                {post.coverImage && (
                    <div className="relative w-full aspect-video mb-12 rounded-xl overflow-hidden shadow-2xl border border-white/10">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 1200px) 100vw, 1200px"
                        />
                    </div>
                )}

                <div
                    className="prose prose-invert prose-lg max-w-none prose-headings:font-heading prose-a:text-primary prose-img:rounded-xl"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <div className="container mx-auto px-6 max-w-7xl mt-24 border-t border-white/10 pt-16">
                    <h2 className="text-3xl font-bold font-heading mb-8">Related Posts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {relatedPosts.map((relatedPost) => (
                            <PostCard key={relatedPost._id} post={relatedPost} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
