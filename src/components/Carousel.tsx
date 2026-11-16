"use client";

import Image from "next/image";
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

type More = { href: string; photos: string[]; label?: string };

// Rangée façon Airbnb : « Métier · Lieu → » à gauche, chevrons en haut à droite.
// Chaque chevron avance d'une seule carte. En bout de rangée, une carte « Tout afficher » animée.
export function Carousel({ title, href, children, label, more }: { title?: string; href?: string; children: ReactNode; label?: string; more?: More }) {
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

  // Avance d'exactement une carte (largeur d'une carte + l'espace entre deux cartes).
  const go = (dir: 1 | -1) => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (first.offsetWidth + gap), behavior: "smooth" });
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
            <button type="button" onClick={() => go(-1)} disabled={edge.start} aria-label="Précédent">
              <Chevron left />
            </button>
            <button type="button" onClick={() => go(1)} disabled={edge.end} aria-label="Suivant">
              <Chevron />
            </button>
          </div>
        )}
      </div>
      <div className={styles.viewport}>
        <div ref={track} className={styles.track}>
          {children}
          {more && <ShowAll {...more} />}
        </div>
      </div>
    </section>
  );
}

export function Slide({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <div className={`${styles.slide} ${wide ? styles.wide : ""}`}>{children}</div>;
}

// Carte de fin de rangée : même taille qu'une photo de prestataire, éventail de trois photos
// qui se déploie quand la carte entre dans l'écran.
function ShowAll({ href, photos, label = "Tout afficher" }: More) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.slide}>
      <Link ref={ref} href={href} className={`${styles.more} ${shown ? styles.moreIn : ""}`}>
        <span className={styles.fan} aria-hidden="true">
          {photos.slice(0, 3).map((p, i) => (
            <span key={p + i} className={styles.fanItem} style={{ ["--i" as string]: i - 1 }}>
              <Image src={p} alt="" fill sizes="120px" style={{ objectFit: "cover" }} />
            </span>
          ))}
        </span>
        <span className={styles.moreLabel}>{label}</span>
      </Link>
    </div>
  );
}
