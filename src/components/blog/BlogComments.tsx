"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Calendar, User, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CommentType {
    _id: string;
    name: string;
    emailHash: string;
    content: string;
    createdAt: string;
}

interface BlogCommentsProps {
    postId: string;
}

export function BlogComments({ postId }: BlogCommentsProps) {
    const [comments, setComments] = useState<CommentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<"success" | "failed" | null>(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        content: ""
    });

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`/api/blog-comments?postId=${postId}`);
                if (res.ok) {
                    const data = await res.json();
                    setComments(data);
                }
            } catch (err) {
                console.error("Failed to load comments", err);
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchComments();
        }
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.content.trim()) return;

        setSubmitting(true);
        setSubmitResult(null);

        try {
            const res = await fetch("/api/blog-comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    postId,
                    name: form.name,
                    email: form.email,
                    content: form.content
                })
            });

            if (res.ok) {
                const newComment = await res.json();
                setComments(prev => [...prev, newComment]); // Add to the chronological thread list at the end
                setForm({ name: "", email: "", content: "" });
                setSubmitResult("success");
            } else {
                setSubmitResult("failed");
            }
        } catch (err) {
            console.error("Failed to post comment", err);
            setSubmitResult("failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-16 pt-12 border-t border-white/10 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold font-heading text-white flex items-center gap-2 mb-8">
                <MessageSquare className="w-5 h-5 text-primary" />
                Discussion ({comments.length})
            </h2>

            {/* Comment Thread List */}
            <div className="space-y-6 mb-12">
                {loading ? (
                    <div className="flex justify-center py-6 text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : comments.length > 0 ? (
                    comments.map(comment => {
                        const formattedDate = new Date(comment.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        });
                        return (
                            <div key={comment._id} className="flex gap-4 items-start bg-[#161719]/40 border border-white/5 hover:border-white/10 transition-colors p-5 rounded-2xl">
                                <img
                                    src={`https://gravatar.com/avatar/${comment.emailHash}?d=identicon&s=120`}
                                    alt={comment.name}
                                    className="w-10 h-10 rounded-full border border-white/10 shrink-0 bg-[#2b2d31]"
                                    loading="lazy"
                                />
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h4 className="font-bold text-white text-sm truncate">{comment.name}</h4>
                                        <span className="text-[10px] text-[#949ba4] font-mono flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formattedDate}
                                        </span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans select-text">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-slate-400 text-sm text-center py-6">
                        No comments yet. Start the conversation below!
                    </p>
                )}
            </div>

            {/* Submission Form */}
            <div className="bg-[#161719]/30 border border-white/5 p-6 md:p-8 rounded-3xl backdrop-blur-sm">
                <h3 className="text-lg font-bold font-heading text-white mb-6">Join the Discussion</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label htmlFor="commenter-name" className="text-[10px] font-semibold text-[#949ba4] uppercase tracking-wider flex items-center gap-1.5">
                                <User className="w-3 h-3 text-[#949ba4]" /> Name
                            </label>
                            <Input
                                id="commenter-name"
                                type="text"
                                placeholder="Your Name"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                                className="bg-[#1e1f22] border-white/10 text-white focus-visible:ring-[#5865F2] h-11 text-sm rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="commenter-email" className="text-[10px] font-semibold text-[#949ba4] uppercase tracking-wider flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-[#949ba4]" /> Email <span className="text-[9px] text-[#949ba4] font-normal lowercase">(for Gravatar - kept private)</span>
                            </label>
                            <Input
                                id="commenter-email"
                                type="email"
                                placeholder="name@example.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                                className="bg-[#1e1f22] border-white/10 text-white focus-visible:ring-[#5865F2] h-11 text-sm rounded-xl"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="commenter-message" className="text-[10px] font-semibold text-[#949ba4] uppercase tracking-wider">Comment</label>
                        <Textarea
                            id="commenter-message"
                            placeholder="Share your thoughts or questions..."
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            required
                            rows={4}
                            className="bg-[#1e1f22] border-white/10 text-white focus-visible:ring-[#5865F2] text-sm rounded-xl resize-y"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto bg-[#5865F2] hover:bg-[#5865F2]/90 text-white font-bold h-11 px-6 rounded-xl flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Posting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" /> Post Comment
                            </>
                        )}
                    </Button>

                    {submitResult === "success" && (
                        <p className="text-emerald-400 text-xs font-semibold mt-2">
                            ✓ Comment posted successfully!
                        </p>
                    )}
                    {submitResult === "failed" && (
                        <p className="text-red-400 text-xs font-semibold mt-2">
                            ✗ Failed to post. Please try again.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}

export default BlogComments;
