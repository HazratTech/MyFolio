import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
    threadId: string;
    discordMessageId?: string;
    sender: "user" | "admin";
    content: string;
    createdAt: Date;
}

const ChatMessageSchema = new Schema(
    {
        threadId: { type: String, required: true, index: true },
        discordMessageId: { type: String, required: false, unique: true, sparse: true },
        sender: { type: String, enum: ["user", "admin"], required: true },
        content: { type: String, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
