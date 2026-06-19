import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, ArrowRight } from "lucide-react";
import { IPost } from "@/models/Post";

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
        <Card className="bg-white/[0.02] backdrop-blur-md border border-white/5 overflow-hidden hover:border-primary/30 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-500 group h-full flex flex-col rounded-2xl">
            {/* Thumbnail Wrapper */}
            <div className="relative h-52 w-full overflow-hidden bg-white/[0.02] border-b border-white/5">
                {post.coverImage ? (
                    <>
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-muted-foreground">
                        <span className="text-4xl filter grayscale">📝</span>
                    </div>
                )}
                
                {/* Category tag */}
                <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-primary/20 text-primary border border-primary/30 backdrop-blur-md hover:bg-primary hover:text-white transition-all text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {post.category || "Development"}
                    </Badge>
                </div>
            </div>

            {/* Title / Header */}
            <CardHeader className="pb-3 pt-5 px-6">
                <Link href={`/blog/${post.slug}`} className="block">
                    <h3 className="text-lg font-bold font-heading leading-snug tracking-tight text-white/95 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {post.title}
                    </h3>
                </Link>
            </CardHeader>

            {/* Card Body */}
            <CardContent className="flex-grow pb-4 px-6">
                <p className="text-muted-foreground/80 text-sm leading-relaxed line-clamp-3 mb-5">
                    {post.excerpt || post.content.replace(/<[^>]*>?/gm, "").substring(0, 150) + "..."}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                    {post.tags?.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-[10px] uppercase tracking-wider font-mono bg-white/[0.02] border-white/5 hover:border-white/20 text-muted-foreground/90 rounded-md">
                            #{tag}
                        </Badge>
                    ))}
                </div>
            </CardContent>

            {/* Card Footer */}
            <CardFooter className="border-t border-white/5 mx-6 py-4 px-0 text-xs text-muted-foreground/60 flex justify-between items-center mt-auto">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary/70" />
                        {formattedDate}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-primary/70" />
                        {post.views}
                    </span>
                </div>
                <Link 
                    href={`/blog/${post.slug}`} 
                    className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-semibold group-hover:gap-1.5 transition-all duration-300"
                >
                    Read More 
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </CardFooter>
        </Card>
    );
}
