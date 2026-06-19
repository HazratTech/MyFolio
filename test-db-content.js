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
    const posts = await db.collection('posts').find({}).sort({createdAt: -1}).limit(1).toArray();
    if(posts.length > 0) {
        console.log("CONTENT SNIPPET:", posts[0].content.substring(0, 500));
    }
    process.exit(0);
}
test();
