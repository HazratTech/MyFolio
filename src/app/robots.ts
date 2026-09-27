import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            // ── Google AI (AI Overviews, AI Mode, Gemini) ──
            {
                userAgent: 'Google-Extended',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            // ── OpenAI (ChatGPT Search, GPT crawling) ──
            {
                userAgent: 'GPTBot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'ChatGPT-User',
                allow: '/',
            },
            {
                userAgent: 'OAI-SearchBot',
                allow: '/',
            },
            // ── Anthropic (Claude) ──
            {
                userAgent: 'Claude-Web',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'anthropic-ai',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'ClaudeBot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            // ── Perplexity ──
            {
                userAgent: 'PerplexityBot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            // ── Meta AI ──
            {
                userAgent: 'FacebookBot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'meta-externalagent',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            // ── Microsoft / Bing AI (Copilot) ──
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            // ── Cohere ──
            {
                userAgent: 'cohere-ai',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            // ── Apple Intelligence / Siri ──
            {
                userAgent: 'Applebot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'Applebot-Extended',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            // ── Amazon / Alexa ──
            {
                userAgent: 'Amazonbot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
        ],
        sitemap: 'https://relayworks.dev/sitemap.xml',
        host: 'https://relayworks.dev',
    };
}
