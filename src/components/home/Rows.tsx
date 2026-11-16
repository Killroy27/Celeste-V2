import { homeRows, reviewPool } from "@/lib/content";
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

export function ReviewRow() {
  return (
    <Carousel title="Avis des couples">
      {reviewPool.map((r) => (
        <Slide key={r.author + r.date}>
          <figure className={styles.review}>
            <div className={styles.stars} aria-label={`${r.rating} étoiles sur 5`}>
              {"★".repeat(r.rating)}
              <span>{"★".repeat(5 - r.rating)}</span>
            </div>
            <blockquote>{r.text}</blockquote>
            <figcaption>
              <span className={styles.avatar}>{r.author.charAt(0)}</span>
              <span>
                <strong>{r.author}</strong>
                <small>Mariés en {r.date}</small>
              </span>
            </figcaption>
          </figure>
        </Slide>
      ))}
    </Carousel>
  );
}
