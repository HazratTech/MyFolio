import type { Metadata } from "next";
import { DiscordBotLanding } from "@/components/sections/DiscordBotLanding";

export const metadata: Metadata = {
  title: "Custom Discord Bot Development Services | Hazrat Ummar Shaikh",
  description: "Get custom Discord bots tailored specifically for your community. Automate moderation, ticket systems, payments, role management, verification, and AI chatbots. Hire me today for custom, scalable, and high-performance solutions.",
  alternates: {
    canonical: "/discord-bot",
  },
  openGraph: {
    title: "Custom Discord Bot Development Services | Hazrat Ummar Shaikh",
    description: "Get custom Discord bots tailored specifically for your community. Automate moderation, ticket systems, payments, role management, verification, and AI chatbots.",
    url: "https://hazratdev.top/discord-bot",
    images: ["/logo.png"],
  }
};

export default function DiscordBotPage() {
  return <DiscordBotLanding />;
}
