import type { Metadata } from "next";
import { Prestataires } from "./Prestataires";

export const metadata: Metadata = { title: "Mes prestataires" };

export default function PrestatairesPage() {
  return <Prestataires />;
}
