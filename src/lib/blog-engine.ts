import { GoogleGenAI, Type } from "@google/genai";
import Media from "@/models/Media";

const STORAGE_API_URL = "https://api-minio-storage.hazratdev.top";
const BUCKET = "myfolio";

// ─── Rate Limiting & Retry Utility ────────────────────────────────────────────
export async function respectRPM(delayMs = 6000) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
}

/** Execute an async operation with robust retries for transient LLM errors (429, 503, etc.) */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    label: string,
    retries = 6,
    initialDelayMs = 5000
): Promise<T> {
    let lastError: any = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await operation();
        } catch (err: any) {
            lastError = err;
            const errMsg = err instanceof Error ? err.message : String(err);
            const isTransient = errMsg.includes("503") || 
                                errMsg.includes("429") || 
                                errMsg.includes("RESOURCE_EXHAUSTED") ||
                                errMsg.includes("UNAVAILABLE") ||
                                errMsg.includes("temporary") ||
                                errMsg.includes("demand") ||
                                errMsg.includes("overloaded");
            
            if (attempt === retries) break;

            // Exponential backoff delay
            const delay = isTransient ? initialDelayMs * Math.pow(2, attempt - 1) : attempt * 3000;
            const jitter = Math.random() * 2000;
            console.warn(`    ⚠️ [${label}] Attempt ${attempt} failed: ${errMsg}. Retrying in ${Math.round(delay + jitter)}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay + jitter));
        }
    }
    throw lastError || new Error(`Operation "${label}" failed after all retry attempts.`);
}

// ─── Word Counter ─────────────────────────────────────────────────────────────
export function countWords(html: string): number {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().split(" ").length;
}

// ─── MinIO Buffer Upload ──────────────────────────────────────────────────────
async function uploadBuffer(
    buffer: Buffer,
    mimeType: string,
    filename: string
): Promise<{ url: string; key: string }> {
    const apiKey = process.env.STORAGE_API_KEY;
    if (!apiKey) throw new Error("STORAGE_API_KEY not configured");

    const initRes = await fetch(`${STORAGE_API_URL}/upload/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: apiKey },
        body: JSON.stringify({
            filename,
            file_type: mimeType,
            file_size: buffer.length,
            bucket: BUCKET,
        }),
    });
    if (!initRes.ok) throw new Error(`MinIO init failed: ${await initRes.text()}`);
    const { upload_url, object_key } = await initRes.json();

    const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: buffer as any,
    });
    if (!putRes.ok) throw new Error(`MinIO PUT failed: ${await putRes.text()}`);

    const completeRes = await fetch(`${STORAGE_API_URL}/upload/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: apiKey },
        body: JSON.stringify({
            object_key,
            file_size: buffer.length,
            file_type: mimeType,
            bucket: BUCKET,
        }),
    });
    if (!completeRes.ok) throw new Error(`MinIO complete failed: ${await completeRes.text()}`);

    const completeData = await completeRes.json();
    return { url: completeData.final_url, key: object_key };
}

// ─── Vision Validation ────────────────────────────────────────────────────────
export async function validateImageRelevance(
    ai: GoogleGenAI,
    imageUrl: string,
    topicContext: string
): Promise<boolean> {
    return retryOperation(async () => {
        // Download image and convert to base64 to pass as inline data
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
        const buffer = Buffer.from(await imageRes.arrayBuffer());
        const base64Image = buffer.toString("base64");
        const mimeType = imageRes.headers.get("content-type") || "image/jpeg";

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `Score this image 1-10 for relevance to: "${topicContext}"
Criteria: 1-3=unrelated/blurry/gibberish, 4-5=vaguely related, 6-7=reasonably related, 8-10=highly relevant.
Return JSON: {"score": number, "reason": "string"}`
                        },
                        {
                            inlineData: {
                                data: base64Image,
                                mimeType
                            }
                        }
                    ]
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER },
                        reason: { type: Type.STRING }
                    },
                    required: ["score", "reason"]
                }
            }
        });

        if (response?.text) {
            const result = JSON.parse(response.text);
            console.log(`    [Validation] Score: ${result.score}/10 — ${result.reason}`);
            return result.score >= 6;
        }
        return true;
    }, "Vision Validation");
}

// ─── Image Generation & Fallback ──────────────────────────────────────────────
export async function generateAndUploadImage(
    ai: GoogleGenAI,
    prompt: string,
    topicContext: string,
    filenamePrefix: string,
    altText: string,
    width = 1200,
    height = 630,
): Promise<{ url: string; key: string } | null> {

    // Fal.ai Flux Pro 1.1 first
    if (process.env.FAL_KEY) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                console.log(`    [Fal.ai] Attempt ${attempt} for "${filenamePrefix}"...`);
                const falRes = await fetch("https://fal.run/fal-ai/flux-pro/v1.1", {
                    method: "POST",
                    headers: {
                        "Authorization": `Key ${process.env.FAL_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        prompt,
                        image_size: "landscape_16_9",
                        num_images: 1,
                        enable_safety_checker: true,
                        sync_mode: true
                    })
                });

                if (!falRes.ok) {
                    const errText = await falRes.text();
                    if (falRes.status === 402 || errText.includes("insufficient") || errText.includes("balance")) {
                        console.warn(`    [Fal.ai] Balance exhausted. Switching to OpenAI...`);
                        break;
                    }
                    throw new Error(`Fal.ai status ${falRes.status}: ${errText}`);
                }

                const falData = await falRes.json();
                const imageUrl = falData.images[0].url;

                const isRelevant = await validateImageRelevance(ai, imageUrl, topicContext);

                if (isRelevant) {
                    const imageRes = await fetch(imageUrl);
                    if (!imageRes.ok) throw new Error("Failed to download Fal.ai image");

                    const buffer = Buffer.from(await imageRes.arrayBuffer());
                    const mimeType = imageRes.headers.get("content-type") || "image/jpeg";
                    const filename = `${filenamePrefix}-${Date.now()}.jpg`;

                    const { url, key } = await uploadBuffer(buffer, mimeType, filename);
                    await Media.create({
                        filename, url, key, mimeType,
                        size: buffer.length, altText,
                        dimensions: { width, height },
                    });
                    console.log(`    ✅ [Fal.ai] Image accepted for "${filenamePrefix}"`);
                    return { url, key };
                } else {
                    console.warn(`    [Fal.ai] Image rejected (off-topic). Switching to OpenAI...`);
                    break;
                }
            } catch (err) {
                console.warn(`    [Fal.ai] Attempt ${attempt} failed:`, err instanceof Error ? err.message : String(err));
                if (attempt < 2) await new Promise(r => setTimeout(r, 3000));
            }
        }
    }

    // OpenAI gpt-image-1 fallback
    if (process.env.OPEN_AI_KEY) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                console.log(`    [OpenAI] Attempt ${attempt} for "${filenamePrefix}"...`);
                const openAiRes = await fetch("https://api.openai.com/v1/images/generations", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.OPEN_AI_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "gpt-image-1",
                        prompt,
                        n: 1,
                        size: "1536x1024",
                        quality: "medium"
                    })
                });

                if (!openAiRes.ok) {
                    throw new Error(`OpenAI status ${openAiRes.status}: ${await openAiRes.text()}`);
                }

                const openAiData = await openAiRes.json();
                const imageBase64 = openAiData.data[0].b64_json;
                if (!imageBase64) throw new Error("b64_json not found in OpenAI response");

                const buffer = Buffer.from(imageBase64, "base64");
                const mimeType = "image/png";
                const filename = `${filenamePrefix}-${Date.now()}.png`;

                const { url, key } = await uploadBuffer(buffer, mimeType, filename);
                await Media.create({
                    filename, url, key, mimeType,
                    size: buffer.length, altText,
                    dimensions: { width, height },
                });
                console.log(`    ✅ [OpenAI] Image generated for "${filenamePrefix}"`);
                return { url, key };
            } catch (err) {
                console.warn(`    [OpenAI] Attempt ${attempt} failed:`, err instanceof Error ? err.message : String(err));
                if (attempt < 2) await new Promise(r => setTimeout(r, 3000));
            }
        }
    }

    return null;
}

