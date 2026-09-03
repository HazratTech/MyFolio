import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Testimonial from '@/models/Testimonial';

export async function GET() {
    await dbConnect();
    try {
        const testimonials = await Testimonial.find({});
        return NextResponse.json(testimonials, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch testimonials' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const testimonial = await Testimonial.create(body);
        return NextResponse.json(testimonial);
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create testimonial' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { _id, ...updateData } = body;
        const testimonial = await Testimonial.findByIdAndUpdate(_id, updateData, { new: true });
        return NextResponse.json(testimonial);
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to update testimonial' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    await dbConnect();
    try {
        const { id } = await request.json();
        await Testimonial.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete testimonial' }, { status: 500 });
    }
}
