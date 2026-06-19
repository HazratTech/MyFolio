const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key] = val.join('=');
    return acc;
}, {});
const { GoogleGenAI } = require('@google/genai');

async function test() {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const response = await ai.models.list();
    for await (const model of response) {
        if (model.name.includes("image")) console.log(model.name);
    }
}
test();
