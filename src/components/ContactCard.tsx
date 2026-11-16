"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { priceLabel, type Vendor } from "@/lib/content";
import type { Person } from "@/lib/vendorDetail";
import styles from "./ContactCard.module.css";

export function Avatar({ person, size = 64 }: { person: Person; size?: number }) {
  return (
    <span className={styles.avatar} style={{ width: size, height: size }}>
      {person.photo ? (
        <Image src={person.photo} alt={`${person.firstName} ${person.lastName}`} fill sizes={`${size}px`} style={{ objectFit: "cover", objectPosition: person.pos }} />
      ) : (
        <span className={styles.initials} style={{ fontSize: size * 0.36 }}>
          {person.firstName[0]}
          {person.lastName[0]}
        </span>
      )}
    </span>
  );
}

// On écrit à une personne, pas à une entreprise. Pas de compte pour parcourir :
// le compte n'est créé qu'à l'envoi, parce qu'il faut pouvoir recevoir la réponse.
export function ContactCard({ vendor: v, person }: { vendor: Vendor; person: Person }) {
  const [sent, setSent] = useState(false);
  const needsGuests = ["lieux", "traiteurs", "patisserie"].includes(v.category);
  const first = person.firstName;

  return (
    <>
      <div id="contact" className={styles.card}>
        <div className={styles.who}>
          <Avatar person={person} />
          <div>
            <strong>
              {person.firstName} {person.lastName}
            </strong>
            <span>
              {person.role} · {v.name}
            </span>
            <small>Répond en général en {v.responseTime}</small>
          </div>
        </div>

        {sent ? (
          <div className={styles.done} role="status">
            <Image src="/icons/envelope-seal.png" alt="" width={80} height={80} />
            <h2 className="h3">Message envoyé à {first}</h2>
            <p className="muted">Vous retrouverez sa réponse et son offre dans votre messagerie Céleste.</p>
            <Link href="/decouvrir" className="btn btn-sm btn-outline">
              Découvrir d&apos;autres prestataires
            </Link>
          </div>
        ) : (
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className={styles.price}>
              À partir de <strong>{priceLabel(v)}</strong>
            </div>
            <div className={styles.row2}>
              <label className="field">
                Votre prénom
                <input name="prenom" autoComplete="given-name" required />
              </label>
              <label className="field">
                E-mail
                <input type="email" name="email" autoComplete="email" required />
              </label>
            </div>
            <div className={needsGuests ? styles.row2 : ""}>
              <label className="field">
                Date du mariage
                <input type="date" name="date" />
              </label>
              {needsGuests && (
                <label className="field">
                  Invités
                  <input type="number" name="invites" min={2} max={1000} placeholder="120" />
                </label>
              )}
            </div>
            <label className={styles.check}>
              <input type="checkbox" name="flexible" /> Notre date est flexible
            </label>
            <label className="field">
              Votre message
              <textarea name="message" placeholder={`Bonjour ${first}, nous nous marions…`} required />
            </label>
            <button type="submit" className="btn btn-block">
              Écrire à {first}
            </button>
            <p className={styles.note}>Sans engagement. Votre espace Céleste est créé à l&apos;envoi, pour recevoir la réponse de {first}.</p>
            <a href="#rendez-vous" className={styles.secondary}>
              Plutôt un rendez-vous ou une visite ?
            </a>
          </form>
        )}
      </div>

      {!sent && (
        <div className={styles.mobileBar}>
          <span className={styles.mobileWho}>
            <Avatar person={person} size={40} />
            <span>
              <strong>{first}</strong>
              <small>dès {priceLabel(v)}</small>
            </span>
          </span>
          <a href="#contact" className="btn btn-sm">
            Écrire à {first}
          </a>
        </div>
      )}
    </>
  );
}
