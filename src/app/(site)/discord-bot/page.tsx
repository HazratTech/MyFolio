import type { Metadata } from "next";
import { DiscordBotLanding } from "@/components/sections/DiscordBotLanding";

export const metadata: Metadata = {
  title: "Custom Discord Bot Developer & Development Services | RelayWorks",
  description: "Looking to make a custom Discord bot? Hire an expert Discord developer to create your own bot with ticket systems, verification, economy, and AI integrations. Free consultation & fast delivery.",
  alternates: {
    canonical: "https://relayworks.dev/discord-bot",
  },
  keywords: [
    "custom discord bot developer",
    "hire discord bot developer",
    "custom discord bot development",
    "discord bot development services",
    "make a custom discord bot",
    "python discord bot developer",
    "discord ticket bot developer",
    "discord verification bot",
    "discord economy bot",
    "discord moderation bot",
  ],
  openGraph: {
    title: "Custom Discord Bot Developer & Development Services | RelayWorks",
    description: "Looking to make a custom Discord bot? Hire an expert Discord developer to create your own bot with ticket systems, verification, economy, and AI integrations.",
    url: "https://relayworks.dev/discord-bot",
    images: [
      {
        url: "https://relayworks.dev/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Custom Discord Bot Developer & Development Services | RelayWorks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Discord Bot Developer & Development Services | RelayWorks",
    description: "Hire an expert Discord bot developer to create custom bots with ticket systems, economy, verification, and AI.",
    images: ["https://relayworks.dev/og-banner.png"],
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://relayworks.dev/discord-bot#service",
      "name": "Custom Discord Bot Development Services",
      "serviceType": "Discord Bot Development",
      "description": "Professional Discord bot development in Python (discord.py) for moderation, ticket systems, custom verification, multi-server economies, and AI chatbots.",
      "provider": {
        "@type": "Organization",
        "name": "RelayWorks",
        "url": "https://relayworks.dev",
        "logo": "https://relayworks.dev/logo-brand.png"
      },
      "areaServed": "Worldwide",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Discord Bot Packages",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Basic Discord Bot",
              "description": "Slash commands, custom welcome cards, basic moderation, and role automation."
            },
            "price": "149.00",
            "priceCurrency": "USD"
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Advanced Community / SaaS Discord Bot",
              "description": "Interactive ticket panels, custom verification with external database sync, and dual-currency economy."
            },
            "price": "349.00",
            "priceCurrency": "USD"
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "24",
        "bestRating": "5"
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
          "name": "Services",
          "item": "https://relayworks.dev/services"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Custom Discord Bot Development",
          "item": "https://relayworks.dev/discord-bot"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://relayworks.dev/discord-bot#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How to make a custom Discord bot for my server?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "To make a custom Discord bot, you need to register a developer app on the Discord portal, write the logic in Python or TypeScript, and host it on a server. By hiring an experienced Discord developer, you get a professionally built, 24/7 online bot tailored to your exact needs without any coding stress."
          }
        },
        {
          "@type": "Question",
          "name": "What are custom commands on a Discord bot?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Custom commands allow you to create interactions specific to your server's needs. You can trigger tasks like pulling live game stats, managing custom verification databases, or upgrading premium roles instantly. Generic public bots cannot provide this level of personalized logic."
          }
        },
        {
          "@type": "Question",
          "name": "Why choose customizable bots for Discord over public ones?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Choosing customizable bots for Discord ensures 100% white-labeled branding (your bot logo and name), custom commands tailored exactly to your workflows, zero monthly pricing model bottlenecks, and dedicated hosting for fast performance."
          }
        },
        {
          "@type": "Question",
          "name": "Do you host the bot for me?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "I configure the bot to run 24/7 on a Linux VPS server using PM2 process manager. If you don't have hosting, I can guide you through setting up a server for free, or handle deployment for you."
          }
        },
        {
          "@type": "Question",
          "name": "What language and library do you write bots in?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "I write high-performance Discord bots in Python (using discord.py or nextcord) to guarantee execution speed and complete support for the latest Discord slash commands and interactive components."
          }
        },
        {
          "@type": "Question",
          "name": "Do I get full ownership of the source code?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, 100%. Upon completion and final payment, you will receive all files, modules, and configurations. You own all rights to your bot's custom source code."
          }
        },
        {
          "@type": "Question",
          "name": "How long does it take to deliver a bot?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Basic bots take around 3-5 days. Advanced moderation or payment setups take 7-14 days. Complex enterprise/database-linked bots take 2-3 weeks depending on criteria."
          }
        },
        {
          "@type": "Question",
          "name": "Can we add new features to the bot in the future?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, the code is structured modularly using Cogs and command-handler layouts, making it simple to append new features, databases, or external APIs later as your server scales."
          }
        }
      ]
    }
  ]
};

export default function DiscordBotPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DiscordBotLanding />
    </>
  );
}
