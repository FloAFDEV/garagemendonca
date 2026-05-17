"use client";

import { Suspense } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { CRMInbox } from "@/components/admin/CRMInbox";
import { ACTIVE_GARAGE_ID as GARAGE_ID } from "@/lib/config/garage";

export default function MessagesPage() {
  return (
    <AdminLayout>
      {/* Suspense requis : CRMInbox utilise useSearchParams() pour le deep link ?id= */}
      <Suspense fallback={<div className="p-8 text-slate-400 text-sm">Chargement…</div>}>
        <CRMInbox garageId={GARAGE_ID} />
      </Suspense>
    </AdminLayout>
  );
}
