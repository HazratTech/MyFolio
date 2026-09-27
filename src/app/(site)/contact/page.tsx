import { Contact } from "@/components/sections/Contact";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Our Engineering Team | RelayWorks",
    description: "Get in touch directly with lead engineer Hazrat Ummar Shaikh at RelayWorks. Inquire about custom native mobile apps, backend microservices, and automation sprints.",
    alternates: {
        canonical: "https://relayworks.dev/contact",
    },
    openGraph: {
        title: "Contact RelayWorks | Lead Software Engineer",
        description: "Direct discovery and sprint inquiries for custom mobile apps, cloud backends, and Discord platform automations.",
        url: "https://relayworks.dev/contact",
        type: "website",
        images: [
            {
                url: "https://relayworks.dev/og-banner.png",
                width: 1200,
                height: 630,
                alt: "Contact RelayWorks",
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact Our Engineering Team | RelayWorks",
        description: "Get in touch directly with lead engineer Hazrat Ummar Shaikh at RelayWorks.",
        images: ["https://relayworks.dev/og-banner.png"],
    }
};

const contactSchema = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "ContactPage",
            "@id": "https://relayworks.dev/contact#webpage",
            "url": "https://relayworks.dev/contact",
            "name": "Contact Our Engineering Team | RelayWorks",
            "description": "Direct engineering inquiries for custom mobile applications, cloud backend architectures, and Discord platform automations.",
            "isPartOf": {
                "@id": "https://relayworks.dev/#website"
            },
            "about": {
                "@id": "https://relayworks.dev/#organization"
            },
            "mainEntity": {
                "@id": "https://relayworks.dev/about#person"
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
                    "name": "Contact",
                    "item": "https://relayworks.dev/contact"
                }
            ]
        }
    ]
};

export default function ContactPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
            />
            <Contact />
        </>
    );
}
