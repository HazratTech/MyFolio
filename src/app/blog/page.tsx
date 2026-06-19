import { Metadata } from "next";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import PostCard from "@/components/blog/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const metadata: Metadata = {
    title: "Software Engineering & Web Development Blog | Hazrat Ummar Shaikh",
    description: "Deep-dive technical tutorials, articles, and guides on React, Next.js, Node.js, Android, iOS, and system architecture. Written by software engineer Hazrat Ummar Shaikh.",
    openGraph: {
        title: "Software Engineering & Web Development Blog | Hazrat Ummar Shaikh",
        description: "Deep-dive technical tutorials, articles, and guides on React, Next.js, Node.js, Android, iOS, and system architecture.",
        url: "https://hazratdev.top/blog",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Software Engineering & Web Development Blog | Hazrat Ummar Shaikh",
        description: "Deep-dive technical tutorials, articles, and guides on React, Next.js, Node.js, Android, iOS, and system architecture.",
    }
};

async function getPosts(search?: string, category?: string, page: number = 1) {
    await dbConnect();
    const limit = 9;
    const skip = (page - 1) * limit;

    const query: any = { status: "published" };

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
        .lean(); // lean for plain JS objects

    const total = await Post.countDocuments(query);

    return { posts, total, pages: Math.ceil(total / limit) };
}

async function getCategories() {
    await dbConnect();
    return Category.find({}).sort({ name: 1 }).lean();
}

export default async function BlogPage({
    searchParams,
}: {
    searchParams: { q?: string; category?: string; page?: string };
}) {
    const page = Number(searchParams.page) || 1;
    const search = searchParams.q || "";
    const category = searchParams.category || "";

    const { posts, total, pages } = await getPosts(search, category, page);
    const categories = await getCategories();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Software Engineering & Web Development Blog | Hazrat Ummar Shaikh",
        "description": "Deep-dive technical tutorials, articles, and guides on React, Next.js, Node.js, Android, iOS, and system architecture.",
        "url": "https://hazratdev.top/blog",
        "publisher": {
            "@type": "Person",
            "name": "Hazrat Ummar Shaikh",
            "url": "https://hazratdev.top"
        }
    };

    return (
        <div className="min-h-screen bg-background pt-2 pb-16">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        My <span className="text-primary">Blog</span>
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Insights, tutorials, and updates from my journey in tech.
                    </p>
                </div>

                {/* Filters & Search */}
                <div className="mb-12 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center max-w-4xl mx-auto bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                        <div className="relative w-full md:w-96">
                            <form action="/blog" method="GET">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    name="q"
                                    placeholder="Search articles..."
                                    defaultValue={search}
                                    className="pl-9 bg-black/20 border-white/10 focus:bg-black/40 transition-colors"
                                />
                                {category && <input type="hidden" name="category" value={category} />}
                            </form>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center">
                            <Link href="/blog">
                                <Button
                                    variant={!category ? "default" : "ghost"}
                                    size="sm"
                                    className={!category ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}
                                >
                                    All
                                </Button>
                            </Link>
                            {categories.map((cat: any) => (
                                <Link key={cat._id} href={`/blog?category=${cat.name}${search ? `&q=${search}` : ''}`}>
                                    <Button
                                        variant={category === cat.name ? "default" : "ghost"}
                                        size="sm"
                                        className={category === cat.name ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}
                                    >
                                        {cat.name}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
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
                        <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                        {(search || category) && (
                            <Link href="/blog" className="mt-4 inline-block">
                                <Button variant="outline">Clear Filters</Button>
                            </Link>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex justify-center gap-2 mt-16">
                        {page > 1 && (
                            <Link href={`/blog?page=${page - 1}${search ? `&q=${search}` : ''}${category ? `&category=${category}` : ''}`}>
                                <Button variant="outline">Previous</Button>
                            </Link>
                        )}
                        <div className="flex items-center px-4 font-medium">
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
        </div>
    );
}
