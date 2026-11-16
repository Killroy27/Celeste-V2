import Image from "next/image";
import Link from "next/link";
import { faq, getVendor, reviewPool, testimonials } from "@/lib/content";
import { Carousel, Slide } from "../Carousel";
import { ArrowIcon } from "../icons";
import { Reveal } from "../Reveal";
import { SimpleForm } from "../SimpleForm";
import styles from "./Sections.module.css";

// Après le catalogue, trois temps et pas un de plus :
// 1. ce que Céleste fait pour vous, 2. la preuve, 3. deux portes de sortie (pros, app).
// Chaque idée n'apparaît qu'une fois sur la page.

/* ---------- 1. Pourquoi Céleste ---------- */

const quotes = [
  { slug: "studio-aube", price: "650 €", best: false },
  { slug: "maison-lumen", price: "590 €", best: true },
  { slug: "nuit-blanche", price: "720 €", best: false },
];

export function WhyCeleste() {
  return (
    <section className={styles.block} aria-labelledby="pourquoi">
      <div className="container">
        <Reveal className={styles.head}>
          <h2 id="pourquoi" className={styles.title}>
            Votre mariage, sans le casse-tête
          </h2>
          <p className={styles.say}>Céleste trie, compare et sécurise. Vous n&apos;avez plus qu&apos;à choisir.</p>
        </Reveal>

        <div className={styles.bento}>
          {/* Best Match : la carte maîtresse */}
          <Reveal className={`${styles.card} ${styles.match}`}>
            <div className={styles.cardText}>
              <span className={styles.tag}>Best Match</span>
              <h3>Dites-nous qui vous êtes, on vous dit qui choisir</h3>
              <p>Quatre questions sur votre style et votre budget. En deux minutes, les prestataires faits pour vous.</p>
              <Link href="/matchs" className="btn">
                Faire mon Best Match
              </Link>
            </div>
            <div className={styles.matchVisual} aria-hidden="true">
              <div className={styles.pick}>
                <Image src="/photos/field.jpg" alt="" fill sizes="160px" style={{ objectFit: "cover" }} />
                <span>Champêtre ✓</span>
              </div>
              <div className={styles.result}>
                <div className={styles.resultPhoto}>
                  <Image src="/photos/florist.jpg" alt="" fill sizes="220px" style={{ objectFit: "cover", objectPosition: "50% 30%" }} />
                </div>
                <strong>Atelier Pivoine</strong>
                <small>Fleuriste · Paris 17e</small>
                <span className={styles.score}>96 % compatible</span>
              </div>
            </div>
          </Reveal>

          {/* Devis comparables */}
          <Reveal className={styles.card}>
            <span className={styles.tag}>Devis</span>
            <h3>Tous vos devis, côte à côte</h3>
            <p>Une seule demande, des réponses sous 48 h, faciles à comparer.</p>
            <ul className={styles.quotes} aria-hidden="true">
              {quotes.map((q) => {
                const v = getVendor(q.slug)!;
                return (
                  <li key={q.slug} className={q.best ? styles.quoteBest : ""}>
                    <span className={styles.quoteThumb}>
                      <Image src={v.photo} alt="" fill sizes="40px" style={{ objectFit: "cover" }} />
                    </span>
                    <span className={styles.quoteName}>{v.name}</span>
                    <strong>{q.price}</strong>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          {/* Acompte protégé */}
          <Reveal className={styles.card}>
            <span className={styles.tag}>Paiement</span>
            <h3>Votre acompte reste protégé</h3>
            <p>Il n&apos;est versé qu&apos;aux dates prévues au contrat. Et payable en 3 ou 4 fois.</p>
            <div className={styles.shield} aria-hidden="true">
              <Image src="/icons/shield-lock.png" alt="" width={96} height={96} />
            </div>
          </Reveal>

          {/* Prestataires vérifiés */}
          <Reveal className={`${styles.card} ${styles.wide}`}>
            <div className={styles.cardText}>
              <span className={styles.tag}>Confiance</span>
              <h3>Uniquement des prestataires vérifiés</h3>
              <p>SIRET, assurance et références contrôlés avant toute mise en ligne. Et c&apos;est gratuit pour les mariés.</p>
            </div>
            <div className={styles.faces} aria-hidden="true">
              {["/photos/photog.jpg", "/photos/chef.jpg", "/photos/florist.jpg", "/photos/dj.jpg", "/photos/bride.jpg"].map((p) => (
                <span key={p} className={styles.face}>
                  <Image src={p} alt="" fill sizes="72px" style={{ objectFit: "cover" }} />
                </span>
              ))}
              <Image src="/icons/verified-seal.png" alt="" width={72} height={72} className={styles.seal} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- 2. La preuve : les avis ---------- */

export function Reviews() {
  const photoReviews = testimonials.map((t) => ({ author: t.couple, text: t.text, meta: t.place, photo: t.photo }));
  const textReviews = reviewPool.slice(0, 5).map((r) => ({ author: r.author, text: r.text, meta: `Mariés en ${r.date}`, photo: undefined as string | undefined }));
  const all = [photoReviews[0], textReviews[0], photoReviews[1], textReviews[1], photoReviews[2], textReviews[2], textReviews[3]];

  return (
    <section className={styles.proof} aria-labelledby="avis">
      <div className={`container ${styles.proofHead}`}>
        <h2 id="avis" className={styles.title}>
          Ils ont dit oui avec Céleste
        </h2>
        <div className={styles.rating}>
          <strong>4,9</strong>
          <span>
            <span className={styles.stars} aria-hidden="true">
              ★★★★★
            </span>
            1 200 avis de couples mariés
          </span>
        </div>
      </div>
      <Carousel title="" label="Avis des couples">
        {all.map((r) => (
          <Slide key={r.author + r.meta}>
            <figure className={styles.review}>
              {r.photo && (
                <div className={styles.reviewPhoto}>
                  <Image src={r.photo} alt={`${r.author} le jour de leur mariage`} fill sizes="320px" style={{ objectFit: "cover", objectPosition: "50% 35%" }} />
                </div>
              )}
              <div className={styles.reviewBody}>
                <span className={styles.stars} aria-label="5 étoiles sur 5">
                  ★★★★★
                </span>
                <blockquote>{r.text}</blockquote>
                <figcaption>
                  <strong>{r.author}</strong>
                  <small>{r.meta}</small>
                </figcaption>
              </div>
            </figure>
          </Slide>
        ))}
      </Carousel>
    </section>
  );
}

/* ---------- 3. Deux portes de sortie ---------- */

export function Duo() {
  return (
    <section className={styles.duo} aria-label="Prestataires et application">
      <div className={`container ${styles.duoGrid}`}>
        <Reveal className={`${styles.door} ${styles.doorPro}`}>
          <Image src="/photos/photog.jpg" alt="" fill sizes="(max-width: 900px) 100vw, 640px" style={{ objectFit: "cover", objectPosition: "50% 35%" }} />
          <div className={styles.doorShade} />
          <div className={styles.doorText}>
            <span className={styles.tagLight}>Prestataires</span>
            <h2>Remplissez votre agenda, sans commission</h2>
            <p>Des demandes de couples qui correspondent à votre style et à vos tarifs.</p>
            <Link href="/devenir-prestataire" className={styles.doorLink}>
              Rejoindre Céleste <ArrowIcon size={14} />
            </Link>
          </div>
        </Reveal>

        <Reveal className={`${styles.door} ${styles.doorApp}`}>
          <div className={styles.doorText}>
            <span className={styles.tag}>Bientôt sur iOS et Android</span>
            <h2>Céleste dans votre poche</h2>
            <p>Coups de cœur, devis et messages, partout avec vous. On vous prévient à la sortie.</p>
            <div className={styles.notify}>
              <SimpleForm submit="Me prévenir" doneTitle="C'est noté !" doneText="On vous écrit le jour de la sortie.">
                <label className="field">
                  <span className="visually-hidden">Votre e-mail</span>
                  <input type="email" name="email" autoComplete="email" placeholder="Votre e-mail" required />
                </label>
              </SimpleForm>
            </div>
          </div>
          <div className={styles.phone} aria-hidden="true">
            <div className={styles.screen}>
              <div className={styles.appPhoto}>
                <Image src="/photos/kente.jpg" alt="" fill sizes="200px" style={{ objectFit: "cover", objectPosition: "50% 30%" }} />
              </div>
              <div className={styles.appBody}>
                <strong>Atelier Kofi & Ama</strong>
                <small>★ 5,0 · Paris 18e</small>
                <span className={styles.appBtn}>Demander un devis</span>
              </div>
            </div>
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
        <h2 id="faq-title" className={styles.title}>
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
