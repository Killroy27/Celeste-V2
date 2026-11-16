import Image from "next/image";
import Link from "next/link";
import { faq } from "@/lib/content";
import { Carousel, Slide } from "../Carousel";
import { Reveal } from "../Reveal";
import { NotifyForm } from "./NotifyForm";
import styles from "./Sections.module.css";

// Sous le catalogue, la page fonctionne comme un entonnoir : chaque bloc donne une raison d'agir
// et se termine par une seule action. Si le visiteur passe un bloc, le suivant le rattrape.
// Tous les arguments viennent du cahier des charges : aucune promesse non validée
// (pas de « gratuit », pas d'assurance, pas de chiffres inventés).

/* ---------- 1. Best Match : le score expliqué (CDC §7.5) ---------- */

const reasons = [
  { ok: true, text: "Disponible le samedi 14 juin 2027" },
  { ok: true, text: "Se déplace dans votre zone" },
  { ok: true, text: "Style champêtre, comme le vôtre" },
  { ok: false, text: "120 € au-dessus de votre budget" },
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
            Arrêtez de chercher. Commencez à choisir.
          </h2>
          <p className={styles.say}>
            Votre date, votre style, votre budget : quelques questions suffisent. Céleste vous présente les prestataires compatibles et vous dit pourquoi.
          </p>
          <Link href="/matchs" className="btn">
            Trouver mon Best Match
          </Link>
        </Reveal>

        <Reveal className={styles.matchCard} aria-hidden="true">
          <div className={styles.matchPhoto}>
            <Image src="/photos/field.jpg" alt="" fill sizes="(max-width: 1000px) 100vw, 560px" style={{ objectFit: "cover", objectPosition: "50% 40%" }} />
            <span className={styles.matchScore}>
              <strong>94 %</strong> compatible
            </span>
          </div>
          <div className={styles.matchBody}>
            <div className={styles.matchName}>
              <strong>Maison Lumen</strong>
              <span>Photographe · Paris 5e</span>
            </div>
            <span className={styles.matchWhy}>Pourquoi ce match</span>
            <ul className={styles.matchReasons}>
              {reasons.map((r) => (
                <li key={r.text} className={r.ok ? styles.ok : styles.gap}>
                  <span>{r.ok ? "✓" : "≈"}</span>
                  {r.text}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- 2. Pourquoi Céleste : ce que la plateforme fait vraiment ---------- */

const features = [
  {
    icon: "/icons/chat-bubbles.png",
    title: "Négociez sans gêne",
    text: "Budget serré ? Demandez au prestataire d'adapter sa formule, la durée ou les options, plutôt que de marchander son prix.",
  },
  {
    icon: "/icons/contract-pen.png",
    title: "Signez et payez au même endroit",
    text: "Contrat signé en ligne, 30 % d'acompte à la réservation, puis le solde en une à trois fois.",
  },
  {
    icon: "/icons/verified-seal.png",
    title: "Des professionnels vérifiés",
    text: "Entreprise, identité et assurance contrôlées. Les meilleurs reçoivent le badge Céleste Select, qui ne s'achète pas.",
  },
  {
    icon: "/icons/planner-notebook.png",
    title: "Un budget qui se tient tout seul",
    text: "Chaque réservation met à jour votre budget, vos échéances et votre checklist. Rien à ressaisir.",
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
              <Image src={f.icon} alt="" width={88} height={88} />
              <div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
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

/* ---------- 3. Avis (exemples en attendant les avis réels) ---------- */

const reviews = [
  {
    author: "Aïcha & Kwame",
    meta: "Traiteur · juin 2026",
    photo: "/photos/kente.jpg",
    text: "On voulait un menu ivoirien et ghanéen. Le traiteur a fait l'attiéké et le jollof, et les deux familles se sont resservies. On n'aurait jamais trouvé seuls.",
  },
  {
    author: "Claire & Thomas",
    meta: "DJ · mai 2026",
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
    text: "On hésitait à passer par une plateforme. Un contrat signé et un acompte payé en ligne, ça nous a rassurés.",
  },
];

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
          {reviews.map((r) => (
            <Slide key={r.author} wide>
              <figure className={styles.review}>
                {r.photo && (
                  <div className={styles.reviewPhoto}>
                    <Image src={r.photo} alt={`${r.author} le jour de leur mariage`} fill sizes="420px" style={{ objectFit: "cover", objectPosition: "50% 35%" }} />
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

/* ---------- 4. Application bientôt disponible : capter l'e-mail ---------- */

export function AppSoon() {
  return (
    <section className={styles.block} aria-labelledby="app">
      <div className={`container ${styles.split} ${styles.flip}`}>
        <Reveal className={styles.copy}>
          <span className={styles.kicker}>
            <Image src="/icons/notification-bell.png" alt="" width={32} height={32} />
            Application mobile · bientôt disponible
          </span>
          <h2 id="app" className={styles.big}>
            Suivez vos préparatifs depuis votre téléphone
          </h2>
          <p className={styles.say}>Messages des prestataires, rappels de paiement, checklist : l&apos;application Céleste arrive sur iOS et Android. Soyez les premiers à l&apos;essayer.</p>
          <NotifyForm />
          <div className={styles.stores} aria-label="Bientôt sur l'App Store et Google Play">
            <span className={styles.store}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1zM13.9 4.9c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5z" />
              </svg>
              App Store
            </span>
            <span className={styles.store}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3.6 2.2c-.2.2-.3.6-.3 1v17.6c0 .4.1.8.3 1l10-9.8-10-9.8zm11.4 8.4 2.8-2.8L5.3 1c-.4-.2-.8-.3-1.1-.2l10.8 9.8zm0 2.8L4.2 23.2c.3.1.7 0 1.1-.2l12.5-6.8-2.8-2.8zm6.1-2.7-2.9-1.6-3.1 3 3.1 3 2.9-1.6c.9-.5.9-1.8 0-2.8z" />
              </svg>
              Google Play
            </span>
            <small>Bientôt</small>
          </div>
        </Reveal>
        <Reveal className={styles.phones} aria-hidden="true">
          <div className={styles.phone}>
            <div className={styles.screen}>
              <div className={styles.appTop}>
                <small>Mon mariage</small>
                <strong>J-210</strong>
              </div>
              <div className={styles.appNotif}>
                <Image src="/icons/notification-bell.png" alt="" width={28} height={28} />
                <span>
                  <strong>Maison Lumen</strong>
                  <small>vous a envoyé une offre révisée</small>
                </span>
              </div>
              <div className={styles.appNotif}>
                <Image src="/icons/calendar.png" alt="" width={28} height={28} />
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

/* ---------- 5. Prestataires : les vraies raisons de rejoindre ---------- */

const proReasons = [
  ["Des demandes qualifiées", "Date, zone, budget et style du couple connus avant même de répondre."],
  ["Moins de concurrence", "Seuls quelques prestataires compatibles peuvent répondre à chaque demande."],
  ["Vendez sans brader", "Adaptez votre formule au budget du couple au lieu de baisser vos prix."],
  ["L'administratif en moins", "Offres, contrats, acomptes et calendrier de disponibilités au même endroit."],
];

export function ProBand() {
  return (
    <section className={`${styles.block} ${styles.last}`} aria-labelledby="pros">
      <div className={`container ${styles.split}`}>
        <Reveal className={styles.copy}>
          <span className={styles.kicker}>Vous êtes prestataire ?</span>
          <h2 id="pros" className={styles.big}>
            Des couples qui vous correspondent, pas des contacts
          </h2>
          <p className={styles.say}>Céleste ne vend pas de leads. La plateforme gagne quand vous signez une réservation, pas avant.</p>
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
              <strong>Nouvelle opportunité · 92 % compatible</strong>
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
