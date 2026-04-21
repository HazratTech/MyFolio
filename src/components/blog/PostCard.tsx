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
    return (
        <Card className="bg-card/50 backdrop-blur-sm border-white/10 overflow-hidden hover:border-primary/50 transition-all duration-300 group h-full flex flex-col">
            <div className="relative h-48 w-full overflow-hidden bg-muted">
                {post.coverImage ? (
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-white/5 text-muted-foreground">
                        <span className="text-4xl">📝</span>
                    </div>
                )}
                <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary">
                        {post.category || "General"}
                    </Badge>
                </div>
            </div>

            <CardHeader className="pb-2">
                <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-xl font-bold font-heading line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                    </h3>
                </Link>
            </CardHeader>

            <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {post.excerpt || post.content.substring(0, 150) + "..."}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags?.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-white/5 hover:bg-white/10 text-muted-foreground border-transparent">
                            #{tag}
                        </Badge>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="border-t border-white/10 pt-4 text-xs text-muted-foreground flex justify-between items-center">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views}
                    </span>
                </div>
                <Link href={`/blog/${post.slug}`} className="flex items-center gap-1 text-primary hover:underline font-medium">
                    Read More <ArrowRight className="w-3 h-3" />
                </Link>
            </CardFooter>
        </Card>
    );
}
