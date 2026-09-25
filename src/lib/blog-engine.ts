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

// ─── OpenAI Raw Text Completion (for articles & auto-completion) ──────────────
export async function callOpenAIText(systemPrompt: string, userPrompt: string): Promise<string> {
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
                temperature: 0.7,
                max_tokens: 16000
            })
        });

        if (!res.ok) {
            throw new Error(`OpenAI GPT-4o-mini text failed: status ${res.status}: ${await res.text()}`);
        }

        const data = await res.json();
        return data.choices[0].message.content;
    }, "OpenAI Text Call");
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
    const systemPrompt = `You are a Principal Software Architect and Technical SEO Specialist at RelayWorks (https://relayworks.dev). Return valid JSON only.`;
    const userPrompt = `Conduct deep, authoritative technical and competitive research on this topic to ensure 100% compliance with Google's Helpful Content System and E-E-A-T guidelines:

TOPIC: "${topic}"
CONTEXT: ${articleContext}

Your job:
1. Identify primary search intent (informational, architectural deep-dive, debugging/troubleshooting)
2. Target audience (Lead Engineers, Senior Backend/Mobile Developers, System Architects)
3. Core production failure scenario: What real-world production incident, bottleneck, or failure does this address?
4. 3-5 specific gaps that commodity/AI-generated articles miss (e.g. failure to discuss memory leaks, unhandled coroutine cancellations, connection pool exhaustion)
5. Unique angle that demonstrates genuine, battle-tested engineering experience
6. Concrete metrics to profile (p95/p99 latency in ms, memory heap dumps, CPU utilization, thread contention, throughput)
7. Technical depth level: "advanced"
8. Target word count: 1800 - 2800 words
9. 5-8 related long-tail keywords that engineers actually search for
10. 2-3 authoritative external documentation links (e.g. official Android Developer docs, Swift.org, FastAPI docs, PostgreSQL docs)
11. 3-4 real, practical edge-case FAQs that developers ask about this problem

Return ONLY valid JSON matching this schema:
{
  "keyword": "string",
  "searchIntent": "string",
  "targetAudience": "string",
  "coreProblem": "string",
  "competitorGaps": ["string"],
  "uniqueAngle": "string",
  "concreteMetrics": ["string"],
  "technicalDepth": "string",
  "targetWordCount": 2200,
  "relatedKeywords": ["string"],
  "externalLinks": [{"url": "string", "anchorText": "string"}],
  "faqTopics": ["string"]
}`;

    // Try Gemini Flash first
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        if (response?.text) {
            console.log("✅ Agent 1: Research complete (Gemini)");
            return JSON.parse(response.text);
        }
    } catch (err: any) {
        console.warn(`    ⚠️ Gemini Research failed (${err?.message || err}). Falling back to OpenAI...`);
    }

    // Failover to OpenAI
    const fallbackResult = await callOpenAI(systemPrompt, userPrompt);
    console.log("✅ Agent 1: Research complete (OpenAI fallback)");
    return JSON.parse(fallbackResult);
}

