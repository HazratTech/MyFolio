"use client";

import React, { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface Social {
    name: string;
    href: string;
    icon: string;
    color: string;
}

export const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        service: "Discord Bot",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [socials, setSocials] = useState<Social[]>([]);

    useEffect(() => {
        const fetchSocials = async () => {
            try {
                const res = await fetch('/api/socials');
                if (res.ok) {
                    const data = await res.json();
                    setSocials(data);
                }
            } catch (error) {
                console.error("Failed to fetch socials:", error);
            }
        };
        fetchSocials();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        // Remove 'contact-' prefix to get the state key
        const key = id.replace("contact-", "");
        setFormData({ ...formData, [key]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResult(null);

        const embed = {
            title: "New Contact Form Submission",
            color: 5814783, // Blue color
            fields: [
                { name: "Name", value: formData.name, inline: true },
                { name: "Email", value: formData.email, inline: true },
                { name: "Service", value: formData.service, inline: true },
                { name: "Subject", value: formData.subject },
                { name: "Message", value: formData.message },
            ],
            timestamp: new Date().toISOString(),
        };

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ embeds: [embed] }),
            });

            if (response.ok) {
                setResult("Message sent successfully!");
                trackEvent("contact_form_submit", {
                    service: formData.service,
                    subject: formData.subject,
                });
                setFormData({ name: "", email: "", service: "Discord Bot", subject: "", message: "" });
            } else {
                setResult("Failed to send message.");
            }
        } catch (error) {
            console.error(error);
            setResult("Something went wrong!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[128px] -z-10" />

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
                            Let's <span className="text-secondary">Connect</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Have a project in mind? Let's build something awesome together.
                        </p>
                    </m.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                        <m.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-1">Email Me</h4>
                                        <a href="mailto:hazratummar9@gmail.com" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Email Me">
                                            hazratummar9@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                                        <img src="/discord.svg" alt="Discord" className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-1">Discord</h4>
                                        <p className="text-muted-foreground">ihazratummar</p>
                                    </div>
                                </div>

                                {/* Freelance Profiles */}
                                <div className="pt-6 border-t border-white/10">
                                    <h4 className="font-bold mb-4">Hire me on</h4>
                                    <div className="flex flex-wrap gap-4">
                                        {/* Fiverr - Always visible */}
                                        <a
                                            href="https://www.fiverr.com/hazratummar"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600/20 to-green-500/20 hover:from-green-600/30 hover:to-green-500/30 border border-green-500/30 transition-all group"
                                            aria-label="Fiverr Profile"
                                        >
                                            <span className="font-medium text-green-400 transition-colors">Fiverr</span>
                                            <ExternalLink className="w-4 h-4 text-green-400 group-hover:text-green-300 transition-colors" />
                                        </a>

                                        {/* Other platforms from database */}
                                        {socials.filter(s => s.name === "Upwork" || s.name === "Freelancer").map((link, index) => (
                                            <a
                                                key={index}
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                                                aria-label={`${link.name} Profile`}
                                            >
                                                <span className={`font-medium ${link.color} transition-colors`}>{link.name}</span>
                                                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-card/30 border border-white/10 rounded-xl mt-8">
                                    <p className="text-muted-foreground italic">
                                        "I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions."
                                    </p>
                                </div>
                            </div>
                        </m.div>

                        <m.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <Card className="bg-card/50 backdrop-blur-md border-white/10">
                                <CardContent className="p-6 space-y-4">
                                    <form id="contact-form" onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label htmlFor="contact-name" className="text-sm font-medium">Name</label>
                                                <Input
                                                    id="contact-name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Your Name"
                                                    required
                                                    className="bg-white/5 border-white/10 focus:border-primary"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="contact-email" className="text-sm font-medium">Email</label>
                                                <Input
                                                    id="contact-email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="your@email.com"
                                                    required
                                                    className="bg-white/5 border-white/10 focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="contact-service" className="text-sm font-medium">Service</label>
                                            <select
                                                id="contact-service"
                                                value={formData.service}
                                                onChange={handleChange}
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="Discord Bot">Discord Bot</option>
                                                <option value="Mobile App">Mobile App</option>
                                                <option value="Backend Dev">Backend Dev</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="contact-subject" className="text-sm font-medium">Subject</label>
                                            <Input
                                                id="contact-subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                placeholder="Project Inquiry"
                                                required
                                                className="bg-white/5 border-white/10 focus:border-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="contact-message" className="text-sm font-medium">Message</label>
                                            <Textarea
                                                id="contact-message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Tell me about your project..."
                                                required
                                                className="min-h-[150px] bg-white/5 border-white/10 focus:border-primary"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg hover:shadow-primary/25 transition-all duration-300"
                                        >
                                            {isSubmitting ? "Sending..." : "Send Message"}
                                        </Button>
                                        {result && (
                                            <p className={`text-center text-sm mt-2 ${result.includes("success") ? "text-green-500" : "text-red-500"}`}>
                                                {result}
                                            </p>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>
                        </m.div>
                    </div>
                </LazyMotion>
            </div>
        </section>
    );
};


