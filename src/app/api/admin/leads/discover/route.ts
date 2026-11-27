import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import Lead from "@/models/Lead";
import { qualifyAndExtractLead } from "@/lib/lead-ai";
import {
  PlatformDiscoveredLead,
  PlatformId,
  fetchMultiPlatformCandidates,
} from "@/lib/multi-platform-scraper";

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const platformParam = searchParams.get("platform") || "all";

    const platforms: PlatformId[] | undefined =
      platformParam === "all"
        ? undefined
        : [platformParam as PlatformId];

    const items = await fetchMultiPlatformCandidates({ platforms });

    const filtered =
      platformParam === "all"
        ? items
        : items.filter((i) => i.platform === platformParam);

    const urls = filtered.map((i) => i.sourceUrl);
    const existing = await Lead.find(
      { sourceUrl: { $in: urls } },
      { sourceUrl: 1, _id: 1 }
    ).lean();
    const existingSet = new Set(existing.map((d: any) => d.sourceUrl));

    const enriched = filtered.slice(0, 60).map((item) => ({
      ...item,
      alreadySaved: existingSet.has(item.sourceUrl),
    }));

    return NextResponse.json(
      {
        success: true,
        count: enriched.length,
        items: enriched,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Multi-platform scan failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json().catch(() => ({}));
    const item: PlatformDiscoveredLead | undefined = body.item;

    if (!item || !item.sourceUrl) {
      return NextResponse.json(
        { success: false, error: "Missing listing item" },
        { status: 400 }
      );
    }

    const existing = await Lead.findOne({ sourceUrl: item.sourceUrl });
    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyExisted: true,
        lead: existing,
      });
    }

    const qualified = await qualifyAndExtractLead(item);

    const lead = await Lead.create({
      title: `${qualified?.category || item.defaultCategory} · ${
        qualified?.company || item.rawCompany || item.author
      }`,
      company: qualified?.company || item.rawCompany || item.author,
      category: qualified?.category || item.defaultCategory,
      decisionMaker: qualified?.decisionMaker || item.author,
      email: item.extractedEmail || "",
      source: item.source,
      sourceUrl: item.sourceUrl,
      status: "New",
      score: qualified?.score || 88,
      confidence: item.extractedEmail ? "High" : "Medium",
      painSignal: qualified?.painSignal || item.title,
      techStack: qualified?.techStack?.length
        ? qualified.techStack
        : item.rawTags || [item.defaultCategory],
      budget: item.budget || qualified?.engagementType || "Contract / Bounty",
      engagementType: qualified?.engagementType || "Contract / Freelance",
      experienceReq: "No Years Req (Portfolio-Driven)",
      postedAt: item.postedAt ? new Date(item.postedAt) : new Date(),
      dmPitch: qualified?.dmPitch || qualified?.body || "",
      personalizedEmail: {
        subject:
          qualified?.subject || `${item.defaultCategory} help for ${item.rawCompany || item.author}`,
        body:
          qualified?.body ||
          `Hi ${item.author},\n\nSaw your posting "${item.title}" on ${item.source}. I specialize in shipping production ${item.defaultCategory} systems cleanly with direct engineering ownership.\n\nHazrat Ummar\nhttps://relayworks.dev | Telegram: @hazratummar`,
        modelUsed: qualified?.modelUsed || "heuristic",
      },
      notes: `Imported from ${item.source} (${item.ageLabel}). ${item.metaBadge || ""}`.trim(),
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to import listing" },
      { status: 500 }
    );
  }
}
