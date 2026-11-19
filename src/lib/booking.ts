// Parcours de réservation (CDC §13.1, étapes 10 à 15) : contrat généré depuis la version acceptée,
// signature électronique, choix du mode de paiement, paiement, réservation confirmée, documents.
// Prototype : signature et paiement sont simulés. En production, Yousign ou équivalent (§13.2) et le
// prestataire de paiement confirmeront chaque étape côté serveur (§26), sans changer ce parcours.

import { getVendor } from "./content";
import { attachVendor, conversationOf, coupleNames, depositPaid, offerTotal, unreadCount, vendorFirstName, type Offer } from "./deal";
import { addDays, euros, formatDate, formatDay, isoDate, stamp } from "./format";
import { DEPOSIT_RATE, MAX_INSTALLMENTS } from "./settings";
import { personFor } from "./vendorDetail";
import type { Payment, Wedding } from "./wedding";

const uid = () => Math.random().toString(36).slice(2, 10);
const daysBetween = (a: string, b: string) => Math.round((new Date(`${b}T12:00`).getTime() - new Date(`${a}T12:00`).getTime()) / 86_400_000);

/* ---------- Mode de paiement (§14.1) ---------- */

// Nombre d'échéances possibles pour le solde : au moins un mois entre deux échéances, sinon le paiement
// en plusieurs fois n'a pas de sens (mariage proche). Toujours au moins une.
export function maxInstallments(weddingDate: string, today = isoDate()) {
  const days = daysBetween(addDays(today, 30), addDays(weddingDate, -30));
  return Math.min(MAX_INSTALLMENTS, Math.max(1, Math.floor(days / 30) + 1));
}

export type PayMode = "once" | "split";
export type Installment = { label: string; amount: number; due: string };

// En une fois aujourd'hui, ou 30 % d'acompte aujourd'hui puis le solde en 1 à 3 échéances, réparties
// entre un mois après la réservation et un mois avant le mariage (resserrées si le mariage est proche).
export function scheduleFor(weddingDate: string, amount: number, mode: PayMode = "split", installments = 1, today = isoDate()): Installment[] {
  if (mode === "once") return [{ label: "Paiement intégral", amount, due: today }];
  const n = Math.min(Math.max(1, Math.round(installments)), maxInstallments(weddingDate, today));
  const deposit = Math.round(amount * DEPOSIT_RATE);
  const rest = amount - deposit;
  const tomorrow = addDays(today, 1);
  const monthBefore = addDays(weddingDate, -30);
  const end = monthBefore > tomorrow ? monthBefore : tomorrow;
  const monthAfter = addDays(today, 30);
  const start = monthAfter < end ? monthAfter : end;
  const span = daysBetween(start, end);
  const base = Math.floor(rest / n);
  return [
    { label: `Acompte ${Math.round(DEPOSIT_RATE * 100)} %`, amount: deposit, due: today },
    ...Array.from({ length: n }, (_, i) => ({
      label: n === 1 ? "Solde" : `Échéance ${i + 1} sur ${n}`,
      amount: i === n - 1 ? rest - base * (n - 1) : base,
      due: n === 1 ? end : addDays(start, Math.round((span * i) / (n - 1))),
    })),
  ];
}

/* ---------- État d'une réservation ---------- */

export type BookingStep = "contrat" | "paiement" | "confirmee";

// Une réservation existe dès qu'une offre est acceptée. Elle est confirmée quand le premier paiement
// (acompte ou paiement intégral) est réglé (§13.1, étape 14).
export function bookingFor(w: Wedding, slug: string) {
  const offer = conversationOf(w, slug)?.offers.find((o) => o.status === "acceptee");
  if (!offer) return null;
  const contract = [...w.documents].reverse().find((d) => d.vendorSlug === slug && d.kind === "Contrat");
  const payments = w.payments.filter((p) => p.vendorSlug === slug).sort((a, b) => a.due.localeCompare(b.due));
  const confirmed = depositPaid(w, slug);
  const signed = contract?.status === "Signé";
  const step: BookingStep = confirmed ? "confirmee" : signed ? "paiement" : "contrat";
  return { slug, offer, total: offerTotal(offer), contract, payments, signed, confirmed, step };
}

