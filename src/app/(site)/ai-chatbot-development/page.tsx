import type { Metadata } from "next";
import { AIChatbotLanding } from "@/components/sections/AIChatbotLanding";

export const metadata: Metadata = {
    title: "Custom AI Chatbot & Automation Engineering | RelayWorks",
    description:
        "Bespoke AI chatbot development and conversational automation for websites, WhatsApp Business, and CRMs. Grounded vector RAG knowledge bases, zero hallucinations, automated calendar scheduling, and 100% full source code ownership.",
    alternates: {
        canonical: "/ai-chatbot-development",
    },
    keywords: [
        "AI chatbot development services",
        "WhatsApp chatbot development",
        "custom AI agent engineering",
        "RAG chatbot for business",
        "conversational AI agency",
        "HubSpot chatbot integration",
        "automated appointment booking chatbot",
        "customer support deflection bot",
        "enterprise conversational AI",
        "lead qualification chatbot",
        "B2B AI chatbot developer",
        "Hazrat Ummar Shaikh AI",
    ],
    openGraph: {
        title: "AI Chatbot & Conversational Automation Engineering | RelayWorks",
        description:
            "Stop losing inbound leads while your office is closed. We engineer production AI assistants for your website and WhatsApp with zero hallucinations, instant calendar booking, and 100% code ownership.",
        url: "https://relayworks.dev/ai-chatbot-development",
        images: [
            {
                url: "https://relayworks.dev/og-banner.png",
                width: 1200,
                height: 630,
                alt: "AI Chatbot & Conversational Automation Engineering | RelayWorks",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Chatbot & Conversational Automation Engineering | RelayWorks",
        description:
            "Production AI chatbots and conversational agents for website and WhatsApp. Grounded RAG, instant CRM sync, and direct senior engineer collaboration.",
        images: ["https://relayworks.dev/og-banner.png"],
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Service",
            "@id": "https://relayworks.dev/ai-chatbot-development#service",
            name: "AI Chatbot & Conversational Automation Engineering",
            provider: {
                "@type": "Organization",
                name: "RelayWorks",
                url: "https://relayworks.dev",
            },
            serviceType: "Conversational AI and Business Automation",
            areaServed: "Worldwide",
            description:
                "Custom AI chatbots and conversational automation for websites, WhatsApp Business, and CRMs. Features grounded vector RAG on verified company documents, zero hallucinations, automated calendar booking, and 100% client source code ownership.",
            offers: {
                "@type": "AggregateOffer",
                priceCurrency: "USD",
                lowPrice: "350",
                highPrice: "1600",
                offerCount: "3",
                url: "https://relayworks.dev/ai-chatbot-development",
            },
            hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Conversational AI Engineering Sprints",
                itemListElement: [
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "Starter Assistant Sprint",
                            description: "Focused single-channel AI assistant for website or WhatsApp with vector RAG knowledge base and lead qualification.",
                        },
                        price: "350",
                        priceCurrency: "USD",
                    },
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "Growth Automation Sprint",
                            description: "Dual-channel conversational automation across website and WhatsApp with real-time calendar booking, two-way CRM sync, and human escalation.",
                        },
                        price: "750",
                        priceCurrency: "USD",
                    },
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "Enterprise Agent Architecture",
                            description: "Multi-agent systems with private database querying, custom admin dashboards, and dedicated engineering retainers.",
                        },
                        price: "1600",
                        priceCurrency: "USD",
                    },
                ],
            },
        },
        {
            "@type": "FAQPage",
            "@id": "https://relayworks.dev/ai-chatbot-development#faq",
            mainEntity: [
                {
                    "@type": "Question",
                    name: "How do you ensure the AI chatbot will not hallucinate or quote wrong prices?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "We implement strict Retrieval-Augmented Generation (RAG). The LLM is never allowed to guess. Every incoming query triggers a semantic search against your verified company knowledge base. The model is instructed with deterministic system bounds to answer exclusively from the retrieved text.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Can you connect it to our WhatsApp Business account?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. We engineer integrations using the official Meta WhatsApp Business Cloud API. We handle webhook registration, template configuration, and message routing so your business can engage leads directly on WhatsApp.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Do I own the full source code and data?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes, 100%. Unlike SaaS chatbot builders that lock your conversation data, prompts, and flows into their proprietary platform, RelayWorks delivers clean, documented source code directly to your repository.",
                    },
                },
            ],
        },
    ],
};

export default function AIChatbotDevelopmentPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <AIChatbotLanding />
        </>
    );
}
