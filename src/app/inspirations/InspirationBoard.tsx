"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { inspirations, inspirationThemes } from "@/lib/content";
import { loadDna, loadDraftInspirations, saveDna, saveDraftInspirations } from "@/lib/dna";
import styles from "./page.module.css";

const themeToCategory: Record<string, string> = {
  Cérémonie: "photographes",
  Réception: "lieux",
  Tenues: "tenues",
  Fleurs: "fleuristes",
  Fête: "dj",
  Détails: "decoration",
};

// Mur façon Pinterest, filtrable par thème. Les images enregistrées nourrissent le Wedding DNA :
// le moodboard reste le socle du profil mariage (CDC §6.1).
export function InspirationBoard() {
  const [theme, setTheme] = useState("Tout");
  const [saved, setSaved] = useState<string[]>([]);
  const [hasDna, setHasDna] = useState(false);
  useEffect(() => {
    const dna = loadDna();
    setHasDna(!!dna);
    setSaved(dna?.inspirations ?? loadDraftInspirations());
  }, []);
  const toggle = (src: string) => {
    const dna = loadDna();
    const cur = dna?.inspirations ?? loadDraftInspirations();
    const inspirations = cur.includes(src) ? cur.filter((x) => x !== src) : [...cur, src];
    if (dna) saveDna({ ...dna, inspirations });
    else saveDraftInspirations(inspirations);
    setSaved(inspirations);
  };
  const list = theme === "Tout" ? inspirations : inspirations.filter((i) => i.theme === theme);

  return (
    <div className="container" style={{ paddingBottom: 32 }}>
      <div className={styles.themes} role="group" aria-label="Thèmes">
        {inspirationThemes.map((t) => (
          <button key={t} type="button" className="chip" aria-pressed={theme === t} onClick={() => setTheme(t)}>
            {t}
          </button>
        ))}
      </div>
      {saved.length > 0 && (
        <p className={styles.savedNote} role="status">
          {hasDna ? (
            <>
              {saved.length} image{saved.length > 1 ? "s" : ""} dans votre Wedding DNA. <Link href="/espace/mariage/wedding-dna">Voir mon Wedding DNA</Link>
            </>
          ) : (
            <>
              {saved.length} image{saved.length > 1 ? "s" : ""} gardée{saved.length > 1 ? "s" : ""} : elle{saved.length > 1 ? "s" : ""} rejoindr{saved.length > 1 ? "ont" : "a"} votre Wedding DNA. <Link href="/matchs">Créer mon Wedding DNA</Link>
            </>
          )}
        </p>
      )}
      <div key={theme} className={styles.board}>
        {list.map((i) => {
          const on = saved.includes(i.src);
          return (
            <div key={i.src + i.label} className={styles.pinWrap} style={{ height: i.h }}>
              <Link href={`/prestataires/${themeToCategory[i.theme]}`} className={styles.pin} style={{ height: "100%" }}>
                <Image src={i.src} alt={i.label} fill sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 25vw" style={{ objectFit: "cover", objectPosition: i.pos ?? "50% 50%" }} />
                <span className={styles.pinLabel}>{i.label}</span>
                <span className={styles.pinCta}>Voir les prestataires →</span>
              </Link>
              <button type="button" className={styles.pinSave} aria-pressed={on} onClick={() => toggle(i.src)} aria-label={on ? `Retirer « ${i.label} » de mon Wedding DNA` : `Ajouter « ${i.label} » à mon Wedding DNA`}>
                {on ? "✓ Dans mon DNA" : "+ Mon DNA"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
