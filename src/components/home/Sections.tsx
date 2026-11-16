import Image from "next/image";
import Link from "next/link";
import { articles, categories, faq, stats, steps, testimonials } from "@/lib/content";
import { Reveal } from "../Reveal";
import styles from "./Sections.module.css";

function Head({ eyebrow, title, lead, center }: { eyebrow?: string; title: string; lead?: string; center?: boolean }) {
  return (
    <Reveal className={`${styles.head} ${center ? styles.center : ""}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="display h2">{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </Reveal>
  );
}

/* ---------- Comment ça marche ---------- */

export function HowItWorks() {
  return (
    <section className={`section ${styles.white}`} aria-label="Comment ça marche">
      <div className="container">
        <Head center eyebrow="Comment ça marche" title="Du coup de cœur à la réservation" lead="Trois étapes, zéro tableur, et un seul endroit pour tout suivre." />
        <ol className={styles.steps}>
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} className={styles.step}>
              <Image src={s.icon} alt="" width={96} height={96} className={styles.stepIcon} />
              <span className={styles.stepN}>Étape {i + 1}</span>
              <h3 className="h3">{s.title}</h3>
              <p className="muted">{s.text}</p>
            </Reveal>
          ))}
        </ol>
        <div className={styles.centerCta}>
          <Link href="/comment-ca-marche" className="link-underline">
            En savoir plus sur Céleste →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Tous les métiers ---------- */

export function AllCategories() {
  return (
    <section className="section" aria-label="Tous les métiers">
      <div className="container">
        <Head eyebrow="Tout au même endroit" title="Chaque détail de votre jour J" lead="Lieu, traiteur, photo, fleurs, musique : comparez les meilleurs dans chaque métier." />
        <div className={styles.cats}>
          {categories.map((c, i) => (
            <Reveal key={c.slug} className={`${styles.catCard} ${i === 0 ? styles.catWide : ""}`}>
              <Link href={`/prestataires/${c.slug}`} className={styles.catLink}>
                <Image src={c.cover} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" style={{ objectFit: "cover" }} />
                <span className={styles.catShade} />
                <span className={styles.catText}>
                  <Image src={c.icon} alt="" width={40} height={40} />
                  <span>
                    <strong>{c.plural}</strong>
                    <small>Comparer les devis</small>
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Quiz des matchs ---------- */

const styleChoices = [
  { slug: "champetre", label: "Champêtre", photo: "/photos/field.jpg" },
  { slug: "chateau", label: "Château", photo: "/photos/chateau.jpg" },
  { slug: "boheme", label: "Bohème", photo: "/photos/deco.jpg" },
  { slug: "urbain", label: "Urbain", photo: "/photos/rain.jpg" },
];

export function MatchTeaser() {
  return (
    <section className="section-tight" aria-label="Trouvez vos matchs">
      <div className="container">
        <Reveal className={`card-surface ${styles.match}`}>
          <div className={styles.matchText}>
            <Image src="/icons/match-puzzle.png" alt="" width={72} height={72} />
            <h2 className="display h2">Pas encore d&apos;idée ? Trouvez vos matchs en 2 minutes</h2>
            <p className="lead">Quatre questions sur votre style, votre budget et votre date. Nous vous présentons les prestataires qui vous ressemblent.</p>
            <Link href="/matchs" className="btn">
              Commencer le quiz
            </Link>
          </div>
          <div className={styles.matchChoices}>
            <span className={styles.matchQ}>Votre mariage ressemble plutôt à…</span>
            <div className={styles.matchGrid}>
              {styleChoices.map((s) => (
                <Link key={s.slug} href={`/matchs?style=${s.slug}`} className={styles.matchChoice}>
                  <Image src={s.photo} alt="" fill sizes="200px" style={{ objectFit: "cover" }} />
                  <span>{s.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Confiance : chiffres et témoignages ---------- */

export function Trust() {
  return (
    <section className="section" aria-label="Ils nous ont fait confiance">
      <div className="container">
        <Head center eyebrow="Ils ont dit oui avec Céleste" title="Des couples sereins, des prestataires vérifiés" />
        <Reveal className={styles.stats}>
          {stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </Reveal>
        <div className={styles.quotes}>
          {testimonials.map((t) => (
            <Reveal as="figure" key={t.couple} className={`card-surface ${styles.quote}`}>
              <div className={styles.quotePhoto}>
                <Image src={t.photo} alt={`${t.couple} le jour de leur mariage`} fill sizes="(max-width: 900px) 100vw, 400px" style={{ objectFit: "cover", objectPosition: "50% 35%" }} />
              </div>
              <blockquote>« {t.text} »</blockquote>
              <figcaption>
                <strong>{t.couple}</strong>
                <span>{t.place}</span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Inspirations éditoriales ---------- */

export function Articles() {
  return (
    <section className={`section ${styles.white}`} aria-label="Conseils et inspirations">
      <div className="container">
        <div className={styles.rowHead}>
          <Head eyebrow="Le carnet Céleste" title="Conseils pour préparer le grand jour" />
          <Link href="/inspirations" className="link-underline">
            Toutes les inspirations →
          </Link>
        </div>
        <div className={styles.articles}>
          {articles.slice(0, 3).map((a) => (
            <Reveal as="article" key={a.slug} className={styles.article}>
              <Link href={`/inspirations#${a.slug}`}>
                <div className={styles.articlePhoto}>
                  <Image src={a.photo} alt="" fill sizes="(max-width: 900px) 100vw, 400px" style={{ objectFit: "cover" }} />
                </div>
                <span className="eyebrow">
                  {a.theme} · {a.read}
                </span>
                <h3 className="h3">{a.title}</h3>
                <p className="muted">{a.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Espace prestataires ---------- */

export function ProBand() {
  return (
    <section className="section" aria-label="Vous êtes prestataire ?">
      <div className="container">
        <Reveal className={styles.pro}>
          <div className={styles.proPhoto}>
            <Image src="/photos/photog.jpg" alt="Une photographe au travail pendant un mariage" fill sizes="(max-width: 900px) 100vw, 600px" style={{ objectFit: "cover", objectPosition: "50% 35%" }} />
          </div>
          <div className={styles.proText}>
            <span className="eyebrow">Vous êtes prestataire ?</span>
            <h2 className="display h2">Recevez des demandes de couples qui vous correspondent</h2>
            <ul className={styles.proList}>
              <li>Des demandes qualifiées : date, budget et style connus d&apos;avance</li>
              <li>Devis, contrats et acomptes sécurisés au même endroit</li>
              <li>Fiche gratuite, sans engagement</li>
            </ul>
            <div className={styles.proCtas}>
              <Link href="/devenir-prestataire" className="btn">
                Créer ma fiche gratuitement
              </Link>
              <Link href="/devenir-prestataire#tarifs" className="link-underline">
                Voir les tarifs
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

export function Faq({ limit, id }: { limit?: number; id?: string }) {
  return (
    <section id={id} className={`section ${styles.white}`} aria-label="Questions fréquentes">
      <div className={`container ${styles.faqWrap}`}>
        <Head eyebrow="Questions fréquentes" title="Tout ce que vous vous demandez" />
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
