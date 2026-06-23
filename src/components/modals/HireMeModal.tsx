"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export const HireMeModal = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        service: "Discord Bot",
        message: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        const key = id.replace("hire-", "");
        setFormData({ ...formData, [key]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResult(null);

        const embed = {
            title: "New Hire Me Request",
            color: 5814783, // Blue color
            fields: [
                { name: "Name", value: formData.name, inline: true },
                { name: "Email", value: formData.email, inline: true },
                { name: "Service", value: formData.service, inline: true },
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
                trackEvent("hire_me_submit", {
                    service: formData.service,
                });
                setFormData({ name: "", email: "", service: "Discord Bot", message: "" });
                setTimeout(() => setOpen(false), 2000);
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-white/10 text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Hire Me</DialogTitle>
                </DialogHeader>
                <form id="hire-form" onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="hire-name">Name</Label>
                        <Input
                            id="hire-name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your Name"
                            required
                            className="bg-white/5 border-white/10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hire-email">Email</Label>
                        <Input
                            id="hire-email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            required
                            className="bg-white/5 border-white/10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hire-service">Service</Label>
                        <select
                            id="hire-service"
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
                        <Label htmlFor="hire-message">Message</Label>
                        <Textarea
                            id="hire-message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Tell me about your project..."
                            required
                            className="bg-white/5 border-white/10 min-h-[100px]"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Send Request
                            </>
                        )}
                    </Button>
                    {result && (
                        <p className={`text-center text-sm ${result.includes("success") ? "text-green-500" : "text-red-500"}`}>
                            {result}
                        </p>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
};
