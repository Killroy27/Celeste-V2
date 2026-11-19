"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { categories } from "@/lib/content";
import { ambiances, miniTests, priorities, zones } from "@/lib/match";
import { currentSettings, DEFAULT_SETTINGS, saveOverrides, type Settings } from "@/lib/settings";
import styles from "../../espace/espace.module.css";
import { Guard, useAsk } from "../AdminShell";
import a from "../admin.module.css";

const VIEWS = [
  { id: "best-match", label: "Best Match" },
  { id: "select", label: "Critères Select" },
  { id: "categories", label: "Catégories et budget" },
  { id: "dna", label: "Wedding DNA et mini-tests" },
] as const;

const WEIGHT_LABELS: Record<keyof Settings["weights"], string> = {
  style: "Style et Wedding DNA",
  miniTest: "Réponses au mini-test",
  budget: "Budget",
  availability: "Disponibilité",
  zone: "Zone",
  reputation: "Réputation",
  capacity: "Capacité",
};

const SELECT_LABELS: Record<keyof Settings["select"], { label: string; unit: "n" | "note" | "%" }> = {
  completedBookings: { label: "Réservations Céleste terminées, au minimum", unit: "n" },
  verifiedReviews: { label: "Avis vérifiés, au minimum", unit: "n" },
  minRating: { label: "Note moyenne minimale", unit: "note" },
  minResponseRate: { label: "Taux de réponse minimal sur 90 jours", unit: "%" },
  maxCancellationRate: { label: "Taux d'annulation maximal", unit: "%" },
};

const pct = (n: number) => Math.round(n * 1000) / 10;

// Marketplace (CDC §20.3) : les règles qui apprennent avec les données réelles, ajustables sans déploiement.
export function AdminMarketplace() {
  const params = useSearchParams();
  const view = VIEWS.find((v) => v.id === params.get("vue"))?.id ?? "best-match";
  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Marketplace</h1>
          <p className={styles.lead}>Les règles du Best Match et de la confiance, ajustables sans déploiement. Chaque changement est tracé.</p>
        </div>
      </header>
      <nav className={styles.subnav} aria-label="Marketplace">
        {VIEWS.map((v) => (
          <Link key={v.id} href={`/admin/marketplace?vue=${v.id}`} aria-current={v.id === view ? "page" : undefined} scroll={false}>
            {v.label}
          </Link>
        ))}
      </nav>
      <Guard section="marketplace">
        {view === "best-match" && <BestMatch />}
        {view === "select" && <SelectRules />}
        {view === "categories" && <Categories />}
        {view === "dna" && <Dna />}
      </Guard>
    </>
  );
}

/* ---------- Best Match (§7) ---------- */

