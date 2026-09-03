import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Social from '@/models/Social';

export async function GET() {
    await dbConnect();
    try {
        const socials = await Social.find({});
        return NextResponse.json(socials, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch socials' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const social = await Social.create(body);
        return NextResponse.json(social);
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create social link' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { _id, ...updateData } = body;
        const social = await Social.findByIdAndUpdate(_id, updateData, { new: true });
        return NextResponse.json(social);
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to update social link' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    await dbConnect();
    try {
        const { id } = await request.json();
        await Social.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete social link' }, { status: 500 });
    }
}
