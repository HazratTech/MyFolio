import { Projects } from "@/components/sections/Projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shipped Software & Engineering Systems | RelayWorks",
    description: "Browse our commercial software portfolio: production native mobile apps (Kotlin/Compose, SwiftUI, KMP), scalable backend microservices, and high-concurrency Discord platform automation by Hazrat Ummar Shaikh.",
    alternates: {
        canonical: "https://relayworks.dev/projects",
    },
    openGraph: {
        title: "Shipped Software & Engineering Systems | RelayWorks",
        description: "Commercial native mobile apps, backend microservices, and Discord platform automations engineered by Hazrat Ummar Shaikh.",
        url: "https://relayworks.dev/projects",
        type: "website",
        images: [
            {
                url: "https://relayworks.dev/og-banner.png",
                width: 1200,
                height: 630,
                alt: "RelayWorks Projects Portfolio",
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Shipped Software & Engineering Systems | RelayWorks",
        description: "Commercial native mobile apps, backend microservices, and Discord platform automations.",
        images: ["https://relayworks.dev/og-banner.png"],
    }
};

export default function ProjectsPage() {
    return <Projects />;
}
