const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key] = val.join('=');
    return acc;
}, {});
const mongoose = require('mongoose');

async function test() {
    await mongoose.connect(env.MONGODB_URI);
    const db = mongoose.connection;
    const posts = await db.collection('posts').find({ slug: 'taming-the-kraken-strategies-for-modernizing-and-maintaining-legacy-codebases' }).toArray();
    if(posts.length > 0) {
        console.log("CONTENT SNIPPET:");
        console.log(posts[0].content.substring(0, 500));
        console.log("---");
        console.log("TAGS:", posts[0].tags);
        console.log("COVER IMAGE:", posts[0].coverImage);
    }
    process.exit(0);
}
test();
