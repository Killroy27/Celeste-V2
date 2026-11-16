import { homeRows } from "@/lib/content";
import { Carousel, Slide } from "../Carousel";
import { VendorCard } from "../VendorCard";
import styles from "./Rows.module.css";

// Rangées façon Fresha, juste sous le hero : on fait défiler, sans onglet ni filtre.
export function VendorRows() {
  return (
    <div className={styles.rows}>
      <Carousel title="Recommandés à Paris" href="/decouvrir">
        {homeRows.recommended.map((v) => (
          <Slide key={v.slug}>
            <VendorCard vendor={v} showCategory landscape />
          </Slide>
        ))}
      </Carousel>
      <Carousel title="Nouveaux sur Céleste" href="/decouvrir">
        {homeRows.newcomers.map((v) => (
          <Slide key={v.slug}>
            <VendorCard vendor={v} showCategory landscape />
          </Slide>
        ))}
      </Carousel>
      <Carousel title="Tendances pour la réception" href="/prestataires/lieux">
        {homeRows.trending.map((v) => (
          <Slide key={v.slug}>
            <VendorCard vendor={v} showCategory landscape />
          </Slide>
        ))}
      </Carousel>
    </div>
  );
}
