import type { Metadata } from "next";
import { ServicesLanding } from "@/components/sections/ServicesLanding";

export const metadata: Metadata = {
    title: "Software Engineering Services & Sprints | RelayWorks",
    description: "Commission production native mobile applications, deterministic AI chatbots, custom Discord bot infrastructure, and scalable backend APIs with 100% source code ownership.",
    alternates: {
        canonical: "https://relayworks.dev/services",
    },
    openGraph: {
        title: "Software Engineering Services & Sprints | RelayWorks",
        description: "Commission production native mobile apps, scalable backend APIs, custom Discord infrastructure, and AI automations with transparent milestone sprints.",
        url: "https://relayworks.dev/services",
        images: [
            {
                url: "https://relayworks.dev/og-banner.png",
                width: 1200,
                height: 630,
                alt: "RelayWorks Software Engineering Services & Sprints",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Software Engineering Services & Sprints | RelayWorks",
        description: "Commission production native mobile apps, scalable backend APIs, custom Discord infrastructure, and AI automations with transparent milestone sprints.",
        images: ["https://relayworks.dev/og-banner.png"],
    },
};

export default function ServicesPage() {
    return <ServicesLanding />;
}
