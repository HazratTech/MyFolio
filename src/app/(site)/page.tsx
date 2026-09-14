import { LandingPage } from "@/components/layout/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RelayWorks | Boutique Software Engineering Studio",
  description: "RelayWorks is an independent boutique software engineering studio led by Hazrat Ummar Shaikh. We engineer production native Android & iOS apps (Kotlin/Compose, SwiftUI, KMP), high-throughput Spring Boot & FastAPI backends, and custom Discord bot automation.",
  alternates: {
    canonical: "https://relayworks.dev",
  },
  keywords: [
    "RelayWorks",
    "Boutique Software Engineering Studio",
    "Custom Mobile App Development",
    "Native Android App Developer",
    "Hire Kotlin Developer",
    "Kotlin Multiplatform Consulting",
    "SwiftUI iOS App Development",
    "Kotlin Spring Boot Backend Development",
    "FastAPI Microservices",
    "Discord Bot Development Agency",
    "Hazrat Ummar Shaikh"
  ],
  openGraph: {
    title: "RelayWorks | Boutique Software Engineering Studio",
    description: "Independent engineering studio led by Hazrat Ummar Shaikh. Production Native Android & iOS apps, Kotlin Multiplatform, Spring Boot backends, and Discord automation. Direct senior builder access.",
    url: "https://relayworks.dev",
    siteName: "RelayWorks",
    images: [
      {
        url: "https://relayworks.dev/og-banner.png",
        width: 1200,
        height: 630,
        alt: "RelayWorks Boutique Software Engineering Studio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RelayWorks | Boutique Software Engineering Studio",
    description: "Production mobile apps, scalable backend systems, and custom automation. Direct senior engineer execution.",
    images: ["https://relayworks.dev/og-banner.png"],
  },
};

const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://relayworks.dev/#organization",
      "name": "RelayWorks",
      "url": "https://relayworks.dev",
      "logo": {
        "@type": "ImageObject",
        "url": "https://relayworks.dev/icon.png"
      },
      "image": "https://relayworks.dev/og-banner.png",
      "description": "Independent boutique software engineering studio specializing in native mobile applications (Kotlin, Compose, SwiftUI, KMP), high-throughput backend microservices (Spring Boot, FastAPI), and custom business automation.",
      "founder": {
        "@type": "Person",
        "name": "Hazrat Ummar Shaikh",
        "jobTitle": "Independent Senior Software Engineer & Studio Founder",
        "url": "https://relayworks.dev/about",
        "sameAs": [
          "https://github.com/ihazratummar",
          "https://play.google.com/store/apps/dev?id=8511073495389394372"
        ]
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Support & Engineering",
        "email": "hazratummar9@gmail.com",
        "url": "https://relayworks.dev/contact"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Engineering Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Native & Multiplatform Mobile App Development",
              "url": "https://relayworks.dev/mobile-app-development",
              "description": "Production Native Android (Kotlin & Compose), iOS (SwiftUI), and Kotlin Multiplatform (KMP) applications with local-first delta-sync and 60FPS fluid UI."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "High-Throughput Backend & Microservice Engineering",
              "url": "https://relayworks.dev/services",
              "description": "High-concurrency REST and WebSocket APIs built with Kotlin Spring Boot, Ktor, and FastAPI backed by PostgreSQL and MongoDB."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Custom Discord Bot & Platform Automation",
              "url": "https://relayworks.dev/discord-bot",
              "description": "High-concurrency community automation bots, custom moderation engines, Stripe checkout sync, and event-driven game integrations."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "AI Assistants & Business Workflows",
              "url": "https://relayworks.dev/ai-chatbot-development",
              "description": "Targeted web and WhatsApp assistants that ingest proprietary knowledge bases, qualify inbound prospects, and sync with CRM databases."
            }
          }
        ]
      }
    }
  ]
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <LandingPage />
    </>
  );
}
