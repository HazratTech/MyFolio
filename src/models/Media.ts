import mongoose, { Schema, model, models } from 'mongoose';

const MediaSchema = new Schema({
    filename: { type: String, required: true },
    url: { type: String, required: true },
    key: { type: String, required: true, unique: true }, // MinIO Object Key
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }, // In bytes
    altText: { type: String, default: '' },
    caption: { type: String, default: '' },
    dimensions: {
        width: Number,
        height: Number
    }
}, { timestamps: true });

// Prevent Mongoose model recompilation error in development
if (mongoose.models.Media) {
    delete mongoose.models.Media;
}

export interface IMedia {
    _id: string;
    filename: string;
    url: string;
    key: string;
    mimeType: string;
    size: number;
    altText?: string;
    caption?: string;
    dimensions?: {
        width: number;
        height: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const Media = models.Media || model('Media', MediaSchema);

export default Media;
