"use client";

import React, { useEffect } from "react";

interface AdBannerProps {
    slot: string;
    style?: React.CSSProperties;
    format?: "auto" | "fluid" | "horizontal" | "rectangle" | "vertical";
    responsive?: "true" | "false";
}

export const AdBanner = ({ slot, style, format = "auto", responsive = "true" }: AdBannerProps) => {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            // Silently fail if AdSense is blocked by browser ad blocker or not loaded yet
            console.debug("AdSense script push trigger:", e);
        }
    }, [slot]);

    return (
        <div className="w-full my-8 flex flex-col items-center justify-center overflow-hidden">
            <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-1.5 select-none font-mono">
                Advertisement
            </span>
            <div className="w-full max-w-7xl min-h-[90px] md:min-h-[100px] bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-center text-xs text-muted-foreground/60 transition-all hover:bg-white/[0.04] hover:border-white/10 relative">
                {/* Google AdSense Unit */}
                <ins
                    className="adsbygoogle"
                    style={style || { display: "block", width: "100%", minWidth: "250px" }}
                    data-ad-client="ca-pub-2489956198626091"
                    data-ad-slot={slot}
                    data-ad-format={format}
                    data-full-width-responsive={responsive}
                />
                
                {/* Fallback label when ad has not rendered yet */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="font-mono text-white/10 text-[9px] uppercase tracking-widest">
                        AdSense Slot [{slot}]
                    </span>
                </div>
            </div>
        </div>
    );
};
