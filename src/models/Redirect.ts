import mongoose, { Schema, model, models } from 'mongoose';

export interface IRedirect {
    _id: string;
    source: string;
    destination: string;
    permanent: boolean;
    hitCount: number;
    lastAccessedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const RedirectSchema = new Schema({
    source: { type: String, required: true, unique: true, index: true },
    destination: { type: String, required: true },
    permanent: { type: Boolean, default: true },
    hitCount: { type: Number, default: 0 },
    lastAccessedAt: { type: Date }
}, { timestamps: true });

// Prevent Mongoose model recompilation error in development
if (mongoose.models.Redirect) {
    delete mongoose.models.Redirect;
}

const Redirect = models.Redirect || model('Redirect', RedirectSchema);

export default Redirect;
