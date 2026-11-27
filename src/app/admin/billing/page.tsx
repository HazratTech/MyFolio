import React, { Suspense } from "react";
import BillingWorkspace from "@/components/admin/billing/BillingWorkspace";

export default function AdminBillingPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-8 w-56 rounded-lg bg-slate-200/70 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl border border-slate-200 bg-white animate-pulse"
              />
            ))}
          </div>
        </div>
      }
    >
      <BillingWorkspace />
    </Suspense>
  );
}
