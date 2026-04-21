import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const category = searchParams.get("category");
        const tag = searchParams.get("tag");
        const status = searchParams.get("status"); // 'published' or 'draft' (admin only)
        const search = searchParams.get("search");

        const query: any = {};

        if (status && status !== 'all') {
            query.status = status;
        } else if (!status) {
            // Default to published for public API if no status specified
            query.status = "published";
        }

        if (category) {
            query.category = category;
        }

        if (tag) {
            query.tags = tag;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;

        const posts = await Post.find(query)
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments(query);

        return NextResponse.json({
            posts,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Failed to fetch posts:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        // Basic validation
        if (!body.title || !body.content) {
            return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
        }

        let slug = body.slug;
        if (!slug) {
            slug = slugify(body.title);
        }

        // Check for duplicate slug
        const existingPost = await Post.findOne({ slug });
        if (existingPost) {
            // Append random string to make unique
            slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
        }

        const post = await Post.create({
            ...body,
            slug,
        });

        return NextResponse.json(post, { status: 201 });

    } catch (error) {
        console.error("Failed to create post:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
