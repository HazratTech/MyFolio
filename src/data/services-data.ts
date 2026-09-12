export interface ServiceNavItem {
    title: string;
    description: string;
    href: string;
    badge?: string;
    iconType: "bot" | "sparkles" | "smartphone" | "server";
    badgeColor?: string;
}

export const servicesNavigationList: ServiceNavItem[] = [
    {
        title: "Native Mobile Apps",
        description: "Android (Kotlin/Compose), iOS (SwiftUI) & Kotlin Multiplatform.",
        href: "/mobile-app-development",
        badge: "Flagship",
        iconType: "smartphone",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
        title: "Backend & Scalable APIs",
        description: "Kotlin Spring Boot, FastAPI, PostgreSQL & Docker microservices.",
        href: "/services",
        badge: "Cloud",
        iconType: "server",
        badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
    {
        title: "Custom Discord Bots",
        description: "High-concurrency moderation, tickets, economy & checkout bots.",
        href: "/discord-bot",
        badge: "Popular",
        iconType: "bot",
        badgeColor: "bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/30",
    },
    {
        title: "AI Chatbot Development",
        description: "Context-aware WhatsApp & web assistants connected to CRM.",
        href: "/ai-chatbot-development",
        badge: "AI Powered",
        iconType: "sparkles",
        badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
];
