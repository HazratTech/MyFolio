import type { Metadata } from "next";
import { AboutLanding } from "@/components/sections/AboutLanding";

export const metadata: Metadata = {
    title: "About Hazrat Ummar Shaikh | Lead Software Engineer | RelayWorks",
    description: "Learn more about Hazrat Ummar Shaikh, lead software engineer and founder of RelayWorks, specializing in production native mobile apps, deterministic AI chatbots, Discord bot infrastructure, and scalable APIs.",
    alternates: {
        canonical: "https://relayworks.dev/about",
    },
    openGraph: {
        title: "About Hazrat Ummar Shaikh | RelayWorks",
        description: "Independent boutique software studio. Production native mobile apps, deterministic AI chatbots, Discord bots, and scalable backends with 100% source code ownership.",
        url: "https://relayworks.dev/about",
        images: [
            {
                url: "https://relayworks.dev/og-banner.png",
                width: 1200,
                height: 630,
                alt: "About Hazrat Ummar Shaikh | RelayWorks",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "About Hazrat Ummar Shaikh | RelayWorks",
        description: "Independent senior engineer building production native mobile apps, AI chatbots, and backend architectures.",
        images: ["https://relayworks.dev/og-banner.png"],
    },
};

export default function AboutPage() {
    return <AboutLanding />;
}
