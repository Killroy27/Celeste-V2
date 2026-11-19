import type { Metadata } from "next";
import { Suspense } from "react";
import { SignIn } from "./SignIn";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

// Connexion et création de compte (CDC §2, §26). La marketplace reste consultable sans compte (§29).
export default function ConnexionPage() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
