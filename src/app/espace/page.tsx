import type { Metadata } from "next";
import { Cockpit } from "./Cockpit";

export const metadata: Metadata = { title: "Accueil" };

export default function EspacePage() {
  return <Cockpit />;
}