export const pendingBookings = (w: Wedding) =>
  w.conversations.map((c) => bookingFor(w, c.vendorSlug)).filter((b): b is NonNullable<ReturnType<typeof bookingFor>> => !!b && !b.confirmed);

/* ---------- Contrat (§13.2) ---------- */

// Contenu généré depuis la version figée de l'offre. Les clauses qui dépendent de validations juridiques
// (§14.3, §14.4, §21, §32) restent marquées « à valider » : le front n'invente ni barème, ni frais, ni TVA.
export function contractFor(w: Wedding, slug: string, offer: Offer) {
  const v = getVendor(slug);
  const person = v ? personFor(v) : undefined;
  return {
    title: `Contrat de prestation · ${v?.name ?? slug}`,
    reference: `CEL-${offer.id.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}-V${offer.version}`,
    parties: [
      { role: "Les mariés", name: coupleNames(w), detail: w.email },
      { role: "Le prestataire", name: v?.name ?? slug, detail: person ? `Représenté par ${person.firstName} ${person.lastName}` : "" },
    ],
    object: `${offer.name}, pour le mariage du ${formatDate(w.date)}, établi à partir de l'offre version ${offer.version} acceptée dans Céleste.`,
    lines: offer.lines,
    total: offerTotal(offer),
    payment: `Paiement via Céleste, selon le mode choisi à l'étape suivante : en une fois, ou acompte de ${Math.round(DEPOSIT_RATE * 100)} % puis solde en 1 à ${MAX_INSTALLMENTS} échéances.`,
    pending: [
      { title: "Annulation et remboursement", text: "Barème d'annulation et cas de force majeure." },
      { title: "Médiation et litiges", text: "Procédure de médiation Céleste et obligations légales applicables." },
      { title: "Facturation", text: "Mentions de TVA et rôle d'intermédiaire de Céleste." },
    ],
  };
}

/* ---------- Actions ---------- */

// Message de Céleste dans la conversation. Il ne marque pas comme lus des messages du prestataire pas encore vus.
function sayCeleste(w: Wedding, slug: string, text: string, at: string): Wedding {
  return {
    ...w,
    conversations: w.conversations.map((c) =>
      c.vendorSlug === slug ? { ...c, readAt: unreadCount(c) ? c.readAt : at, messages: [...c.messages, { id: uid(), from: "celeste" as const, at, text }] } : c,
    ),
  };
}

// Signature électronique (§13.2), simulée : nom du signataire et horodatage gardés sur le document.
// Sans contrat enregistré (projet antérieur au parcours), il est généré au moment de signer.
export function signContract(w: Wedding, slug: string, signer: string, now = new Date()): Wedding {
  const b = bookingFor(w, slug);
  if (!b || b.signed || !signer.trim()) return w;
  const at = stamp(now);
  const signed = { status: "Signé" as const, signedBy: signer.trim(), signedAt: at };
  const next: Wedding = b.contract
    ? { ...w, documents: w.documents.map((d) => (d.id === b.contract!.id ? { ...d, ...signed } : d)) }
    : { ...w, documents: [...w.documents, { id: uid(), vendorSlug: slug, kind: "Contrat", label: `Contrat, offre « ${b.offer.name} » version ${b.offer.version}`, date: isoDate(now), ...signed }] };
  return sayCeleste(next, slug, `Contrat signé électroniquement par ${signer.trim()}. Dernière étape : le paiement, pour confirmer la réservation.`, at);
}

