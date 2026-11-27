import { extractValidEmail, LeadCategory } from "@/lib/lead-ai";

export const FREELANCE_HIRING_SUBREDDITS = [
  "forhire",
  "hiring",
  "freelance_forhire",
  "jobbit",
] as const;

export const NICHE_BUILDER_SUBREDDITS = [
  "DiscordBots",
  "Discord_Bots",
  "AI_Agents",
  "AutomateYourself",
  "n8n",
  "shopify",
  "SaaS",
  "androiddev",
] as const;

export const DEFAULT_REDDIT_SUBREDDITS: string[] = [
  ...FREELANCE_HIRING_SUBREDDITS,
  ...NICHE_BUILDER_SUBREDDITS,
];

export interface RedditRawPost {
  id: string;
  subreddit: string;
  title: string;
  selftext: string;
  author: string;
  permalink: string;
  sourceUrl: string;
  createdUtc: number;
  postedAt: string;
  ageLabel: string;
  linkFlairText: string;
  categoryHint: LeadCategory;
  budget: string;
  extractedEmail: string;
  dmUrl: string;
}

const UA = "RelayWorks-LeadRadar/1.0 (by /u/relayworks)";

function formatAgeLabel(createdUtc: number): string {
  const diffSec = Math.max(0, Math.floor(Date.now() / 1000) - createdUtc);
  if (diffSec < 60) return "just now";
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function buildRedditDmUrl(
  author: string,
  subject: string,
  body?: string
): string {
  if (!author || author === "[deleted]" || author === "AutoModerator") return "";
  const cleanAuthor = author.replace(/^u\//i, "").trim();
  const params = new URLSearchParams({
    to: cleanAuthor,
    subject: subject.slice(0, 100),
  });
  if (body) {
    params.set("message", body.slice(0, 1800));
  }
  return `https://www.reddit.com/message/compose/?${params.toString()}`;
}

export function classifyRedditCategory(
  title: string,
  selftext = ""
): LeadCategory | null {
  const titleLower = title.toLowerCase();
  const combined = `${title}\n${selftext.slice(0, 800)}`;

  // Reject non-software roles explicitly when present in title or headline
  if (
    /\b(scriptwriter|script writer|copywriter|content writer|ghostwriter|data annotator|image annotator|annotators?|ai trainer|labeling|voice actor|voices to read|read aloud|translator|tutor|video editor|thumbnail|onlyfans|chatter|virtual assistant|appointment setter|cold caller|ugc creators?|tiktok editor|logo designer|graphic designer|sketch artist|3d animator|media buyer|meta ads|google ads|seo specialist|sales rep|sales representative|account executive|closer|hr manager|talent acquisition|real estate agent|insurance agent|sidewalk robotics|delivery robot|home health|nursing|caregiver|physical therapist|english proficient callers|callers?)\b/i.test(
      titleLower
    )
  ) {
    return null;
  }

  if (
    /\b(sidewalk robotics|delivery robot|home health|nursing|caregiver|physical therapist)\b/i.test(
      combined
    )
  ) {
    return null;
  }

  if (/\b(discord|telegram bot|discord\.py|discord\.js|slash command|tg bot|whatsapp bot)\b/i.test(combined)) {
    return "Discord Bots";
  }
  if (/\b(android|ios developer|swiftui|kotlin|kmp|flutter|react native|mobile app|mobile developer|ios app|android app)\b/i.test(combined)) {
    return "Mobile Apps";
  }
  if (/\b(chatbot|ai agent|rag pipeline|langchain|langgraph|pgvector|conversational ai|voice agent|ai automation|llm|custom gpt|openai api|claude api)\b/i.test(combined)) {
    return "AI & Chatbots";
  }
  if (/\b(developer|engineer|programmer|coder|fastapi|webhook|microservice|backend|api integration|python script|automation|scraper|scraping|shopify|n8n|make\.com|zapier|saas|mvp|next\.js|react|typescript|postgres|mongodb|node\.js|full[- ]?stack|software|web app|website build)\b/i.test(combined)) {
    return "Backend";
  }

  return null;
}

export function isDisqualifiedRedditPost(
  title: string,
  selftext: string,
  flair = ""
): boolean {
  const combined = `${flair} ${title} ${selftext}`.toLowerCase();
  const titleAndFlair = `${flair} ${title}`.toLowerCase();

  // Reject [For Hire] / job seekers explicitly pitching themselves
  if (
    /\[\s*for\s*hire\s*\]|\bfor\s+hire\b|\b(looking|searching)\s+for\s+work\b|\banyone('?s|\s+is)?\s+hiring\b|\bneed\s+work\b|\bseeking\s+work\b|\bopen\s+to\s+work\b|\bavailable\s+for\s+(hire|work)\b|\bhire\s+me\b|\boffering\s+(my|freelance)\s+services\b|\bi\s+build\b|\bi\s+can\s+build\b|\bi\s+am\s+a\s+(full[- ]?stack|backend|frontend|mobile|python|bot)\s+(dev|developer|engineer)\b/i.test(
      titleAndFlair
    )
  ) {
    return true;
  }

  // Reject theme/product advice requests or showcases disguised by generic keywords
  if (
    /\b(shared\s+\d+\s+free|free\s+(n8n|ai)?\s*templates?|i\s+built\s+(a|this)|here('?s| is)\s+how\s+i|tutorial|showoff|feedback\s+on\s+my|theme\s+suggestions|looking\s+for\s+(suggestions|recommendations|advice))\b/i.test(
      titleAndFlair
    )
  ) {
    return true;
  }

  if (
    /\b(seeking work|seeking freelance|looking for work if|if anyone'?s hiring|who wants to be hired|looking for a role|recently laid off|willing to relocate|here is my portfolio|check out my github|dm me for (rates|samples|portfolio))\b/i.test(
      combined
    )
  ) {
    return true;
  }

  // Enterprise / non-fit bureaucracy barriers / location-locked W2 / unpaid intern
  if (/\b([5-9]|1\d)\+?\s*years?\s*(of)?\s*(experience|exp)\b/i.test(combined)) {
    return true;
  }
  if (
    /\b(security clearance|us citizenship required|us citizens?\s+only|for\s+us\s+(citizens|residents)|us\s+residents?\s+only|polygraph|w-?2 only|onsite only|in-office only|equity only|unpaid|rev-?share only)\b/i.test(
      combined
    )
  ) {
    return true;
  }
  if (/\b(coo|cto|cpo|vp of|director of|head of engineering|staff engineer|principal engineer|intern|internship)\b/i.test(titleAndFlair)) {
    return true;
  }

  return false;
}

export function isValidRedditHiringPost(
  post: {
    title: string;
    selftext: string;
    author: string;
    linkFlairText: string;
    subreddit: string;
  },
  requireKeywordMatch = true
): boolean {
  if (!post.title || post.author === "[deleted]" || post.author === "AutoModerator") {
    return false;
  }

  if (isDisqualifiedRedditPost(post.title, post.selftext, post.linkFlairText)) {
    return false;
  }

  const subLower = post.subreddit.toLowerCase();
  const leadText = `${post.linkFlairText} ${post.title}\n${post.selftext.slice(0, 400)}`;
  const isFreelanceBoard = (FREELANCE_HIRING_SUBREDDITS as readonly string[])
    .map((s) => s.toLowerCase())
    .includes(subLower);

  if (isFreelanceBoard) {
    const hasHiringMarker =
      /\[\s*hiring\s*\]|\bhiring\b|\blooking\s+for\b|\bneed\s+a\s+(dev|developer|engineer|programmer|coder|bot|app|script)\b|\bseeking\s+(a\s+)?(dev|developer|engineer|freelancer|contractor)\b/i.test(
        leadText
      );
    if (!hasHiringMarker) return false;
  } else {
    // Niche subs require clear buyer/commission/hiring signal in title or opening lines
    const hasBuyerIntent =
      /\b(hiring|looking\s+to\s+hire|looking\s+for\s+(someone|a\s+dev|a\s+developer|an\s+engineer|a\s+freelancer)|need\s+(someone|a\s+dev|a\s+developer)\s+to\s+build|will\s+pay|willing\s+to\s+pay|paid\s+(gig|project|task|work)|commission)\b/i.test(
        leadText
      );
    if (!hasBuyerIntent) return false;
  }

  if (requireKeywordMatch) {
    const category = classifyRedditCategory(post.title, post.selftext);
    if (!category) return false;
  }

  return true;
}

export function extractRedditBudget(text: string): string {
  const hourly = text.match(/\$\s*([1-9]\d{1,2})(?:\s*[-–to]+\s*\$?\s*([1-9]\d{1,2}))?\s*(\/|per\s*)(hr|hour)/i);
  if (hourly) return hourly[0].replace(/\s+/g, " ").trim();

  const range = text.match(/\$\s*([1-9][\d,]{1,5})\s*[-–to]+\s*\$?\s*([1-9][\d,]{1,5})/i);
  if (range) return `$${range[1]} – $${range[2]}`;

  const single = text.match(/(?:budget(?:\s*(?:is|of|:))?\s*|paying\s*)\$?\s*([1-9][\d,]{1,5}(?:\s*k)?)/i);
  if (single) return `~$${single[1]}`;

  return "Contract / Discussed on Reddit";
}

let cachedOAuthToken: { token: string; expiresAt: number } | null = null;

async function getRedditOAuthToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret) return null;

  if (cachedOAuthToken && Date.now() < cachedOAuthToken.expiresAt - 60_000) {
    return cachedOAuthToken.token;
  }

  try {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const params =
      username && password
        ? new URLSearchParams({ grant_type: "password", username, password })
        : new URLSearchParams({ grant_type: "client_credentials" });

    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": process.env.REDDIT_USER_AGENT || UA,
      },
      body: params.toString(),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.access_token) return null;

    cachedOAuthToken = {
      token: data.access_token,
      expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
    };
    return cachedOAuthToken.token;
  } catch {
    return null;
  }
}

