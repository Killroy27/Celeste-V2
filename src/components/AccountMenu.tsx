"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFavorites } from "@/lib/favorites";
import { MenuIcon, UserIcon } from "./icons";
import styles from "./AccountMenu.module.css";

export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const { favorites } = useFavorites();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className={styles.root} ref={root}>
      <button
        type="button"
        className={styles.trigger}
        aria-label="Menu du compte"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <MenuIcon />
        <span className={styles.avatar}>
          <UserIcon />
        </span>
        {favorites.length > 0 && <span className={styles.dot} aria-hidden="true" />}
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <Link role="menuitem" href="/favoris" onClick={close} className={styles.strong}>
            Mes coups de cœur{favorites.length > 0 ? ` (${favorites.length})` : ""}
          </Link>
          <Link role="menuitem" href="/matchs" onClick={close} className={styles.strong}>
            Faire mon Best Match
          </Link>
          <hr />
          <Link role="menuitem" href="/decouvrir" onClick={close}>
            Découvrir les prestataires
          </Link>
          <Link role="menuitem" href="/inspirations" onClick={close}>
            Inspirations
          </Link>
          <Link role="menuitem" href="/devenir-prestataire" onClick={close}>
            Devenir prestataire
          </Link>
          <Link role="menuitem" href="/comment-ca-marche" onClick={close}>
            Comment ça marche
          </Link>
          <Link role="menuitem" href="/contact" onClick={close}>
            Aide et contact
          </Link>
        </div>
      )}
    </div>
  );
}
