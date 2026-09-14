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
        ];
    },
};

export default nextConfig;

