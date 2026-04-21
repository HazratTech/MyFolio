"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Terminal, Home, FileText } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFound() {
    const [path, setPath] = useState("");

    useEffect(() => {
        setPath(window.location.pathname);
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center font-mono">
            <div className="max-w-2xl w-full space-y-8">
                {/* 404 Glitch Effect */}
                <div className="relative">
                    <h1 className="text-9xl font-bold text-primary opacity-20 select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h1 className="text-7xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 animate-pulse">
                            System Error
                        </h1>
                    </div>
                </div>

                {/* Terminal Window */}
                <div className="bg-card border border-white/10 rounded-lg overflow-hidden shadow-2xl text-left mx-auto max-w-lg">
                    <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex gap-2 items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground ml-2">bash — 80x24</span>
                    </div>
                    <div className="p-6 space-y-4 font-mono text-sm md:text-base">
                        <div className="text-green-400">
                            <span className="text-blue-400">user@dev</span>:<span className="text-blue-300">~</span>$ curl https://hazratdev.top {path}
                        </div>
                        <div className="text-red-400">
                            Error 404: Resource not found or currently unavailable.
                        </div>
                        <div className="text-muted-foreground">
                            > Initiating search sequence...<br />
                            > Scanning sector: /blog... <span className="text-red-400">Negative.</span><br />
                            > Scanning sector: /projects... <span className="text-red-400">Negative.</span><br />
                            > Determining user intent... <span className="text-green-400">Success.</span>
                        </div>
                        <div className="text-green-400 animate-pulse">
                            <span className="text-blue-400">user@dev</span>:<span className="text-blue-300">~</span>$ _
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-muted-foreground text-lg">
                        Looks like you've ventured into the void. This page doesn't exist yet.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/">
                            <Button size="lg" className="group">
                                <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                Return Home
                            </Button>
                        </Link>
                        <Link href="/blog">
                            <Button size="lg" variant="outline" className="group">
                                <FileText className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                Read Blog
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Background decoration */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-[40%] right-[10%] w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute bottom-[20%] left-[20%] w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
            </div>
        </div>
    );
}
