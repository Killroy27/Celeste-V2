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

const legal = [
  ["Mentions légales", "/mentions-legales"],
  ["Confidentialité", "/confidentialite"],
  ["Conditions générales", "/cgu"],
];

// Pied de page éditorial : une invitation, la navigation, puis la signature de la Maison.
export function Footer() {
  const shownSocials = socials.filter((s) => s.href || SHOW_SOCIAL_PLACEHOLDERS);

  return (
    <footer className={styles.footer}>
      <div className="container">
        {/* 1. L'invitation */}
        <div className={styles.invite}>
          <div>
            <p className={styles.kicker}>La Maison des Célébrations</p>
            <h2 className={styles.inviteTitle}>
              Votre mariage <em>commence ici.</em>
            </h2>
          </div>
          <div className={styles.inviteCtas}>
            <Link href="/matchs" className="btn">
              Trouver mon Best Match
            </Link>
            <Link href="/devenir-prestataire" className="btn btn-outline">
              Rejoindre Céleste
            </Link>
          </div>
        </div>

        <hr className={styles.rule} />

        {/* 2. La navigation */}
        <div className={styles.nav}>
          {columns.map((c) => (
            <nav key={c.title} aria-label={c.title} className={styles.col}>
              <h3>{c.title}</h3>
              <ul>
                {c.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <nav aria-label="Métiers" className={`${styles.col} ${styles.trades}`}>
            <h3>Métiers</h3>
            <ul>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/prestataires/${c.slug}`}>{c.plural}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <hr className={styles.rule} />

        {/* 3. La signature */}
        <div className={styles.signature}>
          <Link href="/" aria-label="Céleste, accueil" className={styles.mark}>
            <Image src="/brand/monogram.png" alt="" width={46} height={48} />
            <Image src="/brand/wordmark.png" alt="Céleste" width={158} height={40} />
          </Link>
          <p className={styles.motto}>Lieux et prestataires du mariage, réunis en un seul endroit.</p>

          {shownSocials.length > 0 && (
            <ul className={styles.socials} aria-label="Céleste sur les réseaux">
              {shownSocials.map((s) => (
                <li key={s.name}>
                  <a href={s.href ?? "#"} aria-label={`Céleste sur ${s.name}`} target={s.href ? "_blank" : undefined} rel={s.href ? "noopener noreferrer" : undefined}>
                    <SocialIcon name={s.name} size={17} />
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.app}>
            <span>Application bientôt disponible</span>
            <span className={styles.store}>
              <AppleLogo size={15} />
              App Store
            </span>
            <span className={styles.store}>
              <GooglePlayLogo size={15} />
              Google Play
            </span>
          </div>
        </div>

        {/* 4. La barre légale */}
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
