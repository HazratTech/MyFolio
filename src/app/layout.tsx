import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { GoogleAdSense } from "@/components/analytics/GoogleAdSense";
import { FacebookPixelRouteTracker } from "@/components/analytics/FacebookPixel";
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
  title: "RelayWorks | Custom Software & Automation Agency",
  description: "Welcome to RelayWorks (also known as Relay Works, Relaywork, or Realy Works). We are a custom software, backend API, and Discord bot development agency. Founded by Hazrat Ummar Shaikh.",
  keywords: [
    "RelayWorks",
    "realyworks",
    "Relayworks",
    "relayworks",
    "Realy Works",
    "relay works",
    "relaywork",
    "RelayWork",
    "Relaywork",
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
    title: "RelayWorks | Custom Software & Automation Agency",
    description: "Welcome to RelayWorks (also known as Relay Works, Relaywork, or Realy Works). We are a custom software, backend API, and Discord bot development agency.",
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
    title: "RelayWorks | Custom Software & Automation Agency",
    description: "Welcome to RelayWorks (also known as Relay Works, Relaywork, or Realy Works). We are a custom software, backend API, and Discord bot development agency.",
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RelayWorks",
  alternateName: [
    "Relay Works",
    "realyworks",
    "Relayworks",
    "relayworks",
    "Realy Works",
    "relay works",
    "relaywork",
    "RelayWork",
    "Relaywork"
  ],
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
    <html lang="en" className="scroll-smooth dark">
      <head>
        {/* Facebook Meta Pixel - raw script tag so Meta's crawler can detect it */}
        <script
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
      </head>
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
        <FacebookPixelRouteTracker />
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
