import React from "react";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";

import Testimonial from "@/models/Testimonial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, MessageSquare } from "lucide-react";
import { AutoBlogConfigSection } from "@/components/admin/AutoBlogConfigSection";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    await dbConnect();

    const projectCount = await Project.countDocuments();

    const testimonialCount = await Testimonial.countDocuments();

    const stats = [
        {
            name: "Total Projects",
            value: projectCount,
            icon: FolderKanban,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },

        {
            name: "Testimonials",
            value: testimonialCount,
            icon: MessageSquare,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-heading">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-2">Welcome back, Admin. Here's what's happening.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.name} className="bg-card/50 backdrop-blur-sm border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.name}
                            </CardTitle>
                            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="max-w-4xl">
                <AutoBlogConfigSection />
            </div>
        </div>
    );
}
