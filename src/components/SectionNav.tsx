"use client";

import { useEffect, useState } from "react";
import styles from "./SectionNav.module.css";

// Onglets d'ancres collés sous l'en-tête, avec la section en cours soulignée.
export function SectionNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const firstEl = document.getElementById(items[0]?.id ?? "");
        // Tant qu'on n'a pas atteint la première section, c'est elle qui est mise en avant.
        if (firstEl && firstEl.getBoundingClientRect().top > window.innerHeight * 0.4) {
          setActive(items[0].id);
          return;
        }
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-160px 0px -60% 0px" },
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className={styles.nav} aria-label="Sections de la fiche">
      <div className={styles.inner}>
        {items.map((i) => (
          <a key={i.id} href={`#${i.id}`} className={active === i.id ? styles.on : ""} aria-current={active === i.id ? "true" : undefined}>
            {i.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
