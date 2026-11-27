import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import Lead from "@/models/Lead";
import { qualifyAndExtractLead, RawLeadCandidate } from "@/lib/lead-ai";
import { sendRedditLeadAlerts } from "@/lib/discord";
import {
  DEFAULT_REDDIT_SUBREDDITS,
  RedditRawPost,
  buildRedditDmUrl,
  scanRedditJobs,
} from "@/lib/reddit-scraper";

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const subsParam = searchParams.get("subreddits");
    const query = searchParams.get("query") || "";
    const maxAgeHours = Number(searchParams.get("maxAgeHours") || 48);
    const strictCategory = searchParams.get("strictCategory") !== "false";

    const subreddits = subsParam
      ? subsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : DEFAULT_REDDIT_SUBREDDITS;

    const { posts, sourceUsed, rateLimited } = await scanRedditJobs({
      subreddits,
      query,
      maxAgeHours: Number.isFinite(maxAgeHours) ? maxAgeHours : 48,
      limitPerSub: 60,
      strictCategory,
    });

    const urls = posts.map((p) => p.sourceUrl);
    const existing = await Lead.find(
      { sourceUrl: { $in: urls } },
      { sourceUrl: 1, _id: 1 }
    ).lean();
    const existingMap = new Map(
      existing.map((d: any) => [d.sourceUrl, String(d._id)])
    );

    const enriched = posts.slice(0, 60).map((p) => ({
      ...p,
      alreadySaved: existingMap.has(p.sourceUrl),
      savedLeadId: existingMap.get(p.sourceUrl) || null,
    }));

    return NextResponse.json(
      {
        success: true,
        sourceUsed,
        rateLimited,
        count: enriched.length,
        posts: enriched,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Reddit search failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "import";

    if (action === "import" && body.post) {
      const post: RedditRawPost = body.post;

      const existing = await Lead.findOne({ sourceUrl: post.sourceUrl });
      if (existing) {
        return NextResponse.json({
          success: true,
          alreadyExisted: true,
          lead: existing,
        });
      }

      const candidate: RawLeadCandidate = {
        rawText: `${post.title}\n\n${post.selftext}`.slice(0, 2000),
        author: post.author,
        source: `Reddit r/${post.subreddit}`,
        sourceUrl: post.sourceUrl,
        extractedEmail: post.extractedEmail || "",
        defaultCategory: post.categoryHint || "Backend",
        rawTitle: post.title,
        budget: post.budget,
      };

      const qualified = await qualifyAndExtractLead(candidate);

      const fallbackSubject = `Re: ${post.title.slice(0, 65)}`;
      const fallbackDm = `Hi u/${post.author}, saw your r/${post.subreddit} post ("${post.title.slice(0, 80)}"). I build production bots, AI agents, and custom backend/mobile systems at RelayWorks. Happy to help scope or build this quickly if you're still looking.\n\nHazrat | https://relayworks.dev | Telegram: @hazratummar`;

      const docData = {
        title: `${qualified?.category || post.categoryHint} · ${
          qualified?.company || `r/${post.subreddit} (@${post.author})`
        }`,
        company: qualified?.company || `r/${post.subreddit} (@${post.author})`,
        category: qualified?.category || post.categoryHint || "Backend",
        decisionMaker: qualified?.decisionMaker || `u/${post.author}`,
        email: post.extractedEmail || "",
        source: `Reddit r/${post.subreddit}`,
        sourceUrl: post.sourceUrl,
        status: "New" as const,
        score: qualified?.score || 88,
        confidence: post.extractedEmail
          ? ("High" as const)
          : ("Medium" as const),
        painSignal:
          qualified?.painSignal ||
          `${post.title}${post.selftext ? ` — ${post.selftext.slice(0, 200)}` : ""}`,
        techStack: qualified?.techStack?.length
          ? qualified.techStack
          : [post.categoryHint],
        budget: post.budget || qualified?.engagementType || "Contract / Reddit",
        engagementType: qualified?.engagementType || "Contract / Freelance",
        experienceReq: "No Years Req (Portfolio-Driven)",
        redditAuthor: post.author,
        subreddit: `r/${post.subreddit}`,
        postedAt: post.postedAt ? new Date(post.postedAt) : new Date(),
        dmPitch: qualified?.dmPitch || fallbackDm,
        personalizedEmail: {
          subject: qualified?.subject || fallbackSubject,
          body: qualified?.body || fallbackDm,
          modelUsed: qualified?.modelUsed || "heuristic",
        },
        notes: `Imported from Reddit r/${post.subreddit} (${post.ageLabel}). ${
          post.extractedEmail ? "Email found." : "Reply via Reddit DM."
        }`,
      };

      const lead = await Lead.create(docData);

      if (body.postToDiscord) {
        await sendRedditLeadAlerts([
          {
            company: lead.company,
            category: lead.category,
            subreddit: `r/${post.subreddit}`,
            redditAuthor: post.author,
            sourceUrl: post.sourceUrl,
            dmUrl: buildRedditDmUrl(
              post.author,
              docData.personalizedEmail.subject,
              docData.dmPitch
            ),
            budget: lead.budget,
            painSignal: lead.painSignal,
            dmPitch: lead.dmPitch,
            score: lead.score,
            postedAt: lead.postedAt,
          },
        ]);
      }

      return NextResponse.json({ success: true, lead }, { status: 201 });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or missing post" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to import Reddit lead" },
      { status: 500 }
    );
  }
}
