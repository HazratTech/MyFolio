import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { GoogleAdSense } from "@/components/analytics/GoogleAdSense";
import { FacebookPixelRouteTracker } from "@/components/analytics/FacebookPixel";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { LiveChatWidget } from "@/components/chat/LiveChatWidget";
import { cn } from "@/lib/utils";
import Script from "next/script";
import { Suspense } from "react";
import { TopProgressBar } from "@/components/layout/TopProgressBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  metadataBase: new URL("https://relayworks.dev"),
  alternates: {
    canonical: "https://relayworks.dev",
  },
  title: "RelayWorks | Boutique Software Engineering Studio — Mobile, Backends & Automation",
  description: "RelayWorks is an independent boutique software engineering studio led by Hazrat Ummar Shaikh. We engineer production native Android & iOS apps (Kotlin/Compose, SwiftUI, KMP), scalable Spring Boot backends, and custom automation.",
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
  authors: [{ name: "RelayWorks", url: "https://relayworks.dev" }],
  creator: "RelayWorks",
  icons: {
    icon: '/favicon-brand.ico',
  },
  other: {
    "google-adsense-account": "ca-pub-2489956198626091"
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://relayworks.dev",
    title: "RelayWorks | Boutique Software Engineering Studio — Mobile, Backends & Automation",
    description: "Independent engineering studio led by Hazrat Ummar Shaikh. Production Native Android & iOS apps, Kotlin Multiplatform, Spring Boot backends, and Discord automation. Direct senior builder access.",
    siteName: "RelayWorks",
    images: [
      {
        url: "https://relayworks.dev/og-banner.png",
        width: 1200,
        height: 630,
        alt: "RelayWorks | Boutique Software Engineering Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RelayWorks | Boutique Software Engineering Studio",
    description: "Production mobile apps, scalable backend systems, and custom automation. Direct senior engineer execution.",
    images: ["https://relayworks.dev/og-banner.png"],
    creator: "@ihazratummar9",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://relayworks.dev/#website",
      "url": "https://relayworks.dev",
      "name": "RelayWorks",
      "description": "Custom Software, Discord Bots, and AI Automation Agency",
      "publisher": {
        "@id": "https://relayworks.dev/#organization"
      }
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://relayworks.dev/#organization",
      "name": "RelayWorks",
      "alternateName": [
        "Relay Works",
        "relayworks.dev",
        "Relaywork",
        "RelayWork",
        "realyworks"
      ],
      "url": "https://relayworks.dev",
      "logo": "https://relayworks.dev/logo-brand.png",
      "image": "https://relayworks.dev/og-banner.png",
      "description": "Custom software development agency specializing in custom Discord bots, mobile apps, backend architectures, and AI chatbots.",
      "founder": {
        "@type": "Person",
        "name": "Hazrat Ummar Shaikh",
        "jobTitle": "Lead Software Engineer & Founder",
        "sameAs": [
          "https://github.com/ihazratummar",
          "https://www.linkedin.com/in/hazrat-ummar-shaikh/",
          "https://x.com/ihazratummar9"
        ]
      },
      "sameAs": [
        "https://github.com/ihazratummar",
        "https://www.linkedin.com/in/hazrat-ummar-shaikh/",
        "https://x.com/ihazratummar9",
        "https://www.instagram.com/hazratummar/"
      ],
      "knowsAbout": [
        "Discord Bot Development",
        "Python",
        "FastAPI",
        "Ktor",
        "Android App Development",
        "iOS App Development",
        "AI Chatbots",
        "MongoDB"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Software Development Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Custom Discord Bot Development",
              "url": "https://relayworks.dev/discord-bot",
              "description": "Custom Discord bots with ticket systems, verification, economy, and AI integration."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "AI Chatbot Development",
              "url": "https://relayworks.dev/ai-chatbot-development",
              "description": "Custom AI chatbots for customer support, lead qualification, and CRM automation."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Backend & API Development",
              "url": "https://relayworks.dev/services",
              "description": "Scalable REST & WebSocket APIs using FastAPI, Ktor, and MongoDB."
            }
          }
        ]
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <head>
        <link rel="preconnect" href="https://minio-api.hazratdev.top" />
        <link rel="dns-prefetch" href="https://minio-api.hazratdev.top" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          outfit.variable
        )}
      >
        {/* Facebook Meta Pixel - Non-blocking afterInteractive */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '27768790286073986');fbq('track', 'PageView');`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=27768790286073986&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <GoogleAnalytics gaId="G-CGMGGSKEBE" />
        <GoogleAdSense />
        <FacebookPixelRouteTracker />
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <LiveChatWidget />
        <CookieConsent />
      </body>
    </html>
  );
}
