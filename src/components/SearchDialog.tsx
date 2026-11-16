"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "./icons";
import { Logo } from "./Logo";
import { SearchForm } from "./SearchForm";
import styles from "./SearchDialog.module.css";

// Recherche ouverte depuis la pilule de l'en-tête, comme sur Airbnb.
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.root}>
      <div className={styles.scrim} onClick={onClose} />
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="search-title" className={styles.panel}>
        <div className={styles.bar}>
          <span className={styles.side}>
            <Logo compact />
          </span>
          <span id="search-title" className={styles.title}>
            Que cherchez-vous ?
          </span>
          <span className={`${styles.side} ${styles.right}`}>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Fermer la recherche">
              <CloseIcon />
            </button>
          </span>
        </div>
        <div className={styles.body}>
          <SearchForm variant="dialog" autoFocus />
        </div>
      </div>
    </div>
  );
}
