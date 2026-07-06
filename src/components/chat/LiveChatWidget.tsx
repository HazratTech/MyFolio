"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, User, Bot, Loader2 } from "lucide-react";
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
            // The polling will fetch the real message with DB ID shortly
        } catch (error) {
            console.error("Error sending message:", error);
            // Revert optimistic update on failure could be handled here
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

    // Hide chat on blog and legal pages
    const isHiddenPath = pathname?.startsWith("/blog") || 
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
                        className="fixed bottom-20 right-6 w-[350px] max-w-[calc(100vw-3rem)] bg-[#1e1f22] border border-white/10 shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col h-[500px] max-h-[70vh]"
                    >
                        {/* Header */}
                        <div className="bg-[#5865F2] p-4 flex justify-between items-center text-white shrink-0 shadow-md relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-tight">Live Support</h3>
                                    <p className="text-white/80 text-[11px]">We usually reply in a few minutes</p>
                                </div>
                            </div>
                            <button
                                onClick={handleToggle}
                                className="text-white/80 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 bg-[#313338] overflow-y-auto p-4 flex flex-col gap-4 relative custom-scrollbar">
                            {!threadId ? (
                                /* Onboarding Form */
                                <div className="h-full flex flex-col justify-center">
                                    <div className="bg-[#2b2d31] p-5 rounded-xl border border-white/5 shadow-inner">
                                        <h4 className="text-white font-semibold mb-2 text-center text-sm">Welcome! Let's get started.</h4>
                                        <p className="text-[#dbdee1] text-xs mb-5 text-center leading-relaxed">
                                            Please provide your name and your question to start chatting with RelayWorks.
                                        </p>
                                        <form onSubmit={handleStartChat} className="space-y-4">
                                            <div>
                                                <Input
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Your Name"
                                                    required
                                                    className="bg-black/20 border-[#2f3136] focus:border-[#5865F2] text-white text-sm h-10 placeholder:text-[#949ba4]"
                                                />
                                            </div>
                                            <div>
                                                <Input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="Your Email"
                                                    required
                                                    className="bg-black/20 border-[#2f3136] focus:border-[#5865F2] text-white text-sm h-10 placeholder:text-[#949ba4]"
                                                />
                                            </div>
                                            <div>
                                                <Input
                                                    value={messageInput}
                                                    onChange={(e) => setMessageInput(e.target.value)}
                                                    placeholder="How can I help you?"
                                                    required
                                                    className="bg-black/20 border-[#2f3136] focus:border-[#5865F2] text-white text-sm h-10 placeholder:text-[#949ba4]"
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={isStarting}
                                                className="w-full bg-[#5865F2] hover:bg-[#5865F2]/90 text-white font-semibold shadow-md"
                                            >
                                                {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Chat"}
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                /* Chat Messages */
                                <>
                                    {messages.length === 0 && (
                                        <div className="flex-1 flex items-center justify-center text-[#949ba4] text-xs">
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
                                                    <div className="w-6 h-6 rounded-full bg-[#5865F2] flex items-center justify-center shrink-0 mb-1">
                                                        <span className="text-[10px] font-bold text-white">H</span>
                                                    </div>
                                                )}
                                                <div
                                                    className={`px-3.5 py-2 rounded-2xl text-sm ${
                                                        msg.sender === "user"
                                                            ? "bg-[#5865F2] text-white rounded-br-sm"
                                                            : "bg-[#2b2d31] text-[#dbdee1] border border-white/5 rounded-bl-sm"
                                                    }`}
                                                    style={{ wordBreak: 'break-word' }}
                                                >
                                                    {msg.content}
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-[#949ba4] mt-1 px-1">
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
                            <div className="bg-[#2b2d31] p-3 border-t border-black/20 shrink-0">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <Input
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type a message..."
                                        disabled={isSending}
                                        className="bg-[#383a40] border-none focus-visible:ring-1 focus-visible:ring-[#5865F2] text-white text-sm h-10 placeholder:text-[#949ba4]"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isSending || !messageInput.trim()}
                                        size="icon"
                                        className="bg-[#5865F2] hover:bg-[#5865F2]/90 text-white shrink-0 h-10 w-10 rounded-xl"
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
                            className="absolute bottom-[4.5rem] right-0 bg-[#1e1f22]/95 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3 cursor-pointer group w-[260px] origin-bottom-right"
                            onClick={handleToggle}
                        >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#2b2d31]">
                                    <img src="https://github.com/ihazratummar.png" alt="RelayWorks Founder" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#1e1f22] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                            </div>
                            
                            {/* Text */}
                            <div className="flex-1 flex flex-col justify-center">
                                <p className="text-[13px] font-bold text-white leading-tight flex items-center gap-1.5">
                                    Have a question? <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-black">Live</span>
                                </p>
                                <p className="text-[11px] text-[#dbdee1] mt-0.5 leading-snug">Chat directly with Hazrat (Founder of RelayWorks).</p>
                            </div>

                            {/* Close cross for the tooltip */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowTooltip(false);
                                    localStorage.setItem("has_seen_chat_tooltip", "true");
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-[#2b2d31] hover:bg-[#383a40] text-[#949ba4] hover:text-white rounded-full flex items-center justify-center border border-white/10 transition-colors shadow-lg z-10"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>

                            {/* Triangle pointer to the bottom */}
                            <div className="absolute -bottom-1.5 right-[1.125rem] w-3.5 h-3.5 bg-[#1e1f22] border-b border-r border-white/10 rotate-45 rounded-br-sm" />
                        </m.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={handleToggle}
                    className="relative w-14 h-14 bg-[#5865F2] hover:bg-[#5865F2]/90 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(88,101,242,0.4)] transition-transform hover:scale-105 shrink-0"
                >
                    {unreadCount > 0 && (
                        <span 
                            style={{ position: 'absolute', top: '-4px', right: '-4px' }}
                            className="bg-red-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#1e1f22] shadow-sm z-50"
                        >
                            {unreadCount}
                        </span>
                    )}
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <img src="/discord.svg" alt="Chat" className="w-6 h-6" />
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
                    background: #1e1f22;
                    border-radius: 10px;
                }
            `}</style>
        </LazyMotion>
    );
};
