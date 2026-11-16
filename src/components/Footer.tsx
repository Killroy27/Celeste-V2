import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/content";
import { SHOW_SOCIAL_PLACEHOLDERS, socials } from "@/lib/site";
import { SocialIcon } from "./SocialIcons";
import { AppleLogo, GooglePlayLogo } from "./StoreBadges";
import styles from "./Footer.module.css";

const columns = [
  {
    title: "Mariés",
    links: [
      ["Trouver mon Best Match", "/matchs"],
      ["Découvrir les prestataires", "/decouvrir"],
      ["Inspirations", "/inspirations"],
      ["Mes coups de cœur", "/favoris"],
      ["Comment ça marche", "/comment-ca-marche"],
    ],
  },
  {
    title: "Prestataires",
    links: [
      ["Rejoindre Céleste", "/devenir-prestataire"],
      ["Zéro abonnement", "/devenir-prestataire#tarifs"],
      ["Créer mon profil", "/devenir-prestataire#inscription"],
    ],
  },
  {
    title: "La Maison",
    links: [
      ["À propos", "/a-propos"],
      ["Questions fréquentes", "/comment-ca-marche#faq"],
      ["Nous contacter", "/contact"],
    ],
  },
];

// Cinq instants, du « oui » à la fête : ce qui donne vie au pied de page.
const moments = ["/photos/confetti.jpg", "/photos/dance.jpg", "/photos/beach.jpg", "/photos/rain.jpg", "/photos/rings.jpg"];

const legal = [
  ["Mentions légales", "/mentions-legales"],
  ["Confidentialité", "/confidentialite"],
  ["Conditions générales", "/cgu"],
];

// Pied de page éditorial, façon maison : la signature, un sommaire, l'index des métiers, puis le légal.
export function Footer() {
  const shownSocials = socials.filter((s) => s.href || SHOW_SOCIAL_PLACEHOLDERS);

  return (
    <footer className={styles.footer}>
      <div className="container">
        {/* 0. Le souffle : une phrase, cinq instants de mariage */}
        <div className={styles.story}>
          <div className={styles.storyHead}>
            <h2 className={styles.storyTitle}>
              Chaque mariage, <em>une histoire à part.</em>
            </h2>
            <Link href="/inspirations" className={`${styles.link} ${styles.storyLink}`}>
              Voir les inspirations <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul className={styles.ribbon} aria-hidden="true">
            {moments.map((src) => (
              <li key={src}>
                <Image src={src} alt="" fill sizes="(max-width: 640px) 33vw, 260px" />
              </li>
            ))}
          </ul>
        </div>

        {/* 1. Signature + sommaire */}
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" aria-label="Céleste, accueil" className={styles.lockup}>
              <Image src="/brand/monogram.png" alt="" width={40} height={42} />
              <Image src="/brand/wordmark.png" alt="Céleste" width={136} height={35} />
            </Link>
            <p className={styles.motto}>La Maison des Célébrations</p>
            <p className={styles.line}>Lieux et prestataires du mariage, réunis en un seul endroit.</p>
          </div>

          <div className={styles.nav}>
            {columns.map((c) => (
              <nav key={c.title} aria-label={c.title} className={styles.col}>
                <h3 className={styles.heading}>{c.title}</h3>
                <ul>
                  {c.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className={styles.link}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* 2. Index des métiers */}
        <nav aria-label="Métiers" className={styles.trades}>
          <h3 className={styles.heading}>Métiers</h3>
          <ul>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/prestataires/${c.slug}`} className={styles.link}>
                  {c.plural}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 3. Réseaux et application */}
        <div className={styles.meta}>
          {shownSocials.length > 0 && (
            <div className={styles.metaGroup}>
              <span className={styles.metaLabel}>Suivre la Maison</span>
              <ul className={styles.socials}>
                {shownSocials.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.href ?? "#"}
                      aria-label={`Céleste sur ${s.name}`}
                      target={s.href ? "_blank" : undefined}
                      rel={s.href ? "noopener noreferrer" : undefined}
                    >
                      <SocialIcon name={s.name} size={16} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.metaGroup}>
            <span className={styles.metaLabel}>Application bientôt disponible</span>
            <div className={styles.stores}>
              <span className={styles.store}>
                <AppleLogo size={15} />
                App Store
              </span>
              <span className={styles.store}>
                <GooglePlayLogo size={14} />
                Google Play
              </span>
            </div>
          </div>
        </div>

        {/* 4. Légal */}
        <div className={styles.bar}>
          <span>© {new Date().getFullYear()} Céleste</span>
          <nav aria-label="Informations légales" className={styles.legal}>
            {legal.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
          <span>Français · EUR €</span>
        </div>
      </div>
    </footer>
  );
}
