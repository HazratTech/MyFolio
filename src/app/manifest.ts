import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'RelayWorks | Custom Automation & Software Agency',
        short_name: 'RelayWorks',
        description: 'RelayWorks is an expert agency specializing in custom Discord Bots, Backend Development, and automated workflow solutions.',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/logo.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
