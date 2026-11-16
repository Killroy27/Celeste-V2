import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function Page() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      sections={[
        ["Données collectées", "Céleste collecte uniquement les données nécessaires au service : identité, coordonnées, informations sur votre projet de mariage (date, lieu, budget, nombre d'invités) et vos échanges avec les prestataires."],
        ["Finalités", "Ces données servent à transmettre vos demandes de devis, gérer vos réservations et paiements, et améliorer le service. Elles ne sont jamais revendues."],
        ["Destinataires", "Vos informations de projet sont partagées uniquement avec les prestataires que vous contactez, et avec nos sous-traitants techniques (hébergement, paiement)."],
        ["Durée de conservation", "Les durées de conservation applicables à chaque catégorie de données seront précisées ici."],
        ["Vos droits", "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition. Vous pouvez les exercer depuis la page Contact."],
        ["Cookies", "Céleste n'utilise que les cookies nécessaires à son fonctionnement. Vos coups de cœur sont enregistrés localement sur votre appareil."],
      ]}
    />
  );
}
