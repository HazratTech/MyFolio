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
    images: ["/logo-brand.png"],
  }
};

export default function DiscordBotPage() {
  return <DiscordBotLanding />;
}
