import fs from 'fs';
import mongoose from 'mongoose';

// Read .env.local
const envContent = fs.readFileSync('/Volumes/SSD/Coding/website/myfolio/.env.local', 'utf-8');
const envVars = Object.fromEntries(
  envContent
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')];
    })
);

const MONGODB_URI = envVars.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("No MONGODB_URI found in .env.local");
  process.exit(1);
}

await mongoose.connect(MONGODB_URI, { dbName: 'myfolio' });

const PostSchema = new mongoose.Schema({
  title: String,
  slug: String,
  excerpt: String,
  content: String,
  category: String,
  tags: [String],
  status: String,
  readingTime: Number,
  views: Number,
  createdAt: Date,
  publishedAt: Date,
});

const Post = mongoose.model('Post', PostSchema);

const posts = await Post.find().sort({ createdAt: -1 }).lean();
console.log(`Total posts found: ${posts.length}`);

const slopKeywords = [
  "game changer", "game-changer", "dive in", "delve", "unlock", "revolutionize",
  "in today's fast-paced", "crucial", "vital", "seamlessly", "leverage", "in conclusion",
  "test post", "lorem ipsum", "sample post"
];

const analysis = posts.map(p => {
  const content = p.content || '';
  const textOnly = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textOnly.split(' ').filter(Boolean).length;
  const slopHits = slopKeywords.filter(k => textOnly.toLowerCase().includes(k));

  return {
    id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    category: p.category,
    status: p.status,
    wordCount,
    slopCount: slopHits.length,
    slopHits,
    createdAt: p.createdAt,
    hasImages: content.includes('<img') || content.includes('<figure'),
    hasMermaid: content.includes('mermaid'),
    hasCode: content.includes('<pre') || content.includes('<code'),
    excerpt: (p.excerpt || '').slice(0, 100),
  };
});

fs.writeFileSync(
  '/Volumes/SSD/Coding/website/myfolio/scripts/posts-summary.json',
  JSON.stringify(analysis, null, 2)
);

console.log("\n--- POSTS SUMMARY ---");
for (const a of analysis) {
  console.log(`[${a.status}] (words: ${a.wordCount}) [slop: ${a.slopCount}] "${a.title}" (${a.slug})`);
}

await mongoose.disconnect();
