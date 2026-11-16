"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowIcon } from "./icons";
import styles from "./Carousel.module.css";

function Chevron({ left }: { left?: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={left ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

// Rangée façon Airbnb : « Métier · Lieu → » à gauche (lien vers les résultats),
// deux chevrons en haut à droite pour faire défiler. Défilement libre au doigt.
export function Carousel({ title, href, children, label }: { title?: string; href?: string; children: ReactNode; label?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const scrollable = !(edge.start && edge.end);

  return (
    <section className={styles.row} aria-label={label ?? title}>
      <div className={`container ${styles.head}`}>
        {title &&
          (href ? (
            <Link href={href} className={styles.titleLink}>
              <h2 className={styles.title}>{title}</h2>
              <span className={styles.go}>
                <ArrowIcon size={13} />
              </span>
            </Link>
          ) : (
            <h2 className={styles.title}>{title}</h2>
          ))}
        {scrollable && (
          <div className={styles.chevrons}>
            <button type="button" onClick={() => go(-1)} disabled={edge.start} aria-label="Précédents">
              <Chevron left />
            </button>
            <button type="button" onClick={() => go(1)} disabled={edge.end} aria-label="Suivants">
              <Chevron />
            </button>
          </div>
        )}
      </div>
      <div className={styles.viewport}>
        <div ref={track} className={styles.track}>
          {children}
        </div>
      </div>
    </section>
  );
}

export function Slide({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <div className={`${styles.slide} ${wide ? styles.wide : ""}`}>{children}</div>;
}