// ─── OpenAI Chat Completion ──────────────────────────────────────────────────
export async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    return retryOperation(async () => {
        if (!process.env.OPEN_AI_KEY) throw new Error("OPEN_AI_KEY not configured");

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPEN_AI_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 16000
            })
        });

        if (!res.ok) {
            throw new Error(`OpenAI GPT-4o-mini failed: status ${res.status}: ${await res.text()}`);
        }

        const data = await res.json();
        return data.choices[0].message.content;
    }, "OpenAI API Call");
}

// ═══════════════════════════════════════════════════════════════════════════════
//  AGENT PIPELINE EXECUTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export async function runResearchAgent(
    ai: GoogleGenAI,
    topic: string,
    articleContext: string
): Promise<any> {
    console.log("🔍 Agent 1: Research Agent starting...");
    return retryOperation(async () => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a senior SEO research analyst at a tech agency called RelayWorks (https://relayworks.dev).

Analyze the following topic and provide deep competitive research:

TOPIC: "${topic}"
CONTEXT: ${articleContext}

Your job:
1. Identify the primary search intent (informational, commercial, transactional)
2. Determine the ideal target audience (junior devs? CTOs? startup founders?)
3. List 3-5 specific gaps that existing articles on this topic typically miss
4. Propose a unique angle that differentiates this article from competitors
5. Specify the technical depth level (beginner, intermediate, advanced)
6. Suggest a target word count (1500-3000)
7. List 5-8 related long-tail keywords to naturally weave in
8. List 2-3 authoritative external documentation links to cite

Return ONLY valid JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        keyword: { type: Type.STRING },
                        searchIntent: { type: Type.STRING },
                        targetAudience: { type: Type.STRING },
                        competitorGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                        uniqueAngle: { type: Type.STRING },
                        technicalDepth: { type: Type.STRING },
                        targetWordCount: { type: Type.INTEGER },
                        relatedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        externalLinks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { url: { type: Type.STRING }, anchorText: { type: Type.STRING } },
                                required: ["url", "anchorText"]
                            }
                        }
                    },
                    required: ["keyword", "searchIntent", "targetAudience", "competitorGaps", "uniqueAngle", "technicalDepth", "targetWordCount", "relatedKeywords", "externalLinks"]
                }
            }
        });

        if (!response?.text) throw new Error("Research Agent returned empty response");
        console.log("✅ Agent 1: Research complete");
        return JSON.parse(response.text);
    }, "Research Agent");
}

