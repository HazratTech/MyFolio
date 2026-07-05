import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { GoogleAdSense } from "@/components/analytics/GoogleAdSense";
import { FacebookPixel } from "@/components/analytics/FacebookPixel";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { LiveChatWidget } from "@/components/chat/LiveChatWidget";
import { cn } from "@/lib/utils";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  metadataBase: new URL("https://relayworks.dev"),
  alternates: {
    canonical: '/',
  },
  title: "RelayWorks | Custom Automation & Software Agency",
  description: "RelayWorks is an expert agency specializing in custom Discord Bots, Backend Development, and automated workflow solutions. Founded by Hazrat Ummar Shaikh.",
  keywords: [
    "RelayWorks",
    "Relay Works",
    "Discord Bot Agency",
    "Custom Discord Bots",
    "Backend Development Agency",
    "Workflow Automation",
    "Hazrat Ummar Shaikh",
    "FastAPI Developer",
    "Ktor Developer"
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
    title: "RelayWorks | Custom Automation & Software Agency",
    description: "RelayWorks is an expert agency specializing in custom Discord Bots, Backend Development, and automated workflow solutions.",
    siteName: "RelayWorks",
    images: [
      {
        url: "/logo-brand.png",
        width: 1200,
        height: 630,
        alt: "RelayWorks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RelayWorks | Custom Automation & Software Agency",
    description: "RelayWorks is an expert agency specializing in custom Discord Bots, Backend Development, and automated workflow solutions.",
    images: ["/logo-brand.png"],
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
  other: {
    "google-adsense-account": "ca-pub-2489956198626091",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RelayWorks",
  url: "https://relayworks.dev",
  sameAs: [
    "https://github.com/ihazratummar",
    "https://www.linkedin.com/in/hazrat-ummar-shaikh/",
    "https://x.com/ihazratummar9",
    "https://www.instagram.com/hazratummar/"
  ],
  description: "Custom automation and software agency.",
  founder: {
    "@type": "Person",
    name: "Hazrat Ummar Shaikh"
  },
  knowsAbout: [
    "Backend Development",
    "FastAPI",
    "Ktor",
    "MongoDB",
    "Discord Bot Development",
    "Workflow Automation"
  ],
  offers: [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Discord Bot Development",
        "description": "Custom Discord bots with advanced features, moderation tools, and API integrations."
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Backend Development",
        "description": "Robust and scalable backend systems using FastAPI, KTOR, and MongoDB."
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
    <html lang="en" className="scroll-smooth">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          outfit.variable
        )}
      >
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-CGMGGSKEBE"
        />
        <Script id="google-analytics" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CGMGGSKEBE');
          `
        }} />
        <GoogleAdSense />
        <FacebookPixel />
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
