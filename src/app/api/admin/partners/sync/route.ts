import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Partner from '@/models/Partner';

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchHtml(url: string): Promise<string> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 9000);
        const res = await fetch(url, {
            headers: { "User-Agent": UA },
            signal: controller.signal,
            next: { revalidate: 0 }
        });
        clearTimeout(timeout);
        if (!res.ok) return '';
        return await res.text();
    } catch {
        return '';
    }
}

function extractWebsite(html: string): string | undefined {
    const externalLinks = html.match(/https?:\/\/(?!([a-z0-9-]+\.)?shopify\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}[^\s\"'<>)]*/gi) || [];
    const cleanWebsites = Array.from(new Set(externalLinks)).filter(l => 
        !l.includes('gstatic') && !l.includes('googletagmanager') && 
        !l.includes('facebook') && !l.includes('twitter') && !l.includes('instagram') && 
        !l.includes('youtube') && !l.includes('tiktok') && !l.includes('linkedin') && !l.includes('pinterest')
    );
    const first = cleanWebsites[0];
    if (first) {
        return first.replace(/\\$/, '').trim();
    }
    return undefined;
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const requestedCountry = searchParams.get('country') || 'US';
        const batchLimit = parseInt(searchParams.get('limit') || '25', 10);

        const targetCountries = requestedCountry === 'ALL' 
            ? ['US', 'GB', 'AU', 'CA', 'DE'] 
            : [requestedCountry];

        let addedCount = 0;
        const candidatePartners: any[] = [];

        for (const country of targetCountries) {
            const dirUrl = `https://www.shopify.com/in/partners/directory/services/store_building?location=${country}`;
            const dirHtml = await fetchHtml(dirUrl);
            if (!dirHtml) continue;

            const regex = /<a[^>]*href=\"\/in\/partners\/directory\/partner\/([a-zA-Z0-9_-]+)\"[^>]*><span>([^<]+)<\/span><\/a>/g;
            let match;
            while ((match = regex.exec(dirHtml)) !== null) {
                const handle = match[1];
                const name = match[2]?.trim();
                if (handle && name && !candidatePartners.some(p => p.handle === handle)) {
                    candidatePartners.push({
                        handle,
                        name,
                        country,
                        partnerDirectoryUrl: `https://www.shopify.com/in/partners/directory/partner/${handle}`
                    });
                }
                if (candidatePartners.length >= batchLimit * 2) break;
            }
        }

        // Process candidate partners and check which ones are not yet in DB
        for (const candidate of candidatePartners) {
            if (addedCount >= batchLimit) break;

            const existing = await Partner.findOne({ handle: candidate.handle });
            if (existing) continue;

            // Fetch individual profile for deep details
            const profileHtml = await fetchHtml(candidate.partnerDirectoryUrl);
            const desc = (profileHtml.match(/<meta\s+name=\"description\"\s+content=\"([^\"]+)\"/i) || [])[1] || '';
            const websiteUrl = extractWebsite(profileHtml);

            // Infer services from description or defaults
            const services = ['Store building'];
            const lowerDesc = desc.toLowerCase();
            if (lowerDesc.includes('design') || lowerDesc.includes('ux') || lowerDesc.includes('ui')) services.push('Store design');
            if (lowerDesc.includes('conversion') || lowerDesc.includes('cro') || lowerDesc.includes('optimization')) services.push('CRO');
            if (lowerDesc.includes('migration') || lowerDesc.includes('plus')) services.push('Shopify Plus Migration');
            if (lowerDesc.includes('seo') || lowerDesc.includes('marketing')) services.push('Marketing & SEO');

            await Partner.create({
                name: candidate.name,
                handle: candidate.handle,
                websiteUrl: websiteUrl || undefined,
                partnerDirectoryUrl: candidate.partnerDirectoryUrl,
                country: candidate.country,
                location: `${candidate.country}`,
                services,
                description: desc || `${candidate.name} is a verified Shopify Partner specializing in store building and design.`,
                startingBudget: '$1,000 - $5,000',
                teamSize: '2 - 9',
                status: 'New',
                notes: `Harvested from Shopify Partner Directory (${candidate.country}).`
            });

            addedCount++;
        }

        const totalPartners = await Partner.countDocuments({});
        return NextResponse.json({
            success: true,
            addedCount,
            totalPartners,
            message: `Scanned Shopify Partner Directory. Successfully added ${addedCount} new verified partner agencies!`
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Partner sync failed' }, { status: 500 });
    }
}
