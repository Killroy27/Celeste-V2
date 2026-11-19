"use client";

import Link from "next/link";
import { proIdentity, proStatus, publishChecks, usePro, type Pro } from "@/lib/pro";
import styles from "../espace/espace.module.css";
import p from "./pro.module.css";

const LADDER = [
  { label: "Inscrit", text: "Compte créé : vous pouvez préparer votre fiche." },
  { label: "Profil publié", text: "Votre fiche est visible des couples et du Best Match." },
  { label: "Vérifié", text: "Identité et existence professionnelles contrôlées par Céleste." },
  { label: "Select", text: "Se mérite par la performance réelle : réservations, avis, réactivité." },
];

// Premiers pas d'un prestataire inscrit (CDC §16.2) : compte immédiat, puis publication et confiance
// qui évoluent selon la complétude, la vérification et l'activité.
export function Onboarding({ pro }: { pro: Pro }) {
  const { update } = usePro();
  const id = proIdentity(pro);
  const status = proStatus(pro);
  const checks = publishChecks(pro);
  const ready = checks.every((c) => c.ok);
  const level = LADDER.findIndex((l) => l.label === status.label);
  const docsToSend = pro.verification.filter((v) => v.status === "À fournir").length;

  return (
    <section className={`${styles.card} ${p.onboarding}`} aria-labelledby="onb-t">
      <div className={styles.cardHead}>
        <div>
          <p className={styles.eyebrow}>
            {id.name} · {id.categoryLabel}
          </p>
          <h2 id="onb-t" className={styles.sectionTitle}>
            {status.published ? "Votre fiche est en ligne" : `Bienvenue ${id.firstName}, votre compte est créé`}
          </h2>
        </div>
      </div>

      <ol className={p.ladder} aria-label="Votre progression">
        {LADDER.map((l, i) => (
          <li key={l.label} data-state={i < level ? "done" : i === level ? "current" : "todo"} aria-current={i === level ? "step" : undefined}>
            <span className={p.ladderDot} aria-hidden="true">
              {i < level ? "✓" : i + 1}
            </span>
            <span>
              <strong>{l.label}</strong>
              <small>{l.text}</small>
            </span>
          </li>
        ))}
      </ol>

      {!status.published ? (
        <>
          <h3 className={p.subTitle}>Pour publier votre fiche</h3>
          <ul className={p.steps}>
            {checks.map((c) => (
              <li key={c.id} data-ok={c.ok}>
                <span aria-hidden="true">{c.ok ? "✓" : "○"}</span>
                <Link href={c.href}>{c.label}</Link>
                <span className="visually-hidden">{c.ok ? " : fait" : " : à faire"}</span>
              </li>
            ))}
          </ul>
          <div className={p.onbActions}>
            <button type="button" className="btn" disabled={!ready} onClick={() => update((x) => (x.account ? { ...x, account: { ...x.account, published: true } } : x))}>
              Publier ma fiche
            </button>
            {!ready && <span className={styles.small}>{checks.filter((c) => !c.ok).length} étape(s) restante(s)</span>}
          </div>
        </>
      ) : (
        <ul className={p.steps}>
          <li data-ok={docsToSend === 0}>
            <span aria-hidden="true">{docsToSend === 0 ? "✓" : "○"}</span>
            <Link href="/espace-pro/profil?vue=confiance">{docsToSend ? `Envoyer vos justificatifs (${docsToSend} restant${docsToSend > 1 ? "s" : ""}) pour le badge Vérifié` : "Justificatifs envoyés : vérification en cours par Céleste"}</Link>
          </li>
          <li data-ok={false}>
            <span aria-hidden="true">○</span>
            <Link href="/espace-pro/opportunites">Les couples compatibles avec votre profil vous seront proposés dans Opportunités</Link>
          </li>
        </ul>
      )}
    </section>
  );
}
