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
        '/discord-bot',
        '/ai-chatbot-development',
        '/cookie-policy',
        '/privacy-policy',
        '/terms-of-service'
    ]

    const staticRoutes = staticPages.map((route) => ({
        url: `${baseUrl}${route === '/' ? '' : route}`,
        lastModified: new Date(),
        changeFrequency: route === '/' ? 'monthly' as const : 'yearly' as const,
        priority: route === '/' ? 1 : 0.8,
    }))

    // Dynamic Blog Routes
    await dbConnect()

    const posts = await Post.find({ status: 'published' }).select('slug updatedAt').lean()
    const categories = await Category.find({}).select('name updatedAt').lean()
    const tags = await Tag.find({}).select('name updatedAt').lean()

    const postRoutes = posts.map((post: any) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }))

    const categoryRoutes = categories.map((cat: any) => ({
        url: `${baseUrl}/blog/category/${encodeURIComponent(cat.name)}`,
        lastModified: new Date(cat.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    const tagRoutes = tags.map((tag: any) => ({
        url: `${baseUrl}/blog/tag/${encodeURIComponent(tag.name)}`,
        lastModified: new Date(tag.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    return [...staticRoutes, ...postRoutes, ...categoryRoutes, ...tagRoutes]
}
