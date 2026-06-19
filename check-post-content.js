const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key.trim()] = val.join('=').trim();
    return acc;
}, {});
const mongoose = require('mongoose');

async function test() {
    await mongoose.connect(env.MONGODB_URI);
    const db = mongoose.connection;
    const post = await db.collection('posts').findOne({ slug: 'taming-the-kraken-strategies-for-modernizing-and-maintaining-legacy-codebases' });
    if(post) {
        console.log("COVER IMAGE:", post.coverImage);
        console.log("---CONTENT FIRST 1500 CHARS---");
        console.log(post.content.substring(0, 1500));
    } else {
        console.log("Post not found");
    }
    process.exit(0);
}
test().catch(e => { console.error(e); process.exit(1); });
