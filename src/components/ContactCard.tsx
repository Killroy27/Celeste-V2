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

// Carte de contact sobre (inspirée de la carte de réservation du projet Céleste d'origine) :
// on écrit à une personne. Aucun compte pour parcourir ; l'espace est créé à l'envoi du message.
export function ContactCard({ vendor: v, person }: { vendor: Vendor; person: Person }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const needsGuests = ["lieux", "traiteurs", "patisserie"].includes(v.category);
  const first = person.firstName;

  return (
    <>
      <div id="contact" className={styles.card}>
        <div className={styles.ribbon} aria-hidden="true" />
        <div className={styles.body}>
          <div className={styles.who}>
            <Avatar person={person} size={56} />
            <div>
              <strong>
                {person.firstName} {person.lastName}
              </strong>
              <span>{v.name}</span>
            </div>
          </div>

          <div className={styles.priceBox}>
            <span className={styles.priceValue}>{priceLabel(v)}</span>
            <span className={styles.priceNote}>à partir de · répond en général en {v.responseTime}</span>
          </div>

          {sent ? (
            <div className={styles.done} role="status">
              <Image src="/icons/envelope-seal.png" alt="" width={72} height={72} />
              <strong>Message envoyé à {first}</strong>
              <p>Sa réponse et son offre arriveront dans votre messagerie Céleste.</p>
              <Link href="/decouvrir" className={styles.textLink}>
                Découvrir d&apos;autres prestataires
              </Link>
            </div>
          ) : open ? (
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className={styles.row2}>
                <label className="field">
                  Prénom
                  <input name="prenom" autoComplete="given-name" required autoFocus />
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
              <label className="field">
                Message
                <textarea name="message" placeholder={`Bonjour ${first}, nous nous marions…`} required />
              </label>
              <button type="submit" className="btn btn-block">
                Envoyer à {first}
              </button>
              <button type="button" className={styles.cancel} onClick={() => setOpen(false)}>
                Annuler
              </button>
            </form>
          ) : (
            <>
              <button type="button" className="btn btn-block" onClick={() => setOpen(true)}>
                Écrire à {first}
              </button>
              <a href="#rendez-vous" className={`btn btn-outline btn-block ${styles.second}`}>
                Proposer un rendez-vous
              </a>
            </>
          )}

          <ul className={styles.reassure}>
            <li>Aucun compte pour explorer</li>
            <li>30 % d&apos;acompte pour bloquer la date</li>
            <li>Le solde en une à trois fois</li>
          </ul>
        </div>
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
          <a
            href="#contact"
            className="btn btn-sm"
            onClick={() => {
              setOpen(true);
            }}
          >
            Écrire à {first}
          </a>
        </div>
      )}
    </>
  );
}
