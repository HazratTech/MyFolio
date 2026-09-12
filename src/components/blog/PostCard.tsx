import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, ArrowRight, FileText } from "lucide-react";
import { IPost } from "@/models/Post";
import { getCleanSlug } from "@/lib/utils";

interface PostCardProps {
    post: IPost;
}

export default function PostCard({ post }: PostCardProps) {
    const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    return (
        <Card className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)] transition-all duration-300 group h-full flex flex-col">
            {/* Thumbnail Wrapper */}
            <div className="relative h-52 w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                {post.coverImage ? (
                    <>
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full bg-blue-50/50 text-blue-600">
                        <FileText className="w-10 h-10 stroke-[1.5]" />
                    </div>
                )}
                
                {/* Category tag */}
                <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/95 text-blue-700 border border-slate-200/80 shadow-xs backdrop-blur-sm">
                        {post.category || "Development"}
                    </span>
                </div>
            </div>

            {/* Title / Header */}
            <CardHeader className="pb-2 pt-5 px-6">
                <Link href={`/blog/${getCleanSlug(post.slug)}`} className="block">
                    <h3 className="text-lg font-bold font-heading leading-snug tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                        {post.title}
                    </h3>
                </Link>
            </CardHeader>

            {/* Card Body */}
            <CardContent className="flex-grow pb-4 px-6">
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">
                    {post.excerpt || post.content.replace(/<[^>]*>?/gm, "").substring(0, 150) + "..."}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                    {post.tags?.slice(0, 3).map((tag: string) => (
                        <span 
                            key={tag} 
                            className="text-[10px] font-mono uppercase tracking-wider bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 px-2 py-0.5 rounded-md transition-colors"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            </CardContent>

            {/* Card Footer */}
            <CardFooter className="border-t border-slate-100 mx-6 py-3.5 px-0 text-xs text-slate-500 flex justify-between items-center mt-auto font-sans">
                <div className="flex gap-4 items-center">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formattedDate}
                    </span>
                    {post.views >= 1000 && (
                        <span className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            {post.views}
                        </span>
                    )}
                </div>
                <Link 
                    href={`/blog/${getCleanSlug(post.slug)}`} 
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors font-semibold group-hover:gap-1.5 duration-200"
                >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </CardFooter>
        </Card>
    );
}
