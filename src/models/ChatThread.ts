import mongoose, { Schema, Document } from "mongoose";

export interface IChatThread extends Document {
    discordThreadId?: string;
    discordChannelId?: string;
    userName: string;
    userEmail?: string;
    status: "open" | "closed";
    createdAt: Date;
    updatedAt: Date;
}

const ChatThreadSchema = new Schema(
    {
        discordThreadId: { type: String, required: false },
        discordChannelId: { type: String, required: false },
        userName: { type: String, required: true },
        userEmail: { type: String, required: false },
        status: { type: String, enum: ["open", "closed"], default: "open" },
    },
    { timestamps: true }
);

export const ChatThread = mongoose.models.ChatThread || mongoose.model<IChatThread>("ChatThread", ChatThreadSchema);
