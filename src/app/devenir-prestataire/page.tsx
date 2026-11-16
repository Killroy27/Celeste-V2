import type { Metadata } from "next";
import Image from "next/image";
import { SimpleForm } from "@/components/SimpleForm";
import { categories, proPlans } from "@/lib/content";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Devenir prestataire",
  description: "Recevez des demandes de couples qualifiées, gérez devis, contrats et acomptes au même endroit.",
};

const benefits = [
  { icon: "/icons/notification-bell.png", title: "Des demandes qualifiées", text: "Date, budget, nombre d'invités et style connus avant même de répondre." },
  { icon: "/icons/contract-pen.png", title: "Devis et contrats en ligne", text: "Modèles prêts à l'emploi, signature électronique, relances automatiques." },
  { icon: "/icons/shield-lock.png", title: "Acomptes sécurisés", text: "Paiements encaissés par Céleste et reversés selon votre échéancier." },
  { icon: "/icons/bar-chart.png", title: "Statistiques claires", text: "Vues, demandes, taux de conversion : sachez ce qui fonctionne." },
];

const proSteps = [
  ["Créez votre fiche", "Photos, formules, zone d'intervention : 15 minutes suffisent."],
  ["Faites-vous vérifier", "SIRET et assurance contrôlés sous 48 h, badge « Vérifié » à la clé."],
  ["Recevez vos premières demandes", "Répondez depuis votre espace ou votre téléphone, où que vous soyez."],
];

export default function ProPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <span className="eyebrow">Espace prestataires</span>
            <h1 className="display h1">Faites grandir votre activité avec Céleste</h1>
            <p className="lead">Rejoignez 2 400 prestataires vérifiés et recevez des demandes de couples qui vous ressemblent, sans commission sur vos prestations.</p>
            <div className={styles.heroCtas}>
              <a href="#inscription" className="btn">
                Créer ma fiche gratuitement
              </a>
              <a href="#tarifs" className="link-underline">
                Voir les tarifs
              </a>
            </div>
          </div>
          <div className={styles.heroPhoto}>
            <Image src="/photos/florist.jpg" alt="Une fleuriste prépare un bouquet dans son atelier" fill priority sizes="(max-width: 900px) 100vw, 560px" style={{ objectFit: "cover", objectPosition: "50% 30%" }} />
            <div className={styles.floating}>
              <Image src="/icons/notification-bell.png" alt="" width={40} height={40} />
              <span>
                <strong>Nouvelle demande</strong>
                <small>Claire & Thomas · 14 juin 2027 · 120 invités</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="avantages">
        <div className="container">
          <h2 id="avantages" className="display h2" style={{ textAlign: "center" }}>
            Tout ce qu&apos;il faut pour vendre, au même endroit
          </h2>
          <div className={styles.benefits}>
            {benefits.map((b) => (
              <div key={b.title} className={`card-surface ${styles.benefit}`}>
                <Image src={b.icon} alt="" width={64} height={64} />
                <h3 className="h3">{b.title}</h3>
                <p className="muted">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.white}`} aria-labelledby="etapes-pro">
        <div className={`container ${styles.split}`}>
          <div>
            <span className="eyebrow">En trois étapes</span>
            <h2 id="etapes-pro" className="display h2" style={{ marginTop: 10 }}>
              En ligne dès cette semaine
            </h2>
          </div>
          <ol className={styles.proSteps}>
            {proSteps.map(([t, d], i) => (
              <li key={t}>
                <span className={styles.num}>{i + 1}</span>
                <span>
                  <strong>{t}</strong>
                  <small>{d}</small>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="tarifs" className="section" aria-labelledby="tarifs-title">
        <div className="container">
          <h2 id="tarifs-title" className="display h2" style={{ textAlign: "center" }}>
            Des tarifs simples, sans commission
          </h2>
          <p className="lead" style={{ textAlign: "center", marginTop: 12 }}>
            Sans engagement, résiliable à tout moment.
          </p>
          <div className={styles.plans}>
            {proPlans.map((p) => (
              <div key={p.name} className={`${styles.plan} ${p.highlight ? styles.planStar : ""}`}>
                {p.highlight && <span className={styles.planTag}>Le plus choisi</span>}
                <h3 className="h3">{p.name}</h3>
                <div className={styles.planPrice}>
                  <strong>{p.price}</strong> <span>{p.period}</span>
                </div>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <a href="#inscription" className={`btn btn-block ${p.highlight ? "" : "btn-outline"}`}>
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="inscription" className={`section ${styles.white}`} aria-labelledby="inscription-title">
        <div className={`container ${styles.split}`}>
          <div>
            <span className="eyebrow">Inscription</span>
            <h2 id="inscription-title" className="display h2" style={{ marginTop: 10 }}>
              Créez votre fiche
            </h2>
            <p className="lead" style={{ marginTop: 12 }}>
              Laissez-nous vos coordonnées : un membre de l&apos;équipe vous rappelle sous 24 h pour mettre votre fiche en ligne avec vous.
            </p>
            <figure className={styles.quote}>
              <blockquote>« Depuis Céleste, je n&apos;ai plus de demandes à côté de mon style. Les couples arrivent avec un projet clair. »</blockquote>
              <figcaption>Ama, Atelier Kofi & Ama, photographe</figcaption>
            </figure>
          </div>
          <div className="card-surface" style={{ padding: 28 }}>
            <SimpleForm submit="Envoyer ma demande" doneTitle="Merci, c'est noté !" doneText="Nous vous rappelons sous 24 h pour créer votre fiche ensemble.">
              <div className={styles.row2}>
                <label className="field">
                  Prénom et nom
                  <input name="nom" autoComplete="name" required />
                </label>
                <label className="field">
                  Entreprise
                  <input name="entreprise" autoComplete="organization" required />
                </label>
              </div>
              <label className="field">
                Métier
                <select name="metier" required defaultValue="">
                  <option value="" disabled>
                    Choisir…
                  </option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.plural}
                    </option>
                  ))}
                </select>
              </label>
              <div className={styles.row2}>
                <label className="field">
                  E-mail
                  <input type="email" name="email" autoComplete="email" required />
                </label>
                <label className="field">
                  Téléphone
                  <input type="tel" name="tel" autoComplete="tel" required />
                </label>
              </div>
              <label className="field">
                Ville
                <input name="ville" autoComplete="address-level2" placeholder="Paris" />
              </label>
            </SimpleForm>
          </div>
        </div>
      </section>
    </>
  );
}
