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
        title: "Custom Discord Bots",
        description: "Custom verification, tickets, economy & game server bots.",
        href: "/discord-bot",
        badge: "Popular",
        iconType: "bot",
        badgeColor: "bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/30",
    },
    {
        title: "AI Chatbot Development",
        description: "24/7 support, lead qualification & automated AI agents.",
        href: "/ai-chatbot-development",
        badge: "AI Powered",
        iconType: "sparkles",
        badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
    {
        title: "Native Mobile Apps",
        description: "High-performance Android (Kotlin/Compose) & iOS apps.",
        href: "/services",
        badge: "Mobile",
        iconType: "smartphone",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
        title: "Backend & Scalable APIs",
        description: "FastAPI, Ktor, MongoDB & WebSocket architectures.",
        href: "/services",
        badge: "Cloud",
        iconType: "server",
        badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
];
