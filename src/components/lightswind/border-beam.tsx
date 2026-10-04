"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
    className?: string;
    size?: number;
    duration?: number;
    borderWidth?: number;
    colorFrom?: string;
    colorTo?: string;
    delay?: number;
    glow?: boolean;
}

export const BorderBeam = ({
    className,
    size = 180,
    duration = 8,
    borderWidth = 1.5,
    colorFrom = "#2563eb",
    colorTo = "#38bdf8",
    delay = 0,
    glow = true,
}: BorderBeamProps) => {
    return (
        <div
            className={cn(
                "pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden",
                className
            )}
            style={{ padding: `${borderWidth}px` }}
        >
            {/* The traveling beam */}
            <div
                className="absolute inset-0 rounded-[inherit]"
                style={
                    {
                        "--size": `${size}px`,
                        "--duration": `${duration}s`,
                        "--color-from": colorFrom,
                        "--color-to": colorTo,
                        "--delay": `-${delay}s`,
                    } as React.CSSProperties
                }
            >
                <div
                    className={cn(
                        "absolute -inset-[100%] aspect-square animate-spin-slow opacity-90",
                        glow && "filter blur-[1px]"
                    )}
                    style={{
                        background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, ${colorFrom} 320deg, ${colorTo} 360deg)`,
                        animation: `border-beam-spin ${duration}s linear infinite`,
                        animationDelay: `-${delay}s`,
                    }}
                />
            </div>

            {/* Inner mask cut-out to expose only the border */}
            <div className="absolute inset-[1.5px] rounded-[inherit] bg-white pointer-events-none" />

            <style jsx>{`
                @keyframes border-beam-spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
};
