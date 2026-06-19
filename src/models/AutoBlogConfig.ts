import mongoose, { Schema, model, models } from 'mongoose';

const AutoBlogConfigSchema = new Schema({
    key: { type: String, required: true, unique: true, default: "auto-blog" },
    allowedTopics: { 
        type: [String], 
        default: ["python", "kotlin", "compose", "android", "android os", "ios dev", "android dev", "fastapi"] 
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const AutoBlogConfig = models.AutoBlogConfig || model('AutoBlogConfig', AutoBlogConfigSchema);

export default AutoBlogConfig;
