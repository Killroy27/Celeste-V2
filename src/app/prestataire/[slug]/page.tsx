import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteCard } from "@/components/QuoteCard";
import { SaveButton } from "@/components/SaveButton";
import { VendorCard } from "@/components/VendorCard";
import { getCategory, getVendor, priceLabel, vendors, vendorsIn } from "@/lib/content";
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

export default async function VendorPage({ params }: Params) {
  const v = getVendor((await params).slug);
  if (!v) notFound();
  const cat = getCategory(v.category)!;
  const similar = vendorsIn(v.category).filter((x) => x.slug !== v.slug).slice(0, 3);

  const highlights = [
    v.verified && { icon: "/icons/verified-seal.png", title: "Prestataire vérifié", text: "Entreprise et identité professionnelle contrôlées par Céleste." },
    { icon: "/icons/chat-bubbles.png", title: `Répond en ${v.responseTime}`, text: "Offre détaillée, modifiable dans la messagerie." },
    { icon: "/icons/shield-lock.png", title: "Paiement sur Céleste", text: "Contrat signé en ligne, 30 % d'acompte puis le solde en une à trois fois." },
  ].filter(Boolean) as { icon: string; title: string; text: string }[];

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

        <div className={styles.titleRow}>
          <div>
            <h1 className="display h2">{v.name}</h1>
            <p className={styles.sub}>
              <strong>★ {v.rating}</strong>
              <a href="#avis">{v.reviewsCount} avis</a>
              <span>·</span>
              <span>
                {cat.singular.charAt(0).toUpperCase() + cat.singular.slice(1)} · {v.area}
              </span>
              {v.verified && <span className="badge">Vérifié</span>}
            </p>
          </div>
          <div className={styles.saveWrap}>
            <SaveButton slug={v.slug} name={v.name} className={styles.save} />
            <span>Enregistrer</span>
          </div>
        </div>

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
        </div>

        <div className={styles.layout}>
          <div className={styles.main}>
            <section className={styles.block}>
              <h2 className="h3">À propos</h2>
              <p className={styles.text}>{v.description}</p>
              <ul className={styles.highlights}>
                {highlights.map((h) => (
                  <li key={h.title}>
                    <Image src={h.icon} alt="" width={48} height={48} />
                    <span>
                      <strong>{h.title}</strong>
                      <small>{h.text}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.block} aria-labelledby="formules">
              <h2 id="formules" className="h3">
                Formules
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
            </section>

            <section id="avis" className={styles.block} aria-labelledby="avis-title">
              <h2 id="avis-title" className="h3">
                ★ {v.rating} · {v.reviewsCount} avis de couples
              </h2>
              <div className={styles.reviews}>
                {v.reviews.map((r, i) => (
                  <figure key={i} className={styles.review}>
                    <figcaption>
                      <span className={styles.avatar}>{r.author.charAt(0)}</span>
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

            <section className={styles.block} aria-labelledby="zone">
              <h2 id="zone" className="h3">
                Zone d&apos;intervention
              </h2>
              <p className={styles.text}>Basé à {v.area}, se déplace dans toute l&apos;Île-de-France. Frais de déplacement éventuels précisés dans l&apos;offre.</p>
              <div className={styles.map}>
                <Image src="/photos/map-paris.jpg" alt={`Carte de la zone d'intervention autour de ${v.area}`} fill sizes="(max-width: 900px) 100vw, 760px" style={{ objectFit: "cover" }} />
                <span className={styles.pin}>{v.area}</span>
              </div>
            </section>
          </div>

          <aside className={styles.aside}>
            <QuoteCard vendor={v} />
          </aside>
        </div>

        {similar.length > 0 && (
          <section className={styles.similar} aria-labelledby="similaires">
            <h2 id="similaires" className="h3">
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
