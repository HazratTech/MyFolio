"use client";

import React from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getIcon } from "@/lib/utils/icons";
import { ServiceDetailsModal } from "@/components/modals/ServiceDetailsModal";

const DiscordIcon = ({ className }: { className?: string }) => (
    <img src="/discord.svg" alt="Discord" className={className} />
);

const services = [
    {
        title: "Discord Bot Development",
        category: "Development",
        description: "Custom bots with advanced features, moderation tools, and API integrations tailored to your community needs.",
        price: "Starts from $50",
        icon: "Bot"
    },
    {
        title: "Native Android Development",
        category: "Development",
        description: "High-performance native Android applications built with Kotlin and Jetpack Compose.",
        price: "Starts from $200",
        icon: "Smartphone"
    },
    {
        title: "Backend Development",
        category: "Development",
        description: "Robust and scalable backend systems using FastAPI, KTOR, and MongoDB.",
        price: "Starts from $150",
        icon: "Server"
    }
];

export const Services = () => {
    return (
        <section id="services" className="py-20 relative">
            <div className="container mx-auto px-6">
                <LazyMotion features={domAnimation}>
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-16 text-center"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">
                            Our <span className="text-primary">Services</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Specialized solutions tailored to your needs.
                        </p>
                    </m.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, index) => {
                            const Icon = service.title === "Discord Bot Development" ? DiscordIcon : getIcon(service.icon);
                            return (
                                <m.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Card className="bg-card/30 backdrop-blur-sm border-white/10 hover:border-primary/50 transition-all duration-300 h-full flex flex-col hover:-translate-y-2 group">
                                        <CardHeader>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                {service.category && (
                                                    <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-xs">
                                                        {service.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-xl font-bold line-clamp-2">{service.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                                                {service.description}
                                            </p>
                                            <div className="text-2xl font-bold text-foreground">
                                                {service.price}
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <ServiceDetailsModal serviceType={service.title}>
                                                <Button className="w-full bg-white/5 hover:bg-primary hover:text-white text-foreground border border-white/10 transition-all duration-300">
                                                    Get Started
                                                </Button>
                                            </ServiceDetailsModal>
                                        </CardFooter>
                                    </Card>
                                </m.div>
                            );
                        })}
                    </div>
                </LazyMotion>
            </div>
        </section>
    );
};
