import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, ContactCard } from "@/components/ContactCard";
import { FicheActions } from "@/components/FicheActions";
import { GalleryTrigger, GalleryViewer } from "@/components/gallery/Gallery";
import { SectionNav } from "@/components/SectionNav";
import { VendorCard } from "@/components/VendorCard";
import { VendorMapLazy } from "@/components/VendorMapLazy";
import { getCategory, getVendor, priceLabel, vendors, vendorsIn } from "@/lib/content";
import { availabilityFor, coordsFor, criteriaFor, faqFor, personFor, specsFor, teamFor } from "@/lib/vendorDetail";
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

/* Icônes au trait fin, comme Airbnb et Fresha (pas d'icônes 3D sur la fiche). */
const ico = {
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3zm-3 9l2 2 4-4",
  chat: "M4 5h16v11H8l-4 4V5z",
  card: "M3 6h18v12H3zM3 10h18",
  calendar: "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4",
  undo: "M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3",
  pin: "M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
};

function Ico({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const pastel = ["#EDE7F6", "#E3F0E8", "#FDE8E4", "#E4EEF8", "#FBEFD8", "#F1E8E1"];
const pastelInk = ["#5B3E96", "#2F6B47", "#A3473A", "#2F5D8A", "#8A5A0E", "#6B4A33"];

function Section({ id, title, aside, children }: { id: string; title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-t`}>
      <div className={styles.sectionHead}>
        <h2 id={`${id}-t`} className={styles.title}>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

// Fiche prestataire. Fond blanc neutre, couleur apportée par le contenu (photos, carte, avatars),
// accent doré réservé à l'action principale. Contenu issu du cahier des charges (§10, §12, §14, §17, §22, §24).
export default async function VendorPage({ params }: Params) {
  const v = getVendor((await params).slug);
  if (!v) notFound();
  const cat = getCategory(v.category)!;
  const person = personFor(v);
  const first = person.firstName;
  const team = teamFor(v, person);
  const specs = specsFor(v);
  const calendar = availabilityFor(v);
  const criteria = criteriaFor(v);
  const faq = faqFor(v, first);
  const [lat, lng] = coordsFor(v);
  const similar = vendorsIn(v.category).filter((x) => x.slug !== v.slug).slice(0, 4);
  const unit = priceLabel(v).includes("/") ? ` ${priceLabel(v).split(" ").slice(-2).join(" ")}` : "";
  // Toutes les photos du prestataire (prototype : sa galerie, complétée par la photothèque du métier).
  const photos = [...v.gallery, ...vendorsIn(v.category).flatMap((x) => x.gallery)]
    .filter((p, i, a) => a.indexOf(p) === i)
    .map((src, i) => ({ src, alt: `${v.name} · photo ${i + 1}` }));
  const portfolio = photos.slice(0, 5);
  const hidden = photos.length - portfolio.length;

  return (
    <div className={styles.page}>
      <div className="container">
        <nav aria-label="Fil d'Ariane" className={styles.crumbs}>
          <Link href="/decouvrir">Découvrir</Link>
          <span aria-hidden="true">›</span>
          <Link href={`/prestataires/${cat.slug}`}>{cat.plural}</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{v.name}</span>
        </nav>

        <div className={styles.headRow}>
          <div>
            <h1 className={styles.name}>
              {v.name}
              {v.verified && (
                <span className={styles.verified} title="Identité vérifiée">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#EEB048" d="M12 2l2.4 1.8 3-.2 1 2.8 2.5 1.7-.8 2.9.8 2.9-2.5 1.7-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8-2.5-1.7.8-2.9-.8-2.9 2.5-1.7 1-2.8 3 .2z" />
                    <path d="M8.5 12.2l2.3 2.3 4.7-4.8" fill="none" stroke="#39210C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </h1>
            <p className={styles.meta}>
              <strong>{v.rating}</strong>
              <span className={styles.stars} aria-hidden="true">
                ★★★★★
              </span>
              <a href="#avis">({v.reviewsCount})</a>
              <span className={styles.sep}>·</span>
              <span className={styles.open}>Répond en {v.responseTime}</span>
              <span className={styles.sep}>·</span>
              <span>
                {cat.plural} · {v.area}
              </span>
              <a href="#lieu" className={styles.metaLink}>
                Voir la zone
              </a>
            </p>
          </div>
          <FicheActions slug={v.slug} name={v.name} />
        </div>

        <div className={styles.mosaic}>
          {photos.slice(0, 3).map((p, i) => (
            <div key={p.src + i} className={styles.tile}>
              <GalleryTrigger index={i} label={`Agrandir la photo ${i + 1}`}>
                <Image
                  src={p.src}
                  alt={i === 0 ? `${v.name}, ${cat.singular}` : ""}
                  fill
                  priority={i === 0}
                  sizes={i === 0 ? "(max-width: 900px) 100vw, 800px" : "30vw"}
                  style={{ objectFit: "cover", objectPosition: i === 0 ? (v.pos ?? "50% 40%") : "50% 40%" }}
                />
              </GalleryTrigger>
            </div>
          ))}
          <GalleryTrigger label={`Afficher les ${photos.length} photos`} className={styles.seeAll}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
            </svg>
            Afficher les {photos.length} photos
          </GalleryTrigger>
        </div>

        <SectionNav
          items={[
            { id: "prestations", label: "Prestations" },
            { id: "equipe", label: "Équipe" },
            { id: "disponibilites", label: "Disponibilités" },
            { id: "avis", label: "Avis" },
            { id: "portfolio", label: "Portfolio" },
            { id: "lieu", label: "Zone" },
            { id: "a-savoir", label: "À savoir" },
          ]}
        />

        <div className={styles.layout}>
          <div>
            {/* Prestations : une liste, comme Fresha */}
            <Section id="prestations" title="Prestations">
              <ul className={styles.services}>
                {v.packages.map((p, i) => (
                  <li key={p.name}>
                    <div>
                      <strong>
                        {p.name}
                        {i === 1 && <span className={styles.popular}>La plus choisie</span>}
                      </strong>
                      <span>{p.includes.join(" · ")}</span>
                      <b>
                        {p.price.toLocaleString("fr-FR")} €{unit}
                      </b>
                    </div>
                    <a href="#contact" className={styles.choose}>
                      Choisir
                    </a>
                  </li>
                ))}
              </ul>
              <p className={styles.note}>
                Une demande particulière ? {first} peut vous proposer une offre sur mesure.{" "}
                <Link href="/matchs" className={styles.link}>
                  Vérifier notre compatibilité avec le Best Match
                </Link>
              </p>
            </Section>

            {/* Équipe : la personne d'abord */}
            <Section id="equipe" title="Équipe">
              <ul className={styles.team}>
                <li>
                  <Avatar person={person} size={88} />
                  <span className={styles.teamRating}>★ {v.rating}</span>
                  <strong>{first}</strong>
                  <small>{person.role}</small>
                </li>
                {team.map((m, i) => (
                  <li key={m.name}>
                    <span className={styles.mate} style={{ background: pastel[(i + 2) % pastel.length], color: pastelInk[(i + 2) % pastelInk.length] }}>
                      {m.name[0]}
                    </span>
                    <strong>{m.name}</strong>
                    <small>{m.role}</small>
                  </li>
                ))}
              </ul>
              <blockquote className={styles.quote}>« {person.bio} »</blockquote>
              <p className={styles.text}>{v.description}</p>
              {specs.length > 0 && (
                <dl className={styles.specs}>
                  {specs.map(([k, val]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{val}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Section>

            {/* Disponibilités */}
            <Section id="disponibilites" title="Disponibilités">
              <ul className={styles.calendar}>
                {calendar.map((c) => (
                  <li key={c.month} data-status={c.status}>
                    <span className={styles.dot} />
                    <span className={styles.month}>{c.month}</span>
                    <span className={styles.status}>{c.status}</span>
                  </li>
                ))}
              </ul>
              <div id="rendez-vous" className={styles.visit}>
                <span>
                  <strong>Envie de vous rencontrer avant de décider ?</strong> Proposez un créneau, {first} le confirme ou en propose un autre.
                </span>
                <a href="#contact" className={styles.choose}>
                  Proposer un rendez-vous
                </a>
              </div>
            </Section>

            {/* Avis */}
            <Section id="avis" title={`Avis`} aside={<span className={styles.count}>{v.reviewsCount}</span>}>
              <div className={styles.score}>
                <span className={styles.scoreValue}>{v.rating}</span>
                <span className={styles.scoreStars} aria-hidden="true">
                  ★★★★★
                </span>
                <span className={styles.scoreLabel}>Recommandé par les couples</span>
                <small>Basé sur {v.reviewsCount} avis de couples ayant réservé</small>
              </div>
              <ul className={styles.criteria}>
                {criteria.map(([label, score]) => (
                  <li key={label}>
                    <span>{label}</span>
                    <strong>{score.toLocaleString("fr-FR")}</strong>
                    <span className={styles.bar}>
                      <i style={{ width: `${(score / 5) * 100}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
              <div className={styles.reviews}>
                {v.reviews.map((r, i) => (
                  <figure key={i} className={styles.review}>
                    <figcaption>
                      <span className={styles.revAvatar} style={{ background: pastel[i % pastel.length], color: pastelInk[i % pastelInk.length] }}>
                        {r.author
                          .split(" & ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                      <span>
                        <strong>{r.author}</strong>
                        <span className={styles.revStars} aria-label={`${r.rating} étoiles sur 5`}>
                          {"★".repeat(r.rating)}
                        </span>
                      </span>
                    </figcaption>
                    <blockquote>{r.text}</blockquote>
                    <small>Mariés en {r.date} · avec {first}</small>
                  </figure>
                ))}
              </div>
            </Section>

            {/* Portfolio */}
            <Section id="portfolio" title="Portfolio" aside={<span className={styles.count}>{photos.length}</span>}>
              <div className={styles.portfolio}>
                {portfolio.map((p, i) => (
                  <div key={p.src} className={styles.pf}>
                    <GalleryTrigger index={i} label={`Agrandir la photo ${i + 1}`}>
                      <Image src={p.src} alt="" fill sizes="(max-width: 900px) 50vw, 260px" style={{ objectFit: "cover" }} />
                      {i === portfolio.length - 1 && hidden > 0 && <span className={styles.more}>+{hidden}</span>}
                    </GalleryTrigger>
                  </div>
                ))}
              </div>
            </Section>

            {/* Zone : vraie carte en couleur */}
            <Section id="lieu" title={`Où travaille ${first}`}>
              <div className={styles.map}>
                <VendorMapLazy lat={lat} lng={lng} label={`★ ${v.rating}`} />
              </div>
              <p className={styles.address}>
                {v.area}, Île-de-France · se déplace dans un rayon d&apos;environ 25 km, et au-delà sur demande.
              </p>
            </Section>

            {/* À savoir */}
            <Section id="a-savoir" title="À savoir">
              <div className={styles.infos}>
                <div>
                  <Ico d={ico.shield} />
                  <strong>{v.verified ? "Prestataire vérifié" : "Vérification en cours"}</strong>
                  <span>Entreprise et identité contrôlées par Céleste.</span>
                </div>
                <div>
                  <Ico d={ico.chat} />
                  <strong>Échanges sur Céleste</strong>
                  <span>Messages, offres et contrat restent au même endroit.</span>
                </div>
                <div>
                  <Ico d={ico.card} />
                  <strong>Paiement en ligne</strong>
                  <span>30 % d&apos;acompte, puis le solde en une à trois fois.</span>
                </div>
                <div>
                  <Ico d={ico.undo} />
                  <strong>Annulation</strong>
                  <span>Intégralement remboursée plus de 30 jours avant. Conditions affichées avant de réserver.</span>
                </div>
                <div>
                  <Ico d={ico.calendar} />
                  <strong>Date bloquée 48 h</strong>
                  <span>Quand la discussion avance, le temps de décider sereinement.</span>
                </div>
                <div>
                  <Ico d={ico.pin} />
                  <strong>Déplacements</strong>
                  <span>Frais éventuels précisés dans l&apos;offre.</span>
                </div>
              </div>
              <div className={styles.faq}>
                {faq.map(([q, a]) => (
                  <details key={q} className={styles.qa}>
                    <summary>{q}</summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </Section>
          </div>

          <aside className={styles.aside}>
            <ContactCard vendor={v} person={person} />
          </aside>
        </div>

        <GalleryViewer photos={photos} title={v.name} />

        {similar.length > 0 && (
          <section className={styles.similar} aria-labelledby="similaires">
            <h2 id="similaires" className={styles.title}>
              {cat.plural} à proximité
            </h2>
            <div className={styles.similarGrid}>
              {similar.map((s) => (
                <VendorCard key={s.slug} vendor={s} landscape />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
