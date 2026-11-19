import type { Metadata } from "next";
import { Dashboard } from "./Dashboard";

export const metadata: Metadata = { title: "Accueil" };

export default function ProHome() {
  return <Dashboard />;
}
