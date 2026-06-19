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
    images: {
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
                source: '/:all*(svg|jpg|png)',
                locale: false,
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    }
                ],
            },
        ];
    },
};

export default nextConfig;

