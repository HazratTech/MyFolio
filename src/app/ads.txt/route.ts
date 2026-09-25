import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const adsTxt = `google.com, pub-2489956198626091, DIRECT, f08c47fec0942fa0\n`;
  return new NextResponse(adsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
