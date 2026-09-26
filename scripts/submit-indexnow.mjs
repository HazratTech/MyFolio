import fs from 'fs';
import mongoose from 'mongoose';

const envContent = fs.readFileSync('/Volumes/SSD/Coding/website/myfolio/.env.local', 'utf-8');
const envVars = Object.fromEntries(
  envContent.split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => {
    const idx = l.indexOf('=');
    return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')];
  })
);

async function submitIndexNow() {
  await mongoose.connect(envVars.MONGODB_URI, { dbName: 'myfolio' });
  const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }));
  const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
  const [posts, categories] = await Promise.all([
    Post.find({ status: 'published' }).select('slug').lean(),
    Category.find({}).select('name').lean()
  ]);

  const staticUrls = [
    'https://relayworks.dev',
    'https://relayworks.dev/about',
    'https://relayworks.dev/projects',
    'https://relayworks.dev/services',
    'https://relayworks.dev/contact',
    'https://relayworks.dev/blog',
    'https://relayworks.dev/sitemap',
    'https://relayworks.dev/discord-bot',
    'https://relayworks.dev/ai-chatbot-development',
    'https://relayworks.dev/mobile-app-development',
    'https://relayworks.dev/privacy-policy',
    'https://relayworks.dev/terms-of-service',
    'https://relayworks.dev/cookie-policy'
  ];

  const categoryUrls = categories.map(c => `https://relayworks.dev/blog/category/${encodeURIComponent(c.name)}`);
  const postUrls = posts.map(p => `https://relayworks.dev/blog/${p.slug}`);
  const allUrls = [...staticUrls, ...categoryUrls, ...postUrls];

  console.log(`Submitting ${allUrls.length} URLs to IndexNow API...`);

  const payload = {
    host: 'relayworks.dev',
    key: '8fa792c3104e4e97a31dc152e72bc462',
    keyLocation: 'https://relayworks.dev/8fa792c3104e4e97a31dc152e72bc462.txt',
    urlList: allUrls
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });

    console.log(`IndexNow status: ${res.status} (${res.statusText})`);
    if (res.ok || res.status === 200 || res.status === 202) {
      console.log('✅ Successfully submitted all URLs to IndexNow network (Bing, Yandex, Seznam, Naver)!');
    } else {
      console.log('IndexNow notice:', await res.text());
    }
  } catch (err) {
    console.error('IndexNow submission failed:', err);
  }

  await mongoose.disconnect();
}

submitIndexNow();
