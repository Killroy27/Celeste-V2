"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PERMISSIONS, ROLES, useAdmin, type Role, type Section } from "@/lib/admin";
import { formatDay, formatTime } from "@/lib/format";
import { currentSettings, DATE_HOLD_MAX_HOURS, DEFAULT_SETTINGS, saveOverrides } from "@/lib/settings";
import styles from "../../espace/espace.module.css";
import { Guard, useAsk } from "../AdminShell";
import a from "../admin.module.css";

const VIEWS = [
  { id: "paiement", label: "Paiement et offres" },
  { id: "a-valider", label: "Règles à valider" },
  { id: "roles", label: "Rôles" },
  { id: "audit", label: "Journal d'audit" },
] as const;

const SECTION_LABELS: Record<Section, string> = {
  dashboard: "Dashboard",
  utilisateurs: "Utilisateurs",
  prestataires: "Prestataires",
  marketplace: "Marketplace",
  reservations: "Réservations",
  finance: "Finance",
  support: "Support",
  parametres: "Paramètres",
};

// Paramètres (CDC §14, §20.5, §20.6, §32).
export function AdminSettings() {
  const params = useSearchParams();
  const view = VIEWS.find((v) => v.id === params.get("vue"))?.id ?? "paiement";
  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Paramètres</h1>
          <p className={styles.lead}>Règles de paiement, rôles de l&apos;équipe et traçabilité.</p>
        </div>
      </header>
      <nav className={styles.subnav} aria-label="Paramètres">
        {VIEWS.map((v) => (
          <Link key={v.id} href={`/admin/parametres?vue=${v.id}`} aria-current={v.id === view ? "page" : undefined} scroll={false}>
            {v.label}
          </Link>
        ))}
      </nav>
      {/* Le journal reste consultable par tous les rôles ; le reste est réservé au Super Admin. */}
      {view === "audit" ? (
        <Audit />
      ) : (
        <Guard section="parametres">
          {view === "paiement" && <Payment />}
          {view === "a-valider" && <Pending />}
          {view === "roles" && <Roles />}
        </Guard>
      )}
    </>
  );
}

function Payment() {
  const ask = useAsk();
  const [s, setS] = useState(currentSettings);
  const pct = (n: number) => Math.round(n * 100);
  return (
    <section className={styles.card} aria-labelledby="pay-t">
      <h2 id="pay-t" className={styles.sectionTitle}>
        Paiement, échéances et offres
      </h2>
      <div className={a.fieldsGrid}>
        <label className="field">
          Acompte par défaut (%)
          <input type="number" min={10} max={90} step={5} value={pct(s.depositRate)} onChange={(e) => setS((x) => ({ ...x, depositRate: Number(e.target.value) / 100 }))} />
          <small className={a.fieldNote}>Défaut {pct(DEFAULT_SETTINGS.depositRate)} % (§14.1)</small>
        </label>
        <label className="field">
          Échéances maximum pour le solde
          <input type="number" min={1} max={6} step={1} value={s.maxInstallments} onChange={(e) => setS((x) => ({ ...x, maxInstallments: Number(e.target.value) }))} />
          <small className={a.fieldNote}>Défaut {DEFAULT_SETTINGS.maxInstallments}. Au-delà de 3, accord du prestataire requis.</small>
        </label>
        <label className="field">
          Blocage de date pendant la négociation (heures)
          <input type="number" min={0} max={DATE_HOLD_MAX_HOURS} step={1} value={s.dateHoldHours} onChange={(e) => setS((x) => ({ ...x, dateHoldHours: Number(e.target.value) }))} />
          <small className={a.fieldNote}>
            Défaut {DEFAULT_SETTINGS.dateHoldHours} h, {DATE_HOLD_MAX_HOURS} h au plus avec accord du prestataire (§14.5)
          </small>
        </label>
        <label className="field">
          Validité d&apos;une offre (jours)
          <input type="number" min={1} max={90} step={1} value={s.offerValidityDays} onChange={(e) => setS((x) => ({ ...x, offerValidityDays: Number(e.target.value) }))} />
          <small className={a.fieldNote}>Défaut {DEFAULT_SETTINGS.offerValidityDays} jours, valeur de démonstration à valider</small>
        </label>
      </div>
      <div className={a.actions}>
        <button
          type="button"
          className="btn"
          onClick={() =>
            ask({ action: "Règle modifiée", target: "Paiement, échéances et validité des offres", confirm: "Appliquer", hint: "S'applique aux nouvelles offres et réservations ; les échéanciers déjà créés ne changent pas." }, (x) => {
              setS(saveOverrides({ depositRate: s.depositRate, maxInstallments: s.maxInstallments, dateHoldHours: s.dateHoldHours, offerValidityDays: s.offerValidityDays }));
              return x;
            })
          }
        >
          Enregistrer
        </button>
      </div>
    </section>
  );
}

