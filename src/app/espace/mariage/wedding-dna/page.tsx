import type { Metadata } from "next";
import { DnaView } from "./DnaView";

export const metadata: Metadata = { title: "Wedding DNA" };

export default function WeddingDnaPage() {
  return <DnaView />;
}
