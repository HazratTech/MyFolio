import {
  LeadCategory,
  RawLeadCandidate,
  extractValidEmail,
  stripHtmlKeepNewlines,
} from "@/lib/lead-ai";

export type PlatformId =
  | "github-bounties"
  | "freelancer"
  | "weworkremotely"
  | "himalayas"
  | "job-boards"
  | "mastodon";

export interface PlatformDiscoveredLead extends RawLeadCandidate {
  id: string;
  platform: PlatformId;
  title: string;
  postedAt: string;
  ageLabel: string;
  metaBadge?: string;
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function formatAgeFromDate(dateStrOrSec: string | number): string {
  const tsMs =
    typeof dateStrOrSec === "number"
      ? dateStrOrSec * 1000
      : Date.parse(dateStrOrSec);
  if (!tsMs || Number.isNaN(tsMs)) return "recent";
  const mins = Math.max(0, Math.floor((Date.now() - tsMs) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function classifySoftwareCategory(title: string, text = ""): LeadCategory | null {
  const tLower = title.toLowerCase();
  const full = `${title}\n${text.slice(0, 1000)}`;

  if (
    /\b(tiktok|ugc|content writing|scriptwriter|voice actor|data collection|indeed employer|adobe illustrator|desain|google ads|business manager|motion & animation|social media|virtual assistant|appointment setter|video editor|3d virtual venue|answer the 2 linked|solutions architect|intern)\b/i.test(
      tLower
    )
  ) {
    return null;
  }

  if (/\b(discord|telegram bot|discord\.py|discord\.js|tg bot|whatsapp bot|slack.*bot)\b/i.test(full)) {
    return "Discord Bots";
  }
  if (/\b(android|kotlin|kmp|jetpack compose|swiftui|flutter|react native|ios app|mobile app)\b/i.test(full)) {
    return "Mobile Apps";
  }
  if (/\b(chatbot|ai agent|rag|langchain|langgraph|pgvector|voice agent|multi-agent|llm|ai assistant|openai)\b/i.test(full)) {
    return "AI & Chatbots";
  }
  if (/\b(fastapi|python|automation|scraper|webhook|microservice|backend|api|shopify|n8n|zapier|sdk|typescript|node\.js|bounty)\b/i.test(full)) {
    return "Backend";
  }

  return null;
}

function isDisqualifiedGeneric(text: string): boolean {
  const lower = text.toLowerCase();
  if (
    /\b(seeking work|for hire|open to work|available for work|here is my portfolio|us citizenship required|security clearance|w-?2 only|onsite only|unpaid)\b/i.test(
      lower
    )
  ) {
    return true;
  }
  if (/\b([5-9]|1\d)\+?\s*years?\s*(of)?\s*(experience|exp)\b/i.test(lower)) {
    return true;
  }
  return false;
}

function approximateUsd(amount: number, currency: string): number {
  const c = (currency || "USD").toUpperCase();
  if (c === "USD" || c === "USDC" || c === "USDT") return amount;
  if (c === "EUR") return amount * 1.08;
  if (c === "GBP") return amount * 1.26;
  if (c === "CAD") return amount * 0.72;
  if (c === "AUD") return amount * 0.65;
  if (c === "INR") return amount / 87.5;
  return amount;
}

async function fetchGitHubBounties(): Promise<PlatformDiscoveredLead[]> {
  const queries = [
    "algora.io is:open is:issue",
    "label:bounty is:open is:issue python",
    "label:bounty is:open is:issue bot",
  ];
  const seen = new Set<string>();
  const out: PlatformDiscoveredLead[] = [];

  const responses = await Promise.all(
    queries.map(async (q) => {
      try {
        const res = await fetch(
          `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=created&order=desc&per_page=6`,
          {
            headers: {
              "User-Agent": UA,
              Accept: "application/vnd.github+json",
            },
            signal: AbortSignal.timeout(8000),
          }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data.items) ? data.items : [];
      } catch {
        return [];
      }
    })
  );

  for (const item of responses.flat()) {
    const url = String(item.html_url || "");
    if (!url || seen.has(url)) continue;

    const title = String(item.title || "");
    const body = String(item.body || "");
    const cat = classifySoftwareCategory(title, body);
    if (!cat) continue;

    // Extract repo owner/name from url https://github.com/owner/repo/issues/123
    const repoMatch = url.match(/github\.com\/([^/]+\/[^/]+)\//);
    const repoName = repoMatch ? repoMatch[1] : "GitHub OSS";
    const bountyMatch = `${title} ${body}`.match(/\$\s?\d[\d,]*(?:\.\d+)?|\d+\s*(?:USDC|USDT)/i);
    const budget = bountyMatch ? `${bountyMatch[0]} Bounty` : "Open-Source Bounty";

    seen.add(url);
    out.push({
      id: `gh-${item.id}`,
      platform: "github-bounties",
      title: `${title}`,
      rawText: `${title} (Repo: ${repoName})\n${body.slice(0, 1400)}`,
      author: item.user?.login || repoName.split("/")[0],
      source: "GitHub Paid Bounty",
      sourceUrl: url,
      extractedEmail: extractValidEmail(body),
      defaultCategory: cat,
      rawCompany: repoName,
      rawTitle: title,
      rawTags: [cat, "Open Source Bounty"],
      budget,
      postedAt: item.created_at || new Date().toISOString(),
      ageLabel: formatAgeFromDate(item.created_at),
      metaBadge: budget,
    });
  }

  return out;
}

async function fetchFreelancerProjects(): Promise<PlatformDiscoveredLead[]> {
  const queries = [
    "discord bot",
    "telegram bot",
    "ai chatbot",
    "kotlin android app",
    "python automation scraper",
  ];
  const seen = new Set<string>();
  const out: PlatformDiscoveredLead[] = [];

  const batches = await Promise.all(
    queries.map(async (q) => {
      try {
        const res = await fetch(
          `https://www.freelancer.com/api/projects/0.1/projects/active/?query=${encodeURIComponent(
            q
          )}&min_avg_price=150&limit=5&full_description=true&compact=false`,
          {
            headers: { "User-Agent": UA },
            signal: AbortSignal.timeout(8000),
          }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return data?.result?.projects || [];
      } catch {
        return [];
      }
    })
  );

  for (const p of batches.flat()) {
    const seo = String(p.seo_url || "");
    if (!seo) continue;
    const url = `https://www.freelancer.com/projects/${seo}`;
    if (seen.has(url)) continue;

    const bidCount = Number(p.bid_stats?.bid_count || 0);
    // Marketing filter: avoid overcrowded 100+ agency bid wars
    if (bidCount > 45) continue;

    const curr = String(p.currency?.code || "USD");
    const minB = Number(p.budget?.minimum || 0);
    const maxB = Number(p.budget?.maximum || minB);
    if (approximateUsd(maxB, curr) < 150) continue;

    const title = String(p.title || "");
    const desc = stripHtmlKeepNewlines(String(p.description || p.preview_description || ""));
    if (isDisqualifiedGeneric(`${title}\n${desc}`)) continue;

    const cat = classifySoftwareCategory(title, desc);
    if (!cat) continue;

    seen.add(url);
    const budgetStr = `${curr} ${Math.round(minB)}–${Math.round(maxB)}`;
    const submitSec = Number(p.submitdate || 0);

    out.push({
      id: `fl-${p.id}`,
      platform: "freelancer",
      title,
      rawText: `${title}\nBudget: ${budgetStr} (${bidCount} bids)\n${desc.slice(0, 1400)}`,
      author: `Client #${p.owner_id || "FL"}`,
      source: "Freelancer (Low-Bid)",
      sourceUrl: url,
      extractedEmail: extractValidEmail(desc),
      defaultCategory: cat,
      rawTitle: title,
      rawTags: [cat, `${bidCount} bids`],
      budget: budgetStr,
      postedAt: submitSec
        ? new Date(submitSec * 1000).toISOString()
        : new Date().toISOString(),
      ageLabel: submitSec ? formatAgeFromDate(submitSec) : "active",
      metaBadge: `${bidCount} bids · ${budgetStr}`,
    });
  }

  return out;
}

async function fetchWeWorkRemotely(): Promise<PlatformDiscoveredLead[]> {
  const out: PlatformDiscoveredLead[] = [];
  try {
    const res = await fetch(
      "https://weworkremotely.com/categories/remote-programming-jobs.rss",
      {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(9000),
      }
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const itemMatches = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));

    for (const m of itemMatches.slice(0, 35)) {
      const block = m[1];
      const rawTitle = (
        block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1] || ""
      ).trim();
      const link = (block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "").trim();
      const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "").trim();
      const rawDesc = (
        block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1] || ""
      ).trim();

      if (!rawTitle || !link) continue;
      const plainDesc = stripHtmlKeepNewlines(rawDesc);
      const combined = `${rawTitle}\n${plainDesc}`;

      if (!/\b(contract|freelance|part[- ]?time|consultant|fractional)\b/i.test(combined)) {
        continue;
      }
      if (isDisqualifiedGeneric(combined)) continue;

      const cat = classifySoftwareCategory(rawTitle, plainDesc);
      if (!cat) continue;

      const [companyPart, rolePart] = rawTitle.includes(":")
        ? [rawTitle.split(":")[0].trim(), rawTitle.split(":").slice(1).join(":").trim()]
        : ["Hiring Company", rawTitle];

      out.push({
        id: `wwr-${link.slice(-24)}`,
        platform: "weworkremotely",
        title: rawTitle,
        rawText: `${rawTitle}\n${plainDesc.slice(0, 1400)}`,
        author: companyPart,
        source: "WeWorkRemotely Contract",
        sourceUrl: link,
        extractedEmail: extractValidEmail(plainDesc),
        defaultCategory: cat,
        rawCompany: companyPart,
        rawTitle: rolePart,
        rawTags: [cat, "Contract"],
        budget: "Contract / Remote",
        postedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        ageLabel: formatAgeFromDate(pubDate),
        metaBadge: "Contract",
      });
    }
  } catch (err: any) {
    console.warn("WWR sync warning:", err?.message);
  }
  return out;
}

async function fetchHimalayasAndBoards(): Promise<PlatformDiscoveredLead[]> {
  const out: PlatformDiscoveredLead[] = [];

  // 1. Himalayas Contractor Jobs
  try {
    const res = await fetch("https://himalayas.app/jobs/api?limit=50", {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      for (const j of data.jobs || []) {
        const empType = String(j.employmentType || "").toLowerCase();
        if (!empType.includes("contract") && !empType.includes("freelance") && !empType.includes("part")) {
          continue;
        }
        const desc = stripHtmlKeepNewlines(String(j.description || ""));
        const combined = `${j.title || ""} ${j.companyName || ""} ${desc}`;
        if (isDisqualifiedGeneric(combined)) continue;
        const cat = classifySoftwareCategory(j.title || "", desc);
        if (!cat) continue;

        const url = String(j.applicationLink || j.guid || "");
        if (!url) continue;

        out.push({
          id: `him-${j.guid || url.slice(-20)}`,
          platform: "himalayas",
          title: `${j.title} @ ${j.companyName}`,
          rawText: `${j.title} at ${j.companyName}\n${desc.slice(0, 1400)}`,
          author: j.companyName || "Company",
          source: "Himalayas Contractor",
          sourceUrl: url,
          extractedEmail: extractValidEmail(desc),
          defaultCategory: cat,
          rawCompany: j.companyName,
          rawTitle: j.title,
          rawTags: [cat, j.employmentType || "Contractor"],
          budget: j.minSalary ? `$${j.minSalary}–$${j.maxSalary || j.minSalary}` : "Contractor",
          postedAt: j.pubDate
            ? new Date(j.pubDate * 1000).toISOString()
            : new Date().toISOString(),
          ageLabel: j.pubDate ? formatAgeFromDate(j.pubDate) : "recent",
          metaBadge: j.employmentType || "Contractor",
        });
      }
    }
  } catch (err: any) {
    console.warn("Himalayas warning:", err?.message);
  }

  // 2. Jobicy & Working Nomads Contract Dev Jobs
  try {
    const [jobicyRes, wnRes] = await Promise.all([
      fetch("https://jobicy.com/api/v2/remote-jobs?count=30&industry=dev", {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(8000),
      }).catch(() => null),
      fetch("https://www.workingnomads.com/api/exposed_jobs/", {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(8000),
      }).catch(() => null),
    ]);

    if (jobicyRes?.ok) {
      const jd = await jobicyRes.json();
      for (const j of jd.jobs || []) {
        const jType = Array.isArray(j.jobType) ? j.jobType.join(" ") : String(j.jobType || "");
        const desc = stripHtmlKeepNewlines(String(j.jobDescription || ""));
        const combined = `${j.jobTitle || ""} ${jType} ${desc}`;
        if (!/\b(contract|freelance|part[- ]?time)\b/i.test(combined)) continue;
        if (isDisqualifiedGeneric(combined)) continue;
        const cat = classifySoftwareCategory(j.jobTitle || "", desc);
        if (!cat || !j.url) continue;

        out.push({
          id: `jobicy-${j.id}`,
          platform: "job-boards",
          title: `${j.jobTitle} @ ${j.companyName}`,
          rawText: `${j.jobTitle} at ${j.companyName}\n${desc.slice(0, 1400)}`,
          author: j.companyName,
          source: "Jobicy Contract",
          sourceUrl: j.url,
          extractedEmail: extractValidEmail(desc),
          defaultCategory: cat,
          rawCompany: j.companyName,
          rawTitle: j.jobTitle,
          rawTags: [cat, "Contract"],
          budget: "Contract / Remote",
          postedAt: j.pubDate || new Date().toISOString(),
          ageLabel: formatAgeFromDate(j.pubDate),
          metaBadge: "Jobicy Contract",
        });
      }
    }

    if (wnRes?.ok) {
      const wn = await wnRes.json();
      for (const j of Array.isArray(wn) ? wn.slice(0, 40) : []) {
        const desc = stripHtmlKeepNewlines(String(j.description || ""));
        const combined = `${j.title || ""} ${desc}`;
        if (!/\b(contract|freelance|contractor|part[- ]?time)\b/i.test(combined)) continue;
        if (isDisqualifiedGeneric(combined)) continue;
        const cat = classifySoftwareCategory(j.title || "", desc);
        if (!cat || !j.url) continue;

        out.push({
          id: `wn-${j.url.slice(-24)}`,
          platform: "job-boards",
          title: `${j.title} @ ${j.company_name}`,
          rawText: `${j.title} at ${j.company_name}\n${desc.slice(0, 1400)}`,
          author: j.company_name,
          source: "Working Nomads Contract",
          sourceUrl: j.url,
          extractedEmail: extractValidEmail(desc),
          defaultCategory: cat,
          rawCompany: j.company_name,
          rawTitle: j.title,
          rawTags: [cat, "Contract"],
          budget: "Contract / Remote",
          postedAt: j.pub_date || new Date().toISOString(),
          ageLabel: formatAgeFromDate(j.pub_date),
          metaBadge: "WorkingNomads",
        });
      }
    }
  } catch (err: any) {
    console.warn("Job boards warning:", err?.message);
  }

  return out;
}

async function fetchMastodonTechHiring(): Promise<PlatformDiscoveredLead[]> {
  const out: PlatformDiscoveredLead[] = [];
  const tags = ["getfedihired", "hiring"];
  const seen = new Set<string>();

  for (const tag of tags) {
    try {
      const res = await fetch(
        `https://mastodon.social/api/v1/timelines/tag/${tag}?limit=20`,
        {
          headers: { "User-Agent": UA },
          signal: AbortSignal.timeout(8000),
        }
      );
      if (!res.ok) continue;
      const posts = await res.json();
      for (const m of Array.isArray(posts) ? posts : []) {
        const url = String(m.url || m.uri || "");
        if (!url || seen.has(url)) continue;

        const text = stripHtmlKeepNewlines(String(m.content || ""));
        if (text.length < 50) continue;
        if (isDisqualifiedGeneric(text)) continue;

        // Require explicit hiring signal vs job-seeker #forhire
        if (/\b(#forhire|open to work|looking for a role|seeking work)\b/i.test(text)) {
          continue;
        }
        if (!/\b(hiring|looking for|need a developer|freelancer|contractor)\b/i.test(text)) {
          continue;
        }
        const acctLower = String(m.account?.acct || "").toLowerCase();
        // Skip corporate W2 job aggregator bots unless post explicitly states contractor/freelance
        if (
          /(jobsfordevelopers|rolechemy|jobboard)/.test(acctLower) &&
          !/\b(contract|contractor|freelance|part[- ]?time|consultant)\b/i.test(text)
        ) {
          continue;
        }

        const cat = classifySoftwareCategory(text.slice(0, 120), text);
        if (!cat) continue;

        seen.add(url);
        out.push({
          id: `mast-${m.id}`,
          platform: "mastodon",
          title: text.split("\n")[0].slice(0, 110),
          rawText: text.slice(0, 1600),
          author: `@${m.account?.acct || "founder"}`,
          source: "Mastodon Indie Hiring",
          sourceUrl: url,
          extractedEmail: extractValidEmail(text),
          defaultCategory: cat,
          rawTags: [cat, `#${tag}`],
          budget: "Direct Founder / Indie",
          postedAt: m.created_at || new Date().toISOString(),
          ageLabel: formatAgeFromDate(m.created_at),
          metaBadge: "Direct Founder",
        });
      }
    } catch {
      continue;
    }
  }

  return out;
}

export async function fetchMultiPlatformCandidates(options?: {
  platforms?: PlatformId[];
}): Promise<PlatformDiscoveredLead[]> {
  const enabled = new Set<PlatformId>(
    options?.platforms?.length
      ? options.platforms
      : [
          "github-bounties",
          "freelancer",
          "weworkremotely",
          "himalayas",
          "job-boards",
          "mastodon",
        ]
  );

  const tasks: Promise<PlatformDiscoveredLead[]>[] = [];
  if (enabled.has("github-bounties")) tasks.push(fetchGitHubBounties());
  if (enabled.has("freelancer")) tasks.push(fetchFreelancerProjects());
  if (enabled.has("weworkremotely")) tasks.push(fetchWeWorkRemotely());
  if (enabled.has("himalayas") || enabled.has("job-boards")) {
    tasks.push(fetchHimalayasAndBoards());
  }
  if (enabled.has("mastodon")) tasks.push(fetchMastodonTechHiring());

  const chunks = await Promise.all(tasks);
  const all = chunks.flat();

  // Sort newest first
  all.sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));
  return all;
}
