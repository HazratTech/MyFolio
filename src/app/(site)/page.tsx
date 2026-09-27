import { LandingPage } from "@/components/layout/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RelayWorks — Production Mobile Apps & Scalable Systems",
  description: "Work directly with senior engineer Hazrat Ummar Shaikh. We engineer production-grade Android & KMP mobile apps, resilient cloud backends, and custom automations with verified code and transparent sprint milestones.",
  alternates: {
    canonical: "https://relayworks.dev",
  },
  keywords: [
    "RelayWorks",
    "Production Mobile Apps",
    "Native Android App Developer",
    "Hire Kotlin Developer",
    "Kotlin Multiplatform Consulting",
    "SwiftUI iOS App Development",
    "Kotlin Spring Boot Backend Development",
    "FastAPI Microservices",
    "Discord Bot Development",
    "Hazrat Ummar Shaikh"
  ],
  openGraph: {
    title: "RelayWorks — Production Mobile Apps & Scalable Systems",
    description: "From offline-first Android apps to high-concurrency cloud backends, we build and ship software that scales. Work directly with senior engineer Hazrat Ummar Shaikh — zero agency bloat, 100% verified code.",
    url: "https://relayworks.dev",
    siteName: "RelayWorks",
    images: [
      {
        url: "https://relayworks.dev/og-banner.png",
        width: 1200,
        height: 630,
        alt: "RelayWorks — Production Mobile Apps, Scalable Backends & AI Systems",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RelayWorks — Production Mobile Apps & Scalable Systems",
    description: "Offline-first Android & KMP mobile apps, scalable cloud backends, and custom automations. Work directly with senior engineer Hazrat Ummar Shaikh.",
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
      "description": "Software engineering studio specializing in production native mobile applications (Kotlin, Compose, SwiftUI, KMP), high-throughput backend microservices (Spring Boot, FastAPI), and custom business automation.",
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
