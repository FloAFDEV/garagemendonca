"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { CRMInbox } from "@/components/admin/CRMInbox";

const GARAGE_ID = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

export default function MessagesPage() {
  return (
    <AdminLayout>
      <CRMInbox garageId={GARAGE_ID} />
    </AdminLayout>
  );
}
