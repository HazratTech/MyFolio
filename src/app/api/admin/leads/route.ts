import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';

export async function GET(request: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const query: any = {};
        if (category && category !== 'All') {
            query.category = category;
        }
        if (status && status !== 'All') {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { company: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { decisionMaker: { $regex: search, $options: 'i' } },
                { painSignal: { $regex: search, $options: 'i' } },
                { techStack: { $in: [new RegExp(search, 'i')] } },
            ];
        }

        const leads = await Lead.find(query).sort({ score: -1, createdAt: -1 });

        return NextResponse.json(leads, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to fetch leads' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const lead = await Lead.create(body);
        return NextResponse.json(lead, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to create lead' }, { status: 500 });
    }
}
