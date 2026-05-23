"use client";

import { Suspense } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { CRMInbox } from "@/components/admin/CRMInbox";
import { ACTIVE_GARAGE_ID as GARAGE_ID } from "@/lib/config/garage";

function CRMSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-xl bg-slate-200 dark:bg-dark-700" />
        ))}
      </div>
      {/* Search skeleton */}
      <div className="h-10 rounded-xl bg-slate-200 dark:bg-dark-700 w-full" />
      {/* Message rows skeleton */}
      <div className="rounded-2xl border border-slate-100 dark:border-dark-700 overflow-hidden divide-y divide-slate-100 dark:divide-dark-700">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-dark-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between gap-4">
                <div className="h-3.5 rounded-lg bg-slate-200 dark:bg-dark-700 w-32" />
                <div className="h-3 rounded-lg bg-slate-100 dark:bg-dark-800 w-16" />
              </div>
              <div className="h-3 rounded-lg bg-slate-100 dark:bg-dark-800 w-48" />
              <div className="h-3 rounded-lg bg-slate-100 dark:bg-dark-800 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <AdminLayout>
      {/* Suspense requis : CRMInbox utilise useSearchParams() pour le deep link ?id= */}
      <Suspense fallback={<CRMSkeleton />}>
        <CRMInbox garageId={GARAGE_ID} />
      </Suspense>
    </AdminLayout>
  );
}
