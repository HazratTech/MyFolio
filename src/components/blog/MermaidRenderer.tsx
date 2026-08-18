"use client";

import { useEffect } from "react";

/**
 * MermaidRenderer — Initializes Mermaid.js on blog pages.
 * Finds all <div class="mermaid"> blocks and renders them as SVG diagrams.
 * Uses suppressErrorRendering and pre-parsing to ensure no syntax errors ever pollute the DOM.
 */
export default function MermaidRenderer() {
    useEffect(() => {
        const renderMermaid = async () => {
            try {
                // Wait for custom fonts to load so SVG bounding box calculations are exact
                if (typeof window !== "undefined" && document.fonts) {
                    await document.fonts.ready;
                }

                const mermaid = (await import("mermaid")).default;
                mermaid.initialize({
                    startOnLoad: false,
                    suppressErrorRendering: true, // Prevents Mermaid from injecting error SVGs into document.body
                    theme: "dark",
                    themeVariables: {
                        darkMode: true,
                        background: "#0f172a",
                        primaryColor: "#6366f1",
                        primaryTextColor: "#e2e8f0",
                        primaryBorderColor: "#818cf8",
                        lineColor: "#6366f1",
                        secondaryColor: "#1e293b",
                        tertiaryColor: "#1e293b",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        nodeBorder: "#818cf8",
                        clusterBkg: "#1e293b",
                        clusterBorder: "#334155",
                        edgeLabelBackground: "#1e293b",
                        nodeTextColor: "#e2e8f0",
                    },
                    flowchart: {
                        htmlLabels: false,
                        curve: "basis",
                        padding: 20,
                    },
                    sequence: {
                        actorMargin: 50,
                        boxMargin: 10,
                        noteMargin: 10,
                        messageMargin: 35,
                    },
                });

                const elements = document.querySelectorAll(".mermaid");
                if (elements.length === 0) return;

                // Render each mermaid block
                for (let i = 0; i < elements.length; i++) {
                    const el = elements[i] as HTMLElement;
                    const code = el.textContent?.trim();
                    if (!code || el.getAttribute("data-processed") === "true") continue;

                    try {
                        // Pre-validate syntax first to prevent global DOM error injection
                        const isValid = await mermaid.parse(code, { suppressErrors: true });
                        if (!isValid) {
                            el.innerHTML = `<pre style="background:#1e293b;color:#94a3b8;padding:1rem;border-radius:8px;overflow-x:auto;font-size:0.85rem;border:1px solid #334155"><code>${code}</code></pre>`;
                            el.setAttribute("data-processed", "true");
                            continue;
                        }

                        const id = `mermaid-svg-${Date.now()}-${i}`;
                        const { svg } = await mermaid.render(id, code);
                        el.innerHTML = svg;
                        el.setAttribute("data-processed", "true");
                    } catch (err) {
                        console.warn(`Mermaid render skipped for block ${i}:`, err);
                        // Show raw code as clean fallback
                        el.innerHTML = `<pre style="background:#1e293b;color:#94a3b8;padding:1rem;border-radius:8px;overflow-x:auto;font-size:0.85rem;border:1px solid #334155"><code>${code}</code></pre>`;
                        el.setAttribute("data-processed", "true");

                        // Remove any stray error elements injected by Mermaid
                        document.querySelectorAll('[id^="dmermaid"]').forEach((errEl) => errEl.remove());
                    }
                }
            } catch (err) {
                console.warn("Mermaid.js failed to load:", err);
            } finally {
                // Ensure all stray Mermaid error elements are purged
                if (typeof document !== "undefined") {
                    document.querySelectorAll('[id^="dmermaid"]').forEach((errEl) => errEl.remove());
                }
            }
        };

        const timer = setTimeout(renderMermaid, 300);
        return () => {
            clearTimeout(timer);
            if (typeof document !== "undefined") {
                document.querySelectorAll('[id^="dmermaid"]').forEach((errEl) => errEl.remove());
            }
        };
    }, []);

    return null;
}
