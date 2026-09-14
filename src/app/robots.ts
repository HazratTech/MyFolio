import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'Google-Extended',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
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
            {
                userAgent: 'Claude-Web',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'PerplexityBot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
        ],
        sitemap: 'https://relayworks.dev/sitemap.xml',
        host: 'https://relayworks.dev',
    };
}
