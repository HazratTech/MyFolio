const prompt = "Abstract software engineering network nodes, coding background, clean vector illustration, dark blue tones, 16:9";
const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=630&nologo=true&enhance=false&model=flux`;

async function test() {
    console.log("Fetching:", imageUrl);
    const res = await fetch(imageUrl);
    console.log("Status:", res.status, res.statusText);
    const buf = Buffer.from(await res.arrayBuffer());
    console.log("Size:", buf.length);
}

test();