function BestMatch() {
  const ask = useAsk();
  const [s, setS] = useState(currentSettings);
  const sum = Object.values(s.weights).reduce((t, w) => t + w, 0);
  const valid = Math.abs(sum - 1) < 0.001;
  const setW = (k: keyof Settings["weights"], v: number) => setS((x) => ({ ...x, weights: { ...x.weights, [k]: Math.max(0, Math.min(1, v)) } }));
  // Répartition proportionnelle, arrondie au dixième de point ; l'écart d'arrondi va au poids le plus fort.
  const normalize = () =>
    setS((x) => {
      if (sum <= 0) return { ...x, weights: { ...DEFAULT_SETTINGS.weights } };
      const w = Object.fromEntries(Object.entries(x.weights).map(([k, v]) => [k, Math.round((v / sum) * 1000) / 1000])) as Settings["weights"];
      const keys = Object.keys(w) as (keyof Settings["weights"])[];
      const top = keys.reduce((m, k) => (w[k] > w[m] ? k : m), keys[0]);
      w[top] = Math.round((w[top] + 1 - keys.reduce((t, k) => t + w[k], 0)) * 1000) / 1000;
      return { ...x, weights: w };
    });

  return (
    <div className={styles.grid}>
      <section className={`${styles.card} ${styles.span7}`} aria-labelledby="w-t">
        <div className={styles.cardHead}>
          <h2 id="w-t" className={styles.sectionTitle}>
            Pondérations du score
          </h2>
          <span className={valid ? a.sumOk : a.sumKo}>Somme : {pct(sum)} %</span>
        </div>
        <p className={styles.rowMeta}>Aucune pondération ne dépend d&apos;un abonnement payant. Le score affiché reste accompagné de ses raisons.</p>
        <ul className={a.weights}>
          {(Object.keys(WEIGHT_LABELS) as (keyof Settings["weights"])[]).map((k) => (
            <li key={k}>
              <label htmlFor={`w-${k}`}>{WEIGHT_LABELS[k]}</label>
              <input id={`w-${k}`} type="range" min={0} max={100} step={1} value={Math.round(s.weights[k] * 100)} onChange={(e) => setW(k, Number(e.target.value) / 100)} />
              <span className={a.pctInput}>
                <input type="number" min={0} max={100} step={0.5} value={pct(s.weights[k])} onChange={(e) => setW(k, Number(e.target.value) / 100)} aria-label={`${WEIGHT_LABELS[k]}, en %`} />%
              </span>
              <small>défaut {pct(DEFAULT_SETTINGS.weights[k])} %</small>
            </li>
          ))}
        </ul>
        {!valid && (
          <p className={a.error} role="alert">
            La somme des pondérations doit faire 100 %.{" "}
            <button type="button" className={a.textBtn} onClick={normalize}>
              Répartir automatiquement
            </button>
          </p>
        )}
      </section>

      <section className={`${styles.card} ${styles.span5}`} aria-labelledby="t-t">
        <h2 id="t-t" className={styles.sectionTitle}>
          Tolérances
        </h2>
        <div className={a.fields}>
          <label className="field">
            Dépassement de budget toléré (%)
            <input type="number" min={0} max={50} step={1} value={pct(s.budgetTolerance)} onChange={(e) => setS((x) => ({ ...x, budgetTolerance: Number(e.target.value) / 100 }))} />
            <small className={a.fieldNote}>Défaut {pct(DEFAULT_SETTINGS.budgetTolerance)} %. À auditer avec la logique de l&apos;agent existant avant production (§32).</small>
          </label>
          <label className="field">
            Bonus si le métier est une priorité du couple (points)
            <input type="number" min={0} max={20} step={0.5} value={pct(s.priorityBonus)} onChange={(e) => setS((x) => ({ ...x, priorityBonus: Number(e.target.value) / 100 }))} />
          </label>
          <label className="field">
            Score maximal affiché (%)
            <input type="number" min={50} max={100} step={1} value={pct(s.maxScore)} onChange={(e) => setS((x) => ({ ...x, maxScore: Number(e.target.value) / 100 }))} />
            <small className={a.fieldNote}>Un plafond sous 100 % évite l&apos;effet « match parfait ».</small>
          </label>
        </div>
        <div className={a.actions}>
          <button
            type="button"
            className="btn"
            disabled={!valid}
            onClick={() =>
              ask({ action: "Règle de matching modifiée", target: "Pondérations et tolérances du Best Match", confirm: "Appliquer" }, (x) => {
                setS(saveOverrides({ weights: s.weights, budgetTolerance: s.budgetTolerance, priorityBonus: s.priorityBonus, maxScore: s.maxScore }));
                return x;
              })
            }
          >
            Enregistrer
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() =>
              ask({ action: "Règle de matching réinitialisée", target: "Best Match : valeurs du cahier des charges", confirm: "Réinitialiser" }, (x) => {
                setS(saveOverrides({ weights: DEFAULT_SETTINGS.weights, budgetTolerance: DEFAULT_SETTINGS.budgetTolerance, priorityBonus: DEFAULT_SETTINGS.priorityBonus, maxScore: DEFAULT_SETTINGS.maxScore }));
                return x;
              })
            }
          >
            Valeurs par défaut
          </button>
        </div>
        <p className={styles.small}>
          S&apos;applique aux prochains résultats du <Link href="/matchs">Best Match</Link> ; un onglet déjà ouvert les prend en compte à son prochain chargement.
        </p>
      </section>
    </div>
  );
}

/* ---------- Critères Select (§18.2) ---------- */

