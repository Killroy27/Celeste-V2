"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import styles from "./CardPhotos.module.css";

// Photos d'une carte prestataire, à feuilleter sans quitter la liste (comme Airbnb) :
// glisser au doigt, flèches au survol, points de position.
export function CardPhotos({ href, photos, alt, pos, children }: { href: string; photos: string[]; alt: string; pos?: string; children?: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const n = photos.length;

  const go = (e: React.MouseEvent, dir: 1 | -1) => {
    e.preventDefault();
    e.stopPropagation();
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: Math.max(0, Math.min(n - 1, i + dir)) * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className={styles.wrap}>
      <Link href={href} className={styles.link} aria-label={alt}>
        <div
          ref={track}
          className={styles.track}
          onScroll={(e) => {
            const el = e.currentTarget;
            setI(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {photos.map((p, k) => (
            <div key={p + k} className={styles.slide}>
              <Image src={p} alt={k === 0 ? alt : ""} fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 360px" style={{ objectFit: "cover", objectPosition: k === 0 ? (pos ?? "50% 40%") : "50% 45%" }} />
            </div>
          ))}
        </div>
      </Link>
      {n > 1 && (
        <>
          <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={(e) => go(e, -1)} disabled={i === 0} aria-label="Photo précédente">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button type="button" className={`${styles.nav} ${styles.next}`} onClick={(e) => go(e, 1)} disabled={i === n - 1} aria-label="Photo suivante">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className={styles.dots} aria-hidden>
            {photos.map((p, k) => (
              <span key={p + k} className={k === i ? styles.dotOn : undefined} />
            ))}
          </div>
        </>
      )}
      {children}
    </div>
  );
}
