import mongoose, { Schema, model, models } from 'mongoose';

export interface ILead {
    _id?: string;
    title: string;
    company: string;
    category: 'Mobile Apps' | 'Discord Bots' | 'AI & Chatbots' | 'Backend';
    decisionMaker: string;
    email: string;
    source: string;
    sourceUrl?: string;
    status: 'New' | 'Contacted' | 'In Discussion' | 'Closed' | 'Archived';
    score: number; // 0 - 100
    confidence: 'High' | 'Medium' | 'Low';
    painSignal: string;
    techStack: string[];
    personalizedEmail: {
        subject: string;
        body: string;
    };
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const LeadSchema = new Schema<ILead>({
    title: { type: String, required: true },
    company: { type: String, required: true },
    category: { 
        type: String, 
        required: true, 
        enum: ['Mobile Apps', 'Discord Bots', 'AI & Chatbots', 'Backend'] 
    },
    decisionMaker: { type: String, required: true },
    email: { type: String, required: true },
    source: { type: String, required: true },
    sourceUrl: { type: String },
    status: { 
        type: String, 
        default: 'New', 
        enum: ['New', 'Contacted', 'In Discussion', 'Closed', 'Archived'] 
    },
    score: { type: Number, default: 85 },
    confidence: { type: String, default: 'High', enum: ['High', 'Medium', 'Low'] },
    painSignal: { type: String, required: true },
    techStack: [{ type: String }],
    personalizedEmail: {
        subject: { type: String, required: true },
        body: { type: String, required: true },
    },
    notes: { type: String, default: '' },
}, { timestamps: true });

// Prevent Mongoose model recompilation error in development
if (mongoose.models.Lead) {
    delete mongoose.models.Lead;
}

const Lead = models.Lead || model<ILead>('Lead', LeadSchema);

export default Lead;

