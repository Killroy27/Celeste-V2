import type { Metadata } from "next";
import Image from "next/image";
import { PageIntro } from "@/components/PageIntro";
import { articles } from "@/lib/content";
import { InspirationBoard } from "./InspirationBoard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Inspirations mariage",
  description: "Idées de cérémonie, de réception, de tenues et de fleurs, et conseils pour préparer votre mariage.",
};

export default function InspirationsPage() {
  return (
    <>
      <PageIntro crumbs={[["Inspirations"]]} title="Inspirations" lead="Des mariages réels pour trouver votre style. Touchez une photo pour découvrir les prestataires qui l'ont rendue possible." />
      <InspirationBoard />

      <section className={`section ${styles.carnet}`} aria-labelledby="carnet">
        <div className="container">
          <span className="eyebrow">Le carnet Céleste</span>
          <h2 id="carnet" className="display h2" style={{ marginTop: 10 }}>
            Conseils pour préparer le grand jour
          </h2>
          <div className={styles.articles}>
            {articles.map((a) => (
              <article key={a.slug} id={a.slug} className={styles.article}>
                <div className={styles.photo}>
                  <Image src={a.photo} alt="" fill sizes="(max-width: 720px) 100vw, 400px" style={{ objectFit: "cover" }} />
                </div>
                <span className="eyebrow">
                  {a.theme} · {a.read}
                </span>
                <h3 className="h3">{a.title}</h3>
                <p className="muted">{a.excerpt}</p>
                <span className={styles.soon}>Article complet bientôt disponible</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
