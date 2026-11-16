import Image from "next/image";
import Link from "next/link";
import { faq } from "@/lib/content";
import { Carousel, Slide } from "../Carousel";
import { Reveal } from "../Reveal";
import { NotifyForm } from "./NotifyForm";
import styles from "./Sections.module.css";

// Sous le catalogue, la page fonctionne comme un entonnoir : chaque bloc donne une raison d'agir
// et se termine par une seule action. Si le visiteur passe un bloc, le suivant le rattrape.
// Tous les arguments viennent du cahier des charges : aucune promesse non validée.

/* ---------- 1. Best Match ---------- */

const styleChoices = [
  { slug: "champetre", label: "Champêtre", photo: "/photos/field.jpg" },
  { slug: "chateau", label: "Château", photo: "/photos/chateau.jpg" },
  { slug: "boheme", label: "Bohème", photo: "/photos/deco.jpg" },
  { slug: "urbain", label: "Urbain", photo: "/photos/rain.jpg" },
];

export function BestMatch() {
  return (
    <section className={styles.block} aria-labelledby="best-match">
      <div className={`container ${styles.split}`}>
        <Reveal className={styles.copy}>
          <span className={styles.kicker}>
            <Image src="/icons/match-puzzle.png" alt="" width={32} height={32} />
            Best Match
          </span>
          <h2 id="best-match" className={styles.big}>
            Dites-nous qui vous êtes. On vous dit qui choisir.
          </h2>
          <p className={styles.say}>Quatre questions sur votre style et votre budget. Deux minutes plus tard, vos prestataires idéaux.</p>
          <Link href="/matchs" className="btn">
            Trouver mon Best Match
          </Link>
        </Reveal>
        <Reveal className={styles.matchVisual}>
          <span className={styles.matchQ}>Votre mariage ressemble plutôt à…</span>
          <div className={styles.matchGrid}>
            {styleChoices.map((s) => (
              <Link key={s.slug} href={`/matchs?style=${s.slug}`} className={styles.matchChoice}>
                <Image src={s.photo} alt="" fill sizes="(max-width: 900px) 50vw, 300px" style={{ objectFit: "cover" }} />
                <span>{s.label}</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- 2. Pourquoi Céleste : fonctionnalités réelles, en ligne ---------- */

const features = [
  {
    icon: "/icons/chat-bubbles.png",
    title: "Négociez sans gêne",
    text: "Budget serré ? Le prestataire adapte sa formule au lieu de vous dire non.",
  },
  {
    icon: "/icons/contract-pen.png",
    title: "Signez et payez ici",
    text: "Contrat en ligne, 30 % d'acompte, puis le solde en une à trois fois.",
  },
  {
    icon: "/icons/verified-seal.png",
    title: "Des pros vérifiés",
    text: "Entreprise et identité contrôlées. Le badge Céleste Select ne s'achète pas.",
  },
  {
    icon: "/icons/planner-notebook.png",
    title: "Un budget à jour",
    text: "Chaque réservation met à jour votre budget et votre checklist. Tout seul.",
  },
];

export function WhyCeleste() {
  return (
    <section className={styles.block} aria-labelledby="pourquoi">
      <div className="container">
        <Reveal className={styles.centerHead}>
          <h2 id="pourquoi" className={styles.mid}>
            Du premier message à la signature, tout se passe ici
          </h2>
          <p className={styles.say}>Fini les tableurs, les PDF par e-mail et les virements à l&apos;aveugle.</p>
        </Reveal>
        <ul className={styles.features}>
          {features.map((f) => (
            <Reveal as="li" key={f.title} className={styles.feature}>
              <Image src={f.icon} alt="" width={112} height={112} />
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </Reveal>
          ))}
        </ul>
        <div className={styles.centerCta}>
          <Link href="/matchs" className="btn">
            Commencer mon mariage sur Céleste
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. Avis : tous avec photo (ceux qui n'en ont pas passent après) ---------- */

type Review = { author: string; meta: string; photo?: string; pos?: string; text: string };

const reviews: Review[] = [
  {
    author: "Aïcha & Kwame",
    meta: "Traiteur · juin 2026",
    photo: "/photos/kente.jpg",
    pos: "50% 30%",
    text: "On voulait un menu ivoirien et ghanéen. Le traiteur a fait l'attiéké et le jollof, et les deux familles se sont resservies. On n'aurait jamais trouvé seuls.",
  },
  {
    author: "Claire & Thomas",
    meta: "DJ · mai 2026",
    photo: "/photos/dance.jpg",
    text: "Le DJ nous a proposé une soirée un peu plus courte pour rentrer dans notre budget, au lieu de nous dire non. C'est ce qui nous a fait signer.",
  },
  {
    author: "Inès & Malik",
    meta: "Photographe · septembre 2026",
    photo: "/photos/confetti.jpg",
    text: "Les messages, le contrat, les paiements : tout était au même endroit. Malik, qui déteste l'administratif, a trouvé ça simple. C'est dire.",
  },
  {
    author: "Mariam & Yanis",
    meta: "Lieu de réception · octobre 2026",
    photo: "/photos/chateau.jpg",
    text: "Le domaine dépassait notre budget de 150 €, mais Céleste nous a expliqué pourquoi il nous correspondait. Il avait raison, c'était le bon.",
  },
  {
    author: "Léa & Julien",
    meta: "Photographe · juillet 2026",
    photo: "/photos/field.jpg",
    text: "On a réservé huit mois à l'avance. Le rappel pour le solde est arrivé tout seul, on n'a rien eu à suivre.",
  },
  {
    author: "Sarah & Nathan",
    meta: "Fleuriste · août 2026",
    photo: "/photos/aisle.jpg",
    pos: "50% 60%",
    text: "On hésitait à passer par une plateforme. Un contrat signé et un acompte payé en ligne, ça nous a rassurés.",
  },
];

// Les avis avec photo d'abord, puis les autres.
const orderedReviews = [...reviews.filter((r) => r.photo), ...reviews.filter((r) => !r.photo)];

export function Proof() {
  return (
    <section className={styles.block} aria-labelledby="avis">
      <div className="container">
        <Reveal className={styles.centerHead}>
          <h2 id="avis" className={styles.mid}>
            Ils ont dit oui avec Céleste
          </h2>
          <p className={styles.say}>Sur Céleste, seuls les couples qui ont réservé peuvent laisser un avis.</p>
        </Reveal>
      </div>
      <div className={styles.reviewsWrap}>
        <Carousel label="Avis des couples">
          {orderedReviews.map((r) => (
            <Slide key={r.author} wide>
              <figure className={styles.review}>
                {r.photo && (
                  <div className={styles.reviewPhoto}>
                    <Image src={r.photo} alt={`${r.author} le jour de leur mariage`} fill sizes="420px" style={{ objectFit: "cover", objectPosition: r.pos ?? "50% 35%" }} />
                  </div>
                )}
                <div className={styles.reviewBody}>
                  <span className={styles.stars} aria-label="5 étoiles sur 5">
                    ★★★★★
                  </span>
                  <blockquote>« {r.text} »</blockquote>
                  <figcaption>
                    <strong>{r.author}</strong>
                    <small>{r.meta}</small>
                  </figcaption>
                </div>
              </figure>
            </Slide>
          ))}
        </Carousel>
      </div>
      <div className={styles.centerCta}>
        <Link href="/decouvrir" className="btn">
          Trouver mes prestataires
        </Link>
      </div>
    </section>
  );
}

/* ---------- 4. La version mobile arrive bientôt ---------- */

function AppleLogo() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#000000"
        d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1zM13.9 4.9c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5z"
      />
    </svg>
  );
}

function GooglePlayLogo() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M3.6 1.6c-.3.3-.4.7-.4 1.2v18.4c0 .5.1.9.4 1.2l.1.1L13.9 12v-.2L3.7 1.5l-.1.1z" />
      <path fill="#FBBC04" d="M17.3 15.4 13.9 12v-.2l3.4-3.4.1.1 4 2.3c1.2.7 1.2 1.7 0 2.4l-4 2.3-.1-.1z" />
      <path fill="#EA4335" d="M17.4 15.3 13.9 11.9 3.6 22.4c.4.4 1 .4 1.7 0l12.1-7.1" />
      <path fill="#34A853" d="M17.4 8.5 5.3 1.6c-.7-.4-1.3-.4-1.7 0l10.3 10.3 3.5-3.4z" />
    </svg>
  );
}

export function AppSoon() {
  return (
    <section className={styles.block} aria-labelledby="app">
      <div className={`container ${styles.split} ${styles.flip}`}>
        <Reveal className={styles.copy}>
          <span className={styles.kicker}>
            <Image src="/icons/notification-bell.png" alt="" width={32} height={32} />
            Application mobile
          </span>
          <h2 id="app" className={styles.big}>
            La version mobile arrive bientôt
          </h2>
          <p className={styles.say}>Vos prestataires, vos offres et vos rappels de paiement, toujours sous la main. Laissez votre e-mail : vous serez prévenus le jour de la sortie.</p>
          <NotifyForm />
          <div className={styles.stores} aria-label="Bientôt sur l'App Store et Google Play">
            <span className={styles.store}>
              <AppleLogo />
              App Store
            </span>
            <span className={styles.store}>
              <GooglePlayLogo />
              Google Play
            </span>
            <small>Bientôt disponible</small>
          </div>
        </Reveal>

        <Reveal className={styles.phones} aria-hidden="true">
          {/* Téléphone de devant : une fiche prestataire */}
          <div className={styles.phone}>
            <div className={styles.screen}>
              <div className={styles.appPhoto}>
                <Image src="/photos/kente.jpg" alt="" fill sizes="280px" style={{ objectFit: "cover", objectPosition: "50% 30%" }} />
              </div>
              <div className={styles.appBody}>
                <strong>Atelier Kofi & Ama</strong>
                <small>★ 5,0 · 87 avis · Paris 18e</small>
                <span className={styles.appChip}>Vérifié</span>
                <span className={styles.appBtn}>Demander un devis</span>
              </div>
            </div>
          </div>
          {/* Téléphone de derrière : le suivi du mariage */}
          <div className={`${styles.phone} ${styles.phoneBack}`}>
            <div className={`${styles.screen} ${styles.screenPad}`}>
              <div className={styles.appTop}>
                <small>Mon mariage</small>
                <strong>J-210</strong>
              </div>
              <div className={styles.appNotif}>
                <Image src="/icons/notification-bell.png" alt="" width={26} height={26} />
                <span>
                  <strong>Maison Lumen</strong>
                  <small>vous a envoyé une offre révisée</small>
                </span>
              </div>
              <div className={styles.appNotif}>
                <Image src="/icons/calendar.png" alt="" width={26} height={26} />
                <span>
                  <strong>Solde du traiteur</strong>
                  <small>échéance dans 5 jours</small>
                </span>
              </div>
              <div className={styles.appList}>
                <span className={styles.appListTitle}>Checklist</span>
                {["Réserver le lieu", "Choisir le photographe", "Goûter le menu"].map((t, i) => (
                  <span key={t} className={i < 2 ? styles.done : ""}>
                    <i />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- 5. Prestataires : on parle d'eux, pas de nous ---------- */

const proReasons = [
  ["Les couples viennent à vous", "Ils découvrent votre travail quand votre style correspond au leur."],
  ["Vous savez tout avant de répondre", "Date, zone, budget et style du mariage, dès la première demande."],
  ["Vous gardez la main sur vos prix", "Adaptez votre formule au budget du couple, sans brader votre travail."],
  ["Vous êtes payé sereinement", "Contrat signé et acompte encaissés en ligne, avant le jour J."],
];

export function ProBand() {
  return (
    <section className={`${styles.block} ${styles.last}`} aria-labelledby="pros">
      <div className={`container ${styles.split}`}>
        <Reveal className={styles.copy}>
          <span className={styles.kicker}>Photographes, traiteurs, lieux, DJ, fleuristes…</span>
          <h2 id="pros" className={styles.big}>
            Votre talent mérite les bons couples
          </h2>
          <p className={styles.say}>Vous faites des mariages inoubliables. Recevez les demandes de couples qui aiment déjà votre style, et gardez votre temps pour ce que vous faites le mieux.</p>
          <ul className={styles.proReasons}>
            {proReasons.map(([t, d]) => (
              <li key={t}>
                <strong>{t}</strong>
                <span>{d}</span>
              </li>
            ))}
          </ul>
          <Link href="/devenir-prestataire" className="btn">
            Créer mon profil prestataire
          </Link>
        </Reveal>
        <Reveal className={styles.proPhoto}>
          <Image src="/photos/photog.jpg" alt="Une photographe au travail pendant un mariage" fill sizes="(max-width: 1000px) 100vw, 640px" style={{ objectFit: "cover", objectPosition: "50% 35%" }} />
          <div className={styles.toast}>
            <Image src="/icons/notification-bell.png" alt="" width={40} height={40} />
            <span>
              <strong>Nouvelle demande · 92 % compatible</strong>
              <small>Claire & Thomas · 14 juin 2027 · Yvelines · champêtre</small>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- FAQ (page Comment ça marche) ---------- */

export function Faq({ limit, id }: { limit?: number; id?: string }) {
  return (
    <section id={id} className={styles.block} aria-labelledby="faq-title">
      <div className={`container ${styles.faqWrap}`}>
        <h2 id="faq-title" className={styles.mid}>
          Questions fréquentes
        </h2>
        <div className={styles.faq}>
          {faq.slice(0, limit).map((f) => (
            <details key={f.q} className={styles.qa}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
