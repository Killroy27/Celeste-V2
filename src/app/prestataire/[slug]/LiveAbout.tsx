"use client";

import { useEffect, useState } from "react";
import { PRO_SLUG, usePro } from "@/lib/pro";
import { currentSettings, DEFAULT_SETTINGS, paymentRule } from "@/lib/settings";
import styles from "./page.module.css";

// « À propos » de la fiche publique. Une seule saisie côté prestataire (CDC §10.3) : quand le prestataire a
// renseigné sa présentation et ses informations métier dans son espace, la fiche les reprend.
// Prototype : seul le prestataire de démonstration (Studio Aube) est relié, via le stockage du navigateur.
export function LiveAbout({ slug, bio, description, specs }: { slug: string; bio: string; description: string; specs: [string, string][] }) {
  const { pro } = usePro();
  const linked = !!pro && !pro.account && slug === PRO_SLUG;
  const text = linked && pro.profile.description.trim() ? pro.profile.description : description;
  const rows = linked ? specs.map(([k, v]) => [k, pro.specs?.[k]?.trim() || v] as [string, string]) : specs;
  return (
    <>
      <p className={styles.text}>
        {bio} {text}
      </p>
      {rows.length > 0 && (
        <dl className={styles.specs}>
          {rows.map(([k, val]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{val}</dd>
            </div>
          ))}
        </dl>
      )}
    </>
  );
}

// Règle de paiement affichée sur la fiche : suit les réglages du back-office (§14.1, §20.3).
// Valeurs du cahier au premier rendu, réglages du navigateur ensuite, pour ne pas gêner l'hydratation.
export function PayRule() {
  const [rule, setRule] = useState({ deposit: 30, balance: "le solde en 1 à 3 fois" });
  useEffect(() => setRule(paymentRule()), []);
  return (
    <>
      Paiement en ligne : {rule.deposit} % d&apos;acompte, puis {rule.balance}
    </>
  );
}

// Durées réglables depuis le back-office (§11, §20.3) : valeur du cahier au premier rendu, réglage ensuite.
export function LiveSetting({ name }: { name: "dateHoldHours" | "offerValidityDays" }) {
  const [n, setN] = useState(DEFAULT_SETTINGS[name]);
  useEffect(() => setN(currentSettings()[name]), [name]);
  return <>{n}</>;
}
