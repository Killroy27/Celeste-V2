import Link from "next/link";
import { categories } from "@/lib/content";
import { SHOW_SOCIAL_PLACEHOLDERS, socials } from "@/lib/site";
import { Logo } from "./Logo";
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
      ["Zéro abonnement : comment ça marche", "/devenir-prestataire#tarifs"],
      ["Créer mon profil", "/devenir-prestataire#inscription"],
    ],
  },
  {
    title: "Céleste",
    links: [
      ["À propos", "/a-propos"],
      ["Questions fréquentes", "/comment-ca-marche#faq"],
      ["Nous contacter", "/contact"],
    ],
  },
];

const legal = [
  ["Mentions légales", "/mentions-legales"],
  ["Confidentialité", "/confidentialite"],
  ["Conditions générales", "/cgu"],
];

export function Footer() {
  const shownSocials = socials.filter((s) => s.href || SHOW_SOCIAL_PLACEHOLDERS);

  return (
    <footer className={styles.footer}>
      <div className="container">
        {/* Marque, promesse, réseaux et contact */}
        <div className={styles.lead}>
          <div className={styles.brand}>
            <Link href="/" aria-label="Céleste, accueil" className={styles.logo}>
              <Logo />
            </Link>
            <p className={styles.tagline}>
              La Maison des Célébrations. Lieux et prestataires du mariage, réunis en un seul endroit, de la première idée au jour J.
            </p>
            {shownSocials.length > 0 && (
              <ul className={styles.socials} aria-label="Céleste sur les réseaux">
                {shownSocials.map((s) => (
                  <li key={s.name}>
                    <a href={s.href ?? "#"} aria-label={`Céleste sur ${s.name}`} target={s.href ? "_blank" : undefined} rel={s.href ? "noopener noreferrer" : undefined}>
                      <SocialIcon name={s.name} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.contact}>
            <span className={styles.contactTitle}>Une question sur votre mariage ?</span>
            <p>Notre équipe vous répond par e-mail, que vous soyez futurs mariés ou prestataire.</p>
            <Link href="/contact" className={styles.contactBtn}>
              Nous écrire
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div className={styles.grid}>
          {columns.map((c) => (
            <nav key={c.title} aria-label={c.title} className={styles.col}>
              <h2>{c.title}</h2>
              <ul>
                {c.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Métiers" className={`${styles.col} ${styles.cats}`}>
            <h2>Métiers</h2>
            <ul>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/prestataires/${c.slug}`}>{c.plural}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.col}>
            <h2>Application</h2>
            <p className={styles.appText}>Bientôt sur iOS et Android.</p>
            <div className={styles.stores}>
              <span className={styles.store}>
                <AppleLogo size={16} />
                App Store
              </span>
              <span className={styles.store}>
                <GooglePlayLogo size={16} />
                Google Play
              </span>
            </div>
          </div>
        </div>

        {/* Barre légale */}
        <div className={styles.bar}>
          <span>© {new Date().getFullYear()} Céleste · La Maison des Célébrations</span>
          <nav aria-label="Informations légales" className={styles.legal}>
            {legal.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
          <span className={styles.locale}>Français · EUR €</span>
        </div>
      </div>

      {/* Signature : le nom en très grand, ton sur ton */}
      <div className={styles.signature} aria-hidden="true">
        Céleste
      </div>
    </footer>
  );
}
