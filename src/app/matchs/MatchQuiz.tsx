"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { VendorGrid } from "@/components/VendorCard";
import { categories, vendors } from "@/lib/content";
import styles from "./quiz.module.css";

type Answers = { style?: string; budget?: string; needs: string[]; guests?: string };

const styleOptions = [
  { value: "champetre", label: "Champêtre", photo: "/photos/field.jpg", keys: ["Champêtre", "Romantique", "Naturel"] },
  { value: "chateau", label: "Château", photo: "/photos/chateau.jpg", keys: ["Château", "Intemporel", "Gastronomique", "Cérémonie classique"] },
  { value: "boheme", label: "Bohème", photo: "/photos/deco.jpg", keys: ["Bohème", "Reportage", "Documentaire"] },
  { value: "urbain", label: "Urbain", photo: "/photos/rain.jpg", keys: ["Urbain", "Moderne", "Open format", "Cinématique"] },
  { value: "multiculturel", label: "Multiculturel", photo: "/photos/kente.jpg", keys: ["Traditionnel", "Afro-fusion", "Afro & Amapiano", "Wax chic", "Cheveux texturés"] },
  { value: "destination", label: "Bord de mer", photo: "/photos/beach.jpg", keys: ["Destination", "Teaser"] },
];

const budgets = [
  { value: "doux", label: "Moins de 15 000 €", factor: 0.8 },
  { value: "moyen", label: "15 000 à 30 000 €", factor: 1.1 },
  { value: "confort", label: "30 000 à 50 000 €", factor: 1.6 },
  { value: "illimite", label: "Plus de 50 000 €", factor: 99 },
];

const guestOptions = ["Moins de 50", "50 à 100", "100 à 150", "Plus de 150"];

const STEPS = 4;

export function MatchQuiz() {
  const params = useSearchParams();
  const initialStyle = styleOptions.some((s) => s.value === params.get("style")) ? params.get("style")! : undefined;
  const [step, setStep] = useState(initialStyle ? 1 : 0);
  const [a, setA] = useState<Answers>({ style: initialStyle, needs: [] });

  const canNext = [!!a.style, !!a.budget, a.needs.length > 0, !!a.guests][step];
  const done = step >= STEPS;

  const results = useMemo(() => {
    if (!done) return [];
    const style = styleOptions.find((s) => s.value === a.style)!;
    const budget = budgets.find((b) => b.value === a.budget)!;
    const avg = (cat: string) => {
      const l = vendors.filter((v) => v.category === cat);
      return l.reduce((t, v) => t + v.price, 0) / l.length;
    };
    return vendors
      .filter((v) => a.needs.includes(v.category))
      .map((v) => ({
        v,
        score:
          (style.keys.includes(v.style) ? 3 : 0) +
          (v.price <= avg(v.category) * budget.factor ? 2 : 0) +
          parseFloat(v.rating.replace(",", ".")) / 5,
      }))
      .sort((x, y) => y.score - x.score)
      .slice(0, 6)
      .map((x) => x.v);
  }, [done, a]);

  const toggleNeed = (slug: string) =>
    setA((p) => ({ ...p, needs: p.needs.includes(slug) ? p.needs.filter((n) => n !== slug) : [...p.needs, slug] }));

  if (done) {
    const style = styleOptions.find((s) => s.value === a.style)!;
    return (
      <div className="container" style={{ padding: "48px var(--gutter) 96px" }}>
        <div className={styles.resultHead}>
          <Image src="/icons/match-puzzle.png" alt="" width={72} height={72} />
          <span className="eyebrow">Vos matchs</span>
          <h1 className="display h1">Votre Best Match : {results.length} prestataires faits pour vous</h1>
          <p className="lead">
            Style {style.label.toLowerCase()}, budget {budgets.find((b) => b.value === a.budget)!.label.toLowerCase()}, {a.guests!.toLowerCase()} invités.
          </p>
          <button type="button" className="link-underline" style={{ background: "none", border: 0, cursor: "pointer" }} onClick={() => setStep(0)}>
            Modifier mes réponses
          </button>
        </div>
        <VendorGrid vendors={results} showCategory />
        <div className={styles.resultFoot}>
          <p className="muted">Enregistrez vos coups de cœur avec le ♡, puis demandez vos devis depuis chaque fiche.</p>
          <Link href="/decouvrir" className="btn btn-outline">
            Voir tous les prestataires
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.progress} aria-hidden="true">
        <span style={{ width: `${((step + 1) / STEPS) * 100}%` }} />
      </div>
      <div className={`container ${styles.inner}`}>
        <span className="eyebrow">
          Question {step + 1} sur {STEPS}
        </span>

        {step === 0 && (
          <fieldset className={styles.q}>
            <legend className="display h2">Votre mariage ressemble plutôt à…</legend>
            <div className={styles.photoGrid}>
              {styleOptions.map((s) => (
                <button key={s.value} type="button" className={styles.photoOpt} aria-pressed={a.style === s.value} onClick={() => setA({ ...a, style: s.value })}>
                  <Image src={s.photo} alt="" fill sizes="(max-width: 720px) 50vw, 300px" style={{ objectFit: "cover" }} />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className={styles.q}>
            <legend className="display h2">Quel budget global prévoyez-vous ?</legend>
            <div className={styles.list}>
              {budgets.map((b) => (
                <button key={b.value} type="button" className={styles.opt} aria-pressed={a.budget === b.value} onClick={() => setA({ ...a, budget: b.value })}>
                  <Image src="/icons/euro-coins.png" alt="" width={36} height={36} />
                  {b.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className={styles.q}>
            <legend className="display h2">Qui cherchez-vous encore ?</legend>
            <p className="muted" style={{ margin: "0 0 20px" }}>
              Plusieurs choix possibles.
            </p>
            <div className={styles.needs}>
              {categories.map((c) => (
                <button key={c.slug} type="button" className={styles.need} aria-pressed={a.needs.includes(c.slug)} onClick={() => toggleNeed(c.slug)}>
                  <Image src={c.icon} alt="" width={44} height={44} />
                  {c.plural}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className={styles.q}>
            <legend className="display h2">Combien d&apos;invités attendez-vous ?</legend>
            <div className={styles.list}>
              {guestOptions.map((g) => (
                <button key={g} type="button" className={styles.opt} aria-pressed={a.guests === g} onClick={() => setA({ ...a, guests: g })}>
                  <Image src="/icons/chiavari-chair.png" alt="" width={36} height={36} />
                  {g}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className={styles.nav}>
          <button type="button" className={styles.back} onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            ← Retour
          </button>
          <button type="button" className="btn" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
            {step === STEPS - 1 ? "Voir mes matchs" : "Continuer"}
          </button>
        </div>
      </div>
    </div>
  );
}
