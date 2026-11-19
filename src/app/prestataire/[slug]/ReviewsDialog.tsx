"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

export type FicheReview = { author: string; date: string; rating: number; text: string; formule: string };

// Ouvre la fenêtre des avis depuis n'importe quel bouton de la fiche.
export function ReviewsButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("celeste:reviews"))}>
      {children}
    </button>
  );
}

/* Icônes au trait fin des cinq critères (même famille que le reste de la fiche). */
const CRITERIA_ICON: Record<string, string> = {
  "Qualité de la prestation": "M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z",
  Communication: "M4 5h16v11H8l-4 4V5z",
  Ponctualité: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
  "Conformité à l'offre": "M6 3h9l4 4v14H6zM9 13l2 2 4-4",
  "Rapport qualité-prix": "M3 12l9-9h8v8l-9 9zM16 8h.01",
};

// Thèmes repérés dans le texte des avis (prototype : mots-clés ; en production, résumé des avis réels).
const THEMES: [string, RegExp][] = [
  ["Réactivité", /réponse|réactif|rapide|moins d'une/i],
  ["Écoute", /écoute|compris|attenti/i],
  ["Devis clair", /devis|clair|surprise/i],
  ["Professionnalisme", /professionnel|efficace|impeccable|discret/i],
  ["Budget", /budget|paiement|plusieurs fois/i],
  ["Ambiance", /chaleureux|adoré|cœur|familles/i],
];

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const monthIndex = (d: string) => {
  const [m, y] = d.split(" ");
  return Number(y) * 12 + MONTHS.indexOf(m);
};

const SORTS = {
  recent: "Les plus récents",
  high: "Note la plus haute",
  low: "Note la plus basse",
} as const;

type Props = { rating: string; count: number; criteria: [string, number][]; reviews: FicheReview[]; first: string };

// Tous les avis (CDC §24) : note, cinq critères, thèmes cités, tri et recherche, comme la fenêtre d'avis Airbnb.
export function ReviewsDialog({ rating, count, criteria, reviews, first }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const downOnBackdrop = useRef(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<string | null>(null);
  const [sort, setSort] = useState<keyof typeof SORTS>("recent");

  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener("celeste:reviews", on);
    return () => window.removeEventListener("celeste:reviews", on);
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const themes = useMemo(() => THEMES.map(([label, re]) => [label, reviews.filter((r) => re.test(r.text)).length] as const).filter(([, n]) => n > 0), [reviews]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const re = THEMES.find(([l]) => l === theme)?.[1];
    const list = reviews.filter((r) => (!q || `${r.author} ${r.text} ${r.formule}`.toLowerCase().includes(q)) && (!re || re.test(r.text)));
    return [...list].sort((a, b) => (sort === "recent" ? monthIndex(b.date) - monthIndex(a.date) : sort === "high" ? b.rating - a.rating : a.rating - b.rating));
  }, [reviews, query, theme, sort]);

  return (
    <dialog
      ref={ref}
      className={styles.revDialog}
      aria-labelledby="tous-avis-t"
      onClose={() => setOpen(false)}
      onMouseDown={(e) => {
        downOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && downOnBackdrop.current) setOpen(false);
        downOnBackdrop.current = false;
      }}
    >
      {open && (
        <div className={styles.revInner}>
          <button type="button" className={styles.revClose} onClick={() => setOpen(false)} aria-label="Fermer les avis">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <aside className={styles.revSide}>
            <h2 id="tous-avis-t" className={styles.revScore}>
              <span>★ {rating}</span>
              <small>{count} avis de couples ayant réservé</small>
            </h2>
            <ul className={styles.revCriteria}>
              {criteria.map(([label, score]) => (
                <li key={label}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={CRITERIA_ICON[label] ?? CRITERIA_ICON.Communication} />
                  </svg>
                  <span>{label}</span>
                  <strong>{score.toLocaleString("fr-FR", { minimumFractionDigits: 1 })}</strong>
                </li>
              ))}
            </ul>
          </aside>

          <div className={styles.revMain}>
            <div className={styles.revTools}>
              <label className={styles.revSearch}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4" />
                </svg>
                <input type="search" placeholder="Rechercher dans les avis" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Rechercher dans les avis" />
              </label>
              <label className={styles.revSort}>
                <select aria-label="Trier les avis" value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)}>
                  {Object.entries(SORTS).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {themes.length > 0 && (
              <div className={styles.revThemes} role="group" aria-label="Thèmes cités par les couples">
                {themes.map(([label, n]) => (
                  <button key={label} type="button" aria-pressed={theme === label} onClick={() => setTheme(theme === label ? null : label)}>
                    {label} <span>{n}</span>
                  </button>
                ))}
              </div>
            )}

            <p className={styles.revCount} role="status">
              {shown.length === 0 ? "Aucun avis ne correspond." : `${shown.length} avis ${query || theme ? "correspondant" + (shown.length > 1 ? "s" : "") : "affiché" + (shown.length > 1 ? "s" : "")}`}
            </p>

            <div className={styles.revList}>
              {shown.map((r) => (
                <figure key={r.author} className={styles.review}>
                  <figcaption>
                    <span className={styles.revAvatar}>
                      {r.author
                        .split(" & ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <span>
                      <strong>{r.author}</strong>
                      <span className={styles.revStars} aria-label={`${r.rating} étoiles sur 5`}>
                        {"★".repeat(r.rating)}
                        <i>{"★".repeat(5 - r.rating)}</i>
                      </span>
                    </span>
                  </figcaption>
                  <blockquote>{r.text}</blockquote>
                  <small>
                    {r.date.charAt(0).toUpperCase() + r.date.slice(1)} · {r.formule} · avec {first}
                  </small>
                </figure>
              ))}
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
