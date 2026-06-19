import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({}, { strict: false });
const Post = mongoose.models.Post || mongoose.model("Post", PostSchema, "posts");

async function check() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "myfolio" });
    const post = await Post.findOne().sort({ createdAt: -1 });
    console.log("Title:", post.title);
    console.log("Cover Image:", post.coverImage);
    console.log("Content Preview:");
    // Extract image tags
    console.log("Cover Prompt:", post.coverImagePrompt);
    console.log("Raw Image Slots:", post.imageSlots);
    // Exit
    
    process.exit(0);
}

check().catch(console.error);
