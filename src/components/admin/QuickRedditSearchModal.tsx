"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ExternalLink,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Clock,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const PRESET_SUBREDDITS = [
  "forhire",
  "hiring",
  "freelance_forhire",
  "jobbit",
  "DiscordBots",
  "Discord_Bots",
  "AI_Agents",
  "AutomateYourself",
  "n8n",
  "shopify",
  "SaaS",
  "androiddev",
];

export interface QuickRedditPost {
  id: string;
  subreddit: string;
  title: string;
  selftext: string;
  author: string;
  permalink: string;
  sourceUrl: string;
  createdUtc: number;
  postedAt: string;
  ageLabel: string;
  linkFlairText: string;
  categoryHint: "Mobile Apps" | "Discord Bots" | "AI & Chatbots" | "Backend";
  budget: string;
  extractedEmail: string;
  dmUrl: string;
  alreadySaved?: boolean;
}

interface QuickRedditSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadImported: () => void;
}

export function QuickRedditSearchModal({
  open,
  onOpenChange,
  onLeadImported,
}: QuickRedditSearchModalProps) {
  const [selectedSubs, setSelectedSubs] = useState<string[]>([
    "forhire",
    "hiring",
    "freelance_forhire",
    "DiscordBots",
    "AI_Agents",
    "shopify",
    "SaaS",
  ]);
  const [customSub, setCustomSub] = useState("");
  const [query, setQuery] = useState("");
  const [maxAgeHours, setMaxAgeHours] = useState("48");
  const [strictCategory, setStrictCategory] = useState(true);
  const [postToDiscord, setPostToDiscord] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sourceUsed, setSourceUsed] = useState("");
  const [posts, setPosts] = useState<QuickRedditPost[]>([]);
  const [importingId, setImportingId] = useState<string | null>(null);

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const subsList = [...selectedSubs];
      const cleanedCustom = customSub.replace(/^r\//i, "").trim();
      if (cleanedCustom && !subsList.includes(cleanedCustom)) {
        subsList.push(cleanedCustom);
      }

      const params = new URLSearchParams({
        subreddits: subsList.join(","),
        maxAgeHours,
        strictCategory: String(strictCategory),
      });
      if (query.trim()) params.set("query", query.trim());

      const res = await fetch(
        `/api/admin/leads/reddit-search?${params.toString()}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Reddit search failed");
      } else {
        setPosts(data.posts || []);
        setSourceUsed(data.sourceUsed || "arctic-shift");
        if (data.rateLimited) {
          setError(
            "Upstream Reddit index is temporarily rate-limited (HTTP 429). Wait ~60 seconds and click Search Reddit again."
          );
        }
      }
    } catch (err: any) {
      setError(err.message || "Network error searching Reddit");
    } finally {
      setLoading(false);
    }
  }, [selectedSubs, customSub, query, maxAgeHours, strictCategory]);

  useEffect(() => {
    if (open && posts.length === 0 && !loading) {
      runSearch();
    }
  }, [open, posts.length, loading, runSearch]);

  const toggleSub = (sub: string) => {
    setSelectedSubs((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleImport = async (post: QuickRedditPost) => {
    setImportingId(post.id);
    try {
      const res = await fetch("/api/admin/leads/reddit-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import",
          post,
          postToDiscord,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, alreadySaved: true } : p))
        );
        onLeadImported();
      } else {
        alert(data.error || "Failed to import lead");
      }
    } finally {
      setImportingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        style={{
          maxHeight: "calc(100dvh - 2.5rem)",
          height: "min(90dvh, 780px)",
          maxWidth: "920px",
          width: "95vw",
        }}
        className="sm:max-w-[920px] w-[95vw] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-2xl"
      >
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between gap-4">
          <div>
            <DialogTitle className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <Search className="w-4 h-4 text-orange-600" />
              <span>Quick Reddit Job Search</span>
              {sourceUsed && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                  {sourceUsed}
                </span>
              )}
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Live [Hiring] scan across Reddit with instant [For Hire] spam removal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="shrink-0 p-4 border-b border-slate-100 bg-white space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Keyword (e.g. discord bot, ai agent, fastapi, kotlin, shopify)..."
                className="pl-9 h-9 text-xs bg-white border-slate-200 text-slate-900 rounded-xl"
              />
            </div>

            <Input
              value={customSub}
              onChange={(e) => setCustomSub(e.target.value)}
              placeholder="+ custom r/sub"
              className="w-full sm:w-36 h-9 text-xs bg-white border-slate-200 text-slate-900 rounded-xl font-mono"
            />

            <select
              value={maxAgeHours}
              onChange={(e) => setMaxAgeHours(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium"
            >
              <option value="6">Last 6 hours</option>
              <option value="24">Last 24 hours</option>
              <option value="48">Last 48 hours</option>
              <option value="168">Last 7 days</option>
            </select>

            <Button
              type="submit"
              disabled={loading}
              className="h-9 px-4 rounded-xl bg-slate-950 hover:bg-black text-white text-xs font-semibold shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Searching..." : "Search Reddit"}
            </Button>
          </form>

          {/* Subreddit Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESET_SUBREDDITS.map((sub) => {
              const active = selectedSubs.includes(sub);
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => toggleSub(sub)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium border transition-colors ${
                    active
                      ? "bg-orange-50 border-orange-300 text-orange-800"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  r/{sub}
                </button>
              );
            })}
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={strictCategory}
                  onChange={(e) => setStrictCategory(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900"
                />
                <span>Match my tech stack only (Bots, AI, Mobile, Backend)</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={postToDiscord}
                  onChange={(e) => setPostToDiscord(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span>Also ping Discord on import</span>
              </label>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              {posts.length} matching [Hiring] post{posts.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl border border-slate-200 bg-white animate-pulse"
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <Search className="w-7 h-7 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">
                No matching [Hiring] posts found in this window
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try broadening to Last 7 days, selecting more subreddits, or clearing your keyword filter.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200">
                      r/{post.subreddit}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/70">
                      {post.categoryHint}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <Clock className="w-3 h-3" />
                      {post.ageLabel}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      · u/{post.author}
                    </span>
                    {post.budget && (
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                        {post.budget}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={post.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-700"
                    >
                      Thread
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {post.dmUrl && (
                      <a
                        href={post.dmUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-[11px] font-medium text-orange-800"
                      >
                        <MessageSquare className="w-3 h-3" />
                        DM u/{post.author}
                      </a>
                    )}
                    {post.alreadySaved ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Saved
                      </span>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        disabled={importingId === post.id}
                        onClick={() => handleImport(post)}
                        className="h-7 px-3 rounded-lg bg-slate-950 hover:bg-black text-white text-[11px] font-semibold"
                      >
                        {importingId === post.id ? (
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3 mr-1" />
                        )}
                        Import + AI Pitch
                      </Button>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-950 leading-snug">
                  {post.title}
                </h4>

                {post.selftext && (
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {post.selftext}
                  </p>
                )}

                {post.extractedEmail && (
                  <div className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    <Send className="w-3 h-3" />
                    Direct Email: {post.extractedEmail}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
