import Image from "next/image";
import Link from "next/link";
import { getCategory, priceLabel, type Vendor } from "@/lib/content";
import { SaveButton } from "./SaveButton";
import styles from "./VendorCard.module.css";

export function VendorCard({ vendor: v, showCategory = false }: { vendor: Vendor; showCategory?: boolean }) {
  const cat = getCategory(v.category)!;
  return (
    <article className={styles.card}>
      <Link href={`/prestataire/${v.slug}`} className={styles.photo}>
        <Image
          src={v.photo}
          alt={`${v.name}, ${cat.singular} à ${v.city}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 400px"
          style={{ objectFit: "cover", objectPosition: v.pos ?? "50% 40%" }}
        />
        {v.verified && <span className={styles.tag}>Vérifié</span>}
      </Link>
      <SaveButton slug={v.slug} name={v.name} className={styles.save} />
      <div className={styles.info}>
        <div className={styles.row}>
          <Link href={`/prestataire/${v.slug}`} className={styles.name}>
            {v.name}
          </Link>
          <span className={styles.rating} aria-label={`Note ${v.rating} sur 5, ${v.reviewsCount} avis`}>
            ★ {v.rating} <span className={styles.count}>({v.reviewsCount})</span>
          </span>
        </div>
        <div className={styles.meta}>
          {showCategory ? `${cat.plural} · ` : ""}
          {v.area} · {v.style}
        </div>
        <div className={styles.price}>
          dès <strong>{priceLabel(v)}</strong>
        </div>
      </div>
    </article>
  );
}

export function VendorGrid({ vendors, showCategory }: { vendors: Vendor[]; showCategory?: boolean }) {
  return (
    <div className={styles.grid}>
      {vendors.map((v) => (
        <VendorCard key={v.slug} vendor={v} showCategory={showCategory} />
      ))}
    </div>
  );
}