// Premier paiement réglé : réservation confirmée, échéancier créé selon le mode choisi, facture disponible.
export function confirmBooking(w: Wedding, slug: string, mode: PayMode, installments: number, last4: string, now = new Date()): Wedding {
  const b = bookingFor(w, slug);
  if (!b || !b.signed || b.confirmed) return w;
  const today = isoDate(now);
  const at = stamp(now);
  const schedule = scheduleFor(w.date, b.total, mode, installments, today);
  const payments: Payment[] = schedule.map((s, i) => ({ id: uid(), vendorSlug: slug, ...s, paid: i === 0, ...(i === 0 ? { paidAt: at, method: `Carte •••• ${last4}` } : {}) }));
  let next = attachVendor(w, slug, "reserve");
  next = {
    ...next,
    vendors: next.vendors.map((v) => (v.vendorSlug === slug ? { ...v, status: "reserve" as const } : v)),
    // Un échéancier provisoire non réglé (offre acceptée avant ce parcours) est remplacé par celui choisi.
    payments: [...next.payments.filter((p) => p.vendorSlug !== slug || p.paid), ...payments],
    documents: [...next.documents, { id: uid(), vendorSlug: slug, kind: "Facture" as const, label: mode === "once" ? "Facture, paiement intégral" : "Facture d'acompte", date: today, status: "Payée" as const }],
  };
  const upcoming = payments.slice(1);
  const v = getVendor(slug);
  return sayCeleste(
    next,
    slug,
    `Réservation confirmée : ${v?.name ?? vendorFirstName(slug)} est réservé pour le ${formatDate(w.date)}. ${euros(schedule[0].amount)} réglés.${upcoming.length ? ` Prochaine échéance : ${euros(upcoming[0].amount)} le ${formatDay(upcoming[0].due)}.` : ""}`,
    at,
  );
}

// Échéance suivante réglée depuis le budget.
export function payInstallment(w: Wedding, paymentId: string, last4: string, now = new Date()): Wedding {
  const p = w.payments.find((x) => x.id === paymentId);
  if (!p || p.paid || needsSignature(w, p.vendorSlug)) return w;
  const at = stamp(now);
  const next: Wedding = {
    ...w,
    payments: w.payments.map((x) => (x.id === p.id ? { ...x, paid: true, paidAt: at, method: `Carte •••• ${last4}` } : x)),
    documents: [...w.documents, { id: uid(), vendorSlug: p.vendorSlug, kind: "Facture", label: `Facture, ${p.label.toLowerCase()}`, date: isoDate(now), status: "Payée" }],
  };
  // Premier paiement d'un prestataire : la réservation devient confirmée.
  return depositPaid(next, p.vendorSlug) && !depositPaid(w, p.vendorSlug)
    ? { ...next, vendors: next.vendors.map((v) => (v.vendorSlug === p.vendorSlug ? { ...v, status: "reserve" } : v)) }
    : next;
}

// Réservation en attente dont le contrat n'est pas signé : aucun paiement avant la signature (§13.1).
export function needsSignature(w: Wedding, slug: string) {
  const b = bookingFor(w, slug);
  return !!b && !b.confirmed && !b.signed;
}

/* ---------- Carte (simulation) ---------- */

// Carte de test qui simule un refus de la banque (cas de recette « paiement refusé », §Phase 6).
export const REFUSED_TEST_CARD = "4000000000000002";

export type CardInput = { number: string; expiry: string; cvc: string; name: string };
export type CardError = { field: keyof CardInput; message: string };

function luhn(digits: string) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

// Contrôle de forme seulement : en production, la saisie se fait dans le formulaire du prestataire de
// paiement et aucun numéro de carte ne transite par Céleste.
export function checkCard(c: CardInput, now = new Date()): CardError | null {
  const digits = c.number.replace(/\D/g, "");
  if (!c.name.trim()) return { field: "name", message: "Indiquez le nom inscrit sur la carte." };
  if (digits.length < 13 || digits.length > 19 || !luhn(digits)) return { field: "number", message: "Ce numéro de carte n'est pas valide." };
  const m = c.expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/);
  const month = m ? Number(m[1]) : 0;
  const year = m ? 2000 + Number(m[2]) : 0;
  if (!m || month < 1 || month > 12 || year * 12 + month < now.getFullYear() * 12 + now.getMonth() + 1) return { field: "expiry", message: "La date d'expiration n'est pas valide." };
  if (!/^\d{3,4}$/.test(c.cvc)) return { field: "cvc", message: "Le code de sécurité compte 3 ou 4 chiffres." };
  return null;
}
