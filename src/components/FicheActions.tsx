"use client";

import { useState } from "react";
import { useFavorites } from "@/lib/favorites";
import { HeartIcon } from "./icons";
import styles from "./FicheActions.module.css";

// Partager et Favori, en haut de la fiche (repris du projet Céleste d'origine).
export function FicheActions({ slug, name }: { slug: string; name: string }) {
  const { has, toggle } = useFavorites();
  const [copied, setCopied] = useState(false);
  const fav = has(slug);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} sur Céleste`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* partage annulé */
    }
  };

  return (
    <div className={styles.actions}>
      <button type="button" className={styles.circle} onClick={share} aria-label={`Partager ${name}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5" />
        </svg>
        <span>{copied ? "Lien copié" : "Partager"}</span>
      </button>
      <button type="button" className={`${styles.circle} ${fav ? styles.on : ""}`} onClick={() => toggle(slug)} aria-pressed={fav} aria-label={fav ? `Retirer ${name} des favoris` : `Ajouter ${name} aux favoris`}>
        <HeartIcon size={16} filled={fav} />
        <span>{fav ? "Enregistré" : "Favori"}</span>
      </button>
    </div>
  );
}
