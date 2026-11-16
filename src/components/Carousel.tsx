"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowIcon } from "./icons";
import styles from "./Carousel.module.css";

// Rangée défilante façon Fresha : titre à gauche, défilement libre au doigt ou à la molette,
// flèches discrètes sur ordinateur. Pas d'onglets, pas de filtre : on parcourt, c'est tout.
export function Carousel({ title, href, children, label }: { title: string; href?: string; children: ReactNode; label?: string }) {
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

  return (
    <section className={styles.row} aria-label={label ?? title}>
      {title && (
      <div className={`container ${styles.head}`}>
        <h2 className={styles.title}>{title}</h2>
        {href && (
          <Link href={href} className={styles.all}>
            Tout voir
          </Link>
        )}
      </div>
      )}
      <div className={styles.viewport}>
        <div ref={track} className={styles.track}>
          {children}
        </div>
        <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => go(-1)} hidden={edge.start} aria-label="Précédents">
          <ArrowIcon size={16} />
        </button>
        <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => go(1)} hidden={edge.end} aria-label="Suivants">
          <ArrowIcon size={16} />
        </button>
      </div>
    </section>
  );
}

export function Slide({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <div className={`${styles.slide} ${wide ? styles.wide : ""}`}>{children}</div>;
}
