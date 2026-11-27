"use client";

import React from "react";
import { ShieldAlert, Clock } from "lucide-react";
import type { AuditLogRecord } from "./types";

interface AuditTrailViewProps {
  logs: AuditLogRecord[];
}

export default function AuditTrailView({ logs }: AuditTrailViewProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">
          Immutable Billing Audit Log ({logs.length})
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Chronological record of invoice creations, Zoho email dispatches,
          crypto receipts, bank reconciliations, and rollbacks.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="p-12 text-center">
          <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No audit events recorded yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {logs.map((log) => {
            const ts = log.timestamp || log.createdAt;
            const formatted = ts
              ? new Date(ts).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "";
            return (
              <div
                key={log._id}
                className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold shrink-0">
                    {log.action}
                  </span>
                  <div>
                    <p className="text-sm text-slate-800">{log.summary}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {log.entityType} · {log.entityId}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400 shrink-0 tabular-nums">
                  <Clock className="w-3 h-3" />
                  {formatted}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
