import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';

export const dynamic = 'force-dynamic';

export async function GET() {
    await dbConnect();

    try {
        // Fetch 20 most recent published posts
        const posts = await Post.find({ status: 'published' })
            .sort({ publishedAt: -1 })
            .limit(20)
            .lean();

        const feedItems = posts.map((post: any) => {
            // Ensure absolute cover image URL
            let coverImageUrl = post.coverImage || '';
            if (coverImageUrl && !coverImageUrl.startsWith('http')) {
                coverImageUrl = `https://relayworks.dev${coverImageUrl.startsWith('/') ? '' : '/'}${coverImageUrl}`;
            }

            // Clean description excerpt
            const cleanDescription = (post.excerpt || post.content || '')
                .replace(/<[^>]*>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 250);

            // Format tags (max 4 for Dev.to compliance)
            const rawTags = (post.tags || [])
                .map((t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, ''))
                .filter(Boolean);
            if (post.category && !rawTags.includes(post.category.toLowerCase())) {
                rawTags.unshift(post.category.toLowerCase().replace(/[^a-z0-9]/g, ''));
            }
            const tags = Array.from(new Set(rawTags)).slice(0, 4);
            const categoryXml = tags.map((t: any) => `<category>${t}</category>`).join('\n            ');

            // Dev.to YAML Frontmatter block to guarantee cover image & canonical link extraction
            const frontmatter = `---
title: "${(post.title || '').replace(/"/g, '\\"')}"
published: false
description: "${cleanDescription.replace(/"/g, '\\"')}"
cover_image: "${coverImageUrl}"
canonical_url: "https://relayworks.dev/blog/${post.slug}"
tags: ${tags.join(', ')}
---`;

            const coverImageHtml = coverImageUrl
                ? `<figure class="blog-cover"><img src="${coverImageUrl}" alt="${post.title}" /></figure>\n`
                : '';
            const fullContent = `${frontmatter}\n${coverImageHtml}${post.content || ''}`;

            const mediaEnclosure = coverImageUrl
                ? `\n            <cover_image>${coverImageUrl}</cover_image>
            <main_image>${coverImageUrl}</main_image>
            <enclosure url="${coverImageUrl}" type="image/jpeg" length="0" />
            <media:content url="${coverImageUrl}" medium="image" />
            <media:thumbnail url="${coverImageUrl}" />`
                : '';

            return `
        <item>
            <title><![CDATA[${post.title}]]></title>
            <link>https://relayworks.dev/blog/${post.slug}</link>
            <guid>https://relayworks.dev/blog/${post.slug}</guid>
            <canonical_url>https://relayworks.dev/blog/${post.slug}</canonical_url>
            <pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
            <description><![CDATA[${cleanDescription}...]]></description>
            ${categoryXml}${mediaEnclosure}
            <content:encoded><![CDATA[${fullContent}]]></content:encoded>
        </item>
            `;
        }).join('');

        const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" 
    xmlns:atom="http://www.w3.org/2005/Atom"
    xmlns:content="http://purl.org/rss/1.0/modules/content/"
    xmlns:media="http://search.yahoo.com/mrss/">
    <channel>
        <title>RelayWorks Blog | Custom Software &amp; Automation Agency</title>
        <link>https://relayworks.dev</link>
        <description>Expert agency specializing in custom Discord Bots, Backend Development, and automated workflow solutions.</description>
        <language>en-us</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="https://relayworks.dev/blog/feed.xml" rel="self" type="application/rss+xml" />
        ${feedItems}
    </channel>
</rss>
        `.trim();

        return new Response(rss, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 's-maxage=3600, stale-while-revalidate',
            },
        });
    } catch (error) {
        console.error("Failed to generate RSS feed:", error);
        return new Response("<error>Failed to generate RSS feed</error>", {
            status: 500,
            headers: { 'Content-Type': 'application/xml' }
        });
    }
}
