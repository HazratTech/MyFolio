const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key.trim()] = val.join('=').trim();
    return acc;
}, {});
const mongoose = require('mongoose');

async function test() {
    await mongoose.connect(env.MONGODB_URI, { dbName: "myfolio" });
    const db = mongoose.connection;
    const posts = await db.collection('posts').find({}).sort({ createdAt: -1 }).limit(10).toArray();
    for (const post of posts) {
        console.log(`Title: ${post.title}`);
        console.log(`  Slug: ${post.slug}`);
        const imgCount = (post.content.match(/<img/g) || []).length;
        console.log(`  <img> tags in content: ${imgCount}`);
        const bracketImageCount = (post.content.match(/\[IMAGE:/gi) || []).length;
        console.log(`  Remaining [IMAGE: markers: ${bracketImageCount}`);
        // Let's find any occurrences of words containing "IMAGE" or bracket patterns
        const matches = post.content.match(/\[[^\]]*IMAGE[^\]]*\]/gi) || [];
        if (matches.length > 0) {
            console.log(`  Other potential markers:`, matches);
        }
    }
    process.exit(0);
}
test().catch(e => { console.error(e); process.exit(1); });
