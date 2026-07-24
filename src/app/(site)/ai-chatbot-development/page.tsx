import type { Metadata } from "next";
import { AIChatbotLanding } from "@/components/sections/AIChatbotLanding";

export const metadata: Metadata = {
    title: "AI Chatbot Development Services | RelayWorks",
    description:
        "Custom AI chatbot development for websites, WhatsApp, Discord, Telegram, customer support automation, lead qualification, appointment booking, CRM integration, and business workflow automation.",
    alternates: {
        canonical: "/ai-chatbot-development",
    },
    keywords: [
        "AI chatbot development",
        "AI chatbot for website",
        "WhatsApp chatbot development",
        "business automation",
        "AI agent development",
        "customer support automation",
        "lead generation chatbot",
        "appointment booking chatbot",
        "CRM integration",
        "workflow automation",
        "OpenAI integration",
        "Claude integration",
        "Gemini integration",
    ],
    openGraph: {
        title: "AI Chatbot Development Services | RelayWorks",
        description:
            "Build custom AI chatbots that answer customers instantly, qualify leads, book appointments, and automate workflows across your website, WhatsApp, Discord, and Telegram.",
        url: "https://relayworks.dev/ai-chatbot-development",
        images: [
            {
                url: "https://relayworks.dev/og-banner.png",
                width: 1200,
                height: 630,
                alt: "AI Chatbot Development Services | RelayWorks",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Chatbot Development Services | RelayWorks",
        description:
            "Custom AI chatbot development for support automation, lead generation, booking, CRM sync, and workflow automation.",
        images: ["https://relayworks.dev/og-banner.png"],
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Service",
            "@id": "https://relayworks.dev/ai-chatbot-development#service",
            name: "AI Chatbot Development Services",
            provider: {
                "@type": "Organization",
                name: "RelayWorks",
                url: "https://relayworks.dev",
            },
            serviceType: "AI Chatbot Development",
            areaServed: "Worldwide",
            description:
                "Custom AI chatbots for website support, WhatsApp automation, lead qualification, appointment booking, CRM integration, and business workflow automation.",
            offers: {
                "@type": "Offer",
                availability: "https://schema.org/InStock",
                priceCurrency: "USD",
                url: "https://relayworks.dev/ai-chatbot-development",
            },
            hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "AI chatbot and automation services",
                itemListElement: [
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "Website AI Chatbot Development",
                        },
                    },
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "WhatsApp Chatbot Development",
                        },
                    },
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "Customer Support Automation",
                        },
                    },
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "CRM and Workflow Automation",
                        },
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
                    name: "What is included in AI chatbot development?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "RelayWorks builds custom AI chatbots with conversation design, knowledge base setup, OpenAI or Claude integration, CRM sync, lead capture, appointment booking, testing, deployment, and support.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Can you build a chatbot for my website and WhatsApp?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. RelayWorks builds chatbots for websites, WhatsApp, Discord, Telegram, Slack, and custom business systems.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Can the chatbot hand off to a human?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. Chatbots can detect high-intent or complex conversations and hand them off to your team through live chat, email, Slack, Discord, or your CRM.",
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
