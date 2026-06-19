import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function test() {
    console.log("Testing Gemini Image Generation...");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const response = await ai.models.generateImages({
            model: "imagen-3.0-generate-002",
            prompt: "A futuristic city skyline at night, cyberpunk style",
            config: {
                numberOfImages: 1,
                aspectRatio: "16:9",
                outputMimeType: "image/jpeg"
            }
        });
        console.log("Success! Image generated.");
        console.log(response.generatedImages[0].image.imageBytes.slice(0, 50) + "...");
    } catch (e) {
        console.error("Error:", e.message);
    }
}

test();
