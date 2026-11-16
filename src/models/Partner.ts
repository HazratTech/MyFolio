import mongoose, { Schema, model, models } from 'mongoose';

export interface IPartner {
    _id?: string;
    name: string;
    handle: string; // unique slug from Shopify directory
    websiteUrl?: string;
    partnerDirectoryUrl: string;
    country: string;
    location?: string;
    services: string[];
    description?: string;
    startingBudget?: string;
    rating?: number;
    reviewCount?: number;
    teamSize?: string;
    email?: string;
    contactName?: string;
    status: 'New' | 'Pitched' | 'In Discussion' | 'Partnered' | 'Archived';
    personalizedPitch?: {
        subject: string;
        body: string;
        angle?: 'white-label' | 'concise' | 'technical-audit';
        modelUsed?: string;
        generatedAt?: Date;
    };
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const PartnerSchema = new Schema<IPartner>({
    name: { type: String, required: true },
    handle: { type: String, required: true, unique: true },
    websiteUrl: { type: String },
    partnerDirectoryUrl: { type: String, required: true },
    country: { type: String, default: 'US' },
    location: { type: String },
    services: [{ type: String }],
    description: { type: String },
    startingBudget: { type: String, default: '$1,000 - $5,000' },
    rating: { type: Number, default: 5 },
    reviewCount: { type: Number, default: 0 },
    teamSize: { type: String, default: '2 - 9' },
    email: { type: String },
    contactName: { type: String },
    status: { 
        type: String, 
        default: 'New', 
        enum: ['New', 'Pitched', 'In Discussion', 'Partnered', 'Archived'] 
    },
    personalizedPitch: {
        subject: { type: String },
        body: { type: String },
        angle: { type: String, default: 'white-label' },
        modelUsed: { type: String, default: 'gpt-4o' },
        generatedAt: { type: Date }
    },
    notes: { type: String, default: '' },
}, { timestamps: true });

if (mongoose.models.Partner) {
    delete mongoose.models.Partner;
}

const Partner = models.Partner || model<IPartner>('Partner', PartnerSchema);

export default Partner;
