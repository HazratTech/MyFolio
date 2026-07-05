"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

interface Testimonial {
    name: string;
    role: string;
    content: string;
    rating: number;
    image?: string;
}

export const Testimonials = () => {
    const [reviews, setReviews] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await fetch('/api/testimonials');
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
            <section id="testimonials" className="py-20 bg-black/20 min-h-[600px] flex items-center justify-center">
                <div className="text-muted-foreground">Loading testimonials...</div>
            </section>
        );
    }

    return (
        <section id="testimonials" className="py-20 bg-black/20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] -z-10" />

            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">
                        Client <span className="text-secondary">Stories</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Don't just take my word for it. Here's what my clients have to say about working with me.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="bg-card/30 backdrop-blur-sm border-white/10 h-full hover:border-primary/30 transition-all duration-300 relative group">
                                <div className="absolute top-4 right-4 text-primary/20 group-hover:text-primary/40 transition-colors">
                                    <Quote className="w-10 h-10" />
                                </div>
                                <CardHeader className="pb-2">
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                        ))}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <p className="text-muted-foreground italic relative z-10">
                                        "{review.content}"
                                    </p>
                                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                                            {review.image ? (
                                                <img src={review.image} alt={review.name} className="w-full h-full object-cover" />
                                            ) : (
                                                review.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">{review.name}</div>
                                            <div className="text-xs text-muted-foreground">{review.role}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
