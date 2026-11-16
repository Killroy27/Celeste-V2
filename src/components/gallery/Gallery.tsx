"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import styles from "./Gallery.module.css";

/* ---------- Petit état partagé : quelle vue est ouverte ---------- */

type View = { mode: "closed" } | { mode: "grid" } | { mode: "photo"; index: number };

let view: View = { mode: "closed" };
const listeners = new Set<() => void>();
const set = (v: View) => {
  view = v;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const openGrid = () => set({ mode: "grid" });
export const openPhoto = (index: number) => set({ mode: "photo", index });

/* ---------- Déclencheurs : n'importe quelle photo de la page ouvre la galerie ---------- */

export function GalleryTrigger({ index, className, label, children }: { index?: number; className?: string; label: string; children: ReactNode }) {
  return (
    <button type="button" className={`${styles.trigger} ${className ?? ""}`} aria-label={label} onClick={() => (index === undefined ? openGrid() : openPhoto(index))}>
      {children}
    </button>
  );
}

/* ---------- Visionneuse : grille de toutes les photos, puis plein écran ---------- */

export type Photo = { src: string; alt: string; theme?: string };

export function GalleryViewer({ photos, title }: { photos: Photo[]; title: string }) {
  const v = useSyncExternalStore(subscribe, () => view, () => view);
  const touchX = useRef<number | null>(null);
  const [shown, setShown] = useState(false);

  const close = useCallback(() => set({ mode: "closed" }), []);
  const go = useCallback(
    (d: number) => {
      if (view.mode !== "photo") return;
      set({ mode: "photo", index: (view.index + d + photos.length) % photos.length });
    },
    [photos.length],
  );

  // Clavier (Échap, flèches) et blocage du défilement de la page pendant l'ouverture.
  useEffect(() => {
    if (v.mode === "closed") {
      setShown(false);
      return;
    }
    setShown(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (view.mode === "photo") set({ mode: "grid" });
        else close();
      }
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [v.mode, close, go]);

  if (v.mode === "closed" || !shown) return null;

  if (v.mode === "grid") {
    // Visite photo (façon Airbnb) : un aperçu par thème en haut, puis chaque thème en section à faire défiler.
    const order = ["Cérémonie", "Le couple", "Préparatifs", "Réception", "La soirée", "Détails", "En coulisses", "Autres"];
    const groups = order
      .map((t) => ({ theme: t, items: photos.map((p, i) => ({ ...p, i })).filter((p) => (p.theme ?? "Autres") === t) }))
      .filter((g) => g.items.length > 0);
    const slug = (t: string) => "theme-" + t.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");

    return (
      <div className={styles.gridView} role="dialog" aria-modal="true" aria-label={`Visite photo de ${title}`}>
        <div className={styles.gridBar}>
          <button type="button" className={styles.round} onClick={close} aria-label="Fermer la galerie">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <span className={styles.gridTitle}>
            {title} · {photos.length} photos
          </span>
          <span />
        </div>

        <div className={styles.tour}>
          <h2 className={styles.tourTitle}>Visite photo</h2>
          <ul className={styles.themes}>
            {groups.map((g) => (
              <li key={g.theme}>
                <a
                  href={`#${slug(g.theme)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(slug(g.theme))?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <span className={styles.themeThumb}>
                    <Image src={g.items[0].src} alt="" fill sizes="160px" style={{ objectFit: "cover" }} />
                  </span>
                  <strong>{g.theme}</strong>
                  <small>
                    {g.items.length} photo{g.items.length > 1 ? "s" : ""}
                  </small>
                </a>
              </li>
            ))}
          </ul>

          {groups.map((g) => (
            <section key={g.theme} id={slug(g.theme)} className={styles.group}>
              <div className={styles.groupHead}>
                <h3>{g.theme}</h3>
                <span>
                  {g.items.length} photo{g.items.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className={styles.groupGrid}>
                {g.items.map((p, k) => (
                  <button
                    key={p.src + p.i}
                    type="button"
                    className={`${styles.gridItem} ${k % 3 === 0 ? styles.gridWide : ""}`}
                    onClick={() => openPhoto(p.i)}
                    aria-label={`Agrandir : ${g.theme}, photo ${k + 1}`}
                  >
                    <Image src={p.src} alt={p.alt} fill sizes={k % 3 === 0 ? "(max-width: 720px) 100vw, 760px" : "(max-width: 720px) 50vw, 380px"} style={{ objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }

  const p = photos[v.index];
  return (
    <div
      className={styles.photoView}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${v.index + 1} sur ${photos.length}`}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className={styles.photoBar}>
        <button type="button" className={styles.textBtn} onClick={() => set({ mode: "grid" })}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
          </svg>
          Toutes les photos
        </button>
        <span className={styles.counter}>
          {p.theme ? `${p.theme} · ` : ""}
          {v.index + 1} / {photos.length}
        </span>
        <button type="button" className={styles.textBtn} onClick={close} aria-label="Fermer la galerie">
          Fermer
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className={styles.stage}>
        <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={() => go(-1)} aria-label="Photo précédente">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div key={p.src + v.index} className={styles.frame}>
          <Image src={p.src} alt={p.alt} fill sizes="90vw" style={{ objectFit: "contain" }} priority />
        </div>
        <button type="button" className={`${styles.nav} ${styles.next}`} onClick={() => go(1)} aria-label="Photo suivante">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className={styles.strip}>
        {photos.map((t, i) => (
          <button key={t.src + i} type="button" className={`${styles.thumb} ${i === v.index ? styles.thumbOn : ""}`} onClick={() => openPhoto(i)} aria-label={`Voir la photo ${i + 1}`}>
            <Image src={t.src} alt="" fill sizes="72px" style={{ objectFit: "cover" }} />
          </button>
        ))}
      </div>
    </div>
  );
}
