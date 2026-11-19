import type { Metadata } from "next";
import { Suspense } from "react";
import { ProMessages } from "./ProMessages";

export const metadata: Metadata = { title: "Messages" };

export default function ProMessagesPage() {
  return (
    <Suspense>
      <ProMessages />
    </Suspense>
  );
}
