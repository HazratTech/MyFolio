/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Ignore TypeScript and ESLint errors during build (for Docker)
    // Remove these in production for stricter checks
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    compress: true,
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 31536000,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'minio-api.hazratdev.top',
            },
            {
                protocol: 'https',
                hostname: 'api-minio-storage.hazratdev.top',
            },
            {
                protocol: 'https',
                hostname: 'image.pollinations.ai',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                ],
            },
            {
                source: '/:path*.(svg|jpg|jpeg|png|webp|avif|ico|woff2)',
                locale: false,
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    }
                ],
            },
            {
                source: '/_next/image/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    }
                ],
            },
        ];
    },
    async redirects() {
        return [
            {
                source: '/cdn-cgi/l/email-protection',
                destination: '/contact',
                permanent: true,
            },
            {
                source: '/blog/tag/CI/CD',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/blog/unmasking-silent-killers',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/blog/avoiding-unintended-side-effects-of-code-optimization',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/blog/common-kotlin-performance-anti-patterns',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/blog/debugging-performance-related-feature-failures',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/blog/defensive-optimization-best-practices',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/blog/integrating-performance-tests-into-ci-cd-kotlin',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/blog/kotlin-coroutine-flows',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/blog/kotlin-performance-optimization-dangers',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/blog/performance-regression-testing-strategies',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/blog/silent-feature-bugs-from-database-bounding',
                destination: '/blog',
                permanent: true,
            },
            // 301 Redirects for cleaned low-quality / thin / duplicate posts
            {
                source: '/blog/ai-chatbot-development-services-boost-conversions-cx',
                destination: '/ai-chatbot-development',
                permanent: true,
            },
            {
                source: '/blog/unlock-business-growth-custom-ai-chatbots-agents-deliver-real-roi',
                destination: '/ai-chatbot-development',
                permanent: true,
            },
            {
                source: '/blog/why-hiring-an-android-app-developer-saves-months-of-time',
                destination: '/mobile-app-development',
                permanent: true,
            },
            {
                source: '/blog/boost-engagement-custom-discord-bot-development-solutions',
                destination: '/discord-bot',
                permanent: true,
            },
            {
                source: '/blog/best-hosting-for-discord-bots-keep-your-bots-online-24-7',
                destination: '/discord-bot',
                permanent: true,
            },
            {
                source: '/blog/building-scaling-discord-bots-a-practical-guide-for-founders',
                destination: '/blog/building-custom-discord-bots-a-deep-dive-into-development-architecture',
                permanent: true,
            },
            {
                source: '/blog/python-automation-saving-209-itr-hours-for-a-ca-firm',
                destination: '/blog/automating-itr-filings-a-python-script-s-209-hour-efficiency-gain',
                permanent: true,
            },
            {
                source: '/blog/build-a-python-mcp-server-github-api-context-management',
                destination: '/blog/building-a-scalable-python-mcp-server-for-github-api-automation',
                permanent: true,
            },
            {
                source: '/blog/mastering-python-mcp-servers-a-practical-github-api-integration-guide',
                destination: '/blog/building-a-scalable-python-mcp-server-for-github-api-automation',
                permanent: true,
            },
            {
                source: '/blog/building-a-production-ready-python-mcp-server-with-fastapi-and-github-api',
                destination: '/blog/building-a-scalable-python-mcp-server-for-github-api-automation',
                permanent: true,
            },
            {
                source: '/blog/beyond-the-headlines-practical-insights-from-the-latest-android-dev-news-for-kotlin-and-compose-developers',
                destination: '/blog/mastering-android-dev-news-boost-compose-performance-with-latest-tools',
                permanent: true,
            },
            {
                source: '/blog/beyond-keywords-building-smart-job-agents-with-fastapi-mongodb',
                destination: '/blog/beyond-keyword-matching-the-semantic-gap-in-developer-job-search',
                permanent: true,
            },
            {
                source: '/blog/deploying-a-minimal-fastapi-app-on-digitalocean-a-hands-on-guide',
                destination: '/blog/fastapi-deep-dive-building-blazing-fast-apis-that-just-work',
                permanent: true,
            },
            {
                source: '/blog/minimal-fastapi-deployment-on-digitalocean-a-developer-s-guide',
                destination: '/blog/fastapi-deep-dive-building-blazing-fast-apis-that-just-work',
                permanent: true,
            },
            {
                source: '/blog/local-llm-output-why-my-em-dash-preprocessing-was-flawed',
                destination: '/blog/five-bugs-in-my-llm-app-that-never-threw-an-error',
                permanent: true,
            },
            {
                source: '/blog/debunking-llm-output-assumptions-em-dashes-local-model-quirks',
                destination: '/blog/five-bugs-in-my-llm-app-that-never-threw-an-error',
                permanent: true,
            },
            {
                source: '/blog/unmasking-native-crashes-a-deep-dive-into-seamless-mobile-app-protection',
                destination: '/blog/fixing-android-native-crashes-in-react-native-app',
                permanent: true,
            },
            {
                source: '/blog/demystifying-android-os-a-deep-dive-for-web-software-engineers',
                destination: '/blog/mastering-modern-android-architecture-a-practical-guide-for-robust-apps',
                permanent: true,
            },
            {
                source: '/blog/demystifying-ios-development-a-practical-guide-for-web-software-engineers',
                destination: '/blog/master-ios-dev-a-comprehensive-guide-for-2024',
                permanent: true,
            },
            {
                source: '/blog/deep-dive-into-ios-development-practical-strategies-for-web-software-engineers',
                destination: '/blog/master-ios-dev-a-comprehensive-guide-for-2024',
                permanent: true,
            },
            {
                source: '/blog/kotlin-unchained-beyond-mobile-powering-backends-bots',
                destination: '/blog/kotlin-news-your-practical-guide-to-the-latest-updates-in-web-mobile-engineering',
                permanent: true,
            },
            {
                source: '/blog/python-benchmarks-the-4300-digit-limit-8-bugs-that-derail-scalability',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/blog/integrating-webrtc-into-py-libp2p-a-practical-guide-for-p2p',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/blog/automating-cs-exams-my-8-month-journey-to-an-ai-powered-study-app',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/blog/active-inference-in-practice-building-self-curious-ai-agents',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/blog/mastering-python-for-high-performance-backends-smarter-discord-bots',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/blog/mastering-python-for-web-and-software-engineering-a-practical-deep-dive',
                destination: '/blog',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;

