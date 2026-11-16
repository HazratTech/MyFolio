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

        const candidatePartners: { handle: string; name: string; country: string; partnerDirectoryUrl: string }[] = [];
        const seenHandles = new Set<string>();

        for (const country of targetCountries) {
            const dirUrl = `https://www.shopify.com/in/partners/directory/services/store_building?location=${country}`;
            const dirHtml = await fetchHtml(dirUrl);
            if (!dirHtml) continue;

            const regex = /<a[^>]*href=\"\/in\/partners\/directory\/partner\/([a-zA-Z0-9_-]+)\"[^>]*><span>([^<]+)<\/span><\/a>/g;
            let match;
            while ((match = regex.exec(dirHtml)) !== null) {
                const handle = match[1];
                const name = match[2]?.trim();
                if (handle && name && !seenHandles.has(handle)) {
                    seenHandles.add(handle);
                    candidatePartners.push({
                        handle,
                        name,
                        country,
                        partnerDirectoryUrl: `https://www.shopify.com/in/partners/directory/partner/${handle}`
                    });
                }
            }
        }

        // Single batch query: find which candidates already exist in MongoDB
        const allHandles = candidatePartners.map(c => c.handle);
        const existingDocs = await Partner.find({ handle: { $in: allHandles } }, { handle: 1 }).lean();
        const existingHandles = new Set(existingDocs.map((p: any) => p.handle));

        // Filter for candidates that do NOT exist in DB yet
        const newCandidates = candidatePartners.filter(c => !existingHandles.has(c.handle));
        const batchToProcess = newCandidates.slice(0, batchLimit);

        if (batchToProcess.length === 0) {
            const totalPartners = await Partner.countDocuments({});
            return NextResponse.json({
                success: true,
                addedCount: 0,
                totalPartners,
                remainingAvailable: 0,
                message: `All ${candidatePartners.length} partner agencies found in the directory for ${requestedCountry} are already saved in your pipeline!`
            });
        }

        // Process profile fetching in concurrent chunks of 5 for high speed
        const chunkSize = 5;
        const partnersToInsert: any[] = [];

        for (let i = 0; i < batchToProcess.length; i += chunkSize) {
            const chunk = batchToProcess.slice(i, i + chunkSize);
            const chunkProfiles = await Promise.all(
                chunk.map(async (candidate) => {
                    const profileHtml = await fetchHtml(candidate.partnerDirectoryUrl);
                    const desc = (profileHtml.match(/<meta\s+name=\"description\"\s+content=\"([^\"]+)\"/i) || [])[1] || '';
                    const websiteUrl = extractWebsite(profileHtml);

                    const services = ['Store building'];
                    const lowerDesc = desc.toLowerCase();
                    if (lowerDesc.includes('design') || lowerDesc.includes('ux') || lowerDesc.includes('ui')) services.push('Store design');
                    if (lowerDesc.includes('conversion') || lowerDesc.includes('cro') || lowerDesc.includes('optimization')) services.push('CRO');
                    if (lowerDesc.includes('migration') || lowerDesc.includes('plus')) services.push('Shopify Plus Migration');
                    if (lowerDesc.includes('seo') || lowerDesc.includes('marketing')) services.push('Marketing & SEO');

                    return {
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
                    };
                })
            );
            partnersToInsert.push(...chunkProfiles);
        }

        if (partnersToInsert.length > 0) {
            await Partner.insertMany(partnersToInsert, { ordered: false }).catch(err => {
                console.warn('Batch insert partial collision:', err?.message);
            });
        }

        const totalPartners = await Partner.countDocuments({});
        const remaining = newCandidates.length - partnersToInsert.length;

        return NextResponse.json({
            success: true,
            addedCount: partnersToInsert.length,
            totalPartners,
            remainingAvailable: remaining,
            message: `Scanned directory. Successfully added ${partnersToInsert.length} new partner agencies! (Total in DB: ${totalPartners}, ${remaining} more available in directory)`
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Partner sync failed' }, { status: 500 });
    }
}
