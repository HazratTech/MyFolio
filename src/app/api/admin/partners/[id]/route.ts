import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Partner from '@/models/Partner';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    try {
        const { id } = await params;
        const partner = await Partner.findById(id);
        if (!partner) {
            return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
        }
        return NextResponse.json(partner);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Error fetching partner' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await request.json();

        const partner = await Partner.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!partner) {
            return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
        }

        return NextResponse.json(partner);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Error updating partner' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    try {
        const { id } = await params;
        const partner = await Partner.findByIdAndDelete(id);
        if (!partner) {
            return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Partner removed' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Error deleting partner' }, { status: 500 });
    }
}
