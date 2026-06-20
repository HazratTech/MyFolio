import mongoose, { Schema, model, models } from 'mongoose';

const PostSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true }, // Markdown/MDX
    excerpt: { type: String },
    coverImage: { type: String },
    coverImageKey: { type: String }, // Store the object key for deletion
    author: { type: String, default: "Hazrat Ummar Shaikh" },
    tags: [{ type: String }], // References by slug or name
    category: { type: String }, // References by slug or name
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    views: { type: Number, default: 0 },
    readingTime: { type: Number }, // In minutes
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date },
}, { timestamps: true });

// Prevent Mongoose model recompilation error in development
if (mongoose.models.Post) {
    delete mongoose.models.Post;
}

export interface IPost {
    _id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    coverImageKey?: string;
    author: string;
    tags?: string[];
    category?: string;
    status: 'draft' | 'published';
    views: number;
    featured: boolean;
    readingTime?: number;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const Post = models.Post || model('Post', PostSchema);

export default Post;