async function fetchFromRedditOAuth(
  subreddit: string,
  limit: number,
  query?: string
): Promise<any[] | null> {
  const token = await getRedditOAuthToken();
  if (!token) return null;

  const url = query?.trim()
    ? `https://oauth.reddit.com/r/${encodeURIComponent(subreddit)}/search?q=${encodeURIComponent(query.trim())}&restrict_sr=1&sort=new&limit=${limit}`
    : `https://oauth.reddit.com/r/${encodeURIComponent(subreddit)}/new?limit=${limit}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": process.env.REDDIT_USER_AGENT || UA,
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const children = json?.data?.children || [];
    return children.map((c: any) => c.data).filter(Boolean);
  } catch {
    return null;
  }
}

const SCAN_CACHE = new Map<
  string,
  {
    expiresAt: number;
    result: {
      posts: RedditRawPost[];
      sourceUsed: "reddit-oauth" | "arctic-shift";
      rateLimited: boolean;
    };
  }
>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchFromArcticShift(
  subreddit: string,
  limit: number,
  afterEpochSec?: number,
  query?: string
): Promise<{ items: any[]; rateLimited: boolean }> {
  const params = new URLSearchParams({
    subreddit,
    limit: String(Math.min(100, Math.max(10, limit))),
    sort: "desc",
  });
  if (afterEpochSec) {
    params.set("after", String(afterEpochSec));
  }
  if (query?.trim()) {
    params.set("query", query.trim());
  }

  try {
    const res = await fetch(
      `https://arctic-shift.photon-reddit.com/api/posts/search?${params.toString()}`,
      {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (res.status === 429) {
      return { items: [], rateLimited: true };
    }
    if (!res.ok) return { items: [], rateLimited: false };
    const json = await res.json();
    return {
      items: Array.isArray(json?.data) ? json.data : [],
      rateLimited: false,
    };
  } catch (err: any) {
    console.warn(`Arctic Shift fetch failed for r/${subreddit}:`, err?.message);
    return { items: [], rateLimited: false };
  }
}

