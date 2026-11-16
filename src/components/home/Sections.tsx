import Image from "next/image";
import Link from "next/link";
import { faq, reviewPool, testimonials } from "@/lib/content";
import { Carousel, Slide } from "../Carousel";
import { Reveal } from "../Reveal";
import { SimpleForm } from "../SimpleForm";
import styles from "./Sections.module.css";

// Après le catalogue : de grands blocs aérés, un message chacun, jamais deux fois la même idée.
// Best Match → trois promesses → la preuve → l'application → les prestataires.

/* ---------- Best Match ---------- */

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
            Faire mon Best Match
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

/* ---------- Trois promesses ---------- */

const promises = [
  { icon: "/icons/chat-bubbles.png", title: "Des devis comparables", text: "Une seule demande, des réponses sous 48 h, présentées côte à côte." },
  { icon: "/icons/shield-lock.png", title: "Un acompte protégé", text: "Versé au prestataire aux dates du contrat, pas avant. Payable en 3 ou 4 fois." },
  { icon: "/icons/verified-seal.png", title: "Des pros vérifiés", text: "SIRET, assurance et références contrôlés avant toute mise en ligne." },
];

export function Promises() {
  return (
    <section className={styles.block} aria-labelledby="promesses">
      <div className="container">
        <Reveal className={styles.centerHead}>
          <h2 id="promesses" className={styles.mid}>
            Votre mariage, sans le casse-tête
          </h2>
          <p className={styles.say}>Céleste trie, compare et sécurise. Vous n&apos;avez plus qu&apos;à choisir. Et c&apos;est gratuit pour les mariés.</p>
        </Reveal>
        <ul className={styles.promises}>
          {promises.map((p) => (
            <Reveal as="li" key={p.title} className={styles.promise}>
              <Image src={p.icon} alt="" width={120} height={120} />
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- La preuve : note + avis ---------- */

export function Proof() {
  const photo = testimonials.map((t) => ({ author: t.couple, text: t.text, meta: t.place, photo: t.photo as string | undefined }));
  const text = reviewPool.slice(3, 7).map((r) => ({ author: r.author, text: r.text, meta: `Mariés en ${r.date}`, photo: undefined as string | undefined }));
  const all = [photo[0], text[0], photo[1], text[1], photo[2], text[2], text[3]];

  return (
    <section className={styles.proof} aria-labelledby="preuve">
      <div className="container">
        <Reveal className={styles.centerHead}>
          <h2 id="preuve" className={styles.mid}>
            Ils ont dit oui avec Céleste
          </h2>
        </Reveal>
        <Reveal className={styles.hugeWrap}>
          <span className={styles.huge}>4,9/5</span>
          <span className={styles.hugeLabel}>
            <span className={styles.stars} aria-hidden="true">
              ★★★★★
            </span>{" "}
            sur 1 200 avis de couples mariés
          </span>
        </Reveal>
      </div>
      <Carousel label="Avis des couples">
        {all.map((r) => (
          <Slide key={r.author + r.meta} wide>
            <figure className={styles.review}>
              {r.photo && (
                <div className={styles.reviewPhoto}>
                  <Image src={r.photo} alt={`${r.author} le jour de leur mariage`} fill sizes="300px" style={{ objectFit: "cover", objectPosition: "50% 35%" }} />
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

/* ---------- Application bientôt disponible ---------- */

export function AppSoon() {
  return (
    <section className={styles.block} aria-labelledby="app">
      <div className={`container ${styles.split} ${styles.flip}`}>
        <Reveal className={styles.copy}>
          <span className={styles.kicker}>Bientôt sur iOS et Android</span>
          <h2 id="app" className={styles.big}>
            Votre mariage dans votre poche
          </h2>
          <p className={styles.say}>Coups de cœur, devis et messages, partout avec vous. Soyez prévenus le jour de la sortie.</p>
          <div className={styles.notify}>
            <SimpleForm submit="Me prévenir" doneTitle="C'est noté !" doneText="On vous écrit le jour de la sortie de l'application.">
              <label className="field">
                <span className="visually-hidden">Votre e-mail</span>
                <input type="email" name="email" autoComplete="email" placeholder="Votre e-mail" required />
              </label>
            </SimpleForm>
          </div>
        </Reveal>
        <Reveal className={styles.phones}>
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
          <div className={`${styles.phone} ${styles.phoneBack}`}>
            <div className={styles.screen}>
              <div className={styles.appList}>
                {["/photos/chateau.jpg", "/photos/florist.jpg", "/photos/dj.jpg"].map((p) => (
                  <div key={p} className={styles.appRow}>
                    <span className={styles.appThumb}>
                      <Image src={p} alt="" fill sizes="64px" style={{ objectFit: "cover" }} />
                    </span>
                    <span className={styles.appLines}>
                      <i />
                      <i />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Céleste pour les prestataires ---------- */

export function ProBand() {
  return (
    <section className={`${styles.block} ${styles.last}`} aria-labelledby="pros">
      <div className={`container ${styles.split}`}>
        <Reveal className={styles.copy}>
          <span className={styles.kicker}>Vous êtes prestataire ?</span>
          <h2 id="pros" className={styles.big}>
            Remplissez votre agenda, sans commission
          </h2>
          <p className={styles.say}>Des demandes de couples qui correspondent à votre style et à vos tarifs. Devis, contrats et acomptes au même endroit.</p>
          <Link href="/devenir-prestataire" className="btn">
            Rejoindre Céleste
          </Link>
        </Reveal>
        <Reveal className={styles.proPhoto}>
          <Image src="/photos/photog.jpg" alt="Une photographe au travail pendant un mariage" fill sizes="(max-width: 900px) 100vw, 640px" style={{ objectFit: "cover", objectPosition: "50% 35%" }} />
          <div className={styles.toast}>
            <Image src="/icons/notification-bell.png" alt="" width={40} height={40} />
            <span>
              <strong>Nouvelle demande</strong>
              <small>Claire & Thomas · 14 juin 2027 · 120 invités</small>
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
