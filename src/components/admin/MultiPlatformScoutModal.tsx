"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Globe,
  ExternalLink,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  X,
  GitBranch,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const PLATFORMS = [
  { id: "all", label: "All Platforms" },
  { id: "github-bounties", label: "GitHub Paid Bounties" },
  { id: "freelancer", label: "Freelancer (Low-Bid $150+)" },
  { id: "weworkremotely", label: "WeWorkRemotely Contract" },
  { id: "himalayas", label: "Himalayas Contractor" },
  { id: "job-boards", label: "Jobicy & WorkingNomads" },
  { id: "mastodon", label: "Mastodon Indie Founders" },
] as const;

interface DiscoveredItem {
  id: string;
  platform: string;
  title: string;
  rawText: string;
  author: string;
  source: string;
  sourceUrl: string;
  extractedEmail?: string;
  defaultCategory: string;
  budget?: string;
  postedAt: string;
  ageLabel: string;
  metaBadge?: string;
  alreadySaved?: boolean;
}

interface MultiPlatformScoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadImported: () => void;
}

export function MultiPlatformScoutModal({
  open,
  onOpenChange,
  onLeadImported,
}: MultiPlatformScoutModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<DiscoveredItem[]>([]);
  const [importingId, setImportingId] = useState<string | null>(null);

  const runScan = useCallback(async (platformId = selectedPlatform) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/leads/discover?platform=${encodeURIComponent(platformId)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to scan platforms");
      } else {
        setItems(data.items || []);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, [selectedPlatform]);

  useEffect(() => {
    if (open && items.length === 0 && !loading) {
      runScan();
    }
  }, [open, items.length, loading, runScan]);

  const handleImport = async (item: DiscoveredItem) => {
    setImportingId(item.id);
    try {
      const res = await fetch("/api/admin/leads/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, alreadySaved: true } : x))
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
          maxWidth: "940px",
          width: "95vw",
        }}
        className="sm:max-w-[940px] w-[95vw] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-2xl"
      >
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between gap-4">
          <div>
            <DialogTitle className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Multi-Platform Real Job Scout</span>
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Live verified work from GitHub Paid Bounties, Low-Bid Freelancer Projects, WeWorkRemotely, Himalayas Contractors, &amp; Indie Founders.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={loading}
              onClick={() => runScan(selectedPlatform)}
              className="h-8 px-3 rounded-lg bg-slate-950 hover:bg-black text-white text-xs font-semibold"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Platform Filter Tabs */}
        <div className="shrink-0 px-4 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {PLATFORMS.map((p) => {
              const active = selectedPlatform === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlatform(p.id);
                    runScan(p.id);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    active
                      ? "bg-slate-950 border-slate-950 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {items.length} real listing{items.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl border border-slate-200 bg-white animate-pulse"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <Briefcase className="w-7 h-7 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">
                No matching software contract listings found right now
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Switch to &quot;All Platforms&quot; or check GitHub Paid Bounties &amp; Freelancer.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.platform === "github-bounties" ? (
                        <GitBranch className="w-3 h-3" />
                      ) : (
                        <Globe className="w-3 h-3" />
                      )}
                      {item.source}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/70">
                      {item.defaultCategory}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <Clock className="w-3 h-3" />
                      {item.ageLabel}
                    </span>
                    {item.metaBadge && (
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80">
                        {item.metaBadge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-700"
                    >
                      Open Live Post
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {item.alreadySaved ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Saved
                      </span>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        disabled={importingId === item.id}
                        onClick={() => handleImport(item)}
                        className="h-7 px-3 rounded-lg bg-slate-950 hover:bg-black text-white text-[11px] font-semibold"
                      >
                        {importingId === item.id ? (
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
                  {item.title}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {item.rawText}
                </p>

                {item.extractedEmail && (
                  <div className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    <Send className="w-3 h-3" />
                    Direct Email: {item.extractedEmail}
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
