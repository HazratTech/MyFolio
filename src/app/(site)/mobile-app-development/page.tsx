import type { Metadata } from "next";
import { MobileAppLanding } from "@/components/sections/MobileAppLanding";

export const metadata: Metadata = {
    title: "Native Mobile App Development Services (Android, iOS & KMP) | RelayWorks",
    description:
        "High-performance native mobile app development in Kotlin, Jetpack Compose, SwiftUI, and Kotlin Multiplatform (KMP). Offline-first architecture, background delta sync, and robust Kotlin Spring Boot backends.",
    alternates: {
        canonical: "https://relayworks.dev/mobile-app-development",
    },
    keywords: [
        "native android app developer",
        "hire kotlin jetpack compose developer",
        "swiftui ios app developer",
        "kotlin multiplatform app development",
        "offline first mobile app developer",
        "custom mobile app development services",
        "compose multiplatform development",
        "kotlin spring boot backend developer",
        "hire mobile app developer",
        "b2b mobile app development"
    ],
    openGraph: {
        title: "Native Mobile App Development Services (Android, iOS & KMP) | RelayWorks",
        description:
            "Custom native mobile applications engineered for offline reliability, 60FPS declarative UI, and zero data loss. Direct senior engineer access.",
        url: "https://relayworks.dev/mobile-app-development",
        images: [
            {
                url: "https://relayworks.dev/og-banner.png",
                width: 1200,
                height: 630,
                alt: "Native Mobile App Development Services | RelayWorks",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Native Mobile App Development Services | RelayWorks",
        description:
            "Production native Android (Kotlin/Compose) and iOS (SwiftUI) mobile engineering backed by Kotlin Spring Boot systems.",
        images: ["https://relayworks.dev/og-banner.png"],
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Service",
            "@id": "https://relayworks.dev/mobile-app-development#service",
            name: "Native Mobile App Development Services",
            serviceType: "Mobile Application Development",
            description:
                "Production native mobile app development in Kotlin, Jetpack Compose, SwiftUI, and Kotlin Multiplatform (KMP) with offline-first Room database delta sync and Kotlin Spring Boot server infrastructure.",
            provider: {
                "@type": "Organization",
                name: "RelayWorks",
                url: "https://relayworks.dev",
                logo: "https://relayworks.dev/logo-brand.png",
            },
            areaServed: "Worldwide",
            hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Mobile App Development Packages",
                itemListElement: [
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "Native Android MVP",
                            description:
                                "100% Native Kotlin & Jetpack Compose, local Room database offline storage, REST API sync, biometric auth, and Google Play Store approval.",
                        },
                        price: "1490.00",
                        priceCurrency: "USD",
                    },
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "Android & iOS Native Suite",
                            description:
                                "Jetpack Compose (Android) + SwiftUI (iOS) powered by Kotlin Multiplatform (KMP/CMP), offline delta sync engine, in-app purchases, and Apple App Store + Google Play Store deployment.",
                        },
                        price: "3490.00",
                        priceCurrency: "USD",
                    },
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "Complete Mobile + Backend System",
                            description:
                                "Dual-platform mobile client with custom Kotlin Spring Boot backend microservices, PostgreSQL, MongoDB, real-time WebSockets, and Docker/GitHub Actions CI/CD with 60-day SLA.",
                        },
                        price: "6490.00",
                        priceCurrency: "USD",
                    },
                ],
            },
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "5.0",
                reviewCount: "24",
                bestRating: "5",
            },
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://relayworks.dev",
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: "Services",
                    item: "https://relayworks.dev/services",
                },
                {
                    "@type": "ListItem",
                    position: 3,
                    name: "Mobile App Development",
                    item: "https://relayworks.dev/mobile-app-development",
                },
            ],
        },
        {
            "@type": "FAQPage",
            "@id": "https://relayworks.dev/mobile-app-development#faq",
            mainEntity: [
                {
                    "@type": "Question",
                    name: "Why use Kotlin Multiplatform (KMP/CMP) + SwiftUI instead of Flutter or React Native?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Flutter uses an artificial canvas renderer that does not look or feel native to iOS, while React Native relies on bridge serialization that can cause frame drops on complex lists. Kotlin Multiplatform allows us to write 100% native UI in Jetpack Compose on Android and SwiftUI on iOS while sharing 80% of business logic, database queries, and network sync in pure Kotlin without runtime performance penalties.",
                    },
                },
                {
                    "@type": "Question",
                    name: "How does the offline-first architecture handle data sync conflicts?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "We implement local-first SQLite/Room storage where user actions are recorded immediately with local timestamps and mutation logs. When the device reconnects to network, a background Delta Sync worker pushes atomic batches to our Spring Boot/PostgreSQL backend with automated field-level conflict resolution, guaranteeing zero data loss.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Do you guarantee Apple App Store and Google Play Store approval?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. Every mobile contract includes complete store submission support, privacy policy compliance, app icon asset bundling, signing key configuration, and direct resolution of any store review feedback until your application is live in production.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Do I receive 100% ownership of the source code and IP?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes, completely. Upon final milestone completion, full source code repositories (Android, iOS, and Backend) are transferred to your organization GitHub/GitLab account along with CI/CD deployment scripts and zero vendor lock-in.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Can you build the backend microservices as well as the mobile apps?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. We specialize in full-stack mobile systems using Kotlin Spring Boot, PostgreSQL, MongoDB, and Docker. This ensures your mobile client and backend API are engineered by the same senior builder, eliminating communication friction between frontend and server developers.",
                    },
                },
                {
                    "@type": "Question",
                    name: "How are project milestones and payments structured?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Projects are divided into 3 transparent milestones: 1) Architecture & UI Prototypes (30%), 2) Core Feature Development & Offline Sync (40%), and 3) Final Store Release & Source Transfer (30%). You review working test builds before releasing milestone funds.",
                    },
                },
            ],
        },
    ],
};

export default function MobileAppPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <MobileAppLanding />
        </>
    );
}
