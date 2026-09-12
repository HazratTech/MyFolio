import { Metadata } from "next";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import PostCard from "@/components/blog/PostCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
    const tag = decodeURIComponent(params.tag);
    return {
        title: `#${tag} Engineering Guides | RelayWorks Dispatches`,
        description: `Read articles and developer guides tagged with #${tag} by Hazrat Ummar Shaikh.`,
        alternates: {
            canonical: `/blog/tag/${params.tag}`,
        },
    };
}

async function getPostsByTag(tag: string, page: number = 1) {
    await dbConnect();
    const limit = 9;
    const skip = (page - 1) * limit;

    const query = { status: "published", tags: new RegExp(`^${tag}$`, 'i') }; // Case-insensitive tag match

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
    params: { tag: string };
    searchParams: { page?: string };
}) {
    const tag = decodeURIComponent(params.tag);
    const page = Number(searchParams.page) || 1;
    const { posts, total, pages } = await getPostsByTag(tag, page);

    return (
        <div className="min-h-screen bg-[#fafaf9] [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] pt-4 pb-20">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="pt-4 pb-6">
                    <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to All Dispatches</span>
                    </Link>
                </div>

                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Topic Index</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight text-slate-950 mb-3">
                        Tag: <span style={{ color: "#2563eb" }} className="font-mono">#{tag}</span>
                    </h1>
                    <p className="text-slate-600 text-base">
                        Showing <strong className="text-slate-900 font-bold">{total}</strong> technical publication{total !== 1 ? 's' : ''}
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

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-16">
                        {page > 1 && (
                            <Link href={`/blog/tag/${params.tag}?page=${page - 1}`}>
                                <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 px-4 rounded-lg shadow-2xs">
                                    Previous
                                </Button>
                            </Link>
                        )}
                        <div className="flex items-center px-4 font-mono text-xs text-slate-600">
                            Page {page} of {pages}
                        </div>
                        {page < pages && (
                            <Link href={`/blog/tag/${params.tag}?page=${page + 1}`}>
                                <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 px-4 rounded-lg shadow-2xs">
                                    Next
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
