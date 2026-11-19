"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadDna } from "@/lib/dna";
import { profileSteps, useWedding } from "@/lib/wedding";
import styles from "./espace.module.css";

// Encart « Complétez votre profil » (benchmark Airbnb) : visible tant qu'une information manque, puis disparaît.
// inPage : sur la page Profil, chaque étape place le curseur dans le champ concerné au lieu d'y naviguer.
export function ProfileNudge({ inPage = false }: { inPage?: boolean }) {
  const { wedding: w } = useWedding();
  const [hasDna, setHasDna] = useState(true);
  useEffect(() => setHasDna(!!loadDna()), []);
  if (!w) return null;

  const steps = profileSteps(w, hasDna);
  const done = steps.filter((s) => s.done).length;
  const todo = steps.filter((s) => !s.done);
  if (!todo.length) return null;
  const pct = Math.round((done / steps.length) * 100);

  return (
    <section className={styles.nudge} aria-labelledby="nudge-t">
      <div className={styles.nudgeHead}>
        <div>
          <h2 id="nudge-t" className={styles.rowTitle}>
            Complétez votre profil
          </h2>
          <p className={styles.rowMeta}>Budget, checklist et Best Match seront plus justes.</p>
        </div>
        <span className={styles.small}>
          {done} sur {steps.length}
        </span>
      </div>
      <div className={styles.bar} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Profil complété">
        <i style={{ width: `${pct}%` }} />
      </div>
      <ul className={styles.nudgeList}>
        {todo.map((s) => (
          <li key={s.id}>
            {inPage && s.field ? (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById(s.field!);
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  el?.focus({ preventScroll: true });
                }}
              >
                {s.label}
              </button>
            ) : (
              <Link href={s.field ? `${s.href}#${s.field}` : s.href}>{s.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