export async function runStrategistAgent(
    ai: GoogleGenAI,
    research: any,
    prompt: string,
    linksContext: string,
    linksList: string[] = []
): Promise<any> {
    console.log("📋 Agent 2: Content Strategist starting...");
    const systemPrompt = `You are the Lead Content Architect at RelayWorks tech agency (https://relayworks.dev). Return valid JSON only.`;
    const userPrompt = `Using the deep research below, create an article blueprint that fulfills Google's Helpful Content and E-E-A-T standards.

USER TOPIC/PROMPT: "${prompt}"
${linksContext}
RESEARCH DATA:
${JSON.stringify(research, null, 2)}

MANDATORY 8-PART E-E-A-T SECTION ARCHITECTURE:
Every article MUST plan these essential sections:
1. Section 1 (H2): Real-world Production Context & Problem Hook. (visualType: "photo" or "none")
2. Section 2 (H2): Executive Summary & Key Takeaways. (visualType: "takeaways")
   - visualDescription: "Highlight 3-4 concrete takeaways and the core solution in a takeaways-box"
3. Section 3 (H2): Under-the-Hood Root Cause & Architecture. (visualType: "diagram")
   - visualDescription: "A Mermaid.js diagram illustrating the request lifecycle, state machine, or data flow"
4. Section 4 (H2): Production Implementation & Runnable Solution. (visualType: "code")
   - visualDescription: "Production-ready, runnable code with comprehensive imports and error handling"
5. Section 5 (H2): Benchmarks & Architectural Trade-offs. (visualType: "table")
   - visualDescription: "An HTML comparison table comparing metrics (latency, memory, throughput, failure modes)"
6. Section 6 (H2): Production Gotchas & Anti-Patterns ("What NOT to do"). (visualType: "gotcha")
   - visualDescription: "3-4 subtle pitfalls (e.g. memory leaks, race conditions, CPU spikes) in a gotcha-box"
7. Section 7 (H2): Frequently Asked Questions. (visualType: "faq")
   - visualDescription: "3-4 authoritative Q&As answering critical edge cases"
8. Section 8 (H2): Architectural Takeaways & System Evolution. (visualType: "none")

VISUAL GUIDELINES:
- visualType MUST be one of: "takeaways", "diagram", "code", "table", "gotcha", "faq", "photo", "none".
- Cover photo prompt MUST describe: "Premium 3D isometric render, vibrant neon accents (cyan/purple/pink), deep dark background, NO text/labels/letters, 16:9 widescreen composition".
- Dynamic topic metaphors:
  - Chatbots/Support: 3D floating glowing robotic avatar with neon message threads.
  - Mobile (iOS/Android): Sleek 3D smartphone mockup with floating UI component layers and glassmorphism.
  - Databases/Storage: Glowing 3D cylindrical database nodes with holographic data sectors.
  - Backend/APIs: Interconnected glowing microservice nodes with fiber-optic data bridges.
  - DevOps/Cloud: Modern dark server racks with glowing neon fiber cables and telemetry lights.
  - Performance: Futuristic aerodynamic dashboard with neon telemetry readouts.

Return valid JSON with: title, metaDescription, category, excerpt, tags, coverImagePrompt, sections (array of {heading, headingLevel, targetWords, visualType, visualDescription}), ctaPlacements.`;

    // Try Gemini Flash first
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        if (response?.text) {
            console.log("✅ Agent 2: Strategy complete (Gemini)");
            return JSON.parse(response.text);
        }
    } catch (err: any) {
        console.warn(`    ⚠️ Gemini Strategist failed (${err?.message || err}). Falling back to OpenAI...`);
    }

    // Failover to OpenAI
    const fallbackResult = await callOpenAI(systemPrompt, userPrompt);
    console.log("✅ Agent 2: Strategy complete (OpenAI fallback)");
    return JSON.parse(fallbackResult);
}

