import type { Metadata } from "next";
import { Suspense } from "react";
import { Messages } from "./Messages";

export const metadata: Metadata = { title: "Messages" };

// Messagerie et Deal Room (CDC §11). La conversation ouverte est dans l'URL (?c=prestataire),
// pour que le retour arrière du téléphone ramène à la liste et qu'un lien mène droit à une offre.
export default function MessagesPage() {
  return (
    <Suspense>
      <Messages />
    </Suspense>
  );
}
