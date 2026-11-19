import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminMarketplace } from "./AdminMarketplace";

export const metadata: Metadata = { title: "Marketplace" };

export default function AdminMarketplacePage() {
  return (
    <Suspense>
      <AdminMarketplace />
    </Suspense>
  );
}
