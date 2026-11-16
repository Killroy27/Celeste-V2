import Image from "next/image";
import Link from "next/link";
import type { Vendor } from "@/lib/content";
import { CategoryBar } from "./CategoryBar";
import { ArrowIcon, HeartIcon } from "./icons";
import { Reveal } from "./Reveal";
import styles from "./FeaturedVendors.module.css";

type Props = {
  title: string;
  href: string;
  total: number;
  vendors: Vendor[];
  ctaLabel: string;
  category: string;
};

// Section catalogue sous le hero : même fond crème, titre simple et flèche comme Airbnb.
export function FeaturedVendors({ title, href, total, vendors, ctaLabel, category }: Props) {
  return (
    <section className={styles.section} aria-labelledby="featured-title">
      <CategoryBar active={category} />
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <Link href={href} className={styles.titleLink}>
            <h2 id="featured-title" className={styles.title}>
              {title}
            </h2>
            <span className={styles.arrow}>
              <ArrowIcon />
            </span>
          </Link>
          <span className={styles.count}>
            {total} prestataires · Trier : <strong>Meilleur match</strong>
          </span>
        </Reveal>

        <div className={styles.grid}>
          {vendors.map((v) => (
            <Reveal as="article" key={v.slug} className={styles.card}>
              <Link href={`/prestataire/${v.slug}`} className={styles.photo}>
                <Image
                  src={v.photo}
                  alt={`Mariage photographié par ${v.name}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 400px"
                  style={{ objectFit: "cover", objectPosition: v.pos ?? "50% 40%" }}
                />
              </Link>
              <button type="button" className={styles.save} aria-label={`Enregistrer ${v.name}`}>
                <HeartIcon />
              </button>
              <div className={styles.info}>
                <div className={styles.row}>
                  <Link href={`/prestataire/${v.slug}`} className={styles.name}>
                    {v.name}
                  </Link>
                  <span className={styles.rating} aria-label={`Note ${v.rating} sur 5`}>
                    ★ {v.rating}
                  </span>
                </div>
                <div className={styles.meta}>{v.meta}</div>
                <div className={styles.price}>
                  dès <strong>{v.price}</strong>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className={styles.more}>
          <Link href={href} className={styles.cta}>
            {ctaLabel}
          </Link>
          <span>Devis gratuit, réponse sous 48 h</span>
        </Reveal>
      </div>
    </section>
  );
}
