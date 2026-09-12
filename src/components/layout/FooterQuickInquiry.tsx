"use client";

import React, { useState } from "react";
import { ArrowRight, Check, Loader2, Mail } from "lucide-react";

export const FooterQuickInquiry = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes("@")) return;

        setStatus("loading");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "Footer Quick Lead",
                    email: email,
                    message: `Quick inquiry submitted via website footer from ${email}.`,
                }),
            });

            if (res.ok) {
                setStatus("success");
                setEmail("");
            } else {
                // If API isn't configured, gracefully fallback to opening direct mailto
                window.location.href = `mailto:hazratummar9@gmail.com?subject=Project%20Inquiry%20from%20${encodeURIComponent(email)}&body=Hi%20Hazrat,%20I'd%20like%20to%20discuss%20a%20project.`;
                setStatus("success");
            }
        } catch {
            window.location.href = `mailto:hazratummar9@gmail.com?subject=Project%20Inquiry&body=Hi%20Hazrat,%20I'd%20like%20to%20discuss%20a%20project.`;
            setStatus("idle");
        }
    };

    if (status === "success") {
        return (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-xl shadow-xs">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Inquiry received! Hazrat will reach out in &lt; 24h.</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="relative flex items-center w-full">
            <div className="relative w-full">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter work email..."
                    required
                    className="w-full h-10 pl-9 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition-all shadow-xs"
                />
            </div>
            <button
                type="submit"
                disabled={status === "loading"}
                aria-label="Submit inquiry"
                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-50 shadow-xs"
            >
                {status === "loading" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                )}
            </button>
        </form>
    );
};