// ─── Post Integrity Validator ────────────────────────────────────────────────
export function validatePostIntegrity(title: string, content: string): { valid: boolean; reason?: string } {
    const textOnly = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = textOnly.split(" ").filter(Boolean).length;

    if (words < 1200) {
        return { valid: false, reason: `Word count too low (${words} words). Minimum required is 1,200 words.` };
    }

    if (/\[IMAGE:[^\]]*\]?/i.test(content)) {
        return { valid: false, reason: "Post contains unreplaced [IMAGE: ...] placeholders." };
    }

    // Check for unclosed <pre> tags
    const preOpen = (content.match(/<pre[^>]*>/gi) || []).length;
    const preClose = (content.match(/<\/pre>/gi) || []).length;
    if (preOpen > preClose) {
        return { valid: false, reason: "Post contains unclosed <pre> code blocks." };
    }

    // Check for essential heading structure
    const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
    if (h2Count < 2) {
        return { valid: false, reason: "Post lacks required <h2> section heading hierarchy." };
    }

    // Check for abrupt endings
    const last50 = textOnly.slice(-50).trim();
    const isAbrupt = 
        last50.endsWith(",") || 
        last50.endsWith(":") || 
        last50.endsWith("and") || 
        last50.endsWith("the") || 
        last50.endsWith("a") || 
        last50.endsWith("an") || 
        last50.endsWith("for") || 
        last50.endsWith("with") || 
        last50.endsWith("like") || 
        last50.endsWith("just") || 
        !/[.!?"]$/.test(last50);

    if (isAbrupt) {
        return { valid: false, reason: `Post appears truncated at ending: "${last50.slice(-30)}"` };
    }

    return { valid: true };
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
            visualInstruction = `Place marker: [IMAGE: ${s.visualDescription} | ${s.heading} technical visual overview]`;
        } else if (s.visualType === "diagram") {
            visualInstruction = `Generate a valid Mermaid.js diagram wrapped in: <div class="mermaid">\n...valid mermaid code with double-quoted labels...\n</div>\nDescription: ${s.visualDescription}`;
        } else if (s.visualType === "code") {
            visualInstruction = `Include a complete, runnable code example with imports and error handling in <pre><code class="language-xxx">...</code></pre>`;
        } else if (s.visualType === "table") {
            visualInstruction = `Include an HTML <table> with <thead>/<tbody> comparing concrete technical metrics/options (e.g. Latency, Heap Memory, Throughput, Failure Resilience)`;
        } else if (s.visualType === "takeaways") {
            visualInstruction = `Render an executive summary callout card wrapped in: <div class="takeaways-box"><h4 class="takeaways-title">Executive Summary & Key Takeaways</h4><ul><li><strong>Key finding:</strong> actionable takeaway</li><li><strong>Architecture decision:</strong> why this pattern was chosen</li><li><strong>Performance outcome:</strong> measured result</li></ul></div>`;
        } else if (s.visualType === "gotcha") {
            visualInstruction = `Render a production pitfalls callout card wrapped in: <div class="gotcha-box"><h4 class="gotcha-title">Production Gotchas & Anti-Patterns</h4><ul><li><strong>Trap:</strong> explanation of subtle bug or failure mode</li><li><strong>Fix:</strong> concrete mitigation</li></ul></div>`;
        } else if (s.visualType === "faq") {
            visualInstruction = `Render 3-4 structured FAQ cards: <div class="faq-card"><h4>Q: ...</h4><p><strong>Answer:</strong> ...</p></div>`;
        } else {
            visualInstruction = "No visual needed";
        }
        return `Section ${i + 1}: <${s.headingLevel}>${s.heading}</${s.headingLevel}> (~${s.targetWords} words)\n  Visual: ${visualInstruction}`;
    }).join("\n\n");

    const affiliateWriterRule = linksList.length > 0
        ? `\n━━━━━ AFFILIATE LINKS ━━━━━\nNaturally embed these exact URLs using relevant anchor text:\n${linksList.map((l: string) => `- ${l}`).join("\n")}\nDo NOT change or fabricate URLs.\n`
        : "";

    const writerPrompt = `You are a Principal Software Architect writing for the RelayWorks Engineering Blog (https://relayworks.dev).

Write a deep, authoritative, publication-grade engineering case study following this exact blueprint:

TITLE: "${strategy.title}"
AUDIENCE: ${research.targetAudience} (Experienced developers, tech leads, system architects)
UNIQUE ANGLE: ${research.uniqueAngle}
TECHNICAL DEPTH: ${research.technicalDepth || "advanced"}
CORE FAILURE SCENARIO: ${research.coreProblem || "Production performance bottleneck and architectural edge cases"}
CONCRETE METRICS: ${research.concreteMetrics?.join(", ") || "Latency (ms), memory footprint, throughput, connection pool limits"}
RELATED KEYWORDS TO NATURALLY INCLUDE: ${research.relatedKeywords.join(", ")}
EXTERNAL LINKS TO CITE: ${research.externalLinks.map((l: any) => `${l.anchorText}: ${l.url}`).join(", ")}
${affiliateWriterRule}

SECTION BLUEPRINT:
${sectionsGuide}

CTA PLACEMENTS: ${strategy.ctaPlacements.join("; ")}
  - Use ONLY these CTA links: <a href="/discord-bot">RelayWorks Custom Bot Development</a> and <a href="/contact">Contact RelayWorks</a>
  - Integrate naturally as an engineering resource, NO aggressive sales pitch.

━━━━━ STRICT GOOGLE HELPFUL CONTENT & E-E-A-T WRITING STANDARDS ━━━━━
• VOICE: First-person authentic engineering voice ("In our production cluster...", "When profiling under load...", "Here is what broke and how we resolved it"). Sound like a battle-tested engineer who actually built, benchmarked, and debugged this system.
• IMMEDIATE VALUE (INFORMATION GAIN): Never write generic conversational filler. Right after the introduction hook, include the <div class="takeaways-box"> so the reader immediately gets 3-4 actionable technical takeaways.
• COMPLETENESS: You MUST write the entire article from start to finish (target 1,800 to 2,800 words). NEVER truncate, never leave sentences unfinished, and never stop mid-code block. Conclude with a strong Architectural Takeaways / Conclusion section.
• NO AI SLOP: Strictly BANNED words and phrases:
  - "Let's dive in", "Game changer", "In today's fast-paced world", "In conclusion", "Unlock", "Revolutionize", "Crucial", "Vital", "Delve", "Seamlessly", "Leverage", "Furthermore", "Moreover", "A testament to", "Tapestry", "Beacon", "Pivotal", "Navigating the complexities", "Fast-forward to today", "Without further ado", "Needless to say".
• CODE QUALITY: Every code snippet must be complete, runnable, and syntactically valid with realistic error handling, types, and imports. No pseudocode or "TODO: implement this". Always specify language (e.g. <pre><code class="language-kotlin"> or language-python, language-typescript, etc.).
• REALISTIC METRICS & TABLES: Ground discussions in concrete technical considerations (latency in ms, throughput, connection limits, memory heap, CPU profiling) rather than vague generic statements. Include a comparison <table> with <thead> and <tbody>.
• FORMAT: Return ONLY the raw HTML content starting directly with the first section (do NOT repeat title as H1). Do NOT wrap in markdown code blocks (\`\`\`html) or JSON.

━━━━━ VISUAL RULES ━━━━━
• [IMAGE: ...] markers: Place BETWEEN block elements, NEVER inside <p> tags. Format as: [IMAGE: prompt | caption]
• Mermaid diagrams: <div class="mermaid">...valid mermaid code...</div>. Quote node labels with double quotes: A["Label Here"].
• Code blocks: <pre><code class="language-xxx">...</code></pre> (always specify language).
• Tables: <table> with <thead> and <tbody>.`;

    let writerContent = "";
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: writerPrompt,
            config: {
                maxOutputTokens: 8192,
                temperature: 0.7,
            }
        });
        if (response?.text) {
            writerContent = response.text.trim();
        }
    } catch (err: any) {
        console.warn(`    ⚠️ Gemini Writer encountered error (${err?.message || err}). Failing over to OpenAI GPT-4o-mini...`);
        writerContent = await callOpenAIText(
            "You are a Principal Software Architect writing for the RelayWorks Engineering Blog (https://relayworks.dev). Return ONLY raw HTML starting directly with the first section without markdown code fences.",
            writerPrompt
        );
    }

    if (!writerContent) {
        throw new Error("Writer Agent returned empty content after all attempts.");
    }

    if (writerContent.startsWith("```html")) {
        writerContent = writerContent.substring(7);
    }
    if (writerContent.endsWith("```")) {
        writerContent = writerContent.substring(0, writerContent.length - 3);
    }
    writerContent = writerContent.trim();

    // ── Check if the generated content was truncated ────────────────────────
    let integrity = validatePostIntegrity(strategy.title, writerContent);
    if (!integrity.valid && integrity.reason?.includes("truncated")) {
        console.warn(`    ⚠️ Writer content ended abruptly (${integrity.reason}). Running auto-completion healing...`);
        try {
            const healPrompt = `The following technical article was cut off mid-sentence or mid-code block at the ending:
"...${writerContent.slice(-300)}"

Complete this thought and conclude the article properly.
Requirements:
1. If inside an unclosed code block, finish it and close with </code></pre>.
2. Provide a strong closing section: <h2>Architectural Takeaways & Conclusion</h2><p>...</p>.
3. Return ONLY the finishing HTML snippet to append directly to the end.`;

            const completion = await callOpenAIText(
                "You are an expert technical editor. Return only the finishing HTML snippet.",
                healPrompt
            );
            let cleanCompletion = completion.trim();
            if (cleanCompletion.startsWith("```html")) cleanCompletion = cleanCompletion.substring(7);
            if (cleanCompletion.endsWith("```")) cleanCompletion = cleanCompletion.substring(0, cleanCompletion.length - 3);

            writerContent = writerContent + "\n" + cleanCompletion.trim();
            console.log("    ✅ Writer content healed successfully.");
        } catch (healErr) {
            console.warn("    ⚠️ Failed to auto-complete ending:", healErr);
        }
    }

    // Ensure all <pre> tags are closed
    const preOpen = (writerContent.match(/<pre[^>]*>/gi) || []).length;
    const preClose = (writerContent.match(/<\/pre>/gi) || []).length;
    if (preOpen > preClose) {
        writerContent += "\n</code></pre>\n<p>Following these architectural patterns ensures high-throughput reliability in production.</p>";
    }

    console.log("✅ Agent 3: Writing complete");
    return writerContent.trim();
}

