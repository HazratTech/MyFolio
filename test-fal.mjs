

async function test() {
    console.log("Testing Fal.ai integration...");
    try {
        const falRes = await fetch("https://fal.run/fal-ai/flux/schnell", {
            method: "POST",
            headers: {
                "Authorization": `Key ${process.env.FAL_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: "A beautiful cinematic shot of a coding workspace, cyberpunk neon lighting, 16:9",
                image_size: "landscape_16_9",
                num_inference_steps: 4,
                num_images: 1,
                enable_safety_checker: true,
                sync_mode: true
            })
        });

        if (!falRes.ok) {
            throw new Error(`Fal.ai fetch failed with status ${falRes.status}: ${await falRes.text()}`);
        }

        const falData = await falRes.json();
        const imageUrl = falData.images[0].url;
        console.log("Success! Generated image URL:", imageUrl);
    } catch (e) {
        console.error(e.message);
    }
}

test();
