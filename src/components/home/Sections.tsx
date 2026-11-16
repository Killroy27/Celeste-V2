import Image from "next/image";
import Link from "next/link";
import { categories, faq, stats, steps } from "@/lib/content";
import { Reveal } from "../Reveal";
import { SimpleForm } from "../SimpleForm";
import styles from "./Sections.module.css";

// Un bloc = un message. Titre très lisible, une phrase, une action. Beaucoup d'air autour.

/* ---------- Best Match : l'action principale ---------- */

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
            Vos prestataires idéaux en 2 minutes
          </h2>
          <p className={styles.say}>Répondez à quatre questions. Céleste choisit pour vous les prestataires qui vous ressemblent.</p>
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

/* ---------- Application bientôt disponible ---------- */

export function AppSoon() {
  return (
    <section className={styles.block} aria-labelledby="app">
      <div className={`container ${styles.split}`}>
        <Reveal className={styles.copy}>
          <span className={styles.kicker}>Bientôt sur iOS et Android</span>
          <h2 id="app" className={styles.big}>
            Votre mariage dans votre poche
          </h2>
          <p className={styles.say}>Coups de cœur, devis et messages, partout avec vous. Soyez prévenus dès la sortie de l&apos;application.</p>
          <div className={styles.notify}>
            <SimpleForm submit="Me prévenir" doneTitle="C'est noté !" doneText="Nous vous écrirons le jour de la sortie de l'application.">
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

/* ---------- Comment ça marche ---------- */

export function HowItWorks() {
  return (
    <section className={styles.block} aria-labelledby="comment">
      <div className="container">
        <Reveal className={styles.centerHead}>
          <h2 id="comment" className={styles.mid}>
            Du coup de cœur à la réservation
          </h2>
          <p className={styles.say}>Trois étapes, un seul endroit.</p>
        </Reveal>
        <ol className={styles.steps}>
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} className={styles.step}>
              <Image src={s.icon} alt="" width={112} height={112} />
              <span className={styles.stepN}>{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Chiffres ---------- */

export function Stats() {
  return (
    <section className={styles.block} aria-labelledby="chiffres">
      <div className="container">
        <Reveal className={styles.centerHead}>
          <h2 id="chiffres" className={styles.mid}>
            La maison des mariages réussis
          </h2>
          <p className={styles.say}>Les couples et les meilleurs prestataires d&apos;Île-de-France nous font déjà confiance.</p>
        </Reveal>
        <Reveal className={styles.hugeWrap}>
          <span className={styles.huge}>+ de 2 400</span>
          <span className={styles.hugeLabel}>prestataires vérifiés</span>
        </Reveal>
        <div className={styles.stats}>
          {stats.slice(1).map((s) => (
            <div key={s.label} className={styles.stat}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Céleste pour les prestataires ---------- */

export function ProBand() {
  return (
    <section className={styles.block} aria-labelledby="pros">
      <div className={`container ${styles.split}`}>
        <Reveal className={styles.copy}>
          <h2 id="pros" className={styles.big}>
            Céleste pour les prestataires
          </h2>
          <p className={styles.say}>Recevez des demandes de couples qui vous correspondent. Devis, contrats et acomptes au même endroit.</p>
          <Link href="/devenir-prestataire" className="btn">
            En savoir plus
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

/* ---------- Recherche par métier (liens simples, comme « Recherchez par ville » chez Fresha) ---------- */

const places = ["Paris", "Versailles", "Boulogne", "Saint-Denis", "Vincennes"];

export function BrowseLinks() {
  return (
    <section className={styles.links} aria-labelledby="parcourir">
      <div className="container">
        <h2 id="parcourir" className={styles.rowTitle}>
          Recherchez par métier
        </h2>
        <div className={styles.linkCols}>
          {categories.slice(0, 5).map((c) => (
            <div key={c.slug}>
              <h3>{c.plural}</h3>
              <ul>
                {places.map((p) => (
                  <li key={p}>
                    <Link href={`/recherche?quoi=${encodeURIComponent(c.singular)}&ou=${encodeURIComponent(p)}`}>
                      {c.plural} à {p}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
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
