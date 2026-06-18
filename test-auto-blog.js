const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key] = val.join('=');
    return acc;
}, {});

const { GoogleGenAI } = require('@google/genai');

async function test() {
    try {
        console.log("Fetching Dev.to...");
        const devToRes = await fetch('https://dev.to/api/articles?top=1&per_page=5');
        const articles = await devToRes.json();
        const selectedArticle = articles[0]; // Just take first for testing
        console.log("Selected article:", selectedArticle.title);

        console.log("Initializing Gemini...");
        const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
        
        const prompt = `Write a 1-paragraph summary of: "${selectedArticle.title}"`;
        
        console.log("Generating...");
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        console.log("SUCCESS! Result:");
        console.log(response.text);
    } catch (e) {
        console.error("FAILED:", e.message);
    }
}
test();
