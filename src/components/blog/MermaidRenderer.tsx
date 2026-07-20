"use client";

import { useEffect } from "react";

/**
 * MermaidRenderer — Initializes Mermaid.js on blog pages.
 * Finds all <div class="mermaid"> blocks and renders them as SVG diagrams.
 * Uses dynamic import to avoid SSR issues.
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
                        htmlLabels: false, // Use native SVG labels to prevent HTML clipping
                        curve: "basis",
                        padding: 20, // Increase padding inside nodes
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
                        const { svg } = await mermaid.render(`mermaid-svg-${i}`, code);
                        el.innerHTML = svg;
                        el.setAttribute("data-processed", "true");
                    } catch (err) {
                        console.warn(`Mermaid render failed for block ${i}:`, err);
                        // Show the raw code in a styled fallback
                        el.innerHTML = `<pre style="background:#1e293b;color:#94a3b8;padding:1rem;border-radius:8px;overflow-x:auto;font-size:0.85rem;border:1px solid #334155"><code>${code}</code></pre>`;
                        el.setAttribute("data-processed", "true");
                    }
                }
            } catch (err) {
                console.warn("Mermaid.js failed to load:", err);
            }
        };

        // Small delay to ensure DOM content is ready
        const timer = setTimeout(renderMermaid, 300);
        return () => clearTimeout(timer);
    }, []);

    return null;
}
