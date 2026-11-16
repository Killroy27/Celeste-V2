"use client";

import { useFavorites } from "@/lib/favorites";
import { HeartIcon } from "./icons";
import styles from "./SaveButton.module.css";

export function SaveButton({ slug, name, className }: { slug: string; name: string; className?: string }) {
  const { has, toggle } = useFavorites();
  const on = has(slug);
  return (
    <button
      type="button"
      className={`${styles.save} ${on ? styles.on : ""} ${className ?? ""}`}
      aria-pressed={on}
      aria-label={on ? `Retirer ${name} de mes coups de cœur` : `Enregistrer ${name} dans mes coups de cœur`}
      onClick={(e) => {
        e.preventDefault();
        toggle(slug);
      }}
    >
      <HeartIcon filled={on} />
    </button>
  );
}
