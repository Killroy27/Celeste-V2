import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { VendorCard } from "@/components/VendorCard";
import { ArrowIcon } from "@/components/icons";
import { categories, vendorsIn } from "@/lib/content";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Découvrir les prestataires",
  description: "Tous les métiers du mariage à Paris : lieux, traiteurs, photographes, DJ, fleuristes et plus encore.",
};

// Une rangée par métier, comme les rangées d'Airbnb.
export default function DiscoverPage() {
  return (
    <>
      <PageIntro crumbs={[["Découvrir"]]} title="Découvrir les prestataires" lead="Une sélection des mieux notés dans chaque métier, à Paris et en Île-de-France." />
      <div className="container" style={{ paddingBottom: 96 }}>
        {categories.map((c) => (
          <section key={c.slug} className={styles.row} aria-labelledby={`row-${c.slug}`}>
            <div className={styles.rowHead}>
              <Link href={`/prestataires/${c.slug}`} className={styles.rowTitle}>
                <h2 id={`row-${c.slug}`}>{c.plural}</h2>
                <span className={styles.arrow}>
                  <ArrowIcon />
                </span>
              </Link>
              <Link href={`/prestataires/${c.slug}`} className="link-underline">
                Tout voir
              </Link>
            </div>
            <div className={styles.scroller}>
              {vendorsIn(c.slug)
                .slice(0, 4)
                .map((v) => (
                  <div key={v.slug} className={styles.item}>
                    <VendorCard vendor={v} />
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
