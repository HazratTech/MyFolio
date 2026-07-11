import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import BlogComment from '@/models/BlogComment';

export async function GET(request: Request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    if (!postId) {
        return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    try {
        const comments = await BlogComment.find({ postId, approved: true }).sort({ createdAt: 1 }); // chronological order
        return NextResponse.json(comments);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { postId, name, email, content } = await request.json();
        if (!postId || !name || !email || !content) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Clean email and generate hash
        const emailHash = crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');

        const newComment = await BlogComment.create({
            postId,
            name,
            emailHash,
            content
        });

        return NextResponse.json(newComment, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    }
}
