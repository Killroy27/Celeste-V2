"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./Results.module.css";

// Filtre en pastille qui ouvre un petit panneau (style, budget, note, tri).
export function Dropdown({ label, active, align = "left", children, width = 300 }: { label: ReactNode; active?: boolean; align?: "left" | "right"; children: (close: () => void) => ReactNode; width?: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={styles.dd}>
      <button type="button" className={styles.pill} aria-expanded={open} data-active={active || undefined} onClick={() => setOpen((o) => !o)}>
        {label}
        <svg className={styles.caret} viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className={styles.pop} data-align={align} style={{ width }}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