export async function runStrategistAgent(
    ai: GoogleGenAI,
    research: any,
    prompt: string,
    linksContext: string,
    linksList: string[] = []
): Promise<any> {
    console.log("📋 Agent 2: Content Strategist starting...");
    return retryOperation(async () => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a content strategist at RelayWorks tech agency. Using the research below, create a detailed article blueprint.

USER TOPIC/PROMPT: "${prompt}"
${linksContext}
RESEARCH DATA:
${JSON.stringify(research, null, 2)}

YOUR TASKS:
1. Create a compelling title (50-60 chars, SEO-optimized with primary keyword)
2. Write a meta description (140-155 chars)
3. Write a 2-sentence excerpt (max 160 chars)
4. Plan the full heading structure (H2/H3 hierarchy)
5. For EACH section, decide what TYPE of visual it needs:
   - "photo": A conceptual AI-generated illustration (use for hero concepts, abstract representations)
   - "diagram": A Mermaid.js flowchart/sequence/architecture diagram (use for system flows, architectures, data pipelines, decision trees)
   - "code": A code block with syntax highlighting (use for implementation sections)
   - "table": An HTML comparison/feature table (use for comparisons, specs, options)
   - "none": No visual needed for this section
6. Assign word count targets per section (total must match research.targetWordCount)
7. Plan CTA placement (exactly 2 natural placements for /discord-bot and /contact links)
8. Choose category: Android, iOS, Backend, Discord Bots, or Architecture

- Be DYNAMIC with visuals. Some articles may need 4 photos and 0 diagrams, others 1 photo and 3 diagrams.
- Use "diagram" for any architecture overviews, data flows, request lifecycles, state machines.
- Use "photo" for conceptual/hero visuals. Each photo prompt MUST describe: "Premium 3D isometric render, vibrant neon accents (cyan/purple/pink), deep dark background, NO text/labels/letters"
- **DYNAMIC TOPIC METAPHORS**: Tailor the visual prompts (cover and inline) specifically to the article's core subject. Do NOT output generic brain or processor images unless the topic is specifically about deep learning or processors. Use the following examples to guide your custom metaphor generation:
  - *Chatbots / Support*: A friendly, glowing 3D helper robot avatar floating above a smartphone, surrounding by neon chat bubbles or message threads.
  - *iOS / Android / Mobile*: A sleek 3D smartphone mockup displaying a colorful, abstract user interface, with designer UI layers floating around the screen.
  - *Databases / Cloud / Storage*: Sleek, glowing 3D database cylinder columns, holographic storage disks, or digital filing units.
  - *Security / Auth / Encryption*: A glowing 3D chrome security shield, a neon laser-grid vault, or a biometric fingerprint authentication node.
  - *API / Backend / Integrations*: Floating interconnected 3D neon spheres representing nodes, glowing data bridge pathways, or futuristic puzzle pieces snapping together.
  - *DevOps / Servers / Networks*: Clean rows of modern server racks in a dark server room, with glowing neon fiber-optic cables and active status lights.
  - *Performance / Optimisation / Speed*: A futuristic aerodynamic rocket dashboard, a glowing neon speedometer asset, or a stylized abstract timeline showing high-speed data flow.
- Each "diagram" must describe what the Mermaid diagram should show.
${linksList.length > 0 ? `Ensure affiliate links are embedded naturally in comparison tables or recommendation sections.` : ""}

Return ONLY valid JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        metaDescription: { type: Type.STRING },
                        category: { type: Type.STRING },
                        excerpt: { type: Type.STRING },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        coverImagePrompt: { type: Type.STRING },
                        sections: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    heading: { type: Type.STRING },
                                    headingLevel: { type: Type.STRING },
                                    targetWords: { type: Type.INTEGER },
                                    visualType: { type: Type.STRING },
                                    visualDescription: { type: Type.STRING }
                                },
                                required: ["heading", "headingLevel", "targetWords", "visualType", "visualDescription"]
                            }
                        },
                        ctaPlacements: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["title", "metaDescription", "category", "excerpt", "tags", "coverImagePrompt", "sections", "ctaPlacements"]
                }
            }
        });

        if (!response?.text) throw new Error("Strategist Agent returned empty response");
        console.log("✅ Agent 2: Strategy complete");
        return JSON.parse(response.text);
    }, "Strategist Agent");
}

