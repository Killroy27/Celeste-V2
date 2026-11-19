import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminSupport } from "./AdminSupport";

export const metadata: Metadata = { title: "Support" };

export default function AdminSupportPage() {
  return (
    <Suspense>
      <AdminSupport />
    </Suspense>
  );
}
