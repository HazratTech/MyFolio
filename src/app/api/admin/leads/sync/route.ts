import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import {
    LeadCategory,
    RawLeadCandidate,
    extractValidEmail,
    qualifyAndExtractLead,
    stripHtmlKeepNewlines,
} from '@/lib/lead-ai';
import { scanRedditJobs, buildRedditDmUrl } from '@/lib/reddit-scraper';
import { fetchMultiPlatformCandidates } from '@/lib/multi-platform-scraper';
import { sendRedditLeadAlerts, RedditLeadAlertItem } from '@/lib/discord';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function classifyStrictCategory(text: string): LeadCategory | null {
    // Reject obvious physical hardware / medical / non-software spam
    if (/\b(sidewalk robotics|delivery robot|home health|nursing|caregiver|physical therapist|real estate agent|travel agent|insurance agent|copywriter|sales representative)\b/i.test(text)) {
        return null;
    }

    if (/\b(discord|telegram bot|discord\.py|discord\.js)\b/i.test(text)) return 'Discord Bots';
    if (/\b(android|ios|swiftui|kotlin|kmp|flutter|react native|mobile app)\b/i.test(text)) return 'Mobile Apps';
    if (/\b(chatbot|ai agent|rag pipeline|langchain|langgraph|pgvector|conversational ai|voice agent)\b/i.test(text)) return 'AI & Chatbots';
    if (/\b(fastapi|webhook|microservice|backend engineer|backend developer|api integration|python script|automation script)\b/i.test(text)) return 'Backend';

    return null;
}