export async function runWriterAgent(
    ai: GoogleGenAI,
    research: any,
    strategy: any,
    linksList: string[] = []
): Promise<string> {
    console.log("✍️  Agent 3: Content Writer starting...");

    const sectionsGuide = strategy.sections.map((s: any, i: number) => {
        let visualInstruction = "";
        if (s.visualType === "photo") {
            visualInstruction = `Place marker: [IMAGE: ${s.visualDescription}]`;
        } else if (s.visualType === "diagram") {
            visualInstruction = `Generate a valid Mermaid.js diagram wrapped in: <div class="mermaid">\\n...mermaid code...\\n</div>\\nDescription: ${s.visualDescription}`;
        } else if (s.visualType === "code") {
            visualInstruction = `Include a working code example in <pre><code class="language-xxx">...</code></pre>`;
        } else if (s.visualType === "table") {
            visualInstruction = `Include an HTML <table> with <thead>/<tbody> and relevant data`;
        } else {
            visualInstruction = "No visual needed";
        }
        return `Section ${i + 1}: <${s.headingLevel}>${s.heading}</${s.headingLevel}> (~${s.targetWords} words)\n  Visual: ${visualInstruction}`;
    }).join("\n\n");

    const affiliateWriterRule = linksList.length > 0
        ? `\n━━━━━ AFFILIATE LINKS ━━━━━\nNaturally embed these exact URLs using relevant anchor text:\n${linksList.map((l: string) => `- ${l}`).join("\n")}\nDo NOT change or fabricate URLs.\n`
        : "";

    return retryOperation(async () => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a senior technical writer at RelayWorks (https://relayworks.dev), a custom software development and automation agency.

Write a complete, publication-ready blog post following this exact blueprint:

TITLE: "${strategy.title}"
AUDIENCE: ${research.targetAudience}
UNIQUE ANGLE: ${research.uniqueAngle}
TECHNICAL DEPTH: ${research.technicalDepth}
RELATED KEYWORDS TO NATURALLY INCLUDE: ${research.relatedKeywords.join(", ")}
EXTERNAL LINKS TO CITE: ${research.externalLinks.map((l: any) => `${l.anchorText}: ${l.url}`).join(", ")}
${affiliateWriterRule}

SECTION BLUEPRINT:
${sectionsGuide}

CTA PLACEMENTS: ${strategy.ctaPlacements.join("; ")}
  - Use ONLY these CTA links: <a href="/discord-bot">RelayWorks Custom Bot Development</a> and <a href="/contact">Contact RelayWorks</a>
  - Integrate naturally, NO aggressive sales language

━━━━━ WRITING RULES ━━━━━
• Write the full post content in standard HTML. Start directly with the first section (do NOT repeat the title as H1 in the content).
• Write in neutral, authoritative third-person voice. Sound like a real engineer.
• NEVER fabricate statistics, benchmarks, or survey results.
• Avoid AI clichés: "Let's dive in", "Game changer", "In today's fast-paced world", "In conclusion", "Unlock", "Revolutionize", "Crucial"
• Code must be correct and runnable.
• Environment variables: use placeholders like YOUR_TOKEN_HERE.
• NO author review scores or subjective ratings.

━━━━━ VISUAL RULES ━━━━━
• [IMAGE: ...] markers: Place BETWEEN block elements, NEVER inside <p> tags.
• Mermaid diagrams: <div class="mermaid">...valid mermaid code...</div>. Quote node labels with special characters. Use proper Mermaid syntax (graph TD, sequenceDiagram, flowchart LR, etc).
  - **CRITICAL MERMAID SYNTAX RULE**: Do NOT use single quotes (') or commas (,) inside node shapes directly. For example, instead of A[KPIs 'Conversion Rate'] or B(CRM 'Salesforce'), you MUST enclose the text in double quotes inside the shapes: A["KPIs 'Conversion Rate'"] or B("CRM 'Salesforce'"). Never use raw single quotes inside parentheses or square brackets.
• Code blocks: <pre><code class="language-python">...</code></pre> (specify language).
• Tables: <table> with <thead> and <tbody>.

━━━━━ FORMAT ━━━━━
Return ONLY the raw HTML content. Do NOT wrap in markdown code blocks (\`\`\`html) or JSON.`,
        });

        if (!response?.text) throw new Error("Writer Agent returned empty response");
        let writerContent = response.text.trim();
        if (writerContent.startsWith("```html")) {
            writerContent = writerContent.substring(7);
        }
        if (writerContent.endsWith("```")) {
            writerContent = writerContent.substring(0, writerContent.length - 3);
        }
        console.log("✅ Agent 3: Writing complete");
        return writerContent.trim();
    }, "Writer Agent");
}

