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
        
        // Find all tags in order
        const tagRegex = /<(h2|h3|p|figure|pre)[^>]*>([\s\S]*?)<\/\1>/gi;
        let match;
        console.log("Document structure:");
        while ((match = tagRegex.exec(post.content)) !== null) {
            const tag = match[1].toLowerCase();
            let preview = match[2].replace(/<[^>]*>/g, '').slice(0, 80).replace(/\n/g, ' ');
            if (tag === 'figure') {
                const imgMatch = match[0].match(/src="([^"]*)"/);
                preview = `[IMAGE: ${imgMatch ? imgMatch[1] : 'no url'}]`;
            }
            console.log(` - <${tag}>: ${preview}...`);
        }
    } else {
        console.log("Post not found");
    }
    process.exit(0);
}
test().catch(e => { console.error(e); process.exit(1); });
