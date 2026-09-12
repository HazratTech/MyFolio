"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, User, Bot, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const LiveChatWidget = () => {
    const pathname = usePathname();
    
    const [isOpen, setIsOpen] = useState(false);
    const [threadId, setThreadId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [isStarting, setIsStarting] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showTooltip, setShowTooltip] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isOpenRef = useRef(isOpen);
    const lastMessageCount = useRef(0);

    // Custom window event listener to programmatically open the chat
    useEffect(() => {
        const handleOpenChat = () => {
            setIsOpen(true);
            setShowTooltip(false);
            localStorage.setItem("has_seen_chat_tooltip", "true");
        };
        window.addEventListener("openLiveChat", handleOpenChat);
        return () => window.removeEventListener("openLiveChat", handleOpenChat);
    }, []);

    // Check first-time visitor for CTA tooltip
    useEffect(() => {
        const hasSeenTooltip = localStorage.getItem("has_seen_chat_tooltip");
        if (!hasSeenTooltip && !isOpen) {
            const timer = setTimeout(() => {
                setShowTooltip(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleToggle = () => {
        if (!isOpen) {
            setShowTooltip(false);
            localStorage.setItem("has_seen_chat_tooltip", "true");
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        isOpenRef.current = isOpen;
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.5; // Soft volume
            audio.play().catch(() => {
                // Ignore autoplay policy errors or missing file
            });
        } catch (e) {
            console.error("Audio play failed:", e);
        }
    };

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Polling for new messages
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        const fetchMessages = async () => {
            if (!threadId) return;
            try {
                const res = await fetch(`/api/chat/messages?threadId=${threadId}`);
                if (res.ok) {
                    const data = await res.json();
                    const currentLength = data.messages.length;
                    
                    if (lastMessageCount.current > 0 && currentLength > lastMessageCount.current) {
                        const newMsgs = data.messages.slice(lastMessageCount.current);
                        const adminMsgs = newMsgs.filter((m: any) => m.sender === "admin");
                        
                        if (adminMsgs.length > 0 && !isOpenRef.current) {
                            playNotificationSound();
                            setUnreadCount(c => c + adminMsgs.length);
                        }
                    }
                    
                    lastMessageCount.current = currentLength;
                    setMessages(data.messages);
                }
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
        };

        if (threadId) {
            // Initial fetch
            fetchMessages();
            // Poll every 3 seconds
            interval = setInterval(fetchMessages, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [threadId]);

    const handleStartChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !messageInput.trim()) return;

        setIsStarting(true);
        try {
            const res = await fetch("/api/chat/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, initialMessage: messageInput }),
            });

            if (res.ok) {
                const data = await res.json();
                setThreadId(data.threadId);
                setMessages([data.message]);
                setMessageInput("");
                // Store session in localStorage so chat persists across reloads
                localStorage.setItem("chat_thread_id", data.threadId);
            }
        } catch (error) {
            console.error("Error starting chat:", error);
        } finally {
            setIsStarting(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !threadId) return;

        const optimisticMessage = {
            _id: Date.now().toString(),
            sender: "user",
            content: messageInput,
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        const contentToSend = messageInput;
        setMessageInput("");
        setIsSending(true);

        try {
            await fetch("/api/chat/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ threadId, content: contentToSend }),
            });
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    // Restore session on load
    useEffect(() => {
        const savedThreadId = localStorage.getItem("chat_thread_id");
        if (savedThreadId) {
            setThreadId(savedThreadId);
        }
    }, []);

    // Hide chat on admin, blog, and legal pages
    const isHiddenPath = pathname?.startsWith("/admin") ||
                         pathname?.startsWith("/blog") || 
                         pathname === "/privacy-policy" || 
                         pathname === "/terms-of-service" || 
                         pathname === "/cookie-policy";

    if (isHiddenPath) {
        return null;
    }

    return (
        <LazyMotion features={domAnimation}>
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <m.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-20 right-6 w-[360px] max-w-[calc(100vw-3rem)] bg-white border border-slate-200 shadow-[0_25px_60px_rgba(0,0,0,0.18)] rounded-3xl overflow-hidden z-50 flex flex-col h-[520px] max-h-[72vh]"
                    >
                        {/* Header */}
                        <div 
                            style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                            className="p-4 flex justify-between items-center shrink-0 shadow-sm relative z-10"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                                        <MessageSquare className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-blue-600 rounded-full" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-1.5">
                                        Direct Studio Support
                                    </h3>
                                    <p className="text-blue-100 text-[11px] font-medium">Replies typically within minutes</p>
                                </div>
                            </div>
                            <button
                                onClick={handleToggle}
                                className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/15"
                                aria-label="Close Chat"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 bg-[#fafaf9] overflow-y-auto p-4 flex flex-col gap-4 relative custom-scrollbar">
                            {!threadId ? (
                                /* Onboarding Form */
                                <div className="h-full flex flex-col justify-center">
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 mb-2.5 w-fit">
                                            <Sparkles className="w-3 h-3 text-blue-600" />
                                            <span>Live Builder Connect</span>
                                        </div>
                                        <h4 className="text-slate-950 font-bold font-heading mb-1 text-base">Welcome! Let&apos;s get started.</h4>
                                        <p className="text-slate-600 text-xs mb-4 leading-relaxed">
                                            Provide your details and inquiry to start a direct session with RelayWorks.
                                        </p>
                                        <form onSubmit={handleStartChat} className="space-y-3">
                                            <div>
                                                <Input
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Your Name"
                                                    required
                                                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 text-slate-900 text-sm h-10 placeholder:text-slate-400 rounded-xl"
                                                />
                                            </div>
                                            <div>
                                                <Input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="Your Email"
                                                    required
                                                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 text-slate-900 text-sm h-10 placeholder:text-slate-400 rounded-xl"
                                                />
                                            </div>
                                            <div>
                                                <Input
                                                    value={messageInput}
                                                    onChange={(e) => setMessageInput(e.target.value)}
                                                    placeholder="How can I help you?"
                                                    required
                                                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 text-slate-900 text-sm h-10 placeholder:text-slate-400 rounded-xl"
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={isStarting}
                                                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                                className="w-full hover:opacity-90 text-white font-bold h-11 rounded-xl shadow-xs transition-opacity text-sm"
                                            >
                                                {isStarting ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Connecting...</span>
                                                    </div>
                                                ) : (
                                                    "Start Chat"
                                                )}
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                /* Chat Messages */
                                <>
                                    {messages.length === 0 && (
                                        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                                            Loading messages...
                                        </div>
                                    )}
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={msg._id || idx}
                                            className={`flex flex-col max-w-[85%] ${
                                                msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                                            }`}
                                        >
                                            <div className="flex items-end gap-2">
                                                {msg.sender === "admin" && (
                                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 shrink-0 mb-1">
                                                        <img src="/images/founder.jpg" alt="Hazrat" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div
                                                    className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                                                        msg.sender === "user"
                                                            ? "text-white rounded-br-xs shadow-2xs"
                                                            : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-2xs"
                                                    }`}
                                                    style={msg.sender === "user" ? { backgroundColor: "#2563eb", wordBreak: 'break-word' } : { wordBreak: 'break-word' }}
                                                >
                                                    {msg.content}
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input Area (Only if chatting) */}
                        {threadId && (
                            <div className="bg-white p-3 border-t border-slate-200 shrink-0">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <Input
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type your message..."
                                        disabled={isSending}
                                        className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 text-slate-900 text-sm h-10 placeholder:text-slate-400 rounded-xl"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isSending || !messageInput.trim()}
                                        size="icon"
                                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                        className="hover:opacity-90 text-white shrink-0 h-10 w-10 rounded-xl shadow-xs transition-opacity"
                                    >
                                        <Send className="w-4 h-4 ml-0.5" />
                                    </Button>
                                </form>
                            </div>
                        )}
                    </m.div>
                )}
            </AnimatePresence>

            {/* Toggle Button Container */}
            <div className="fixed bottom-6 right-6 z-40">
                <AnimatePresence>
                    {showTooltip && !isOpen && (
                        <m.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute bottom-[4.5rem] right-0 bg-white border border-slate-200 p-3 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.12)] flex items-center gap-3 cursor-pointer group w-[270px] origin-bottom-right"
                            onClick={handleToggle}
                        >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-slate-200">
                                    <img src="/images/founder.jpg" alt="RelayWorks Founder" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs animate-pulse" />
                            </div>
                            
                            {/* Text */}
                            <div className="flex-1 flex flex-col justify-center">
                                <p className="text-xs font-bold text-slate-950 leading-tight flex items-center gap-1.5">
                                    Have a question? <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Live</span>
                                </p>
                                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">Chat directly with Hazrat (Studio Founder).</p>
                            </div>

                            {/* Close cross for the tooltip */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowTooltip(false);
                                    localStorage.setItem("has_seen_chat_tooltip", "true");
                                }}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full flex items-center justify-center border border-slate-200 transition-colors shadow-xs z-10"
                                aria-label="Close tooltip"
                            >
                                <X className="w-3 h-3" />
                            </button>

                            {/* Triangle pointer to the bottom */}
                            <div className="absolute -bottom-1.5 right-[1.125rem] w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45" />
                        </m.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={handleToggle}
                    style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                    className="relative w-14 h-14 hover:opacity-90 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 shrink-0"
                    aria-label="Toggle Live Chat Support"
                >
                    {unreadCount > 0 && (
                        <span 
                            style={{ position: 'absolute', top: '-4px', right: '-4px' }}
                            className="bg-red-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-50"
                        >
                            {unreadCount}
                        </span>
                    )}
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <MessageSquare className="w-6 h-6" />
                    )}
                </button>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
            `}</style>
        </LazyMotion>
    );
};
