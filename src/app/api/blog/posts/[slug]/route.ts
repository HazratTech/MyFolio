import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
    try {
        await dbConnect();
        const { slug } = params;

        const post = await Post.findOneAndUpdate(
            { slug },
            { $inc: { views: 1 } }, // Increment view count
            { new: true }
        );

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error("Failed to fetch post:", error);
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
    try {
        await dbConnect();
        const { slug } = params;
        const body = await req.json();

        const post = await Post.findOneAndUpdate({ slug }, body, { new: true });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error("Failed to update post:", error);
        return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
    try {
        await dbConnect();
        const { slug } = params;

        const post = await Post.findOneAndDelete({ slug });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Failed to delete post:", error);
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}
