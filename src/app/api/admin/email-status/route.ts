import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getZohoStatus } from '@/lib/zoho-mail';

export async function GET() {
    const status = getZohoStatus();
    return NextResponse.json(status, {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
}
