"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import styles from "./Reveal.module.css";

type Props = { as?: ElementType; className?: string; children: ReactNode };

// Apparition douce à l'entrée dans l'écran. Fonctionne dans tous les navigateurs (pas de scroll-timeline).
export function Reveal({ as: Tag = "div", className, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`${styles.reveal} ${shown ? styles.shown : ""} ${className ?? ""}`}>
      {children}
    </Tag>
  );
}
