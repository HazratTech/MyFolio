import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Redirect from "@/models/Redirect";

const STOP_WORDS = new Set([
    "the", "and", "for", "with", "from", "that", "this", "how", "why", "what",
    "guide", "tutorial", "deep", "dive", "insights", "key", "best", "simple",
    "time", "real", "practical", "building", "create", "boost", "mastering",
    "comprehensive", "a", "an", "in", "on", "to", "of", "my", "your", "is", "are"
]);

export type ResolutionResult =
    | { type: "post"; post: any }
    | { type: "redirect"; destination: string; permanent: boolean };

/**
 * Resolves a requested blog slug:
 * 1. Returns post if exact slug is active.
 * 2. Checks previousSlugs array for renamed posts.
 * 3. Checks dynamic Redirect rules collection in MongoDB.
 * 4. Performs smart keyword similarity fallback to find the closest live article.
 * 5. Falls back cleanly to /blog if no semantic match exists.
 */
export async function resolvePostOrRedirect(
    rawSlug: string,
    isPreview: boolean = false
): Promise<ResolutionResult> {
    await dbConnect();

    const slug = (rawSlug || "").trim().toLowerCase().replace(/\/$/, "");
    if (!slug) {
        return { type: "redirect", destination: "/blog", permanent: false };
    }

    // 1. Check exact match
    const query: any = { slug };
    if (!isPreview) {
        query.status = "published";
    }
    const directPost = await Post.findOne(query).lean();
    if (directPost) {
        return { type: "post", post: directPost };
    }

    // 2. Check previous/historical slugs on published posts
    const historicPost = await Post.findOne({
        previousSlugs: slug,
        status: "published"
    }).lean();

    if (historicPost) {
        return {
            type: "redirect",
            destination: `/blog/${historicPost.slug}`,
            permanent: true
        };
    }

    // 3. Check dynamic Redirects collection (matches "slug" or "/blog/slug")
    const redirectDoc = await Redirect.findOne({
        source: { $in: [slug, `/blog/${slug}`] }
    }).lean();

    if (redirectDoc) {
        // Asynchronously update analytics
        Redirect.updateOne(
            { _id: redirectDoc._id },
            { $inc: { hitCount: 1 }, $set: { lastAccessedAt: new Date() } }
        ).catch(() => {});

        return {
            type: "redirect",
            destination: redirectDoc.destination,
            permanent: redirectDoc.permanent ?? true
        };
    }

    // 4. Intelligent keyword similarity matching
    const tokens = slug
        .split("-")
        .map(t => t.replace(/[^a-z0-9]/g, ""))
        .filter(t => t.length >= 3 && !STOP_WORDS.has(t));

    if (tokens.length > 0) {
        const publishedPosts = await Post.find({ status: "published" })
            .select("title slug")
            .lean();

        let bestPost: any = null;
        let maxScore = 0;

        for (const p of publishedPosts) {
            const pSlug = (p.slug || "").toLowerCase();
            const pTitle = (p.title || "").toLowerCase();
            let score = 0;

            for (const token of tokens) {
                if (pSlug.includes(token)) score += 3;
                else if (pTitle.includes(token)) score += 1.5;
            }

            if (score > maxScore) {
                maxScore = score;
                bestPost = p;
            }
        }

        // Require minimum relevance threshold
        const threshold = tokens.length <= 2 ? 3 : 4.5;
        if (bestPost && maxScore >= threshold) {
            return {
                type: "redirect",
                destination: `/blog/${bestPost.slug}`,
                permanent: true
            };
        }
    }

    // 5. Final safety fallback to /blog instead of a 404
    return {
        type: "redirect",
        destination: "/blog",
        permanent: false
    };
}
