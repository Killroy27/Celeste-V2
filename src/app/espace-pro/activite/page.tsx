import type { Metadata } from "next";
import { Suspense } from "react";
import { Activite } from "./Activite";

export const metadata: Metadata = { title: "Mon activité" };

export default function ActivitePage() {
  return (
    <Suspense>
      <Activite />
    </Suspense>
  );
}