function isDisqualifiedEnterpriseOrSeeker(text: string): boolean {
    const lower = text.toLowerCase();

    // Job seekers / applicants / freelancers pitching themselves (including HN "Who wants to be hired?" template)
    if (/\b(seeking work|seeking freelance|for hire|\[for hire\]|who wants to be hired|candidate profile|looking for a role|open to work|available for work|recently laid off|loved the opportunity|would love to work with you|sent my resume|here is my portfolio|willing to relocate)\b/i.test(lower)) {
        return true;
    }

    // Strict onsite-only without remote option
    if (/\b(onsite\s*\(?5 days|in-office only|onsite only)\b/i.test(lower) && !/\bremote\b/i.test(lower)) {
        return true;
    }

    // Years of experience barrier (5+ years)
    if (/\b([5-9]|1\d)\+?\s*years?\s*(of)?\s*(experience|exp|proof)?/i.test(lower)) return true;
    if (/years?\s*of\s*experience\s*required/i.test(lower)) return true;
    if (/\b(minimum|at least)\s+([5-9]|1\d)\s+years/i.test(lower)) return true;

    // Corporate $100k+ salaried roles
    if (/\$(1[0-9]{2}|2[0-9]{2}|3[0-9]{2})[,0-9]*\s*(k|\/yr|\/year|\s*-\s*\$[0-9]+)/i.test(lower)) return true;
    if (/\b(1[0-9]{2}|2[0-9]{2})k\s*-\s*[0-9]+k/i.test(lower)) return true;

    // Executive / non-dev roles
    if (/\b(coo|cto|cpo|vp of|director of|head of engineering|staff engineer|principal engineer|enterprise architect|solutions architect)\b/i.test(lower)) return true;
    if (/\b(sales manager|account executive|recruiter|human resources|business development|bdr|sdr|copywriter)\b/i.test(lower)) return true;

    // Corporate bureaucracy gates
    if (/\b(security clearance|us citizenship required|polygraph|w-?2 only|401\(?k\)?|equity only|unpaid)\b/i.test(lower)) return true;

    return false;
}

function extractOptionalBudget(text: string): string {
    const monthlyMatch = text.match(/\$([1-9],[0-9]{3}|[1-9][0-9]{2,3})\s*[-–]\s*\$?([1-9],[0-9]{3}|[1-9][0-9]{2,3})\s*(\/|\s*per\s*)(mo|month)/i);
    if (monthlyMatch) return monthlyMatch[0];

    const fixedMatch = text.match(/\$([1-9],[0-9]{3}|[1-9][0-9]{2,3})\s*[-–]\s*\$?([1-9],[0-9]{3}|[1-9][0-9]{2,3})/i);
    if (fixedMatch) return `$${fixedMatch[1]} – $${fixedMatch[2]} (Stated)`;

    return 'Contract / Sprint';
}

export async function POST() {
    await dbConnect();
    try {
        const rawCandidates: RawLeadCandidate[] = [];

        // ==========================================
        // 1. Dynamic Hacker News Hiring & Freelancer Threads (TOP-LEVEL COMMENTS ONLY)
        // ==========================================
        try {
            const [freelancerStoriesRes, hiringStoriesRes] = await Promise.all([
                fetch('https://hn.algolia.com/api/v1/search_by_date?query=%22Freelancer%3F+Seeking+freelancer%3F%22&tags=story&hitsPerPage=2', {
                    headers: { 'User-Agent': UA },
                    signal: AbortSignal.timeout(8000),
                }),
                fetch('https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring&hitsPerPage=4', {
                    headers: { 'User-Agent': UA },
                    signal: AbortSignal.timeout(8000),
                }),
            ]);

            const storyTargets: { id: string; isFreelancerThread: boolean }[] = [];

            if (freelancerStoriesRes.ok) {
                const fData = await freelancerStoriesRes.json();
                for (const h of fData.hits || []) {
                    if (h.objectID && /seeking freelancer/i.test(h.title || '')) {
                        storyTargets.push({ id: String(h.objectID), isFreelancerThread: true });
                    }
                }
            }

            if (hiringStoriesRes.ok) {
                const hData = await hiringStoriesRes.json();
                const latestHiring = (hData.hits || []).find((h: any) => /who is hiring\?/i.test(h.title || ''));
                if (latestHiring?.objectID) {
                    storyTargets.push({ id: String(latestHiring.objectID), isFreelancerThread: false });
                }
            }

            for (const target of storyTargets) {
                const res = await fetch(
                    `https://hn.algolia.com/api/v1/search_by_date?tags=comment,story_${target.id}&hitsPerPage=150`,
                    { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) }
                );
                if (!res.ok) continue;
                const data = await res.json();

                for (const hit of data.hits || []) {
                    // CRITICAL: Skip all nested replies! Replies are applicants/chatter, NOT job postings.
                    if (String(hit.parent_id) !== String(hit.story_id)) continue;

                    const cleanText = stripHtmlKeepNewlines(hit.comment_text || '');
                    if (cleanText.length < 60) continue;

                    if (isDisqualifiedEnterpriseOrSeeker(cleanText)) continue;

                    // In the Freelancer thread, require explicit client/seeking-freelancer intent
                    if (target.isFreelancerThread) {
                        const looksLikeClient = /\b(seeking freelancer|hiring|looking for a (dev|developer|engineer|freelancer|contractor)|need a (dev|developer|bot)|we are building|we're building)\b/i.test(cleanText);
                        if (!looksLikeClient) continue;
                    } else {
                        // In Who Is Hiring, prefer posts that mention contract/freelance/part-time OR explicit niche fit without full-time-only restriction
                        const isContractFriendly = /\b(contract|freelance|part[- ]time|contractor|consulting)\b/i.test(cleanText);
                        if (!isContractFriendly) continue;
                    }

                    const category = classifyStrictCategory(cleanText);
                    if (!category) continue;

                    const realEmail = extractValidEmail(cleanText);
                    const hasUrl = /https?:\/\/\S+/i.test(cleanText);
                    if (!realEmail && !hasUrl) continue; // Skip uncontactable anonymous posts

                    rawCandidates.push({
                        rawText: cleanText,
                        author: hit.author || 'hn-user',
                        source: target.isFreelancerThread ? 'Hacker News Seeking Freelancer' : 'Hacker News Contract Hiring',
                        sourceUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
                        extractedEmail: realEmail,
                        defaultCategory: category,
                        budget: extractOptionalBudget(cleanText),
                    });
                }
            }

            // Also search globally on HN for explicit "SEEKING FREELANCER" comments
            const sfRes = await fetch(
                'https://hn.algolia.com/api/v1/search_by_date?query=%22SEEKING%20FREELANCER%22&tags=comment&hitsPerPage=25',
                { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) }
            );
            if (sfRes.ok) {
                const sfData = await sfRes.json();
                for (const hit of sfData.hits || []) {
                    if (String(hit.parent_id) !== String(hit.story_id)) continue;
                    const cleanText = stripHtmlKeepNewlines(hit.comment_text || '');
                    if (cleanText.length < 60 || isDisqualifiedEnterpriseOrSeeker(cleanText)) continue;
                    if (!/seeking freelancer/i.test(cleanText)) continue;

                    const category = classifyStrictCategory(cleanText) || 'Backend';
                    const realEmail = extractValidEmail(cleanText);
                    const hasUrl = /https?:\/\/\S+/i.test(cleanText);
                    if (!realEmail && !hasUrl) continue;

                    rawCandidates.push({
                        rawText: cleanText,
                        author: hit.author || 'hn-user',
                        source: 'Hacker News Seeking Freelancer',
                        sourceUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
                        extractedEmail: realEmail,
                        defaultCategory: category,
                        budget: extractOptionalBudget(cleanText),
                    });
                }
            }
        } catch (err: any) {
            console.error('HN sync error:', err.message);
        }

        // ==========================================
        // 2. Remotive Contract & Freelance Software Feed
        // ==========================================
        try {
            const res = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=40', {
                headers: { 'User-Agent': UA },
                signal: AbortSignal.timeout(8000),
            });
            if (res.ok) {
                const data = await res.json();
                for (const job of data.jobs || []) {
                    const jobType = (job.job_type || '').toLowerCase();
                    if (!jobType.includes('contract') && !jobType.includes('freelance')) continue;

                    const plainDesc = stripHtmlKeepNewlines(job.description || '');
                    const combined = `${job.title || ''} ${job.company_name || ''} ${(job.tags || []).join(' ')} ${plainDesc}`;
                    if (isDisqualifiedEnterpriseOrSeeker(combined)) continue;

                    const category = classifyStrictCategory(combined);
                    if (!category) continue;

                    rawCandidates.push({
                        rawText: `${job.title} at ${job.company_name}\n${plainDesc.slice(0, 1400)}`,
                        author: job.company_name || 'Hiring Team',
                        source: 'Remotive Contract Feed',
                        sourceUrl: job.url,
                        extractedEmail: extractValidEmail(plainDesc),
                        defaultCategory: category,
                        rawCompany: job.company_name,
                        rawTitle: job.title,
                        rawTags: Array.isArray(job.tags) ? job.tags.slice(0, 5) : [category],
                        budget: job.salary || extractOptionalBudget(plainDesc),
                    });
                }
            }
        } catch (err: any) {
            console.error('Remotive sync error:', err.message);
        }

        // ==========================================
        // 3. RemoteOK Contract / Freelance Filtered Feed
        // ==========================================
        try {
            const res = await fetch('https://remoteok.com/api', {
                headers: { 'User-Agent': UA },
                signal: AbortSignal.timeout(8000),
            });
            if (res.ok) {
                const data = await res.json();
                for (const item of Array.isArray(data) ? data : []) {
                    if (!item.position || !item.company) continue;
                    const plainDesc = stripHtmlKeepNewlines(item.description || '');
                    const tagsStr = Array.isArray(item.tags) ? item.tags.join(' ') : '';
                    const combined = `${item.position} ${item.company} ${tagsStr} ${plainDesc}`;

                    // Strictly require contract/freelance/part-time signal on RemoteOK
                    if (!/\b(contract|freelance|contractor|part[- ]time|bounty|sprint)\b/i.test(combined)) continue;
                    if (isDisqualifiedEnterpriseOrSeeker(combined)) continue;

                    const category = classifyStrictCategory(combined);
                    if (!category) continue;

                    const sourceUrl = item.url || item.apply_url;
                    if (!sourceUrl) continue;

                    rawCandidates.push({
                        rawText: `${item.position} at ${item.company}\n${plainDesc.slice(0, 1400)}`,
                        author: item.company,
                        source: 'RemoteOK Contract Feed',
                        sourceUrl,
                        extractedEmail: extractValidEmail(plainDesc),
                        defaultCategory: category,
                        rawCompany: item.company,
                        rawTitle: item.position,
                        rawTags: Array.isArray(item.tags) ? item.tags.slice(0, 5) : [category],
                        budget: extractOptionalBudget(plainDesc),
                    });
                }
            }
        } catch (err: any) {
            console.error('RemoteOK sync error:', err.message);
        }

        // ==========================================
        // 4. Live Reddit [Hiring] & Niche Buyer Subreddits (Arctic Shift / OAuth)
        // ==========================================
        const redditMetaByUrl = new Map<string, { redditAuthor: string; subreddit: string; postedAt: string }>();
        try {
            const { posts: redditPosts } = await scanRedditJobs({
                maxAgeHours: 36,
                limitPerSub: 25,
                strictCategory: true,
            });
            for (const rp of redditPosts.slice(0, 20)) {
                redditMetaByUrl.set(rp.sourceUrl, {
                    redditAuthor: rp.author,
                    subreddit: `r/${rp.subreddit}`,
                    postedAt: rp.postedAt,
                });
                rawCandidates.push({
                    rawText: `${rp.title}\n\n${rp.selftext}`.slice(0, 1800),
                    author: rp.author,
                    source: `Reddit r/${rp.subreddit}`,
                    sourceUrl: rp.sourceUrl,
                    extractedEmail: rp.extractedEmail,
                    defaultCategory: rp.categoryHint,
                    rawTitle: rp.title,
                    budget: rp.budget,
                });
            }
        } catch (err: any) {
            console.error('Reddit sync error:', err.message);
        }

        // ==========================================
        // 5. Verified Multi-Platform Live Jobs & Paid Bounties (GitHub, Freelancer Low-Bid, WWR, Himalayas, Jobicy, WorkingNomads, Mastodon)
        // ==========================================
        try {
            const discovered = await fetchMultiPlatformCandidates();
            for (const item of discovered.slice(0, 20)) {
                rawCandidates.push({
                    rawText: item.rawText,
                    author: item.author,
                    source: item.source,
                    sourceUrl: item.sourceUrl,
                    extractedEmail: item.extractedEmail,
                    defaultCategory: item.defaultCategory,
                    rawCompany: item.rawCompany,
                    rawTitle: item.rawTitle,
                    rawTags: item.rawTags,
                    budget: item.budget,
                });
            }
        } catch (err: any) {
            console.error('Multi-platform sync error:', err.message);
        }

        // ==========================================
        // 6. Batch Deduplicate Before AI Qualification
        // ==========================================
        const candidateUrls = rawCandidates.map(c => c.sourceUrl);
        const existingDocs = await Lead.find({ sourceUrl: { $in: candidateUrls } }, { sourceUrl: 1 });
        const existingSet = new Set(existingDocs.map(d => d.sourceUrl));

        const freshCandidates = rawCandidates.filter(c => !existingSet.has(c.sourceUrl)).slice(0, 24);

        let addedCount = 0;
        let rejectedCount = 0;
        const redditAlerts: RedditLeadAlertItem[] = [];

        // ==========================================
        // 6. AI Gatekeeper Verification + Entity Extraction (Concurrent chunks of 5)
        // ==========================================
        const CHUNK_SIZE = 5;
        for (let i = 0; i < freshCandidates.length; i += CHUNK_SIZE) {
            const chunk = freshCandidates.slice(i, i + CHUNK_SIZE);
            const results = await Promise.all(
                chunk.map(async (cand) => {
                    const qualified = await qualifyAndExtractLead(cand);
                    if (!qualified) return null;

                    const redditMeta = redditMetaByUrl.get(cand.sourceUrl);
                    const doc = {
                        title: `${qualified.category} · ${qualified.company}`,
                        company: qualified.company,
                        category: qualified.category,
                        decisionMaker: qualified.decisionMaker,
                        email: cand.extractedEmail || '',
                        source: cand.source,
                        sourceUrl: cand.sourceUrl,
                        status: 'New' as const,
                        score: qualified.score,
                        confidence: cand.extractedEmail ? ('High' as const) : ('Medium' as const),
                        painSignal: qualified.painSignal,
                        techStack: qualified.techStack,
                        budget: cand.budget || qualified.engagementType,
                        engagementType: qualified.engagementType,
                        experienceReq: 'No Years Req (Portfolio-Driven)',
                        redditAuthor: redditMeta?.redditAuthor || '',
                        subreddit: redditMeta?.subreddit || '',
                        postedAt: redditMeta?.postedAt ? new Date(redditMeta.postedAt) : undefined,
                        dmPitch: qualified.dmPitch || qualified.body,
                        personalizedEmail: {
                            subject: qualified.subject,
                            body: qualified.body,
                            modelUsed: qualified.modelUsed,
                        },
                        notes: `AI-verified from ${cand.source}. ${cand.extractedEmail ? 'Direct email extracted.' : redditMeta ? 'Reply via Reddit DM / thread.' : 'Apply via original posting URL.'}`,
                    };

                    if (redditMeta) {
                        redditAlerts.push({
                            company: doc.company,
                            category: doc.category,
                            subreddit: redditMeta.subreddit,
                            redditAuthor: redditMeta.redditAuthor,
                            sourceUrl: doc.sourceUrl,
                            dmUrl: buildRedditDmUrl(redditMeta.redditAuthor, doc.personalizedEmail.subject, doc.dmPitch),
                            budget: doc.budget,
                            painSignal: doc.painSignal,
                            dmPitch: doc.dmPitch,
                            score: doc.score,
                            postedAt: redditMeta.postedAt,
                        });
                    }

                    return doc;
                })
            );

            const validDocs = results.filter((doc): doc is NonNullable<typeof doc> => doc !== null);
            rejectedCount += chunk.length - validDocs.length;

            if (validDocs.length > 0) {
                await Lead.insertMany(validDocs, { ordered: false }).catch((e) => {
                    console.warn('Partial insert warning:', e.message);
                });
                addedCount += validDocs.length;
            }
        }

        if (redditAlerts.length > 0) {
            await sendRedditLeadAlerts(redditAlerts);
        }

        const totalLeads = await Lead.countDocuments({});

        return NextResponse.json({
            success: true,
            addedCount,
            rejectedCount,
            evaluatedCount: freshCandidates.length,
            totalLeads,
            message: freshCandidates.length === 0
                ? `All matching leads are already in your pipeline (${totalLeads} total).`
                : `AI verified ${addedCount} qualified client leads out of ${freshCandidates.length} new posts (filtered out ${rejectedCount} job seekers / non-fits).`,
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Sync failed' }, { status: 500 });
    }
}
