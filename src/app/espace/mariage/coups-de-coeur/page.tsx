import type { Metadata } from "next";
import { FavoritesList } from "@/app/favoris/FavoritesList";
import styles from "../../espace.module.css";

export const metadata: Metadata = { title: "Coups de cœur" };

// Coups de cœur regroupés dans Mon mariage plutôt qu'en entrée principale (CDC §5.1).
export default function CoupsDeCoeurPage() {
  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Coups de cœur</h1>
          <p className={styles.lead}>Les prestataires que vous avez enregistrés. Comparez-les, écrivez-leur ou partagez-les dans une conversation.</p>
        </div>
      </header>
      <FavoritesList embedded />
    </>
  );
}