function SelectRules() {
  const ask = useAsk();
  const [s, setS] = useState(currentSettings().select);
  const show = (k: keyof Settings["select"], v: number) => (SELECT_LABELS[k].unit === "%" ? pct(v) : v);
  const read = (k: keyof Settings["select"], v: number) => (SELECT_LABELS[k].unit === "%" ? v / 100 : v);
  return (
    <section className={styles.card} aria-labelledby="sel-t">
      <h2 id="sel-t" className={styles.sectionTitle}>
        Seuils Céleste Select
      </h2>
      <p className={styles.rowMeta}>Seuils de référence au lancement. Select se mérite par la performance réelle : aucun paiement ne permet de l&apos;obtenir.</p>
      <div className={a.fieldsGrid}>
        {(Object.keys(SELECT_LABELS) as (keyof Settings["select"])[]).map((k) => (
          <label key={k} className="field">
            {SELECT_LABELS[k].label}
            {SELECT_LABELS[k].unit === "%" ? " (%)" : SELECT_LABELS[k].unit === "note" ? " (sur 5)" : ""}
            <input type="number" min={0} step={SELECT_LABELS[k].unit === "note" ? 0.1 : 1} value={show(k, s[k])} onChange={(e) => setS((x) => ({ ...x, [k]: read(k, Number(e.target.value)) }))} />
            <small className={a.fieldNote}>Défaut {show(k, DEFAULT_SETTINGS.select[k])}</small>
          </label>
        ))}
      </div>
      <p className={styles.small}>Toujours requis aussi : statut Vérifié actif, aucun litige grave non résolu, activité récente.</p>
      <div className={a.actions}>
        <button
          type="button"
          className="btn"
          onClick={() =>
            ask({ action: "Règle modifiée", target: "Seuils Céleste Select", confirm: "Appliquer", hint: "Les badges sont recalculés pour tous les prestataires." }, (x) => {
              setS(saveOverrides({ select: s }).select);
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

/* ---------- Catégories et parts de budget ---------- */

function Categories() {
  const ask = useAsk();
  const [share, setShare] = useState(currentSettings().budgetShare);
  const [off, setOff] = useState(currentSettings().categoriesOff);
  return (
    <section className={styles.card} aria-labelledby="cat-t">
      <h2 id="cat-t" className={styles.sectionTitle}>
        Catégories et répartition indicative du budget
      </h2>
      <p className={styles.rowMeta}>La part sert à estimer l&apos;enveloppe de chaque métier dans le budget des couples et à juger si un prestataire entre dans leur budget.</p>
      <ul className={a.catList}>
        {categories.map((c) => (
          <li key={c.slug}>
            <span>
              <strong>{c.plural}</strong>
              <small>
                {off.includes(c.slug) ? "Désactivée" : "Active"} · {(miniTests[c.slug] ?? []).length} question(s) de mini-test
              </small>
            </span>
            <label className={a.switch}>
              <input
                type="checkbox"
                role="switch"
                checked={!off.includes(c.slug)}
                onChange={(e) => {
                  // Le choix est capturé tout de suite : la case contrôlée reprend sa valeur jusqu'à confirmation.
                  const activate = e.target.checked;
                  ask({ action: activate ? "Catégorie activée" : "Catégorie désactivée", target: c.plural, confirm: "Appliquer", hint: "Une catégorie désactivée disparaît des parcours de choix de métier (Best Match). Les réservations en cours ne sont pas touchées." }, (x) => {
                    const next = activate ? off.filter((s) => s !== c.slug) : [...off, c.slug];
                    setOff(saveOverrides({ categoriesOff: next }).categoriesOff);
                    return x;
                  });
                }}
              />
              <span className="visually-hidden">{c.plural} active</span>
            </label>
            <span className={a.pctInput}>
              <input
                type="number"
                min={0}
                max={60}
                step={0.5}
                value={pct(share[c.slug] ?? DEFAULT_SETTINGS.budgetShare[c.slug] ?? 0)}
                onChange={(e) => setShare((x) => ({ ...x, [c.slug]: Math.max(0, Number(e.target.value)) / 100 }))}
                aria-label={`Part du budget pour ${c.plural}, en %`}
              />
              %
            </span>
          </li>
        ))}
      </ul>
      <div className={a.actions}>
        <button
          type="button"
          className="btn"
          onClick={() =>
            ask({ action: "Règle modifiée", target: "Répartition indicative du budget par métier", confirm: "Appliquer" }, (x) => {
              setShare(saveOverrides({ budgetShare: share }).budgetShare);
              return x;
            })
          }
        >
          Enregistrer
        </button>
      </div>
      <p className={styles.small}>Les schémas de champs par métier (§10.2) seront éditables avec l&apos;API ; ils restent définis dans le catalogue pour la démonstration.</p>
    </section>
  );
}

/* ---------- Wedding DNA et mini-tests (§6, §8) ---------- */

function Dna() {
  return (
    <div className={styles.grid}>
      <section className={`${styles.card} ${styles.span5}`} aria-labelledby="dna-t">
        <h2 id="dna-t" className={styles.sectionTitle}>
          Wedding DNA
        </h2>
        <p className={styles.rowMeta}>Questions communes, posées une seule fois et réutilisées par tous les métiers.</p>
        <ul className={a.defList}>
          <li>
            <strong>Ambiances</strong>
            <span>{ambiances.map((x) => x.label).join(", ")}</span>
          </li>
          <li>
            <strong>Zones</strong>
            <span>{zones.map((x) => x.label).join(", ")}</span>
          </li>
          <li>
            <strong>Priorités</strong>
            <span>{priorities.map((x) => x.label).join(", ")}</span>
          </li>
        </ul>
      </section>
      <section className={`${styles.card} ${styles.span7}`} aria-labelledby="mt-t">
        <h2 id="mt-t" className={styles.sectionTitle}>
          Mini-tests par métier
        </h2>
        <p className={styles.rowMeta}>Une ou deux questions visibles par catégorie avant les premiers résultats.</p>
        <ul className={a.defList}>
          {Object.entries(miniTests).map(([slug, qs]) => (
            <li key={slug}>
              <strong>{categories.find((c) => c.slug === slug)?.plural ?? slug}</strong>
              <span>{qs.map((q) => `${q.label} (${q.options.length} réponses)`).join(" · ")}</span>
            </li>
          ))}
        </ul>
        <p className={styles.small}>Lecture seule dans la démonstration : l&apos;édition des questions arrivera avec l&apos;API.</p>
      </section>
    </div>
  );
}
