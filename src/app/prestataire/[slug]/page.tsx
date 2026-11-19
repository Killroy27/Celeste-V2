import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, ContactButton, ContactCard } from "@/components/ContactCard";
import { FicheNav } from "./FicheNav";
import { LiveAbout, LiveSetting, PayRule } from "./LiveAbout";
import { ReviewsButton, ReviewsDialog } from "./ReviewsDialog";
import { FicheActions } from "@/components/FicheActions";
import { GalleryThemeButton, GalleryTrigger, GalleryViewer } from "@/components/gallery/Gallery";
import { VendorCard } from "@/components/VendorCard";
import { VendorMapLazy } from "@/components/VendorMapLazy";
import { getCategory, getVendor, priceLabel, reviewPool, vendors, vendorsIn } from "@/lib/content";
import { actionsFor, availabilityFor, capacityFor, coordsFor, criteriaFor, faqFor, personFor, specsFor, teamFor, groupByTheme, themeOf, themeOrder } from "@/lib/vendorDetail";
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
  check: "M5 12.5l4.5 4.5L19 7.5",
  lock: "M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 017 0v3",
};

function Ico({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// Avatars sans photo : initiales noires sur blanc cassé (docs/direction-artistique.md §6).
const initialsStyle = { background: "var(--offwhite)", color: "var(--ink)" };

function CalendarList({ months }: { months: { month: string; status: string }[] }) {
  return (
    <ul className={styles.calendar}>
      {months.map((c) => (
        <li key={c.month} data-status={c.status}>
          <span className={styles.dot} />
          <span className={styles.month}>{c.month}</span>
          <span className={styles.status}>{c.status}</span>
        </li>
      ))}
    </ul>
  );
}

function Laurel({ flip }: { flip?: boolean }) {
  return (
    <svg width="34" height="52" viewBox="0 0 34 52" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <g fill="#EEB048">
        <path d="M27 50C14 44 7 32 8 16" fill="none" stroke="#EEB048" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="6" cy="14" rx="3.2" ry="6.5" transform="rotate(-15 6 14)" />
        <ellipse cx="5" cy="25" rx="3.2" ry="6.5" transform="rotate(-35 5 25)" />
        <ellipse cx="8" cy="35" rx="3.2" ry="6.5" transform="rotate(-55 8 35)" />
        <ellipse cx="14" cy="43" rx="3.2" ry="6.5" transform="rotate(-70 14 43)" />
        <ellipse cx="14" cy="20" rx="2.8" ry="5.5" transform="rotate(25 14 20)" />
        <ellipse cx="15" cy="31" rx="2.8" ry="5.5" transform="rotate(5 15 31)" />
      </g>
    </svg>
  );
}

function Section({ id, title, aside, more, children }: { id: string; title: string; aside?: React.ReactNode; more?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-t`}>
      <div className={styles.sectionHead}>
        <h2 id={`${id}-t`} className={styles.title}>
          {title}
        </h2>
        {aside}
        {more && <span className={styles.headMore}>{more}</span>}
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
  const actions = actionsFor(v, first);
  const specs = specsFor(v);
  const calendar = availabilityFor(v);
  const capacity = capacityFor(v);
  const criteria = criteriaFor(v);
  const faq = faqFor(v, first);
  const [lat, lng] = coordsFor(v);
  const similar = vendorsIn(v.category).filter((x) => x.slug !== v.slug).slice(0, 4);
  const unit = priceLabel(v).includes("/") ? ` ${priceLabel(v).split(" ").slice(-2).join(" ")}` : "";
  // Toutes les photos du prestataire (prototype : sa galerie, complétée par la photothèque du métier).
  const photos = [...v.gallery, ...vendorsIn(v.category).flatMap((x) => x.gallery), ...vendors.flatMap((x) => x.gallery)]
    .filter((p, i, a) => a.indexOf(p) === i)
    .slice(0, 12)
    .map((src, i) => ({ src, alt: `${v.name} · photo ${i + 1}`, theme: themeOf(src, v.category) }));
  const themes = groupByTheme(photos, themeOrder(v.category));
  const portfolio = photos.slice(0, 5);
  // Avis (prototype : ceux du prestataire complétés par la réserve d'exemples). Six sur la fiche, tous dans la fenêtre.
  const allReviews = [...v.reviews, ...reviewPool]
    .filter((r, i, a) => a.findIndex((x) => x.author === r.author) === i)
    .map((r, i) => ({ ...r, formule: v.packages[i % v.packages.length].name }));
  const reviews = allReviews.slice(0, 6);
  const best = [...criteria].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([l]) => (l.startsWith("Rapport") ? "le " : "la ") + l.toLowerCase());
  const hidden = photos.length - portfolio.length;

  return (
    <div className={styles.page}>
      <FicheNav price={priceLabel(v)} rating={v.rating} action={{ kind: actions.primary.kind, label: actions.primary.label }} />
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
                    <path fill="#000000" d="M12 2l2.4 1.8 3-.2 1 2.8 2.5 1.7-.8 2.9.8 2.9-2.5 1.7-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8-2.5-1.7.8-2.9-.8-2.9 2.5-1.7 1-2.8 3 .2z" />
                    <path d="M8.5 12.2l2.3 2.3 4.7-4.8" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

        <div id="photos" className={styles.mosaic}>
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

        <div className={styles.layout}>
          <div className={styles.flow}>
            {/* 1. Prestations */}
            <Section id="prestations" title="Prestations">
              {/* Formules en cartes (photo, prix, inclusions) : « Choisir » ouvre le message avec la formule reprise. */}
              <ul className={styles.formules}>
                {v.packages.map((p, i) => (
                  <li key={p.name} className={styles.formule}>
                    <div className={styles.fPhoto}>
                      <Image src={photos[(3 + i) % photos.length].src} alt="" fill sizes="(max-width: 700px) 78vw, 240px" style={{ objectFit: "cover" }} />
                      {i === 1 && <span className={styles.popular}>La plus choisie</span>}
                    </div>
                    <div className={styles.fBody}>
                      <strong className={styles.fName}>{p.name}</strong>
                      <span className={styles.fPrice}>
                        <b>{p.price.toLocaleString("fr-FR")} €</b>
                        {unit}
                      </span>
                      <ul className={styles.fIncludes}>
                        {p.includes.map((x) => (
                          <li key={x}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d={ico.check} />
                            </svg>
                            {x}
                          </li>
                        ))}
                      </ul>
                      <ContactButton kind="message" formule={p.name} className={`${styles.choose} ${styles.fChoose}`}>
                        Choisir cette formule
                      </ContactButton>
                    </div>
                  </li>
                ))}
              </ul>
              <p className={styles.note}>
                Une demande particulière ? {first} peut vous proposer une offre sur mesure.{" "}
                <Link href="/matchs" className={styles.link}>
                  Vérifier notre compatibilité
                </Link>
              </p>
            </Section>

            {/* 2. Équipe */}
            <Section id="equipe" title="Équipe">
              <ul className={styles.team}>
                <li>
                  <Avatar person={person} size={88} />
                  <span className={styles.teamRating}>★ {v.rating}</span>
                  <strong>{first}</strong>
                  <small>{person.role}</small>
                </li>
                {team.map((m) => (
                  <li key={m.name}>
                    <span className={styles.mate} style={initialsStyle}>
                      {m.name[0]}
                    </span>
                    <strong>{m.name}</strong>
                    <small>{m.role}</small>
                  </li>
                ))}
              </ul>
            </Section>

            {/* 3. Avis */}
            <Section id="avis" title="Avis" aside={<span className={styles.count}>{v.reviewsCount}</span>} more={<ReviewsButton className={styles.more2}>Tout voir</ReviewsButton>}>
              <div className={styles.score}>
                <div className={styles.scoreRow}>
                  <Laurel />
                  <span className={styles.scoreValue}>{v.rating}</span>
                  <Laurel flip />
                </div>
                <span className={styles.scoreLabel}>Coup de cœur des couples</span>
                <small>Basé sur {v.reviewsCount} avis de couples ayant réservé</small>
              </div>
              <ul className={styles.criteria}>
                {criteria.map(([label, score]) => (
                  <li key={label}>
                    <span>{label}</span>
                    <strong>{score.toLocaleString("fr-FR", { minimumFractionDigits: 1 })}</strong>
                  </li>
                ))}
              </ul>
              <div className={styles.summary}>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EEB048" d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
                </svg>
                <p>
                  Les couples saluent surtout {best[0]} et {best[1]} de {first}. Ils décrivent un accompagnement {v.style.toLowerCase()}, attentif du premier message au jour J.
                  <small>Résumé des avis par Céleste</small>
                </p>
              </div>
              <div className={styles.reviews}>
                {reviews.map((r) => (
                  <figure key={r.author} className={styles.review}>
                    <figcaption>
                      <span className={styles.revAvatar} style={initialsStyle}>
                        {r.author
                          .split(" & ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                      <span>
                        <strong>{r.author}</strong>
                        <span className={styles.revStars} aria-label={`${r.rating} étoiles sur 5`}>
                          {"★".repeat(r.rating)}
                          <i>{"★".repeat(5 - r.rating)}</i>
                        </span>
                      </span>
                    </figcaption>
                    <blockquote>{r.text}</blockquote>
                    <small>
                      {r.date.charAt(0).toUpperCase() + r.date.slice(1)} · {r.formule} · avec {first}
                    </small>
                  </figure>
                ))}
              </div>
              <ReviewsButton className={styles.allReviews}>Voir les {v.reviewsCount} avis</ReviewsButton>
              <ReviewsDialog rating={v.rating} count={v.reviewsCount} criteria={criteria} reviews={allReviews} first={first} />
            </Section>

            {/* 4. Portfolio */}
            <Section id="portfolio" title="Portfolio" aside={<span className={styles.count}>{photos.length}</span>}>
              {/* Visite photo par thème (benchmark Airbnb) : chaque pastille ouvre la galerie sur son thème. */}
              <ul className={styles.pfThemes} aria-label="Photos par thème">
                {themes.map((g) => (
                  <li key={g.theme}>
                    <GalleryThemeButton theme={g.theme} className={styles.pfTheme}>
                      <span className={styles.pfThumb}>
                        <Image src={g.items[0].src} alt="" fill sizes="44px" style={{ objectFit: "cover" }} />
                      </span>
                      <span>
                        <strong>{g.theme}</strong>
                        <small>
                          {g.items.length} photo{g.items.length > 1 ? "s" : ""}
                        </small>
                      </span>
                    </GalleryThemeButton>
                  </li>
                ))}
              </ul>
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

            {/* 5. À propos */}
            <Section id="a-propos" title="À propos">
              <LiveAbout slug={v.slug} bio={person.bio} description={v.description} specs={specs} />
            </Section>

            {/* 6. Zone */}
            <Section id="lieu" title="Zone d'intervention">
              <div className={styles.map}>
                <VendorMapLazy lat={lat} lng={lng} label={`★ ${v.rating}`} />
              </div>
              <p className={styles.address}>
                {v.area}, Île-de-France · se déplace dans un rayon d&apos;environ 25 km, et au-delà sur demande.
              </p>
            </Section>

            {/* 7. Disponibilités et renseignements, côte à côte comme Fresha */}
            <div id="disponibilites" className={styles.twoCols}>
              <section aria-labelledby="dispo-t">
                <h2 id="dispo-t" className={styles.title}>
                  Disponibilités
                </h2>
                <p className={styles.capacity}>
                  {capacity === 1 ? "Un seul mariage par jour : votre date vous est réservée." : `Jusqu'à ${capacity} mariages le même jour, avec des équipes distinctes.`}
                </p>
                {/* CDC §17 : calendrier glissant sur 24 mois. Les 6 prochains mois d'abord, le reste à la demande. */}
                <CalendarList months={calendar.slice(0, 6)} />
                <details className={styles.calendarMore}>
                  <summary>Voir les {calendar.length} prochains mois</summary>
                  <CalendarList months={calendar.slice(6)} />
                </details>
                <ContactButton kind={actions.primary.kind === "message" ? "meeting" : actions.primary.kind} className={`${styles.choose} ${styles.dispoBtn}`}>
                  {actions.primary.kind === "message" ? "Proposer un rendez-vous" : actions.primary.label}
                </ContactButton>
              </section>
              <section aria-labelledby="infos-t">
                <h2 id="infos-t" className={styles.title}>
                  En bref
                </h2>
                <ul className={styles.infoList}>
                  <li>
                    <Ico d={ico.shield} />
                    {v.verified ? "Prestataire vérifié par Céleste" : "Vérification en cours"}
                  </li>
                  <li>
                    <Ico d={ico.chat} />
                    Répond en général en {v.responseTime}
                  </li>
                  <li>
                    <Ico d={ico.pin} />
                    {v.area} et environ 25 km autour
                  </li>
                  <li>
                    <Ico d={ico.undo} />
                    Frais de déplacement précisés dans l&apos;offre
                  </li>
                </ul>
              </section>
            </div>

            {/* 8. Questions */}
            <Section id="questions" title="Questions fréquentes">
              <div className={styles.faq}>
                {faq.map(([q, a]) => (
                  <details key={q} className={styles.qa}>
                    <summary>{q}</summary>
                    <p>
                      {a.split("{hold}").map((part, i) => (
                        <span key={i}>
                          {i > 0 && <LiveSetting name="dateHoldHours" />}
                          {part}
                        </span>
                      ))}
                    </p>
                  </details>
                ))}
              </div>
            </Section>

            {/* 9. À savoir : les règles de la réservation, en trois colonnes courtes, avant de se décider. */}
            <Section id="a-savoir" title="À savoir">
              <div className={styles.know}>
                <div>
                  <Ico d={ico.calendar} />
                  <strong>Réserver</strong>
                  <ul>
                    <li>
                      Votre date est bloquée <LiveSetting name="dateHoldHours" /> h pendant la discussion.
                    </li>
                    <li>
                      Chaque offre reste valable <LiveSetting name="offerValidityDays" /> jours.
                    </li>
                    <li>Le contrat se signe en ligne, avant tout paiement.</li>
                  </ul>
                </div>
                <div>
                  <Ico d={ico.card} />
                  <strong>Payer</strong>
                  <ul>
                    <li>
                      <PayRule />.
                    </li>
                    <li>L&apos;échéancier est affiché avant la signature.</li>
                    <li>Les paiements passent par Céleste, jamais en direct.</li>
                  </ul>
                </div>
                <div>
                  <Ico d={ico.lock} />
                  <strong>Échanger en confiance</strong>
                  <ul>
                    <li>{v.verified ? "Identité, activité et compte de paiement contrôlés par Céleste." : "Justificatifs en cours de vérification par Céleste."}</li>
                    <li>Coordonnées masquées jusqu&apos;à la réservation.</li>
                    <li>Annulation selon le contrat ; en cas de désaccord, Céleste vous accompagne.</li>
                  </ul>
                </div>
              </div>
            </Section>
          </div>

          <aside className={styles.aside}>
            <ContactCard vendor={v} person={person} actions={actions} />
          </aside>
        </div>

        <GalleryViewer photos={photos} title={v.name} order={themeOrder(v.category)} />

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
