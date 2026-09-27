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

const servicesSchema = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebPage",
            "@id": "https://relayworks.dev/services#webpage",
            "url": "https://relayworks.dev/services",
            "name": "Software Engineering Services & Sprints | RelayWorks",
            "description": "Production native mobile apps, scalable backend APIs, custom Discord infrastructure, and AI automations with transparent milestone sprints.",
            "isPartOf": {
                "@id": "https://relayworks.dev/#website"
            },
            "about": {
                "@id": "https://relayworks.dev/#organization"
            }
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://relayworks.dev"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Services",
                    "item": "https://relayworks.dev/services"
                }
            ]
        }
    ]
};

export default function ServicesPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
            />
            <ServicesLanding />
        </>
    );
}
