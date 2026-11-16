import type { Metadata } from "next";
import { MatchFlow } from "./MatchFlow";

export const metadata: Metadata = {
  title: "Trouver mon Best Match",
  description: "Votre Wedding DNA en quelques images, puis les prestataires qui vous ressemblent, avec un score expliqué.",
};

export default function MatchsPage() {
  return <MatchFlow />;
}
