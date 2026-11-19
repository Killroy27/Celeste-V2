"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../espace.module.css";

const TABS = [
  ["planning", "Planning"],
  ["budget", "Budget"],
  ["prestataires", "Mes prestataires"],
  ["wedding-dna", "Wedding DNA"],
  ["documents", "Documents"],
  ["coups-de-coeur", "Coups de cœur"],
] as const;

export function MariageNav() {
  const pathname = usePathname();
  return (
    <>
      <p className={styles.eyebrow}>Mon mariage</p>
      <nav className={styles.subnav} aria-label="Mon mariage">
        {TABS.map(([slug, label]) => {
          const href = `/espace/mariage/${slug}`;
          return (
            <Link key={slug} href={href} aria-current={pathname.startsWith(href) ? "page" : undefined}>
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
