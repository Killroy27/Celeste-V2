import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Mentions légales" };

export default function Page() {
  return (
    <LegalPage
      title="Mentions légales"
      sections={[
        ["Éditeur du site", "Le site Céleste est édité par la société exploitant la marque Céleste. Raison sociale, forme juridique, capital, adresse du siège, numéro RCS et numéro de TVA intracommunautaire seront précisés ici."],
        ["Directeur de la publication", "Le nom du directeur de la publication sera indiqué ici."],
        ["Hébergement", "Le nom, l'adresse et le téléphone de l'hébergeur du site seront indiqués ici."],
        ["Propriété intellectuelle", "L'ensemble des contenus du site (textes, photographies, logos, icônes) est protégé par le droit d'auteur. Toute reproduction sans autorisation préalable est interdite."],
        ["Contact", "Pour toute question, vous pouvez nous écrire depuis la page Contact."],
      ]}
    />
  );
}
