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
            // Strip HTML tags for clean description excerpt
            const cleanDescription = (post.excerpt || post.content || '')
                .replace(/<[^>]*>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 250);

            return `
        <item>
            <title><![CDATA[${post.title}]]></title>
            <link>https://relayworks.dev/blog/${post.slug}</link>
            <guid>https://relayworks.dev/blog/${post.slug}</guid>
            <pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
            <description><![CDATA[${cleanDescription}...]]></description>
            <content:encoded><![CDATA[${post.content || ''}]]></content:encoded>
        </item>
            `;
        }).join('');

        const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" 
    xmlns:atom="http://www.w3.org/2005/Atom"
    xmlns:content="http://purl.org/rss/1.0/modules/content/">
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
