import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Conditions générales" };

export default function Page() {
  return (
    <LegalPage
      title="Conditions générales d'utilisation"
      sections={[
        ["Objet", "Les présentes conditions encadrent l'utilisation de la plateforme Céleste, qui met en relation des couples et des prestataires de mariage et d'événementiel."],
        ["Accès au service", "La recherche, l'enregistrement de coups de cœur et les demandes de devis sont gratuits pour les couples. Les offres destinées aux prestataires sont décrites sur la page Devenir prestataire."],
        ["Rôle de Céleste", "Céleste agit en tant qu'intermédiaire. Le contrat de prestation est conclu directement entre le couple et le prestataire."],
        ["Paiements et acomptes", "Les modalités de paiement, de séquestre des acomptes et de remboursement seront détaillées ici, conformément aux conditions de notre prestataire de paiement."],
        ["Avis", "Seuls les couples ayant réservé un prestataire via Céleste peuvent publier un avis. Céleste se réserve le droit de modérer les contenus contraires à la loi."],
        ["Responsabilité et litiges", "Les clauses de responsabilité, de médiation et de droit applicable seront précisées ici."],
      ]}
    />
  );
}
