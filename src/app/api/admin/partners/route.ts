import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Partner from '@/models/Partner';

export async function GET(request: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const country = searchParams.get('country');
        const status = searchParams.get('status');
        const service = searchParams.get('service');
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const page = parseInt(searchParams.get('page') || '1', 10);

        const query: any = {};
        if (country && country !== 'All') {
            query.country = country;
        }
        if (status && status !== 'All') {
            query.status = status;
        }
        if (service && service !== 'All') {
            query.services = service;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { websiteUrl: { $regex: search, $options: 'i' } },
                { services: { $in: [new RegExp(search, 'i')] } },
            ];
        }

        const skip = (page - 1) * limit;
        const [partners, totalFiltered, totalAll, newCount, pitchedCount, discussionCount, partneredCount] = await Promise.all([
            Partner.find(query).sort({ rating: -1, reviewCount: -1, createdAt: -1 }).skip(skip).limit(limit),
            Partner.countDocuments(query),
            Partner.countDocuments({}),
            Partner.countDocuments({ status: 'New' }),
            Partner.countDocuments({ status: 'Pitched' }),
            Partner.countDocuments({ status: 'In Discussion' }),
            Partner.countDocuments({ status: 'Partnered' }),
        ]);

        // Country breakdown
        const countriesAgg = await Partner.aggregate([
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const countriesCount: Record<string, number> = { All: totalAll };
        countriesAgg.forEach((c: any) => {
            if (c._id) countriesCount[c._id] = c.count;
        });

        const stats = {
            total: totalAll,
            filtered: totalFiltered,
            new: newCount,
            pitched: pitchedCount,
            inDiscussion: discussionCount,
            partnered: partneredCount,
            countries: countriesCount,
        };

        return NextResponse.json({
            partners,
            stats,
            page,
            totalPages: Math.ceil(totalFiltered / limit),
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to fetch partners' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        
        if (!body.name) {
            return NextResponse.json({ success: false, error: 'Partner Name is required' }, { status: 400 });
        }

        const handle = body.handle || body.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const partnerDirectoryUrl = body.partnerDirectoryUrl || `https://www.shopify.com/in/partners/directory/partner/${handle}`;

        const partner = await Partner.findOneAndUpdate(
            { handle },
            {
                name: body.name,
                handle,
                websiteUrl: body.websiteUrl,
                partnerDirectoryUrl,
                country: body.country || 'US',
                location: body.location || `${body.country || 'US'}`,
                services: body.services || ['Store building', 'Theme customization'],
                description: body.description || '',
                startingBudget: body.startingBudget || '$1,000 - $5,000',
                teamSize: body.teamSize || '2 - 9',
                status: body.status || 'New',
                notes: body.notes || 'Manually added agency partner.',
            },
            { upsert: true, new: true }
        );

        return NextResponse.json(partner, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to create partner' }, { status: 500 });
    }
}
