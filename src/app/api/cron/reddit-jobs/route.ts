import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import Lead from "@/models/Lead";
import { qualifyAndExtractLead, RawLeadCandidate } from "@/lib/lead-ai";
import { sendRedditLeadAlerts, RedditLeadAlertItem } from "@/lib/discord";
import { buildRedditDmUrl, scanRedditJobs } from "@/lib/reddit-scraper";

async function runRedditCron(request: Request) {
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");

  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    querySecret !== process.env.CRON_SECRET
  ) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  await dbConnect();

  try {
    const maxAgeHours = Number(searchParams.get("maxAgeHours") || 3);
    const { posts, sourceUsed } = await scanRedditJobs({
      maxAgeHours: Number.isFinite(maxAgeHours) ? maxAgeHours : 3,
      limitPerSub: 25,
      strictCategory: true,
    });

    if (posts.length === 0) {
      return NextResponse.json({
        success: true,
        sourceUsed,
        scanned: 0,
        addedCount: 0,
        message: "No new matching Reddit [Hiring] posts in window.",
      });
    }

    const candidateUrls = posts.map((p) => p.sourceUrl);
    const existingDocs = await Lead.find(
      { sourceUrl: { $in: candidateUrls } },
      { sourceUrl: 1 }
    ).lean();
    const existingSet = new Set(existingDocs.map((d: any) => d.sourceUrl));

    const freshPosts = posts
      .filter((p) => !existingSet.has(p.sourceUrl))
      .slice(0, 15);

    const newLeadsToInsert: any[] = [];
    const discordAlerts: RedditLeadAlertItem[] = [];

    const CHUNK_SIZE = 5;
    for (let i = 0; i < freshPosts.length; i += CHUNK_SIZE) {
      const chunk = freshPosts.slice(i, i + CHUNK_SIZE);
      const qualifiedChunk = await Promise.all(
        chunk.map(async (post) => {
          const cand: RawLeadCandidate = {
            rawText: `${post.title}\n\n${post.selftext}`.slice(0, 2000),
            author: post.author,
            source: `Reddit r/${post.subreddit}`,
            sourceUrl: post.sourceUrl,
            extractedEmail: post.extractedEmail,
            defaultCategory: post.categoryHint,
            rawTitle: post.title,
            budget: post.budget,
          };

          const qualified = await qualifyAndExtractLead(cand);
          if (!qualified) return null;

          const dmText =
            qualified.dmPitch ||
            qualified.body ||
            `Hi u/${post.author}, saw your r/${post.subreddit} post. Happy to help build this quickly at RelayWorks.`;

          return {
            doc: {
              title: `${qualified.category} · ${qualified.company}`,
              company: qualified.company,
              category: qualified.category,
              decisionMaker: qualified.decisionMaker,
              email: post.extractedEmail || "",
              source: `Reddit r/${post.subreddit}`,
              sourceUrl: post.sourceUrl,
              status: "New" as const,
              score: qualified.score,
              confidence: post.extractedEmail
                ? ("High" as const)
                : ("Medium" as const),
              painSignal: qualified.painSignal,
              techStack: qualified.techStack,
              budget: post.budget || qualified.engagementType,
              engagementType: qualified.engagementType,
              experienceReq: "No Years Req (Portfolio-Driven)",
              redditAuthor: post.author,
              subreddit: `r/${post.subreddit}`,
              postedAt: new Date(post.postedAt),
              dmPitch: dmText,
              personalizedEmail: {
                subject: qualified.subject,
                body: qualified.body,
                modelUsed: qualified.modelUsed,
              },
              notes: `Auto-captured from Reddit r/${post.subreddit} (${post.ageLabel}).`,
            },
            alert: {
              company: qualified.company,
              category: qualified.category,
              subreddit: `r/${post.subreddit}`,
              redditAuthor: post.author,
              sourceUrl: post.sourceUrl,
              dmUrl: buildRedditDmUrl(post.author, qualified.subject, dmText),
              budget: post.budget || qualified.engagementType,
              painSignal: qualified.painSignal,
              dmPitch: dmText,
              score: qualified.score,
              postedAt: post.postedAt,
            } satisfies RedditLeadAlertItem,
          };
        })
      );

      for (const item of qualifiedChunk) {
        if (!item) continue;
        newLeadsToInsert.push(item.doc);
        discordAlerts.push(item.alert);
      }
    }

    if (newLeadsToInsert.length > 0) {
      await Lead.insertMany(newLeadsToInsert, { ordered: false }).catch((e) => {
        console.warn("Partial Reddit cron insert warning:", e.message);
      });
      await sendRedditLeadAlerts(discordAlerts);
    }

    return NextResponse.json({
      success: true,
      sourceUsed,
      scanned: posts.length,
      evaluatedFresh: freshPosts.length,
      addedCount: newLeadsToInsert.length,
      discordNotified: discordAlerts.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Reddit cron failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return runRedditCron(request);
}

export async function POST(request: Request) {
  return runRedditCron(request);
}
