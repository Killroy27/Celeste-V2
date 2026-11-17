import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/content";
import { FiltersIcon } from "./icons";
import styles from "./CategoryBar.module.css";

type Props = {
  active?: string;
  /** Sur la landing, les onglets changent la grille sur place ; ailleurs, ce sont des liens. */
  onSelect?: (slug: string) => void;
  onFilters?: () => void;
  filtersCount?: number;
  /** Même largeur que les rangées (.container) plutôt que la largeur des résultats. */
  narrow?: boolean;
};

// Onglets des métiers, posés juste au-dessus de la grille qu'ils pilotent.
// Collés sous l'en-tête tant qu'on parcourt la liste, puis ils s'en vont avec elle.
export function CategoryBar({ active, onSelect, onFilters, filtersCount = 0, narrow }: Props) {
  return (
    <div className={styles.bar}>
      <div className={styles.inner} style={narrow ? { maxWidth: 1360 } : undefined}>
        <nav aria-label="Métiers" className={styles.cats}>
          {categories.map((c) => {
            const on = c.slug === active;
            const body = (
              <>
                <Image src={c.icon} alt="" width={32} height={32} />
                <span>{c.label}</span>
              </>
            );
            return onSelect ? (
              <button
                key={c.slug}
                type="button"
                className={`${styles.cat} ${on ? styles.on : ""}`}
                aria-pressed={on}
                onClick={() => onSelect(c.slug)}
              >
                {body}
              </button>
            ) : (
              <Link
                key={c.slug}
                href={`/prestataires/${c.slug}`}
                className={`${styles.cat} ${on ? styles.on : ""}`}
                aria-current={on ? "page" : undefined}
              >
                {body}
              </Link>
            );
          })}
        </nav>
        {onFilters && (
          <button type="button" className={styles.filters} onClick={onFilters}>
            <FiltersIcon />
            <span>Filtres</span>
            {filtersCount > 0 && <b className={styles.n}>{filtersCount}</b>}
          </button>
        )}
      </div>
    </div>
  );
}
