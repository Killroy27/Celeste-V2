import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminVendors } from "./AdminVendors";

export const metadata: Metadata = { title: "Prestataires" };

export default function AdminVendorsPage() {
  return (
    <Suspense>
      <AdminVendors />
    </Suspense>
  );
}
