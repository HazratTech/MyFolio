import mongoose, { Schema, model, models } from 'mongoose';

const TagSchema = new Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
}, { timestamps: true });

// Prevent Mongoose model recompilation error in development
if (mongoose.models.Tag) {
    delete mongoose.models.Tag;
}

const Tag = models.Tag || model('Tag', TagSchema);

export default Tag;
