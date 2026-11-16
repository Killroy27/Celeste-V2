import { SearchIcon } from "./icons";
import styles from "./SearchForm.module.css";

type Props = {
  variant?: "hero" | "dialog";
  autoFocus?: boolean;
  id?: string;
};

// Une seule barre de recherche, réutilisée dans le hero et dans la recherche ouverte depuis l'en-tête.
export function SearchForm({ variant = "hero", autoFocus, id }: Props) {
  return (
    <form id={id} action="/recherche" method="get" role="search" className={`${styles.form} ${styles[variant]}`}>
      <label className={`${styles.seg} ${styles.what}`}>
        <span className={styles.label}>Prestataire</span>
        <input name="quoi" placeholder="Photographe, DJ, traiteur…" autoComplete="off" autoFocus={autoFocus} />
      </label>
      <span className={styles.sep} aria-hidden="true" />
      <label className={styles.seg}>
        <span className={styles.label}>Lieu</span>
        <input name="ou" placeholder="Ville ou région" autoComplete="address-level2" />
      </label>
      <span className={styles.sep} aria-hidden="true" />
      <div className={`${styles.seg} ${styles.last}`}>
        <label className={styles.dateField}>
          <span className={styles.label}>Date</span>
          <input name="quand" placeholder="Jour J" autoComplete="off" />
        </label>
        <button type="submit" className={styles.submit}>
          <SearchIcon size={20} />
          <span className={styles.submitText}>Rechercher</span>
        </button>
      </div>
    </form>
  );
}
