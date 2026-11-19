import type { Metadata } from "next";
import { Suspense } from "react";
import { Opportunites } from "./Opportunites";

export const metadata: Metadata = { title: "Opportunités" };

export default function OpportunitesPage() {
  return (
    <Suspense>
      <Opportunites />
    </Suspense>
  );
}
