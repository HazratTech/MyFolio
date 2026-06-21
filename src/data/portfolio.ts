import { Github, Linkedin, Instagram, Twitter, Mail, Code, Smartphone, Zap, Globe, Server, Database, Layout, Terminal, MessageCircle, MessageSquare, Bot } from "lucide-react";

export const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "/blog" },
];

export const socialLinks = [
    {
        name: "GitHub",
        href: "https://github.com/ihazratummar",
        icon: Github,
        color: "hover:text-white",
    },
    {
        name: "LinkedIn",
        href: "https://www.linkedin.com/in/hazrat-ummar-shaikh/",
        icon: Linkedin,
        color: "hover:text-blue-500",
    },
    {
        name: "Instagram",
        href: "https://www.instagram.com/hazratummar/",
        icon: Instagram,
        color: "hover:text-pink-500",
    },
    {
        name: "X (Twitter)",
        href: "https://x.com/ihazratummar9",
        icon: Twitter,
        color: "hover:text-sky-500",
    },
    {
        name: "Discord",
        href: "#", // Discord ID provided: ihazratummar
        icon: MessageCircle,
        color: "hover:text-indigo-500",
    },
];

// Fix for Discord icon if not available in Lucide, or use a generic one. 
// Lucide has 'Disc' but not Discord brand icon. We can use a custom component or just text for now.
// Actually, let's use 'MessageSquare' for Discord for now.
socialLinks[4].icon = MessageSquare;


export const about = {
    name: "Hazrat Ummar Shaikh",
    role: "Native Android & Backend Developer",
    headline: "Building Things That Actually Work",
    description: "I'm a self-taught developer who believes in solving real problems with code. No fancy degrees — just curiosity, late-night experiments, and the discipline to master what I set out to learn.",
    avatar: "/avatar.png", // Placeholder
};

export const freelanceLinks = [
    {
        name: "Fiverr",
        href: "https://www.fiverr.com/hazratummar",
        image: "/fiverr.svg", // You might need to add an icon or SVG for this
        color: "hover:text-green-500",
    },
    {
        name: "Upwork",
        href: "https://www.upwork.com/freelancers/~01b0e7a5f06ccd87dc",
        image: "/upwork.svg", // You might need to add an icon or SVG for this
        color: "hover:text-green-600",
    },
];

export const skills = [
    { name: "Discord", icon: MessageSquare, level: 95 },
    { name: "Python", icon: Terminal, level: 90 },
    { name: "FastApi", icon: Zap, level: 85 },
    { name: "Android", icon: Smartphone, level: 80 },
    { name: "Kotlin", icon: Code, level: 85 },
    { name: "Jetpack Compose", icon: Layout, level: 80 },
    { name: "Ktor", icon: Server, level: 75 },
    { name: "MongoDB", icon: Database, level: 70 },
    { name: "Discord Bot", icon: Bot, level: 95 },
];

export const projects = [
    {
        id: 1,
        title: "Discord Bot Dashboard",
        description: "A comprehensive dashboard for managing Discord bots with real-time analytics and configuration.",
        tags: ["Next.js", "Discord.js", "Tailwind", "PostgreSQL"],
        category: "Discord Bots",
        image: "/project1.jpg",
        liveUrl: "#",
        githubUrl: "#",
    },
    {
        id: 2,
        title: "E-commerce Mobile App",
        description: "A cross-platform mobile application for online shopping with seamless payment integration.",
        tags: ["React Native", "Redux", "Stripe"],
        category: "Mobile Apps",
        image: "/project2.jpg",
        liveUrl: "#",
        githubUrl: "#",
    },
    {
        id: 3,
        title: "Automation System",
        description: "An automated workflow system that integrates multiple APIs to streamline business processes.",
        tags: ["Node.js", "Express", "Redis", "Docker"],
        category: "Backend",
        image: "/project3.jpg",
        liveUrl: "#",
        githubUrl: "#",
    },
    {
        id: 4,
        title: "Islam24",
        description: "A comprehensive Islamic app featuring prayer times, Quran, and daily supplications. Designed for ease of use and accessibility.",
        tags: ["Mobile App", "Android", "Kotlin", "Jetpack Compose", "Firebase", "MapSDK"],
        category: "Mobile Apps",
        image: "/islam24.jpg",
        liveUrl: "https://play.google.com/store/apps/details?id=com.hazrat.islam24",
        githubUrl: "#",
    },
    {
        id: 5,
        title: "OneDrop Blood Donation",
        description: "A life-saving mobile application connecting blood donors with those in need. Features real-time notifications and location-based matching.",
        tags: ["Mobile App", "Android", "Firebase", "Ktor", "MongoDB", "Kotlin"],
        category: "Mobile Apps",
        image: "/onedrop.jpg",
        liveUrl: "https://play.google.com/store/apps/details?id=com.hazrat.onedrop",
        githubUrl: "#",
    },
];

export const services = [
    {
        title: "Discord Bot Development",
        description: "Custom bots with advanced features, moderation tools, and API integrations.",
        icon: MessageSquare,
        price: "Starting at $80",
    },
    {
        title: "Mobile App Development",
        description: "Cross-platform mobile apps for iOS and Android using React Native and Kotlin.",
        icon: Smartphone,
        price: "Starting at $300",
    },
    {
        title: "Backend Development",
        description: "Scalable server-side solutions, API design, and database management.",
        icon: Server,
        price: "Starting at $200",
    },
];

export const reviews = [
    {
        name: "iamjuantapp",
        role: "United States",
        content: "What can I say that everyone else that has worked with Hazrat hasn't already, he's just amazing and goes above and beyond to make the project top notch. I will 100% be utilizing his skills in the future so don't hesitate to use him either, you won't be disappointed.",
        rating: 5,
    },
    {
        name: "afcumerma",
        role: "United States",
        content: "Hazrat created a custom \"mission creation\" bot for my Discord community of 600+ members, specifically for the space MMO, Star Citizen. I am a meticulous customer, always asking for things to be just right, and Hazrat was able to accommodate and deliver on my exceptional requests.",
        rating: 5,
    },
    {
        name: "sgtgonzo",
        role: "United States",
        content: "Amazing work! Speedy and meticulous. Answered all my questions, explained and demonstrated how my bot worked, outstanding job.",
        rating: 5,
    },
    {
        name: "weloveyoutko",
        role: "United States",
        content: "Great and fast working developer, Listens to your wants and needs.",
        rating: 5,
    },
    {
        name: "frescher",
        role: "Germany",
        content: "Working with Hazrat was a pleasure. He asked many question about the details, to make sure I get the functionality that I need for my discord bot. Delivery was quick and professional. Clear recommendation!",
        rating: 5,
    },
    {
        name: "samswa",
        role: "Austria",
        content: "Did a great job setting up a custom bot in our discord server! 10/10",
        rating: 5,
    },
];
