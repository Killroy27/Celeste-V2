"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { currentSettings, type Settings } from "@/lib/settings";
import styles from "./WhyOrder.module.css";

export type OrderMode = "dna" | "reco" | "rating" | "price";

const WEIGHT_LABELS: Record<keyof Settings["weights"], string> = {
  style: "Style et Wedding DNA",
  miniTest: "Réponses au mini-test",
  budget: "Budget",
  availability: "Disponibilité à votre date",
  zone: "Zone",
  reputation: "Réputation (note et avis)",
  capacity: "Capacité",
};

const INTRO: Record<OrderMode, string> = {
  dna: "Chaque prestataire reçoit un score de compatibilité calculé à partir de votre Wedding DNA. Les résultats sont classés du score le plus haut au plus bas.",
  reco: "Sans Wedding DNA, Céleste classe les prestataires selon leur note moyenne, pondérée par le nombre d'avis : une très bonne note sur beaucoup d'avis passe devant une note parfaite sur trois avis.",
  rating: "Vous avez choisi le tri « Mieux notés » : note moyenne la plus haute d'abord, puis le plus grand nombre d'avis en cas d'égalité.",
  price: "Vous avez choisi le tri « Prix croissant » : le prix d'appel le plus bas d'abord.",
};

// « Pourquoi cet ordre ? » (benchmark Airbnb, CDC §3 et §7.5) : explique le classement affiché et rappelle
// qu'aucun prestataire ne paie pour monter. Les pondérations affichées sont celles réglées dans le back-office.
// excludes : résultats Best Match, où les critères indispensables retirent des profils (le catalogue les garde tous).
export function WhyOrder({ mode, className, excludes = false }: { mode: OrderMode; className?: string; excludes?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const downOnBackdrop = useRef(false);
  const [open, setOpen] = useState(false);
  // La fenêtre est rendue dans <body> : le bouton vit souvent dans un paragraphe, où un <dialog> est interdit.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open, mounted]);

  const weights = open && mode === "dna" ? Object.entries(currentSettings().weights).sort((a, b) => b[1] - a[1]) : [];

  return (
    <>
      <button type="button" className={`${styles.trigger} ${className ?? ""}`} onClick={() => setOpen(true)}>
        Pourquoi cet ordre ?
      </button>
      {mounted &&
        createPortal(
          <dialog
            ref={ref}
            className={styles.dialog}
            aria-labelledby="why-order-t"
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
              <div className={styles.body}>
                <h2 id="why-order-t" className={styles.title}>
                  Pourquoi cet ordre ?
                </h2>
                <p>{INTRO[mode]}</p>

                {mode === "dna" && (
                  <>
                    <h3 className={styles.sub}>Ce qui compte dans le score</h3>
                    <ul className={styles.weights}>
                      {weights.map(([k, w]) => (
                        <li key={k}>
                          <span>{WEIGHT_LABELS[k as keyof Settings["weights"]]}</span>
                          <span className={styles.bar} aria-hidden="true">
                            <i style={{ width: `${Math.round(w * 100)}%` }} />
                          </span>
                          <strong>{Math.round(w * 100)} %</strong>
                        </li>
                      ))}
                    </ul>
                    {excludes && <p className={styles.small}>Vos critères indispensables retirent un prestataire des résultats au lieu de seulement baisser son score.</p>}
                  </>
                )}

                <div className={styles.promise}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3zm-3 9l2 2 4-4" />
                  </svg>
                  <p>
                    <strong>Aucun prestataire ne paie pour apparaître plus haut.</strong> Le badge Select se mérite sur des critères de performance et ne change pas l&apos;ordre. Les
                    filtres retirent des profils, ils ne les reclassent pas.
                  </p>
                </div>

                <button type="button" className="btn btn-block" onClick={() => setOpen(false)}>
                  J&apos;ai compris
                </button>
              </div>
            )}
          </dialog>,
          document.body,
        )}
    </>
  );
}
