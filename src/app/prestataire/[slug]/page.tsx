import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, ContactCard } from "@/components/ContactCard";
import { FicheActions } from "@/components/FicheActions";
import { SectionNav } from "@/components/SectionNav";
import { VendorCard } from "@/components/VendorCard";
import { getCategory, getVendor, priceLabel, vendors, vendorsIn } from "@/lib/content";
import { availabilityFor, criteriaFor, faqFor, personFor, specsFor } from "@/lib/vendorDetail";
import styles from "./page.module.css";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return vendors.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const v = getVendor((await params).slug);
  if (!v) return {};
  const cat = getCategory(v.category)!;
  return { title: `${v.name}, ${cat.singular} à ${v.city}`, description: v.description, openGraph: { images: [v.photo] } };
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-t`}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={`${id}-t`} className={styles.title}>
        {title}
      </h2>
      {children}
    </section>
  );
}

// Fiche prestataire : structure et ambiance du projet Céleste d'origine (en-tête net, Partager / Favori,
// mosaïque, onglets collés, carte sobre), contenu du cahier des charges (§10.1, §10.2, §12, §14, §17, §24),
// et la personne derrière la prestation au centre. Les échanges passent par Céleste (§22).
export default async function VendorPage({ params }: Params) {
  const v = getVendor((await params).slug);
  if (!v) notFound();
  const cat = getCategory(v.category)!;
  const person = personFor(v);
  const first = person.firstName;
  const specs = specsFor(v);
  const calendar = availabilityFor(v);
  const criteria = criteriaFor(v);
  const faq = faqFor(v, first);
  const similar = vendorsIn(v.category).filter((x) => x.slug !== v.slug).slice(0, 3);
  const unit = priceLabel(v).includes("/") ? ` ${priceLabel(v).split(" ").slice(-2).join(" ")}` : "";

  const steps = [
    ["Vous écrivez à " + first, "Votre date, votre lieu, vos envies. Pas besoin de compte pour commencer."],
    [first + " vous envoie une offre", "Formule, options et prix détaillés. Vous pouvez demander une adaptation."],
    ["Vous signez en ligne", "Contrat électronique et 30 % d'acompte : votre date est réservée."],
    ["Le jour J", "Le solde est réglé en une à trois fois, selon l'échéancier choisi."],
  ];

  return (
    <div className={styles.page}>
      <div className="container">
        {/* En-tête */}
        <nav aria-label="Fil d'Ariane" className={styles.crumbs}>
          <Link href="/decouvrir">Découvrir</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/prestataires/${cat.slug}`}>{cat.plural}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{v.name}</span>
        </nav>
        <div className={styles.headRow}>
          <div>
            <h1 className={styles.name}>{v.name}</h1>
            <p className={styles.subtitle}>
              {cat.plural} · {v.area} · avec {first} {person.lastName}
            </p>
          </div>
          <FicheActions slug={v.slug} name={v.name} />
        </div>
        <p className={styles.meta}>
          <strong>★ {v.rating}</strong>
          <span className={styles.sep}>|</span>
          <a href="#avis">{v.reviewsCount} avis</a>
          <span className={styles.sep}>·</span>
          <span>{v.area}</span>
          {v.verified && (
            <>
              <span className={styles.sep}>·</span>
              <span>Identité vérifiée</span>
            </>
          )}
        </p>

        {/* Mosaïque : une grande photo, deux petites */}
        <div className={styles.mosaic}>
          {v.gallery.slice(0, 3).map((src, i) => (
            <div key={src + i} className={styles.tile}>
              <Image
                src={src}
                alt={i === 0 ? `${v.name}, ${cat.singular}` : ""}
                fill
                priority={i === 0}
                sizes={i === 0 ? "(max-width: 900px) 100vw, 800px" : "30vw"}
                style={{ objectFit: "cover", objectPosition: i === 0 ? (v.pos ?? "50% 40%") : "50% 40%" }}
              />
              {i === 2 && <span className={styles.seeAll}>Voir les photos</span>}
            </div>
          ))}
        </div>

        <SectionNav
          items={[
            { id: "prestations", label: "Prestations" },
            { id: "details", label: "Détails" },
            { id: "disponibilites", label: "Disponibilités" },
            { id: "rencontre", label: `${first}` },
            { id: "deroule", label: "Déroulé" },
            { id: "avis", label: "Avis" },
            { id: "questions", label: "Questions" },
          ]}
        />

        <div className={styles.layout}>
          <div>
            <Section id="prestations" eyebrow="Formules" title={`Les prestations de ${first}`}>
              <div className={styles.packages}>
                {v.packages.map((p, i) => (
                  <div key={p.name} className={`${styles.pack} ${i === 1 ? styles.packStar : ""}`}>
                    <div className={styles.packHead}>
                      <strong>{p.name}</strong>
                      {i === 1 && <span className={styles.packTag}>La plus choisie</span>}
                    </div>
                    <span className={styles.packPrice}>
                      {p.price.toLocaleString("fr-FR")} €{unit}
                    </span>
                    <ul>
                      {p.includes.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className={styles.note}>
                Rien ne vous correspond tout à fait ? Décrivez votre projet à {first} : une offre sur mesure est possible.{" "}
                <Link href="/matchs" className={styles.link}>
                  Ou vérifiez votre compatibilité avec le Best Match
                </Link>
              </p>
            </Section>

            {specs.length > 0 && (
              <Section id="details" eyebrow={cat.plural} title="Le détail de la prestation">
                <dl className={styles.specs}>
                  {specs.map(([k, val]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{val}</dd>
                    </div>
                  ))}
                </dl>
              </Section>
            )}

            <Section id="disponibilites" eyebrow="Calendrier" title="Disponibilités">
              <ul className={styles.calendar}>
                {calendar.map((c) => (
                  <li key={c.month} data-status={c.status}>
                    <span className={styles.month}>{c.month}</span>
                    <span className={styles.status}>
                      <i aria-hidden="true" />
                      {c.status}
                    </span>
                  </li>
                ))}
              </ul>
              <div id="rendez-vous" className={styles.visit}>
                <p>
                  <strong>Envie de vous rencontrer avant de décider ?</strong> Proposez un créneau : {first} le confirme ou vous propose une autre date.
                </p>
                <a href="#contact" className="btn btn-sm btn-outline">
                  Proposer un rendez-vous
                </a>
              </div>
            </Section>

            <Section id="rencontre" eyebrow="La personne derrière la prestation" title={`Rencontrez ${first}`}>
              <div className={styles.host}>
                <div className={styles.hostCard}>
                  <Avatar person={person} size={96} />
                  <strong>
                    {first} {person.lastName}
                  </strong>
                  <span>{person.role}</span>
                  <dl>
                    <div>
                      <dt>Avis</dt>
                      <dd>★ {v.rating}</dd>
                    </div>
                    <div>
                      <dt>Depuis</dt>
                      <dd>{person.since}</dd>
                    </div>
                    <div>
                      <dt>Équipe</dt>
                      <dd>{person.team}</dd>
                    </div>
                  </dl>
                </div>
                <div className={styles.hostText}>
                  <blockquote>« {person.bio} »</blockquote>
                  <p>{v.description}</p>
                  <ul>
                    <li>Langues : {person.languages}</li>
                    <li>Répond en général en {v.responseTime}</li>
                    {v.verified && <li>Identité et entreprise vérifiées par Céleste</li>}
                  </ul>
                  <a href="#contact" className={styles.link}>
                    Écrire à {first}
                  </a>
                </div>
              </div>
            </Section>

            <Section id="deroule" eyebrow="En quatre étapes" title="Comment ça se passe">
              <ol className={styles.steps}>
                {steps.map(([t, d], i) => (
                  <li key={t}>
                    <span className={styles.stepN}>{i + 1}</span>
                    <strong>{t}</strong>
                    <span>{d}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section id="avis" eyebrow="Ce qu'en disent les couples" title={`★ ${v.rating} · ${v.reviewsCount} avis`}>
              <ul className={styles.criteria}>
                {criteria.map(([label, score]) => (
                  <li key={label}>
                    <span>{label}</span>
                    <span className={styles.bar}>
                      <i style={{ width: `${(score / 5) * 100}%` }} />
                    </span>
                    <strong>{score.toLocaleString("fr-FR")}</strong>
                  </li>
                ))}
              </ul>
              <div className={styles.reviews}>
                {v.reviews.map((r, i) => (
                  <figure key={i} className={styles.review}>
                    <figcaption>
                      <span className={styles.revAvatar}>{r.author.charAt(0)}</span>
                      <span>
                        <strong>{r.author}</strong>
                        <small>Mariés en {r.date}</small>
                      </span>
                    </figcaption>
                    <blockquote>{r.text}</blockquote>
                  </figure>
                ))}
              </div>
              <p className={styles.note}>Seuls les couples qui ont réservé sur Céleste peuvent laisser un avis.</p>
            </Section>

            <Section id="questions" eyebrow="Réservation" title="Questions fréquentes">
              <div className={styles.faq}>
                {faq.map(([q, a]) => (
                  <details key={q} className={styles.qa}>
                    <summary>{q}</summary>
                    <p>{a}</p>
                  </details>
                ))}
                <details className={styles.qa}>
                  <summary>Que se passe-t-il en cas d&apos;annulation ?</summary>
                  <p>Plus de 30 jours avant l&apos;événement : remboursement intégral. Entre 30 et 7 jours : 50 %. Les conditions sont affichées avant de réserver.</p>
                </details>
                <details className={styles.qa}>
                  <summary>Où intervient {first} ?</summary>
                  <p>Basé à {v.area}, se déplace dans toute l&apos;Île-de-France. Frais de déplacement éventuels précisés dans l&apos;offre.</p>
                </details>
              </div>
            </Section>
          </div>

          <aside className={styles.aside}>
            <ContactCard vendor={v} person={person} />
          </aside>
        </div>

        {similar.length > 0 && (
          <section className={styles.similar} aria-labelledby="similaires">
            <p className={styles.eyebrow}>Dans le même métier</p>
            <h2 id="similaires" className={styles.title}>
              D&apos;autres {cat.plural.toLowerCase()} à découvrir
            </h2>
            <div className={styles.similarGrid}>
              {similar.map((s) => (
                <VendorCard key={s.slug} vendor={s} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
