const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key] = val.join('=');
    return acc;
}, {});

const { GoogleGenAI } = require('@google/genai');

async function test() {
    try {
        console.log("Initializing Gemini...");
        const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
        
        console.log("Generating Image...");
        const response = await ai.models.generateImages({
            model: "imagen-3.0-generate-001",
            prompt: "A beautiful futuristic web development workspace",
            config: {
                numberOfImages: 1,
                aspectRatio: "16:9",
                outputMimeType: "image/jpeg"
            }
        });
        
        console.log("SUCCESS! Result keys:", Object.keys(response));
        if (response.generatedImages && response.generatedImages.length > 0) {
            console.log("Image data exists! Length:", response.generatedImages[0].image.imageBytes.length);
        }
    } catch (e) {
        console.error("FAILED:", e.message);
    }
}
test();
