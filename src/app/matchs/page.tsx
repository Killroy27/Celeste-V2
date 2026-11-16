import type { Metadata } from "next";
import { Suspense } from "react";
import { MatchQuiz } from "./MatchQuiz";

export const metadata: Metadata = {
  title: "Trouver mon Best Match",
  description: "Quatre questions pour découvrir les prestataires de mariage qui vous ressemblent.",
};

export default function MatchsPage() {
  return (
    <Suspense>
      <MatchQuiz />
    </Suspense>
  );
}
