import type { Metadata } from "next";
import { AboutLanding } from "@/components/sections/AboutLanding";

export const metadata: Metadata = {
    title: "About Hazrat Ummar Shaikh | Founder & Lead Engineer",
    description: "Learn more about Hazrat Ummar Shaikh, lead software engineer and founder of RelayWorks, specializing in production native mobile apps, deterministic AI chatbots, Discord bot infrastructure, and scalable APIs.",
    alternates: {
        canonical: "https://relayworks.dev/about",
    },
    openGraph: {
        title: "About Hazrat Ummar Shaikh | RelayWorks",
        description: "Meet Hazrat Ummar Shaikh, founder and lead engineer at RelayWorks. Building production native mobile apps, scalable backends, and custom automations with 100% verified code.",
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

const aboutSchema = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebPage",
            "@id": "https://relayworks.dev/about#webpage",
            "url": "https://relayworks.dev/about",
            "name": "About Hazrat Ummar Shaikh | Founder & Lead Engineer",
            "description": "Learn more about Hazrat Ummar Shaikh, lead software engineer and founder of RelayWorks.",
            "isPartOf": {
                "@id": "https://relayworks.dev/#website"
            },
            "about": {
                "@id": "https://relayworks.dev/about#person"
            }
        },
        {
            "@type": "Person",
            "@id": "https://relayworks.dev/about#person",
            "name": "Hazrat Ummar Shaikh",
            "givenName": "Hazrat Ummar",
            "familyName": "Shaikh",
            "jobTitle": "Senior Software Engineer & Founder",
            "description": "Independent senior software engineer specializing in production native mobile app architecture (Kotlin, Jetpack Compose, SwiftUI, KMP), high-throughput backend microservices (Spring Boot, FastAPI), and AI-powered business automation. Founder of RelayWorks.",
            "url": "https://relayworks.dev/about",
            "image": "https://relayworks.dev/og-banner.png",
            "email": "hazratummar9@gmail.com",
            "sameAs": [
                "https://github.com/ihazratummar",
                "https://www.linkedin.com/in/hazrat-ummar-shaikh/",
                "https://x.com/ihazratummar9",
                "https://play.google.com/store/apps/dev?id=8511073495389394372"
            ],
            "worksFor": {
                "@type": "Organization",
                "@id": "https://relayworks.dev/#organization",
                "name": "RelayWorks",
                "url": "https://relayworks.dev"
            },
            "knowsAbout": [
                "Android Development",
                "Kotlin",
                "Jetpack Compose",
                "iOS Development",
                "SwiftUI",
                "Kotlin Multiplatform",
                "Spring Boot",
                "FastAPI",
                "PostgreSQL",
                "MongoDB",
                "Discord Bot Development",
                "AI Chatbot Development",
                "Retrieval-Augmented Generation",
                "Docker",
                "Microservice Architecture"
            ],
            "alumniOf": [],
            "nationality": {
                "@type": "Country",
                "name": "India"
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
                    "name": "About",
                    "item": "https://relayworks.dev/about"
                }
            ]
        }
    ]
};

export default function AboutPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
            />
            <AboutLanding />
        </>
    );
}
