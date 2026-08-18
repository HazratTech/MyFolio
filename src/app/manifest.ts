import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'RelayWorks | Custom Software, Discord Bot & AI Development Agency',
        short_name: 'RelayWorks',
        description: 'RelayWorks is a custom software agency specializing in Discord bots, mobile apps, backend APIs, and AI chatbots.',
        start_url: '/',
        display: 'standalone',
        background_color: '#090a0f',
        theme_color: '#3b82f6',
        icons: [
            {
                src: '/logo-brand.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo-brand.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