export async function runEditorAgent(
    content: string,
    strategy: any,
    _research: any
): Promise<any> {
    console.log("🔬 Agent 4: Editor linting (HTML cleanup)...");
    
    // Clean up obvious AI slop phrases surgically without running lossy full-text JSON rewriting
    let cleaned = content;
    const slopPatterns = [
        /\bIn today's fast-paced (world|landscape|tech environment),?\s*/gi,
        /\bLet's dive (in|deep into this),?\s*/gi,
        /\bIn conclusion,?\s*/gi,
        /\bAs a testament to [^,.]*,?\s*/gi,
        /\bIt is crucial to remember that\s*/gi,
        /\bNeedless to say,?\s*/gi,
        /\bWithout further ado,?\s*/gi,
        /\bGame[- ]changer,?\s*/gi,
    ];

    for (const pattern of slopPatterns) {
        cleaned = cleaned.replace(pattern, "");
    }

    // Clean empty tags
    cleaned = cleaned.replace(/<p>\s*<\/p>/gi, "");
    cleaned = cleaned.replace(/<p>&nbsp;<\/p>/gi, "");

    const integrity = validatePostIntegrity(strategy.title, cleaned);
    console.log(`✅ Agent 4: Linting complete (Integrity: ${integrity.valid ? "PASSED" : integrity.reason})`);

    return {
        content: cleaned,
        editorScore: integrity.valid ? 95 : 60,
        changesLog: integrity.valid ? ["Slop phrases scrubbed", "Empty tags cleaned"] : [integrity.reason || "Integrity warning"]
    };
}

