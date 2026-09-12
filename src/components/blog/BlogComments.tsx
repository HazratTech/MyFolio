"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Calendar, User, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
                setComments(prev => [...prev, newComment]);
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
        <div className="mt-16 pt-12 border-t border-slate-200 max-w-4xl mx-auto">
            <h2 className="text-2xl font-black font-heading text-slate-950 flex items-center gap-2.5 mb-8">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>Discussion ({comments.length})</span>
            </h2>

            {/* Comment Thread List */}
            <div className="space-y-4 mb-12">
                {loading ? (
                    <div className="flex justify-center py-8 text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                ) : comments.length > 0 ? (
                    comments.map(comment => {
                        const formattedDate = new Date(comment.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        });
                        return (
                            <div key={comment._id} className="flex gap-4 items-start bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs transition-colors">
                                <img
                                    src={`https://gravatar.com/avatar/${comment.emailHash}?d=identicon&s=120`}
                                    alt={comment.name}
                                    className="w-10 h-10 rounded-full border border-slate-200 shrink-0 bg-slate-100"
                                    loading="lazy"
                                />
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h4 className="font-bold text-slate-900 text-sm truncate">{comment.name}</h4>
                                        <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            {formattedDate}
                                        </span>
                                    </div>
                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-sans select-text">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-slate-500 text-sm text-center py-6 bg-white rounded-2xl border border-slate-200 border-dashed">
                        No comments yet. Start the conversation below!
                    </p>
                )}
            </div>

            {/* Submission Form */}
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-xs">
                <h3 className="text-lg font-bold font-heading text-slate-950 mb-6">Join the Technical Discussion</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label htmlFor="commenter-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-500" /> Name
                            </label>
                            <Input
                                id="commenter-name"
                                type="text"
                                placeholder="Your Name"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                                className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus-visible:ring-blue-600 h-11 text-sm rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="commenter-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-500" /> Email <span className="text-[10px] text-slate-400 font-normal lowercase">(for Gravatar - kept private)</span>
                            </label>
                            <Input
                                id="commenter-email"
                                type="email"
                                placeholder="name@example.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                                className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus-visible:ring-blue-600 h-11 text-sm rounded-xl"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="commenter-message" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Comment</label>
                        <Textarea
                            id="commenter-message"
                            placeholder="Share your technical perspective, question, or implementation insight..."
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            required
                            rows={4}
                            className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus-visible:ring-blue-600 text-sm rounded-xl resize-y"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={submitting}
                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                        className="w-full sm:w-auto hover:opacity-90 text-white font-bold h-11 px-6 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-opacity"
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
                        <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold mt-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Comment posted successfully!</span>
                        </div>
                    )}
                    {submitResult === "failed" && (
                        <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold mt-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span>Failed to post comment. Please try again.</span>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default BlogComments;
