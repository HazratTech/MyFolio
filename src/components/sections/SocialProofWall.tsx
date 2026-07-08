"use client";

import React, { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";

interface Testimonial {
    name: string;
    role: string;
    content: string;
    rating: number;
    image?: string;
}

const platformBadges = [
    {
        name: "Fiverr",
        url: "https://www.fiverr.com/hazratummar",
        label: "5.0★ on Fiverr",
        bgColor: "bg-emerald-500/10 border-emerald-500/20",
        textColor: "text-emerald-400",
    },
    {
        name: "Upwork",
        url: "https://www.upwork.com/freelancers/~01b0e7a5f06ccd87dc",
        label: "Seller on Upwork",
        bgColor: "bg-green-500/10 border-green-500/20",
        textColor: "text-green-400",
    },
];

export const SocialProofWall = () => {
    const [reviews, setReviews] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await fetch("/api/testimonials");
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error("Failed to fetch testimonials:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
    }, []);

    if (loading) {
        return (
            <section className="py-20 bg-black/20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-36 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Split reviews into two columns for masonry effect
    const leftColumn = reviews.filter((_, i) => i % 2 === 0);
    const rightColumn = reviews.filter((_, i) => i % 2 === 1);

    const renderMessage = (review: Testimonial, idx: number, colOffset: number) => {
        const globalIdx = colOffset + idx * 2;
        const timestamp = new Date(Date.now() - (globalIdx + 1) * 86400000 * 3).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });

        const avatarColors = [
            "from-[#5865F2] to-[#7289da]",
            "from-emerald-500 to-teal-500",
            "from-orange-500 to-red-500",
            "from-purple-500 to-pink-500",
            "from-blue-500 to-cyan-500",
            "from-yellow-500 to-orange-500",
        ];

        return (
            <m.div
                key={`${review.name}-${idx}`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: globalIdx * 0.06 }}
            >
                <div className="group rounded-xl bg-[#111214] border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden">
                    {/* Discord-style message layout */}
                    <div className="p-4 flex gap-3">
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors[globalIdx % avatarColors.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                            {review.image ? (
                                <img src={review.image} alt={review.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                review.name.charAt(0).toUpperCase()
                            )}
                        </div>

                        {/* Message body */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-sm font-semibold text-white">{review.name}</span>
                                <span className="text-[10px] text-white/20">{timestamp}</span>
                            </div>

                            {/* Stars */}
                            <div className="flex gap-0.5 mb-1.5">
                                {[...Array(review.rating || 5)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                ))}
                            </div>

                            <p className="text-sm text-white/70 leading-relaxed">
                                {review.content}
                            </p>

                            {/* Country tag */}
                            {review.role && (
                                <div className="mt-2">
                                    <span className="text-[10px] text-white/25 bg-white/[0.03] px-2 py-0.5 rounded">
                                        📍 {review.role}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </m.div>
        );
    };

    return (
        <section id="reviews" className="py-20 bg-black/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#5865F2]/5 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto px-6">
                <LazyMotion features={domAnimation}>
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-10"
                    >
                        <span className="text-xs uppercase tracking-widest text-primary font-semibold">Client Reviews</span>
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2">
                            What people actually said.
                        </h2>

                        {/* Platform badges */}
                        <div className="flex flex-wrap gap-3 mt-5">
                            {platformBadges.map((badge, idx) => (
                                <a
                                    key={idx}
                                    href={badge.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${badge.bgColor} ${badge.textColor} text-xs font-medium hover:opacity-80 transition-opacity`}
                                >
                                    {badge.label}
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            ))}
                        </div>
                    </m.div>

                    {/* Masonry Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-3">
                            {leftColumn.map((review, idx) => renderMessage(review, idx, 0))}
                        </div>
                        <div className="space-y-3 md:mt-8">
                            {rightColumn.map((review, idx) => renderMessage(review, idx, 1))}
                        </div>
                    </div>
                </LazyMotion>
            </div>
        </section>
    );
};
