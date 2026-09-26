import { MetadataRoute } from 'next'
import dbConnect from '@/lib/db'
import Post from '@/models/Post'
import Category from '@/models/Category'
import Tag from '@/models/Tag'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://relayworks.dev'

    const staticPages = [
        '/',
        '/about',
        '/projects',
        '/services',
        '/contact',
        '/blog',
        '/sitemap',
        '/discord-bot',
        '/ai-chatbot-development',
        '/mobile-app-development',
        '/cookie-policy',
        '/privacy-policy',
        '/terms-of-service'
    ]

    const staticRoutes = staticPages.map((route) => ({
        url: `${baseUrl}${route === '/' ? '' : route}`,
        changeFrequency: route === '/' ? 'weekly' as const : route === '/ai-chatbot-development' ? 'monthly' as const : 'yearly' as const,
        priority: route === '/' ? 1 : route === '/ai-chatbot-development' ? 0.9 : 0.7,
    }))

    try {
        // The core sitemap remains available even when the blog database is temporarily unavailable.
        await dbConnect()

        const posts = await Post.find({ status: 'published' }).select('slug updatedAt').lean()
        const categories = await Category.find({}).select('name updatedAt').lean()
        const tags = await Tag.find({}).select('name updatedAt').lean()

        const postRoutes = posts.map((post: any) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: new Date(post.updatedAt),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))

        const categoryRoutes = categories.map((cat: any) => ({
            url: `${baseUrl}/blog/category/${encodeURIComponent(cat.name)}`,
            lastModified: new Date(cat.updatedAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }))

        const tagRoutes = tags.map((tag: any) => ({
            url: `${baseUrl}/blog/tag/${encodeURIComponent(tag.name)}`,
            lastModified: new Date(tag.updatedAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.5,
        }))

        return [...staticRoutes, ...postRoutes, ...categoryRoutes, ...tagRoutes]
    } catch (error) {
        console.error('Unable to load dynamic sitemap routes:', error)
        return staticRoutes
    }
}
