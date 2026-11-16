import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, ContactCard } from "@/components/ContactCard";
import { SaveButton } from "@/components/SaveButton";
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

const statusClass: Record<string, string> = {
  Disponible: "free",
  "Capacité limitée": "limited",
  "À confirmer": "tbc",
  Complet: "full",
};

// Fiche prestataire selon le cahier des charges (§10.1 socle commun, §10.2 champs métier, §7.5 et §8 Best Match,
// §12 rendez-vous, §14 conditions, §17 calendrier, §24 avis). On met en avant la personne derrière la prestation,
// et toute prise de contact passe par Céleste (§22) : pas de téléphone ni de site affichés.
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
  const nextFree = calendar.find((c) => c.status === "Disponible")?.month;
  const similar = vendorsIn(v.category).filter((x) => x.slug !== v.slug).slice(0, 3);

  return (
    <div className={styles.page}>
      <div className="container">
        <nav aria-label="Fil d'Ariane" className={styles.crumbs}>
          <Link href="/">Accueil</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/prestataires/${cat.slug}`}>{cat.plural}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{v.name}</span>
        </nav>

        <div className={styles.gallery}>
          {v.gallery.map((src, i) => (
            <div key={src + i} className={styles.shot}>
              <Image
                src={src}
                alt={i === 0 ? `${v.name}, ${cat.singular}` : ""}
                fill
                priority={i === 0}
                sizes={i === 0 ? "(max-width: 900px) 100vw, 640px" : "(max-width: 900px) 50vw, 320px"}
                style={{ objectFit: "cover", objectPosition: i === 0 ? (v.pos ?? "50% 40%") : "50% 40%" }}
              />
            </div>
          ))}
          <span className={styles.allPhotos}>Toutes les photos</span>
        </div>

        <div className={styles.layout}>
          <div className={styles.main}>
            {/* En-tête : la prestation, puis la personne */}
            <header className={styles.head}>
              <div className={styles.titleRow}>
                <h1 className="display h2">{v.name}</h1>
                <SaveButton slug={v.slug} name={v.name} className={styles.save} />
              </div>
              <p className={styles.sub}>
                <strong>★ {v.rating}</strong>
                <a href="#avis">{v.reviewsCount} avis</a>
                <span>·</span>
                <span>
                  {cat.plural} · {v.area}
                </span>
                {v.verified && <span className={styles.badge}>Vérifié</span>}
              </p>
              <div className={styles.host}>
                <Avatar person={person} size={52} />
                <span>
                  Avec <strong>{first} {person.lastName}</strong>
                  <small>
                    {person.role} · depuis {person.since}
                  </small>
                </span>
              </div>
            </header>

            {/* L'essentiel en un coup d'œil */}
            <ul className={styles.facts}>
              <li>
                <Image src="/icons/price-tag.png" alt="" width={40} height={40} />
                <span>
                  <strong>À partir de {priceLabel(v)}</strong>
                  <small>Formules ou offre sur mesure</small>
                </span>
              </li>
              <li>
                <Image src="/icons/map-pin.png" alt="" width={40} height={40} />
                <span>
                  <strong>Basé à {v.area}</strong>
                  <small>Se déplace dans toute l&apos;Île-de-France</small>
                </span>
              </li>
              <li>
                <Image src="/icons/calendar.png" alt="" width={40} height={40} />
                <span>
                  <strong>{nextFree ? `Disponible en ${nextFree.toLowerCase()}` : "Calendrier à jour"}</strong>
                  <small>
                    <a href="#disponibilites">Voir le calendrier</a>
                  </small>
                </span>
              </li>
            </ul>

            {/* Best Match sur la fiche (CDC §8) */}
            <div className={styles.match}>
              <Image src="/icons/match-puzzle.png" alt="" width={56} height={56} />
              <div>
                <strong>Êtes-vous faits pour travailler avec {first} ?</strong>
                <span>Votre score Best Match en deux minutes : date, zone, style et budget.</span>
              </div>
              <Link href="/matchs" className="btn btn-sm btn-outline">
                Calculer notre compatibilité
              </Link>
            </div>

            {/* La personne (socle commun : bio / équipe) */}
            <section className={styles.block} aria-labelledby="rencontre">
              <h2 id="rencontre" className={styles.h2}>
                Rencontrez {first}
              </h2>
              <div className={styles.meet}>
                <Avatar person={person} size={112} />
                <div>
                  <blockquote className={styles.quote}>« {person.bio} »</blockquote>
                  <ul className={styles.meetFacts}>
                    <li>
                      <span>Métier</span>
                      {person.role}
                    </li>
                    <li>
                      <span>Équipe</span>
                      {person.team}
                    </li>
                    <li>
                      <span>Langues</span>
                      {person.languages}
                    </li>
                    {v.verified && (
                      <li>
                        <span>Statut</span>
                        Identité et entreprise vérifiées
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              <p className={styles.text}>{v.description}</p>
            </section>

            {/* Formules */}
            <section className={styles.block} aria-labelledby="formules">
              <h2 id="formules" className={styles.h2}>
                Les formules de {first}
              </h2>
              <div className={styles.packages}>
                {v.packages.map((p, i) => (
                  <div key={p.name} className={`${styles.pack} ${i === 1 ? styles.packStar : ""}`}>
                    {i === 1 && <span className={styles.packTag}>La plus choisie</span>}
                    <strong>{p.name}</strong>
                    <span className={styles.packPrice}>
                      {p.price.toLocaleString("fr-FR")} €{priceLabel(v).includes("/") ? ` ${priceLabel(v).split(" ").slice(-2).join(" ")}` : ""}
                    </span>
                    <ul>
                      {p.includes.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className={styles.textSmall}>Aucune formule ne vous correspond ? Décrivez votre projet : {first} peut vous proposer une offre sur mesure.</p>
            </section>

            {/* Champs spécifiques au métier (CDC §10.2) */}
            {specs.length > 0 && (
              <section className={styles.block} aria-labelledby="details">
                <h2 id="details" className={styles.h2}>
                  Le détail de la prestation
                </h2>
                <dl className={styles.specs}>
                  {specs.map(([k, val]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{val}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* Calendrier (CDC §17) et rendez-vous (CDC §12) */}
            <section id="disponibilites" className={styles.block} aria-labelledby="dispo-title">
              <h2 id="dispo-title" className={styles.h2}>
                Disponibilités
              </h2>
              <ul className={styles.calendar}>
                {calendar.map((c) => (
                  <li key={c.month} className={styles[statusClass[c.status]]}>
                    <span>{c.month}</span>
                    <strong>{c.status}</strong>
                  </li>
                ))}
              </ul>
              <div id="rendez-vous" className={styles.visit}>
                <Image src="/icons/calendar.png" alt="" width={48} height={48} />
                <div>
                  <strong>Envie de vous rencontrer avant de décider ?</strong>
                  <span>Proposez un créneau : {first} le confirme, ou vous propose une autre date. Le rappel arrive tout seul.</span>
                </div>
                <a href="#contact" className="btn btn-sm btn-outline">
                  Proposer un rendez-vous
                </a>
              </div>
            </section>

            {/* Avis détaillés (CDC §24) */}
            <section id="avis" className={styles.block} aria-labelledby="avis-title">
              <h2 id="avis-title" className={styles.h2}>
                ★ {v.rating} · {v.reviewsCount} avis de couples
              </h2>
              <p className={styles.textSmall}>Seuls les couples qui ont réservé {first} sur Céleste peuvent laisser un avis.</p>
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
                    <div aria-label={`${r.rating} étoiles sur 5`} className={styles.stars}>
                      {"★".repeat(r.rating)}
                      <span>{"★".repeat(5 - r.rating)}</span>
                    </div>
                    <blockquote>{r.text}</blockquote>
                  </figure>
                ))}
              </div>
            </section>

            {/* Zone */}
            <section className={styles.block} aria-labelledby="zone">
              <h2 id="zone" className={styles.h2}>
                Où travaille {first}
              </h2>
              <p className={styles.text}>Basé à {v.area}, se déplace dans toute l&apos;Île-de-France. Frais de déplacement éventuels précisés dans l&apos;offre.</p>
              <div className={styles.map}>
                <Image src="/photos/map-paris.jpg" alt={`Carte de la zone d'intervention autour de ${v.area}`} fill sizes="(max-width: 900px) 100vw, 760px" style={{ objectFit: "cover" }} />
                <span className={styles.pin}>{v.area}</span>
              </div>
            </section>

            {/* Conditions (CDC §14) */}
            <section className={styles.block} aria-labelledby="conditions">
              <h2 id="conditions" className={styles.h2}>
                Réserver en confiance
              </h2>
              <ul className={styles.terms}>
                <li>
                  <strong>Paiement</strong>
                  <span>Contrat signé en ligne, 30 % d&apos;acompte à la réservation, puis le solde en une à trois fois.</span>
                </li>
                <li>
                  <strong>Annulation</strong>
                  <span>Plus de 30 jours avant : remboursement intégral. Entre 30 et 7 jours : 50 %. Conditions affichées avant de réserver.</span>
                </li>
                <li>
                  <strong>Date bloquée</strong>
                  <span>Quand la discussion est avancée, votre date peut être bloquée 48 heures, le temps de décider.</span>
                </li>
              </ul>
            </section>

            {/* FAQ du prestataire */}
            <section className={styles.block} aria-labelledby="faq-v">
              <h2 id="faq-v" className={styles.h2}>
                Vos questions à {first}
              </h2>
              <div className={styles.faq}>
                {faq.map(([q, a]) => (
                  <details key={q} className={styles.qa}>
                    <summary>{q}</summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles.aside}>
            <ContactCard vendor={v} person={person} />
          </aside>
        </div>

        {similar.length > 0 && (
          <section className={styles.similar} aria-labelledby="similaires">
            <h2 id="similaires" className={styles.h2}>
              D&apos;autres {cat.plural.toLowerCase()} qui pourraient vous plaire
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
