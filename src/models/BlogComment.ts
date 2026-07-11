import mongoose, { Schema, model, models } from 'mongoose';

const BlogCommentSchema = new Schema({
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    name: { type: String, required: true },
    emailHash: { type: String, required: true },
    content: { type: String, required: true },
    approved: { type: Boolean, default: true }
}, { timestamps: true });

// Prevent model compilation errors in development
if (mongoose.models.BlogComment) {
    delete mongoose.models.BlogComment;
}

const BlogComment = models.BlogComment || model('BlogComment', BlogCommentSchema);

export default BlogComment;
