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
    const post = await db.collection('posts').findOne({}, { sort: { createdAt: -1 } });
    if(post) {
        console.log("TITLE:", post.title);
        console.log("SLUG:", post.slug);
        console.log("COVER IMAGE:", post.coverImage);
        
        // Count <img> tags in content
        const imgCount = (post.content.match(/<img/g) || []).length;
        console.log("Number of images in content:", imgCount);
        
        // Find all img tags and show their details
        const imgRegex = /<img[^>]*src="([^"]*)"[^>]*>/g;
        let match;
        console.log("Inline Image URLs:");
        while ((match = imgRegex.exec(post.content)) !== null) {
            console.log(" -", match[1]);
        }

        console.log("---CONTENT---");
        console.log(post.content);
    } else {
        console.log("Post not found");
    }
    process.exit(0);
}
test().catch(e => { console.error(e); process.exit(1); });
