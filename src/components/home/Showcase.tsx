"use client";

import Link from "next/link";
import { useState } from "react";
import { getCategory, vendorsIn } from "@/lib/content";
import { CategoryBar } from "../CategoryBar";
import { ArrowIcon } from "../icons";
import { VendorGrid } from "../VendorCard";
import styles from "./Showcase.module.css";

// Catalogue sous le hero : les onglets métiers changent la sélection sur place, comme Airbnb.
export function Showcase() {
  const [active, setActive] = useState("photographes");
  const cat = getCategory(active)!;
  const list = vendorsIn(active);
  const href = `/prestataires/${active}`;

  const select = (slug: string) => {
    setActive(slug);
    const top = document.getElementById("selection")?.getBoundingClientRect().top ?? 0;
    if (top < 0) document.getElementById("selection")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="selection" className={styles.section} aria-labelledby="showcase-title">
      <CategoryBar active={active} onSelect={select} />
      <div className={`container ${styles.inner}`}>
        <div className={styles.head}>
          <Link href={href} className={styles.titleLink}>
            <h2 id="showcase-title" className={styles.title}>
              {cat.plural} coups de cœur à Paris
            </h2>
            <span className={styles.arrow}>
              <ArrowIcon />
            </span>
          </Link>
          <span className={styles.count}>
            {list.length} sélectionnés · Trier : <strong>Meilleur match</strong>
          </span>
        </div>

        <div key={active} className={styles.grid}>
          <VendorGrid vendors={list.slice(0, 6)} />
        </div>

        <div className={styles.more}>
          <Link href={href} className="btn">
            Voir tous les {cat.plural.toLowerCase()}
          </Link>
          <span>Devis gratuit, réponse sous 48 h</span>
        </div>
      </div>
    </section>
  );
}
