import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    await dbConnect();
    try {
        const body = await request.json();
        const updatedLead = await Lead.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true,
        });

        if (!updatedLead) {
            return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
        }

        return NextResponse.json(updatedLead);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to update lead' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    await dbConnect();
    try {
        const deletedLead = await Lead.findByIdAndDelete(params.id);
        if (!deletedLead) {
            return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Lead deleted' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to delete lead' }, { status: 500 });
    }
}
