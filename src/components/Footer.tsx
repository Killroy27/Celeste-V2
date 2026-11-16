import Link from "next/link";
import { categories } from "@/lib/content";
import { Logo } from "./Logo";
import styles from "./Footer.module.css";

const groups = [
  {
    title: "Mariés",
    links: [
      ["Découvrir les prestataires", "/decouvrir"],
      ["Trouver mes matchs", "/matchs"],
      ["Inspirations", "/inspirations"],
      ["Mes coups de cœur", "/favoris"],
      ["Comment ça marche", "/comment-ca-marche"],
    ],
  },
  {
    title: "Prestataires",
    links: [
      ["Devenir prestataire", "/devenir-prestataire"],
      ["Tarifs", "/devenir-prestataire#tarifs"],
      ["Questions fréquentes", "/comment-ca-marche#faq"],
    ],
  },
  {
    title: "Céleste",
    links: [
      ["À propos", "/a-propos"],
      ["Contact", "/contact"],
      ["Mentions légales", "/mentions-legales"],
      ["Confidentialité", "/confidentialite"],
      ["Conditions générales", "/cgu"],
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo />
            <p>La Maison des Célébrations. Les meilleurs prestataires de mariage, réunis en un seul endroit.</p>
          </div>
          {groups.map((g) => (
            <nav key={g.title} aria-label={g.title} className={styles.group}>
              <h2>{g.title}</h2>
              <ul>
                {g.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <nav aria-label="Métiers" className={styles.cats}>
          {categories.map((c) => (
            <Link key={c.slug} href={`/prestataires/${c.slug}`}>
              {c.plural}
            </Link>
          ))}
        </nav>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} Céleste</span>
          <span>Fait avec soin à Paris</span>
        </div>
      </div>
    </footer>
  );
}
