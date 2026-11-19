import type { Metadata } from "next";
import { Suspense } from "react";
import { ProProfil } from "./ProProfil";

export const metadata: Metadata = { title: "Mon profil" };

export default function ProProfilPage() {
  return (
    <Suspense>
      <ProProfil />
    </Suspense>
  );
}