export async function runEditorAgent(
    content: string,
    strategy: any,
    research: any
): Promise<any> {
    console.log("🔬 Agent 4: Editor starting (GPT-4o-mini)...");
    const systemPrompt = `You are a senior technical editor. Review and improve this blog draft:
1. REMOVE AI slop: "Let's dive in", "Game changer", "Unlock", "Revolutionize", "Crucial", "Vital", "Delve", "Seamlessly", "Leverage"
2. Verify code syntax, improve readability, ensure developer-to-developer tone
3. Preserve <div class="mermaid"> blocks, verify no fabricated /blog/* URLs
4. Check word count > 1200
5. Clean up empty <p></p> tags
Return JSON: {"content": "cleaned HTML", "editorScore": 0-100, "changesLog": ["change1"]}`;

    const userPrompt = `TITLE: "${strategy.title}"\nDRAFT:\n${content}`;
    const result = await callOpenAI(systemPrompt, userPrompt);
    console.log("✅ Agent 4: Editing complete");
    return JSON.parse(result);
}

export async function runSEOAgent(
    content: string,
    strategy: any,
    research: any
): Promise<any> {
    console.log("📊 Agent 5: SEO Optimizer starting (GPT-4o-mini)...");
    const systemPrompt = `You are an SEO specialist. Optimize this blog:
1. Title 50-60 chars with keyword, meta 140-155 chars
2. Keyword density 3-5x naturally, related keywords woven in
3. Verify 2 external links + 2 internal CTAs (/discord-bot, /contact)
4. Generate 3 FAQ items for rich snippets
5. Preserve <div class="mermaid">, <pre><code>, <figure> blocks
Return JSON: {"title":"","metaDescription":"","content":"HTML","faqSchema":[{"question":"","answer":""}],"seoScore":0-100,"optimizations":[]}`;

    const userPrompt = `KEYWORD: "${research.keyword}"\nRELATED: ${research.relatedKeywords.join(", ")}\nTITLE: "${strategy.title}"\nMETA: "${strategy.metaDescription}"\n\nHTML:\n${content}`;
    const result = await callOpenAI(systemPrompt, userPrompt);
    console.log("✅ Agent 5: SEO optimization complete");
    return JSON.parse(result);
}

