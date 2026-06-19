import { Metadata } from "next";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import PostCard from "@/components/blog/PostCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
    const category = decodeURIComponent(params.category);
    return {
        title: `${category} Posts | Hazrat Ummar Shaikh`,
        description: `Read articles about ${category}.`,
        alternates: {
            canonical: `/blog/category/${params.category}`,
        },
    };
}

async function getPostsByCategory(category: string, page: number = 1) {
    await dbConnect();
    const limit = 9;
    const skip = (page - 1) * limit;

    const query = { status: "published", category: new RegExp(`^${category}$`, 'i') }; // Case-insensitive exact match

    const posts = await Post.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Post.countDocuments(query);

    return { posts, total, pages: Math.ceil(total / limit) };
}

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: { category: string };
    searchParams: { page?: string };
}) {
    const category = decodeURIComponent(params.category);
    const page = Number(searchParams.page) || 1;
    const { posts, total, pages } = await getPostsByCategory(category, page);

    return (
        <div className="min-h-screen bg-background pt-2 pb-16">
            <div className="container mx-auto px-6 max-w-7xl">
                <Link href="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to All Posts
                </Link>

                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
                        Category: <span className="text-primary capitalize">{category}</span>
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        {total} article{total !== 1 ? 's' : ''} found
                    </p>
                </div>

                {/* Posts Grid */}
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post: any) => (
                            <div key={post._id} className="animate-in fade-in zoom-in-95 duration-500">
                                <PostCard post={post} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                        <h3 className="text-2xl font-bold mb-2">No posts found</h3>
                        <p className="text-muted-foreground">Try a different category.</p>
                    </div>
                )}

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex justify-center gap-2 mt-16">
                        {page > 1 && (
                            <Link href={`/blog/category/${params.category}?page=${page - 1}`}>
                                <Button variant="outline">Previous</Button>
                            </Link>
                        )}
                        <div className="flex items-center px-4 font-medium">
                            Page {page} of {pages}
                        </div>
                        {page < pages && (
                            <Link href={`/blog/category/${params.category}?page=${page + 1}`}>
                                <Button variant="outline">Next</Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
