import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminSettings } from "./AdminSettings";

export const metadata: Metadata = { title: "Paramètres" };

export default function AdminSettingsPage() {
  return (
    <Suspense>
      <AdminSettings />
    </Suspense>
  );
}
