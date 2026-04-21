import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "oklch(0.15 0.02 250)",
                foreground: "oklch(0.98 0 0)",
                card: "oklch(0.18 0.02 250)",
                "card-foreground": "oklch(0.98 0 0)",
                popover: "oklch(0.18 0.02 250)",
                "popover-foreground": "oklch(0.98 0 0)",
                primary: "oklch(0.60 0.20 250)",
                "primary-foreground": "oklch(0.98 0 0)",
                secondary: "oklch(0.65 0.18 310)",
                "secondary-foreground": "oklch(0.98 0 0)",
                muted: "oklch(0.25 0.02 250)",
                "muted-foreground": "oklch(0.60 0.01 250)",
                accent: "oklch(0.55 0.15 190)",
                "accent-foreground": "oklch(0.98 0 0)",
                destructive: "oklch(0.55 0.25 25)",
                "destructive-foreground": "oklch(0.98 0 0)",
                border: "oklch(0.30 0.02 250)",
                input: "oklch(0.30 0.02 250)",
                ring: "oklch(0.60 0.20 250)",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
                heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
            },
            keyframes: {
                blob: {
                    "0%": { transform: "translate(0px, 0px) scale(1)" },
                    "33%": { transform: "translate(30px, -50px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
                    "100%": { transform: "translate(0px, 0px) scale(1)" },
                },
            },
            animation: {
                blob: "blob 7s infinite",
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
} satisfies Config;
