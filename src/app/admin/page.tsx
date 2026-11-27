import React from "react";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import Testimonial from "@/models/Testimonial";
import Partner from "@/models/Partner";
import Lead from "@/models/Lead";
import Post from "@/models/Post";
import { getZohoStatus } from "@/lib/zoho-mail";
import {
    Handshake,
    Target,
    FileText,
    FolderKanban,
    MessageSquare,
    ArrowUpRight,
    Mail,
    Plus,
    Sparkles,
    Send,
} from "lucide-react";
import { AutoBlogConfigSection } from "@/components/admin/AutoBlogConfigSection";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    await dbConnect();

    const [
        projectCount,
        testimonialCount,
        partnerTotal,
        partnerNew,
        partnerPitched,
        leadTotal,
        leadNew,
        leadContacted,
        publishedPosts,
        draftPosts,
    ] = await Promise.all([
        Project.countDocuments(),
        Testimonial.countDocuments(),
        Partner.countDocuments(),
        Partner.countDocuments({ status: "New" }),
        Partner.countDocuments({ status: { $in: ["Pitched", "In Discussion", "Partnered"] } }),
        Lead.countDocuments(),
        Lead.countDocuments({ status: "New" }),
        Lead.countDocuments({ status: { $in: ["Contacted", "In Discussion", "Closed"] } }),
        Post.countDocuments({ status: "published" }),
        Post.countDocuments({ status: "draft" }),
    ]);

    const zohoStatus = getZohoStatus();

    const kpis = [
        {
            name: "Shopify Partners",
            value: partnerTotal,
            sub: `${partnerNew} ready to pitch · ${partnerPitched} pitched`,
            href: "/admin/partners",
            icon: Handshake,
            iconBg: "bg-blue-50 border-blue-200/80 text-blue-600",
        },
        {
            name: "Lead Radar",
            value: leadTotal,
            sub: `${leadNew} new inquiries · ${leadContacted} active`,
            href: "/admin/leads",
            icon: Target,
            iconBg: "bg-indigo-50 border-indigo-200/80 text-indigo-600",
        },
        {
            name: "Published Articles",
            value: publishedPosts,
            sub: `${draftPosts} drafts queued`,
            href: "/admin/blog",
            icon: FileText,
            iconBg: "bg-emerald-50 border-emerald-200/80 text-emerald-600",
        },
        {
            name: "Portfolio & Proof",
            value: projectCount,
            sub: `${testimonialCount} client testimonials`,
            href: "/admin/projects",
            icon: FolderKanban,
            iconBg: "bg-amber-50 border-amber-200/80 text-amber-600",
        },
    ];

    const quickLinks = [
        {
            title: "Pitch Shopify Agencies",
            desc: `${partnerNew} uncontacted partners waiting in your pipeline.`,
            href: "/admin/partners",
            icon: Handshake,
            badge: "Primary Outreach",
        },
        {
            title: "Review Lead Radar",
            desc: `${leadNew} AI-verified client inquiries ready to review.`,
            href: "/admin/leads",
            icon: Target,
            badge: "Live Feeds",
        },
        {
            title: "Publish New Project",
            desc: "Add shipped case studies, bot builds, or mobile demos.",
            href: "/admin/projects/new",
            icon: Plus,
            badge: "Portfolio",
        },
        {
            title: "Write Blog Dispatch",
            desc: "Draft a technical article or edit AI-generated posts.",
            href: "/admin/blog/new",
            icon: FileText,
            badge: "Content",
        },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Top Command Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-slate-950">
                        Dashboard Overview
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        RelayWorks operations, outreach pipeline, and automated content controls.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold shadow-2xs ${
                        zohoStatus.configured
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}>
                        <Mail className="w-3.5 h-3.5" />
                        <span>
                            {zohoStatus.configured
                                ? `Zoho Ready: ${zohoStatus.senderEmail}`
                                : "Zoho SMTP Not Configured"}
                        </span>
                    </div>

                    <Link
                        href="/admin/partners"
                        className="inline-flex items-center gap-1.5 bg-slate-950 hover:bg-black text-white text-xs font-semibold h-9 px-4 rounded-xl shadow-xs transition-colors"
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>Open Pitch Studio</span>
                    </Link>
                </div>
            </div>

            {/* 4-Card KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                {item.name}
                            </span>
                            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${item.iconBg}`}>
                                <item.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-3xl font-black font-mono text-slate-950 tracking-tight flex items-baseline justify-between">
                                <span>{item.value}</span>
                                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{item.sub}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main 2-Column Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: AI Auto-Blog Config */}
                <div className="lg:col-span-8">
                    <AutoBlogConfigSection />
                </div>

                {/* Right Column: Outreach & Quick Launch */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                <span>Quick Launch</span>
                            </h2>
                            <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">Workflows</span>
                        </div>

                        <div className="p-3 space-y-2">
                            {quickLinks.map((q) => (
                                <Link
                                    key={q.title}
                                    href={q.href}
                                    className="group flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50/90 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors shrink-0 mt-0.5">
                                        <q.icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-bold text-slate-950 group-hover:text-blue-600 transition-colors truncate">
                                                {q.title}
                                            </p>
                                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                                                {q.badge}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{q.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Social Proof Summary Card */}
                    <Link
                        href="/admin/testimonials"
                        className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-950">Client Testimonials</p>
                                <p className="text-[11px] text-slate-500">{testimonialCount} published reviews live on site</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
