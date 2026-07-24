import type { Metadata } from "next";
import { DiscordBotLanding } from "@/components/sections/DiscordBotLanding";

export const metadata: Metadata = {
  title: "Custom Discord Bot Developer & Development Services | RelayWorks",
  description: "Want to make a custom Discord bot? Hire an expert Discord developer to create your own bot with custom commands. Professional discord bot development services.",
  alternates: {
    canonical: "/discord-bot",
  },
  openGraph: {
    title: "Custom Discord Bot Developer & Development Services | RelayWorks",
    description: "Want to make a custom Discord bot? Hire an expert Discord developer to create your own bot with custom commands. Professional discord bot development services.",
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
    description: "Want to make a custom Discord bot? Hire an expert Discord developer to create your own bot with custom commands. Professional discord bot development services.",
    images: ["https://relayworks.dev/og-banner.png"],
  }
};

export default function DiscordBotPage() {
  return <DiscordBotLanding />;
}
