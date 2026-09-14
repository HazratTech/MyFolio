import { Metadata } from "next";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import PostCard from "@/components/blog/PostCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Sparkles, Tag as TagIcon, Compass } from "lucide-react";

function extractTag(param: string | string[]): string {
    if (Array.isArray(param)) {
        return decodeURIComponent(param.join("/"));
    }
    return decodeURIComponent(param || "");
}

export async function generateMetadata({ params }: { params: { tag: string | string[] } }): Promise<Metadata> {
    const tag = extractTag(params.tag);
    const title = tag.length <= 32 
        ? `#${tag} Engineering Guides | RelayWorks` 
        : `#${tag} Guides | RelayWorks`;
    return {
        title: title.length <= 60 ? title : `${title.substring(0, 57)}...`,
        description: `Read technical guides and architectural dispatches tagged with #${tag} by Hazrat Ummar Shaikh.`,
        alternates: {
            canonical: `/blog/tag/${Array.isArray(params.tag) ? params.tag.join("/") : params.tag}`,
        },
    };
}

async function getPostsByTag(tag: string, page: number = 1) {
    await dbConnect();
    const limit = 9;
    const skip = (page - 1) * limit;

    const query = { status: "published", tags: new RegExp(`^${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") };

    const posts = await Post.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Post.countDocuments(query);

    return { posts, total, pages: Math.ceil(total / limit) };
}

export default async function TagPage({
    params,
    searchParams,
}: {
    params: { tag: string | string[] };
    searchParams: { page?: string };
}) {
    const tag = extractTag(params.tag);
    const page = Number(searchParams.page) || 1;
    const { posts, total, pages } = await getPostsByTag(tag, page);

    const popularTags = [
        "Android", "Kotlin", "SwiftUI", "iOS", "FastAPI", 
        "Spring Boot", "Discord Bot", "AI Chatbots", "Microservices"
    ];

    return (
        <div className="min-h-screen bg-[#fafaf9] [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] pt-4 pb-20">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="pt-4 pb-6">
                    <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to All Dispatches</span>
                    </Link>
                </div>

                {/* Header Section */}
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Curated Tag Index</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight text-slate-950 mb-3">
                        Tag: <span style={{ color: "#2563eb" }}>#{tag}</span>
                    </h1>
                    <p className="text-slate-600 text-base leading-relaxed">
                        Curated collection of <strong className="text-slate-900 font-bold">{total}</strong> engineering dispatch{total !== 1 ? "es" : ""} and production architectural walk-throughs covering #{tag}, system tradeoffs, and senior engineering implementation.
                    </p>
                </div>

                {/* Posts Grid */}
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post: any) => (
                            <div key={post._id} className="h-full">
                                <PostCard post={post} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed p-8 max-w-md mx-auto">
                        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2 font-heading">No articles found</h3>
                        <p className="text-slate-500 text-sm mb-4">No published guides match this tag currently.</p>
                        <Link href="/blog">
                            <Button variant="outline" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
                                Browse All Dispatches
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Rich Context & Related Topics (Boosts word count and text-to-HTML ratio) */}
                <div className="mt-16 pt-10 border-t border-slate-200/80 bg-white rounded-2xl p-8 border border-slate-200 shadow-xs max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 mb-3">
                        <Compass className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold font-heading text-slate-900">Explore Core Engineering Disciplines</h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                        RelayWorks publishes in-depth architectural postmortems, performance benchmarks, and implementation strategies for production systems. Explore foundational categories across native mobile engineering, distributed microservices, and automated bot architectures.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {popularTags.map((popularTag) => (
                            <Link
                                key={popularTag}
                                href={`/blog/tag/${encodeURIComponent(popularTag)}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                            >
                                <TagIcon className="w-3 h-3 text-slate-400" />
                                <span>#{popularTag}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex justify-center gap-2 mt-12">
                        {Array.from({ length: pages }).map((_, i) => (
                            <Link key={i} href={`/blog/tag/${encodeURIComponent(tag)}?page=${i + 1}`}>
                                <Button
                                    variant={page === i + 1 ? "default" : "outline"}
                                    size="sm"
                                    className={page === i + 1 ? "bg-blue-600 hover:bg-blue-700 text-white font-bold" : "bg-white border-slate-200 text-slate-700"}
                                >
                                    {i + 1}
                                </Button>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
