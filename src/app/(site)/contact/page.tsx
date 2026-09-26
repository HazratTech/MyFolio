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
    }
};

export default function ContactPage() {
    return <Contact />;
}
