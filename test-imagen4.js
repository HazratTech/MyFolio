const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key] = val.join('=');
    return acc;
}, {});
const { GoogleGenAI } = require('@google/genai');

async function test() {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const response = await ai.models.generateImages({
        model: "imagen-4.0-fast-generate-001",
        prompt: "A beautiful futuristic web development workspace",
        config: {
            numberOfImages: 1,
            aspectRatio: "16:9",
            outputMimeType: "image/jpeg"
        }
    });
    console.log("SUCCESS!");
}
test();
