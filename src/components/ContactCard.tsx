"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { priceLabel, type Vendor } from "@/lib/content";
import type { ActionKind, Person, VendorActions } from "@/lib/vendorDetail";
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

type Mode = ActionKind | "meeting";

// Ouvre la carte de contact sur une action précise depuis n'importe quel bouton de la page.
export function openContact(kind: Mode) {
  window.dispatchEvent(new CustomEvent("celeste:contact", { detail: kind }));
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ContactButton({ kind, className, children }: { kind: Mode; className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => openContact(kind)}>
      {children}
    </button>
  );
}

const sentTitles: Record<Mode, (f: string) => string> = {
  message: (f) => `Message envoyé à ${f}`,
  visit: () => "Demande de visite envoyée",
  tasting: () => "Demande de dégustation envoyée",
  trial: () => "Demande d'essai envoyée",
  meeting: () => "Demande de rendez-vous envoyée",
};

// Carte de contact : on s'adresse à une personne, avec l'action adaptée au métier.
// Aucun compte pour parcourir ; l'espace Céleste est créé à l'envoi.
export function ContactCard({ vendor: v, person, actions }: { vendor: Vendor; person: Person; actions: VendorActions }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [sent, setSent] = useState<Mode | null>(null);
  const first = person.firstName;

  useEffect(() => {
    const on = (e: Event) => setMode((e as CustomEvent<Mode>).detail);
    window.addEventListener("celeste:contact", on);
    return () => window.removeEventListener("celeste:contact", on);
  }, []);

  const isPrimary = mode === actions.primary.kind;
  const title = mode === null ? "" : isPrimary ? actions.primary.title : mode === "message" ? `Votre message à ${first}` : `Rencontrer ${first}`;
  const submit = isPrimary ? actions.primary.submit : mode === "message" ? `Envoyer à ${first}` : "Proposer ce créneau";
  const needsGuests = ["lieux", "traiteurs", "patisserie"].includes(v.category) && mode !== "trial";

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
              <strong>{sentTitles[sent](first)}</strong>
              <p>La réponse de {first} arrivera dans votre messagerie Céleste.</p>
              <Link href="/decouvrir" className={styles.textLink}>
                Découvrir d&apos;autres prestataires
              </Link>
            </div>
          ) : mode ? (
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                setSent(mode);
              }}
            >
              <strong className={styles.formTitle}>{title}</strong>
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

              {mode === "message" ? (
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
              ) : (
                <div className={styles.row2}>
                  <label className="field">
                    {mode === "visit" ? "Date de visite" : mode === "tasting" ? "Date de dégustation" : mode === "trial" ? "Date de l'essai" : "Date souhaitée"}
                    <input type="date" name="creneau" required />
                  </label>
                  <label className="field">
                    Moment
                    <select name="moment" defaultValue="apres-midi">
                      <option value="matin">Matin</option>
                      <option value="apres-midi">Après-midi</option>
                      <option value="soir">Soir</option>
                    </select>
                  </label>
                </div>
              )}

              {mode === "tasting" && (
                <label className="field">
                  Nombre de personnes à la dégustation
                  <input type="number" name="personnes" min={1} max={6} defaultValue={2} />
                </label>
              )}

              <label className="field">
                {mode === "message" ? "Message" : "Un mot pour " + first + " (facultatif)"}
                <textarea name="message" placeholder={`Bonjour ${first}, nous nous marions…`} required={mode === "message"} />
              </label>
              <button type="submit" className="btn btn-block">
                {submit}
              </button>
              <p className={styles.small}>{isPrimary ? actions.primary.note : `Sans engagement. Votre espace Céleste est créé à l'envoi.`}</p>
              <button type="button" className={styles.cancel} onClick={() => setMode(null)}>
                Annuler
              </button>
            </form>
          ) : (
            <>
              <button type="button" className="btn btn-block" onClick={() => setMode(actions.primary.kind)}>
                {actions.primary.label}
              </button>
              <button type="button" className={`btn btn-outline btn-block ${styles.second}`} onClick={() => setMode(actions.secondary.kind)}>
                {actions.secondary.label}
              </button>
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
          <button type="button" className="btn btn-sm" onClick={() => openContact(actions.primary.kind)}>
            {actions.primary.label}
          </button>
        </div>
      )}
    </>
  );
}
