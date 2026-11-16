"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { inspirations, inspirationThemes } from "@/lib/content";
import styles from "./page.module.css";

const themeToCategory: Record<string, string> = {
  Cérémonie: "photographes",
  Réception: "lieux",
  Tenues: "beaute",
  Fleurs: "fleuristes",
  Fête: "dj",
  Détails: "decoration",
};

// Mur façon Pinterest, filtrable par thème.
export function InspirationBoard() {
  const [theme, setTheme] = useState("Tout");
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
      <div key={theme} className={styles.board}>
        {list.map((i) => (
          <Link key={i.src + i.label} href={`/prestataires/${themeToCategory[i.theme]}`} className={styles.pin} style={{ height: i.h }}>
            <Image src={i.src} alt={i.label} fill sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 25vw" style={{ objectFit: "cover", objectPosition: i.pos ?? "50% 50%" }} />
            <span className={styles.pinLabel}>{i.label}</span>
            <span className={styles.pinCta}>Voir les prestataires →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