export async function runVisualCreatorAgent(
    ai: GoogleGenAI,
    content: string,
    coverPrompt: string,
    imageSlots: Array<{ placeholder: string; prompt: string }>,
    title: string,
    topicContext: string
): Promise<{ content: string; coverResult: any }> {
    console.log(`🎨 Agent 6: Visual Creator starting (${imageSlots.length} photos + 1 cover)...`);

    const coverResult = await generateAndUploadImage(
        ai,
        coverPrompt,
        topicContext,
        "cover",
        title,
        1200,
        630
    );

    const inlineResults: Array<{ slot: typeof imageSlots[0]; result: any }> = [];

    for (let i = 0; i < imageSlots.length; i++) {
        const slot = imageSlots[i];
        const result = await generateAndUploadImage(
            ai,
            slot.prompt,
            topicContext,
            `inline-${i}`,
            slot.prompt.slice(0, 100),
            1200,
            675
        );
        inlineResults.push({ slot, result });
        if (i < imageSlots.length - 1) await respectRPM(4000);
    }

    // Inject inline images
    let finalContent = content;
    let replacedCount = 0;

    while (true) {
        const markerRegex = /\[IMAGE:[^\]]*\]/i;
        const match = markerRegex.exec(finalContent);
        if (!match) break;

        const marker = match[0];
        const matchIndex = match.index;
        const resultObj = inlineResults[replacedCount];

        let replacement = "";
        if (resultObj?.result) {
            const figureHtml = `\n<figure class="blog-image">
  <img src="${resultObj.result.url}" alt="${resultObj.slot.prompt.slice(0, 120)}" loading="lazy" />
</figure>\n`;
            const before = finalContent.substring(0, matchIndex);
            const insideP = before.lastIndexOf("<p") > before.lastIndexOf("</p>");
            replacement = insideP ? `</p>${figureHtml}<p>` : figureHtml;
        }

        finalContent = finalContent.substring(0, matchIndex) + replacement + finalContent.substring(matchIndex + marker.length);
        replacedCount++;
    }

    finalContent = finalContent.replace(/\[IMAGE:[^\]]*\]/g, "");

    console.log(`✅ Agent 6: ${replacedCount} inline photos injected`);
    return { content: finalContent, coverResult };
}
