"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { priceLabel, type Vendor } from "@/lib/content";
import { proposeAppointment, sendMessage } from "@/lib/deal";
import { paymentRule } from "@/lib/settings";
import { SlotPicker } from "./SlotPicker";
import { registerCoupleFromContact, useSession } from "@/lib/session";
import { newWedding, useWedding, type AppointmentKind } from "@/lib/wedding";
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

const KIND: Record<Exclude<Mode, "message">, AppointmentKind> = { visit: "Visite", tasting: "Dégustation", trial: "Essai", meeting: "Rendez-vous" };

type ContactRequest = { kind: Mode; formule?: string };

// Ouvre la carte de contact sur une action précise depuis n'importe quel bouton de la page,
// avec la formule choisie le cas échéant (elle est reprise dans le message).
export function openContact(kind: Mode, formule?: string) {
  window.dispatchEvent(new CustomEvent<ContactRequest>("celeste:contact", { detail: { kind, formule } }));
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ContactButton({ kind, formule, className, children }: { kind: Mode; formule?: string; className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => openContact(kind, formule)}>
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
  const [formule, setFormule] = useState<string | null>(null);
  // Règles de paiement réglables depuis le back-office : lues après le montage pour ne pas gêner l'hydratation.
  const [rules, setRules] = useState({ deposit: 30, balance: "le solde en 1 à 3 fois" });
  useEffect(() => setRules(paymentRule()), []);
  const { wedding, create, update } = useWedding();
  // Couple déjà connecté : on écrit en son nom, sans redemander prénom, e-mail ni date.
  const { session } = useSession();
  const signedIn = session?.role === "couple" && !!wedding;
  const first = person.firstName;

  useEffect(() => {
    const on = (e: Event) => {
      const { kind, formule: f } = (e as CustomEvent<ContactRequest>).detail;
      setMode(kind);
      setFormule(f ?? null);
    };
    window.addEventListener("celeste:contact", on);
    return () => window.removeEventListener("celeste:contact", on);
  }, []);

  const isPrimary = mode === actions.primary.kind;
  const title = mode === null ? "" : isPrimary ? actions.primary.title : mode === "message" ? `Votre message à ${first}` : `Rencontrer ${first}`;
  const submit = isPrimary ? actions.primary.submit : mode === "message" ? `Envoyer à ${first}` : "Proposer ce créneau";
  const chosen = v.packages.find((p) => p.name === formule);
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
              <Link href={`/espace/messages?c=${v.slug}`} className="btn btn-sm">
                Voir la conversation
              </Link>
              <Link href="/decouvrir" className={styles.textLink}>
                Découvrir d&apos;autres prestataires
              </Link>
            </div>
          ) : mode ? (
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const people = Number(f.get("personnes")) || 0;
                const text = [mode === "message" && chosen ? `Formule « ${chosen.name} ».` : "", String(f.get("message") ?? "").trim(), mode === "tasting" && people ? `Nous serons ${people} à la dégustation.` : ""].filter(Boolean).join(" ");
                // L'espace Céleste est créé à l'envoi, avec ce qui vient d'être saisi : la conversation y attend la réponse (CDC §3, §11).
                // Visiteur : son compte couple est créé (ou retrouvé) et connecté ; l'espace est créé s'il n'existe pas.
                if (!signedIn) {
                  const firstName = String(f.get("prenom") ?? "").trim();
                  const email = String(f.get("email") ?? "").trim();
                  const has = registerCoupleFromContact(email, firstName);
                  if (!has) create(newWedding({ firstName, email, date: String(f.get("date") ?? "") || undefined, guests: Number(f.get("invites")) || undefined }));
                }
                if (mode === "message") update((x) => sendMessage(x, v.slug, { text }));
                else update((x) => proposeAppointment(x, v.slug, KIND[mode], `${f.get("creneau")}T${f.get("heure")}`, text));
                setSent(mode);
              }}
            >
              <strong className={styles.formTitle}>{title}</strong>
              {signedIn ? (
                <p className={styles.small}>Envoyé au nom de {session.name}, depuis votre espace Céleste.</p>
              ) : (
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
              )}

              {mode === "message" && signedIn ? null : mode === "message" ? (
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
                <SlotPicker
                  dateName="creneau"
                  timeName="heure"
                  dateLabel={mode === "visit" ? "Jour de la visite" : mode === "tasting" ? "Jour de la dégustation" : mode === "trial" ? "Jour de l'essai" : "Jour souhaité"}
                />
              )}

              {mode === "message" && chosen && (
                <div className={styles.formule}>
                  <span>
                    Formule <strong>{chosen.name}</strong> · {chosen.price.toLocaleString("fr-FR")} €
                  </span>
                  <button type="button" onClick={() => setFormule(null)} aria-label={`Retirer la formule ${chosen.name}`}>
                    Retirer
                  </button>
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
              <button
                type="button"
                className={styles.cancel}
                onClick={() => {
                  setMode(null);
                  setFormule(null);
                }}
              >
                Annuler
              </button>
            </form>
          ) : (
            <>
              <button type="button" className="btn btn-block" onClick={() => { setMode(actions.primary.kind); setFormule(null); }}>
                {actions.primary.label}
              </button>
              <button type="button" className={`btn btn-outline btn-block ${styles.second}`} onClick={() => { setMode(actions.secondary.kind); setFormule(null); }}>
                {actions.secondary.label}
              </button>
            </>
          )}

          <ul className={styles.reassure}>
            <li>Aucun compte pour explorer</li>
            <li>{rules.deposit} % d&apos;acompte pour bloquer la date</li>
            <li>{rules.balance.charAt(0).toUpperCase() + rules.balance.slice(1)}</li>
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
