import React from "react";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Social from "@/models/Social";
import { getIcon } from "@/lib/utils/icons";

export const BlogFooter = async () => {
    let socials = [];
    try {
        await dbConnect();
        socials = await Social.find({});
    } catch (error) {
        console.error("Failed to fetch socials in BlogFooter:", error);
    }

    return (
        <footer className="bg-background border-t border-white/10 py-12">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-center pb-8 border-b border-white/5">
                    <div className="mb-6 md:mb-0 text-center md:text-left">
                        <Link href="/blog" className="text-2xl font-bold font-heading tracking-tighter">
                            Relay<span className="text-primary">Works</span><span className="text-sm font-normal text-muted-foreground ml-2">Blog</span>
                        </Link>
                        <p className="text-muted-foreground mt-2 text-sm max-w-md">
                            Deep-dive technical tutorials, articles, and guides on Android, iOS, Backend development, Discord bots, and software architecture.
                        </p>
                    </div>

                    <div className="flex space-x-6">
                        {socials.map((social: any, index: number) => {
                            const Icon = getIcon(social.icon);
                            return (
                                <a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-muted-foreground transition-colors ${social.color}`}
                                    aria-label={`${social.name} Profile`}
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} RelayWorks. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link href="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link>
                        <Link href="#cookie-settings" className="hover:text-primary transition-colors">Manage Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
