import { homeRows } from "@/lib/content";
import { Carousel, Slide } from "../Carousel";
import { VendorCard } from "../VendorCard";
import styles from "./Rows.module.css";

// Quatre rangées : les trois meilleures catégories, puis un mélange de toutes les autres
// (règle détaillée dans docs/recherche.md).
export function VendorRows() {
  const rows = homeRows();
  return (
    <div className={styles.rows}>
      {rows.map((r, i) => (
        <Carousel key={r.title} title={r.title} href={r.href} more={{ href: r.href, photos: r.list.slice(0, 3).map((v) => v.photo) }}>
          {r.list.map((v) => (
            <Slide key={v.slug}>
              <VendorCard vendor={v} landscape showCategory={i === rows.length - 1} />
            </Slide>
          ))}
        </Carousel>
      ))}
    </div>
  );
}
