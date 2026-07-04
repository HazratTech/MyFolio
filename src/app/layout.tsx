import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { GoogleAdSense } from "@/components/analytics/GoogleAdSense";
import { FacebookPixel } from "@/components/analytics/FacebookPixel";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { cn } from "@/lib/utils";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  metadataBase: new URL("https://hazratdev.top"),
  alternates: {
    canonical: '/',
  },
  title: "Hazrat Ummar Shaikh | Native Android & Backend Developer",
  description: "Portfolio of Hazrat Ummar Shaikh, an expert Native Android App Developer, Backend Developer, and Discord Bot Developer from India. Specializing in Kotlin, FastAPI, KTOR, and MongoDB.",
  keywords: [
    "Hazrat Ummar Shaikh",
    "Hazrat Developer",
    "Android Developer",
    "Android App Developer",
    "Native Android Developer",
    "Backend Developer",
    "Discord Bot Developer",
    "Kotlin Developer",
    "FastAPI Developer",
    "Ktor Developer",
    "Kotlin Multiplatform Developer",
    "Jetpack Compose Developer",
    "Kotlin Multiplatform",
    "Jetpack Compose",
    "KMP Developer"
  ],
  authors: [{ name: "Hazrat Ummar Shaikh", url: "https://hazrat.dev" }],
  creator: "Hazrat Ummar Shaikh",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hazrat.dev",
    title: "Hazrat Ummar Shaikh | Native Android & Backend Developer",
    description: "Portfolio of Hazrat Ummar Shaikh, an expert Native Android App Developer, Backend Developer, and Discord Bot Developer from India.",
    siteName: "Hazrat Ummar Shaikh Portfolio",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Hazrat Ummar Shaikh Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hazrat Ummar Shaikh | Native Android & Backend Developer",
    description: "Portfolio of Hazrat Ummar Shaikh, an expert Native Android App Developer, Backend Developer, and Discord Bot Developer from India.",
    images: ["/logo.png"],
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
  "@type": "Person",
  name: "Hazrat Ummar Shaikh",
  url: "https://hazratdev.top",
  sameAs: [
    "https://github.com/ihazratummar",
    "https://www.linkedin.com/in/hazrat-ummar-shaikh/",
    "https://x.com/ihazratummar9",
    "https://www.instagram.com/hazratummar/"
  ],
  jobTitle: "Native Android & Backend Developer",
  worksFor: {
    "@type": "Organization",
    name: "Freelance"
  },
  knowsAbout: [
    "Android Development",
    "Kotlin",
    "Jetpack Compose",
    "Backend Development",
    "FastAPI",
    "Ktor",
    "MongoDB",
    "Discord Bot Development",
    "Python",
    "Docker"
  ],
  offers: [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Native Android App Development",
        "description": "High-performance native Android applications built with Kotlin and Jetpack Compose."
      }
    },
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
        <GoogleAnalytics gaId="G-CGMGGSKEBE" />
        <GoogleAdSense />
        <FacebookPixel />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