export async function runSEOAgent(
    content: string,
    strategy: any,
    research: any
): Promise<any> {
    console.log("📊 Agent 5: SEO Optimizer starting (GPT-4o-mini)...");
    const systemPrompt = `You are a Principal Technical SEO Specialist at RelayWorks (https://relayworks.dev).
Given the article details, generate Google-compliant, high-CTR metadata and rich FAQ schema:
1. title: 50-60 chars max, keyword-frontloaded, compelling for senior engineers
2. metaDescription: 140-155 chars max, active voice, outlining the concrete takeaways
3. faqSchema: Array of 3-4 authoritative FAQ items with concrete, technical questions and clear answers.
4. seoScore: 0-100 rating
5. optimizations: Array of 2-3 specific optimizations applied

Return JSON: {"title":"","metaDescription":"","faqSchema":[{"question":"","answer":""}],"seoScore":0-100,"optimizations":[]}`;

    const userPrompt = `KEYWORD: "${research.keyword}"
RELATED: ${research.relatedKeywords?.join(", ") || ""}
TITLE: "${strategy.title}"
META: "${strategy.metaDescription}"
EXCERPT: "${strategy.excerpt}"
ARTICLE EXCERPT:
${content.replace(/<[^>]*>/g, " ").slice(0, 2000)}`;

    const result = await callOpenAI(systemPrompt, userPrompt);
    console.log("✅ Agent 5: SEO metadata complete");
    const parsed = JSON.parse(result);
    // Keep writer's full content untouched to prevent truncation
    return {
        ...parsed,
        content
    };
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

    // Google Discover requires minimum 1200px wide, landscape 16:9 (1200x675)
    const coverResult = await generateAndUploadImage(
        ai,
        coverPrompt,
        topicContext,
        "cover",
        title,
        1200,
        675
    );

    const inlineResults: Array<{ slot: typeof imageSlots[0]; result: any }> = [];

    for (let i = 0; i < imageSlots.length; i++) {
        const slot = imageSlots[i];
        let cleanPrompt = slot.prompt;
        if (cleanPrompt.includes("|")) {
            cleanPrompt = cleanPrompt.split("|")[0].trim();
        }

        const result = await generateAndUploadImage(
            ai,
            cleanPrompt,
            topicContext,
            `inline-${i}`,
            cleanPrompt.slice(0, 100),
            1200,
            675
        );
        inlineResults.push({ slot, result });
        if (i < imageSlots.length - 1) await respectRPM(4000);
    }

    // Inject inline images with semantic <figure class="blog-image"> and <figcaption>
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
            let promptText = resultObj.slot.prompt;
            let captionText = "";
            if (promptText.includes("|")) {
                const parts = promptText.split("|");
                promptText = parts[0].trim();
                captionText = parts[1].trim();
            } else {
                captionText = promptText.length > 90 ? promptText.slice(0, 90) + "..." : promptText;
            }

            const cleanAlt = promptText.replace(/"/g, "&quot;").slice(0, 120);
            const figureHtml = `\n<figure class="blog-image">
  <img src="${resultObj.result.url}" alt="${cleanAlt}" width="1200" height="675" loading="lazy" />
  <figcaption>${captionText}</figcaption>
</figure>\n`;
            const before = finalContent.substring(0, matchIndex);
            const insideP = before.lastIndexOf("<p") > before.lastIndexOf("</p>");
            replacement = insideP ? `</p>${figureHtml}<p>` : figureHtml;
        }

        finalContent = finalContent.substring(0, matchIndex) + replacement + finalContent.substring(matchIndex + marker.length);
        replacedCount++;
    }

    // Remove any remaining or unclosed image markers
    finalContent = finalContent.replace(/\[IMAGE:[^\]]*(?:\]|$)/gi, "");

    console.log(`✅ Agent 6: ${replacedCount} inline photos injected`);
    return { content: finalContent, coverResult };
}
