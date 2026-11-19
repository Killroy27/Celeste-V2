import type { Metadata } from "next";
import { Paiements } from "./Paiements";

export const metadata: Metadata = { title: "Paiements" };

export default function PaiementsPage() {
  return <Paiements />;
}
