import type { Metadata } from "next";
import Image from "next/image";
import { SimpleForm } from "@/components/SimpleForm";
import { categories, proPricing } from "@/lib/content";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Devenir prestataire",
  description: "Recevez des couples compatibles avec votre offre. Créer votre profil ne coûte rien : Céleste se rémunère sur les réservations signées.",
};

const benefits = [
  { icon: "/icons/notification-bell.png", title: "Des demandes qualifiées", text: "Date, zone, budget et style du couple connus avant de répondre. Et seuls quelques prestataires compatibles peuvent répondre." },
  { icon: "/icons/chat-bubbles.png", title: "Vendez sans brader", text: "Le couple a un budget serré ? Adaptez votre formule, la durée ou les options, plutôt que de baisser votre prix." },
  { icon: "/icons/contract-pen.png", title: "Contrats et paiements intégrés", text: "Offre acceptée, contrat signé en ligne, acompte et échéances encaissés sur Céleste." },
  { icon: "/icons/calendar.png", title: "Vos disponibilités sous contrôle", text: "Un calendrier sur 24 mois, et votre capacité réelle : une ou plusieurs équipes le même jour." },
];

const proSteps = [
  ["Créez votre profil", "Photos, formules, options, zone d'intervention et disponibilités. Une seule saisie, réutilisée partout."],
  ["Faites-vous vérifier", "Justificatif professionnel et identité contrôlés : le badge « Vérifié » rassure les couples."],
  ["Répondez aux opportunités", "Proposez une offre structurée, négociez dans la messagerie, signez et encaissez sur Céleste."],
];

export default function ProPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <span className="eyebrow">Espace prestataires</span>
            <h1 className="display h1">Faites grandir votre activité avec Céleste</h1>
            <p className="lead">Céleste ne vend pas de contacts : la plateforme vous présente des couples compatibles avec votre offre et ne gagne que lorsque vous signez une réservation.</p>
            <div className={styles.heroCtas}>
              <a href="#inscription" className="btn">
                Créer mon profil
              </a>
              <a href="#tarifs" className="link-underline">
                Comment Céleste se rémunère
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
            De la demande à l&apos;encaissement, au même endroit
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
              Trois étapes pour vos premières réservations
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
            Vous gagnez d&apos;abord. Céleste ensuite.
          </h2>
          <p className="lead" style={{ textAlign: "center", marginTop: 12 }}>
            Pas d&apos;achat de contacts, pas de visibilité à acheter pour mieux apparaître dans le Best Match.
          </p>
          <div className={styles.plans}>
            {proPricing.map((p, i) => (
              <div key={p.title} className={`${styles.plan} ${i === 2 ? styles.planStar : ""}`}>
                <div className={styles.planPrice}>
                  <strong>{p.value}</strong>
                </div>
                <h3 className="h3">{p.title}</h3>
                <p className="muted" style={{ margin: 0, lineHeight: "24px" }}>
                  {p.text}
                </p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
            <a href="#inscription" className="btn">
              Créer mon profil
            </a>
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
              Laissez-nous vos coordonnées : un membre de l&apos;équipe vous recontacte pour mettre votre profil en ligne avec vous.
            </p>
            <figure className={styles.quote}>
              <blockquote>« Depuis Céleste, je n&apos;ai plus de demandes à côté de mon style. Les couples arrivent avec un projet clair. »</blockquote>
              <figcaption>Ama, Atelier Kofi & Ama, photographe</figcaption>
            </figure>
          </div>
          <div className="card-surface" style={{ padding: 28 }}>
            <SimpleForm submit="Envoyer ma demande" doneTitle="Merci, c'est noté !" doneText="Nous vous recontactons très vite pour créer votre profil ensemble.">
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
