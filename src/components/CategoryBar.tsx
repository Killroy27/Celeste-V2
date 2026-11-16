import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/content";
import { FiltersIcon } from "./icons";
import styles from "./CategoryBar.module.css";

// Onglets des métiers, posés juste au-dessus de la grille qu'ils pilotent.
// Collés sous l'en-tête tant qu'on parcourt le catalogue, puis ils s'en vont avec lui.
export function CategoryBar({ active }: { active: string }) {
  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <nav aria-label="Métiers" className={styles.cats}>
          {categories.map((c) => {
            const on = c.slug === active;
            return (
              <Link
                key={c.slug}
                href={`/prestataires/${c.slug}`}
                className={`${styles.cat} ${on ? styles.on : ""}`}
                aria-current={on ? "page" : undefined}
              >
                <Image src={c.icon} alt="" width={32} height={32} />
                <span>{c.label}</span>
              </Link>
            );
          })}
        </nav>
        <button type="button" className={styles.filters}>
          <FiltersIcon />
          <span>Filtres</span>
        </button>
      </div>
    </div>
  );
}