export async function scanRedditJobs(options?: {
  subreddits?: string[];
  query?: string;
  maxAgeHours?: number;
  limitPerSub?: number;
  strictCategory?: boolean;
}): Promise<{
  posts: RedditRawPost[];
  sourceUsed: "reddit-oauth" | "arctic-shift";
  rateLimited: boolean;
}> {
  const subs = (
    options?.subreddits?.length ? options.subreddits : DEFAULT_REDDIT_SUBREDDITS
  )
    .map((s) => s.replace(/^r\//i, "").trim())
    .filter(Boolean);

  const maxAgeHours = options?.maxAgeHours ?? 48;
  const limitPerSub = options?.limitPerSub ?? 80;
  const strictCategory = options?.strictCategory ?? true;
  const cacheKey = JSON.stringify({
    subs: [...subs].sort(),
    q: (options?.query || "").trim().toLowerCase(),
    maxAgeHours,
    strictCategory,
  });

  const cached = SCAN_CACHE.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.result;
  }

  const afterEpochSec = Math.floor(Date.now() / 1000) - maxAgeHours * 3600;

  let usedOAuth = false;
  let rateLimited = false;
  const resultsBySub: { sub: string; raw: any[] }[] = [];

  // Process politely in pairs with 300ms spacing so Arctic Shift never returns HTTP 429
  for (let i = 0; i < subs.length; i += 2) {
    const pair = subs.slice(i, i + 2);
    const pairRes = await Promise.all(
      pair.map(async (sub) => {
        const oauthPosts = await fetchFromRedditOAuth(
          sub,
          limitPerSub,
          options?.query
        );
        if (oauthPosts && oauthPosts.length > 0) {
          usedOAuth = true;
          return { sub, raw: oauthPosts, hit429: false };
        }

        const isHighVolumeBoard = (FREELANCE_HIRING_SUBREDDITS as readonly string[])
          .map((s) => s.toLowerCase())
          .includes(sub.toLowerCase());
        const targetLimit = isHighVolumeBoard ? 100 : Math.min(limitPerSub, 50);

        const { items, rateLimited: hit429 } = await fetchFromArcticShift(
          sub,
          targetLimit,
          afterEpochSec,
          options?.query
        );
        return { sub, raw: items, hit429 };
      })
    );

    for (const r of pairRes) {
      resultsBySub.push({ sub: r.sub, raw: r.raw });
      if (r.hit429) rateLimited = true;
    }

    if (rateLimited) break;
    if (i + 2 < subs.length) {
      await sleep(320);
    }
  }

  const seenUrls = new Set<string>();
  const collected: RedditRawPost[] = [];

  for (const { sub, raw } of resultsBySub) {
    for (const item of raw) {
      const createdUtc = Number(item.created_utc || 0);
      if (createdUtc && createdUtc < afterEpochSec) continue;

      const title = String(item.title || "").trim();
      const selftext = String(item.selftext || "").trim();
      const author = String(item.author || "redditor").trim();
      const linkFlairText = String(item.link_flair_text || "").trim();
      const subreddit = String(item.subreddit || sub).trim();
      const permalink = item.permalink
        ? String(item.permalink)
        : `/r/${subreddit}/comments/${item.id}`;
      const sourceUrl = `https://www.reddit.com${permalink}`;

      if (seenUrls.has(sourceUrl)) continue;

      if (
        !isValidRedditHiringPost(
          { title, selftext, author, linkFlairText, subreddit },
          strictCategory
        )
      ) {
        continue;
      }

      const fullText = `${title}\n${selftext}`;
      const categoryHint = classifyRedditCategory(title, selftext) || "Backend";
      seenUrls.add(sourceUrl);

      collected.push({
        id: String(item.id || permalink),
        subreddit,
        title,
        selftext,
        author,
        permalink,
        sourceUrl,
        createdUtc,
        postedAt: createdUtc
          ? new Date(createdUtc * 1000).toISOString()
          : new Date().toISOString(),
        ageLabel: createdUtc ? formatAgeLabel(createdUtc) : "recent",
        linkFlairText,
        categoryHint,
        budget: extractRedditBudget(fullText),
        extractedEmail: extractValidEmail(fullText),
        dmUrl: buildRedditDmUrl(author, `Re: ${title.slice(0, 75)}`),
      });
    }
  }

  collected.sort((a, b) => b.createdUtc - a.createdUtc);

  const output = {
    posts: collected,
    sourceUsed: (usedOAuth ? "reddit-oauth" : "arctic-shift") as
      | "reddit-oauth"
      | "arctic-shift",
    rateLimited,
  };

  if (!rateLimited) {
    SCAN_CACHE.set(cacheKey, {
      expiresAt: Date.now() + 180_000,
      result: output,
    });
  }

  return output;
}