// Décisions qui ne doivent pas être improvisées (§32) : visibles, mais non paramétrables.
function Pending() {
  const items = [
    ["Commission prestataire", "Référence 7 % des montants encaissés ; structure fiscale et contractuelle à valider."],
    ["Frais de service couple", "Hypothèse historique de 5 % ; à confirmer ou abandonner par la direction."],
    ["Reversement au prestataire", "Cible J+72 h après l'événement ; faisabilité à confirmer avec le PSP."],
    ["Barème d'annulation", "100 % / 50 % / 0 % selon le délai ; validation juridique et adaptations par métier."],
    ["TVA et facturation", "Rôle d'intermédiaire de Céleste et mentions à valider par l'expert-comptable."],
    ["Signature électronique", "Yousign ou équivalent ; conditions d'intégration à confirmer."],
    ["Assurance", "Assureur, garanties, exclusions, coûts et éligibilité : aucune promesse avant validation."],
    ["Analyse automatisée des messages", "Information et consentement des utilisateurs à formaliser."],
  ];
  return (
    <section className={styles.card} aria-labelledby="pend-t">
      <h2 id="pend-t" className={styles.sectionTitle}>
        Règles à valider avant la mise en production
      </h2>
      <p className={styles.rowMeta}>Ces règles ne sont ni affichées aux utilisateurs ni paramétrables tant qu&apos;elles n&apos;ont pas été validées (cahier des charges §32).</p>
      <ul className={a.rules}>
        {items.map(([t, d]) => (
          <li key={t}>
            <strong>{t}</strong>
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Roles() {
  const sections = Object.keys(PERMISSIONS) as Section[];
  return (
    <section className={styles.card} aria-labelledby="roles-t">
      <h2 id="roles-t" className={styles.sectionTitle}>
        Rôles et accès
      </h2>
      <p className={styles.rowMeta}>Chaque rôle n&apos;agit que dans ses sections. En production, les droits sont vérifiés côté serveur.</p>
      <div className={a.scrollX}>
        <table className={a.grid}>
          <thead>
            <tr>
              <th scope="col">Section</th>
              {ROLES.map((r) => (
                <th key={r} scope="col" className={a.center}>
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map((s) => (
              <tr key={s}>
                <th scope="row">{SECTION_LABELS[s]}</th>
                {ROLES.map((r: Role) => (
                  <td key={r} className={a.center}>
                    {PERMISSIONS[s].includes(r) ? <span aria-label="Accès">✓</span> : <span className={a.muted} aria-label="Pas d'accès">–</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function Audit() {
  const { admin } = useAdmin();
  const [q, setQ] = useState("");
  if (!admin) return null;
  const list = admin.audit.filter((e) => !q || fold(`${e.action} ${e.target} ${e.reason} ${e.role}`).includes(fold(q)));
  return (
    <section className={styles.card} aria-labelledby="audit-t">
      <div className={styles.cardHead}>
        <h2 id="audit-t" className={styles.sectionTitle}>
          Journal d&apos;audit
        </h2>
        <span className={styles.small}>{admin.audit.length} entrées</span>
      </div>
      <p className={styles.rowMeta}>Qui a fait quoi, quand, et pourquoi : remboursements, suspensions, badges, règles de matching, accès exceptionnels aux conversations.</p>
      <div className={a.toolbar}>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Action, cible, motif, rôle" aria-label="Rechercher dans le journal" />
      </div>
      <div className={a.scrollX}>
        <table className={a.grid}>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Rôle</th>
              <th scope="col">Action</th>
              <th scope="col">Cible</th>
              <th scope="col">Motif</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id}>
                <td className={a.nowrap}>
                  {formatDay(e.at)} · {formatTime(e.at)}
                </td>
                <td className={a.nowrap}>{e.role}</td>
                <td>{e.action}</td>
                <td>{e.target}</td>
                <td className={a.muted}>{e.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
