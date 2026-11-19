// Messagerie et Deal Room (CDC §11) : conversations, offres versionnées et négociation, dans le même
// projet de mariage que le budget et le planning. Accepter une offre, proposer un rendez-vous ou recevoir
// une nouvelle version met donc à jour tout le reste sans ressaisie (§3).
// Prototype : les réponses du prestataire sont simulées (voir `respond`). En production, elles viendront
// de l'espace prestataire (§30.2) via l'API et les notifications (§25).

import { getVendor } from "./content";
import { addDays, euros, formatDate, formatDay, formatTime, formatWeekday, isoDate, stamp } from "./format";
import { DATE_HOLD_HOURS, OFFER_VALIDITY_DAYS } from "./settings";
import { personFor } from "./vendorDetail";
import type { Appointment, AppointmentKind, VendorStatus, Wedding } from "./wedding";

/* ---------- Types ---------- */

// Liste technique unique des états d'une offre (§11.2). « Adaptée » ou « négociée » ne sont pas des états :
// ce sont une nouvelle version ou l'état « en discussion ».
export type OfferStatus = "brouillon" | "envoyee" | "vue" | "en-discussion" | "revisee" | "acceptee" | "confirmee" | "refusee" | "expiree" | "retiree";

// Libellés vus par le couple : la liste technique ne change pas, seul le vocabulaire s'adapte au lecteur.
export const OFFER_LABEL: Record<OfferStatus, string> = {
  brouillon: "Brouillon",
  envoyee: "Offre reçue",
  vue: "Offre reçue",
  "en-discussion": "En discussion",
  revisee: "Nouvelle version",
  acceptee: "Acceptée",
  confirmee: "Réservation confirmée",
  refusee: "Refusée",
  expiree: "Expirée",
  retiree: "Retirée",
};

// Libellés vus par le prestataire (espace pro) : même liste technique, vocabulaire de l'émetteur.
export const OFFER_LABEL_PRO: Record<OfferStatus, string> = {
  brouillon: "Brouillon",
  envoyee: "Envoyée",
  vue: "Vue",
  "en-discussion": "En discussion",
  revisee: "Révisée",
  acceptee: "Acceptée",
  confirmee: "Réservation confirmée",
  refusee: "Refusée",
  expiree: "Expirée",
  retiree: "Retirée",
};

// Une ligne d'offre garde un prix clair (§11.3) : on la réduit (`reduced`) ou on la retire, on ne la brade pas.
export type OfferLine = { key: string; label: string; amount: number; removable?: boolean; reduced?: { label: string; amount: number } };

export type Offer = {
  id: string;
  version: number;
  name: string;
  lines: OfferLine[];
  status: OfferStatus;
  sentAt: string;
  validUntil: string; // AAAA-MM-JJ
  holdUntil?: string; // date bloquée pour le couple pendant la négociation (§14.5)
  acceptedAt?: string; // version figée à cet instant (§11.4)
};

export type MessageCard = { kind: "offre"; offerId: string } | { kind: "rdv"; appointmentId: string } | { kind: "fiche"; slug: string };

export type Message = {
  id: string;
  from: "couple" | "vendor" | "celeste";
  at: string;
  text: string;
  replyTo?: string; // réponse citée (§11.1)
  file?: { name: string; size: number };
  card?: MessageCard;
};

// Réponse du prestataire en attente (simulation) : gardée dans le projet pour survivre à un changement de page.
type Pending = { id: string; at: number; kind: "reply" | "adapt" | "rdv" | "decline"; target?: number; drop?: string[]; appointmentId?: string; retry?: boolean };

// readAt : lecture côté couple ; vendorReadAt : lecture côté prestataire (espace pro).
export type Conversation = { vendorSlug: string; messages: Message[]; offers: Offer[]; readAt: string; pending: Pending[]; vendorReadAt?: string };

/* ---------- Lecture ---------- */

const uid = () => Math.random().toString(36).slice(2, 10);
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

// Réservé ou terminé : la règle unique de ce qui compte comme réservé (réexportée par wedding.ts).
export const isBookedStatus = (s: VendorStatus) => s === "reserve" || s === "termine";

export const offerTotal = (o: { lines: OfferLine[] }) => o.lines.reduce((s, l) => s + l.amount, 0);
const OPEN: OfferStatus[] = ["envoyee", "vue", "en-discussion", "revisee"];
export const isOpen = (s: OfferStatus) => OPEN.includes(s);

export const vendorFirstName = (slug: string) => {
  const v = getVendor(slug);
  return v ? personFor(v).firstName : "le prestataire";
};
export const coupleNames = (w: Wedding) => w.names.filter(Boolean).join(" et ");

export const conversationOf = (w: Wedding, slug: string) => w.conversations.find((c) => c.vendorSlug === slug);
export const latestOffer = (c?: Conversation) => c?.offers.reduce<Offer | undefined>((a, o) => (!a || o.version > a.version ? o : a), undefined);
export const lastMessage = (c: Conversation) => c.messages[c.messages.length - 1];
export const unreadCount = (c: Conversation) => c.messages.filter((m) => m.from !== "couple" && m.at > c.readAt).length;
export const totalUnread = (w: Wedding) => w.conversations.reduce((s, c) => s + unreadCount(c), 0);
export const isTyping = (c: Conversation) => c.pending.length > 0;

// Premier paiement réglé = acompte (ou paiement intégral) : la réservation est confirmée (§11.2, §13.1).
// Règle unique, reprise par booking.ts.
export function depositPaid(w: Wedding, slug: string) {
  const first = w.payments.filter((p) => p.vendorSlug === slug).sort((a, b) => a.due.localeCompare(b.due))[0];
  return !!first?.paid;
}

// État affiché. « Expirée » et « Réservation confirmée » sont déduits de la date et de l'acompte,
// jamais stockés : aucune donnée à resynchroniser.
export function offerStatus(w: Wedding, slug: string, o: Offer, today = isoDate()): OfferStatus {
  if (o.status === "acceptee" && depositPaid(w, slug)) return "confirmee";
  if (isOpen(o.status) && o.validUntil < today) return "expiree";
  return o.status;
}

// Offre de référence d'un prestataire : la version acceptée, figée (§11.4), sinon la dernière reçue.
// Budget, Mes prestataires et Cockpit lisent tous cette valeur.
export function offerOf(w: Wedding, slug?: string) {
  if (!slug) return undefined;
  const c = conversationOf(w, slug);
  const o = c?.offers.find((x) => x.status === "acceptee") ?? latestOffer(c);
  if (!o) return undefined;
  return { offer: o, total: offerTotal(o), status: offerStatus(w, slug, o) };
}

// Une offre peut être acceptée si c'est la dernière version, encore ouverte et non expirée.
export function canAnswer(w: Wedding, slug: string, o: Offer) {
  const c = conversationOf(w, slug);
  return latestOffer(c)?.id === o.id && isOpen(offerStatus(w, slug, o));
}

/* ---------- Comparaison de versions (§11.4) ---------- */

export type Change = { kind: "retire" | "modifie" | "ajoute"; label: string; to?: string; delta: number };

export function offerChanges(prev: Offer, next: { lines: OfferLine[] }): Change[] {
  const out: Change[] = [];
  for (const a of prev.lines) {
    const b = next.lines.find((l) => l.key === a.key);
    if (!b) out.push({ kind: "retire", label: a.label, delta: -a.amount });
    else if (b.label !== a.label || b.amount !== a.amount) out.push({ kind: "modifie", label: a.label, to: b.label, delta: b.amount - a.amount });
  }
  for (const b of next.lines) if (!prev.lines.some((a) => a.key === b.key)) out.push({ kind: "ajoute", label: b.label, delta: b.amount });
  return out;
}

const describeChange = (c: Change) =>
  c.kind === "retire" ? `sans ${lc(c.label)}` : c.kind === "ajoute" ? `avec ${lc(c.label)}` : c.to === c.label ? `${lc(c.label)} ajusté` : `${lc(c.to!)} au lieu de ${lc(c.label)}`;

/* ---------- Négociation intelligente (§11.3) ---------- */

export type AdaptRequest = { target?: number; drop: string[]; note?: string };

// Le prestataire adapte le contenu plutôt que le prix : il réduit d'abord ce qui peut l'être (durée, niveau
// de service), puis retire des options, jusqu'à entrer dans le budget indiqué. Le prix de chaque ligne ne bouge pas.
export function adaptLines(lines: OfferLine[], req: { target?: number; drop: string[] }) {
  let next = lines.map((l) => ({ ...l }));
  const apply = (key: string) => {
    const l = next.find((x) => x.key === key);
    if (!l) return false;
    if (l.reduced) {
      const r = l.reduced;
      next = next.map((x) => (x.key === key ? { key, label: r.label, amount: r.amount, removable: l.removable } : x));
      return true;
    }
    if (l.removable) {
      next = next.filter((x) => x.key !== key);
      return true;
    }
    return false;
  };
  const total = () => next.reduce((s, l) => s + l.amount, 0);
  for (const k of req.drop) apply(k);
  while (req.target !== undefined && total() > req.target) {
    const reducible = next.filter((l) => l.reduced).sort((a, b) => b.amount - b.reduced!.amount - (a.amount - a.reduced!.amount))[0];
    const removable = next.filter((l) => l.removable && !l.reduced).sort((a, b) => b.amount - a.amount)[0];
    const pick = reducible ?? removable;
    if (!pick || !apply(pick.key)) break;
  }
  return { lines: next, total: total(), reachable: req.target === undefined || total() <= req.target };
}

/* ---------- Anti-contournement (§22) ---------- */

// Détection automatique de motifs, sans lecture humaine (§22.1). Réaction choisie : avertissement contextuel
// seulement ; le masquage avant réservation (§22.2) attend la règle retenue par Céleste.
const CONTACT_PATTERNS: [RegExp, string][] = [
  [/[\w.+-]+@[\w-]+\.[\w.]+/, "une adresse e-mail"],
  [/(?:\+33\s?|\b0)[1-9](?:[\s.-]?\d{2}){4}\b/, "un numéro de téléphone"],
  [/https?:\/\/|www\.|\b[\w-]+\.(?:fr|com|net|org|io|be)\b/i, "un lien externe"],
  [/whats ?app|telegram|instagram|hors c[ée]leste|en direct|virement direct|en liquide|esp[èe]ces/i, "une invitation à continuer hors de Céleste"],
];

export function detectContact(text: string) {
  return CONTACT_PATTERNS.find(([r]) => r.test(text))?.[1] ?? null;
}

/* ---------- Actions du couple ---------- */

function withConv(w: Wedding, slug: string, fn: (c: Conversation) => Conversation): Wedding {
  const list = w.conversations.some((c) => c.vendorSlug === slug)
    ? w.conversations
    : [...w.conversations, { vendorSlug: slug, messages: [], offers: [], readAt: "", pending: [] }];
  return { ...w, conversations: list.map((c) => (c.vendorSlug === slug ? fn(c) : c)) };
}

// Écrire à un prestataire l'inscrit dans « Mes prestataires » si son métier est encore à rechercher (§3, §5.4).
// Le réserver l'y inscrit toujours : à la place d'un prestataire non réservé du même métier, sinon à côté
// (deux musiciens, par exemple), pour que budget et échéancier restent cohérents.
export function attachVendor(w: Wedding, slug: string, status: VendorStatus = "conversation"): Wedding {
  const v = getVendor(slug);
  if (!v || w.vendors.some((x) => x.vendorSlug === slug)) return w;
  const pv = w.vendors.find((x) => x.category === v.category && !x.vendorSlug) ?? w.vendors.find((x) => x.category === v.category);
  const add = { ...w, vendors: [...w.vendors, { category: v.category, vendorSlug: slug, status }] };
  if (!pv) return add;
  // Un prestataire réservé, ou dont l'offre est acceptée, garde sa place : le nouveau s'ajoute à côté.
  const committed = !!pv.vendorSlug && (isBookedStatus(pv.status) || !!conversationOf(w, pv.vendorSlug)?.offers.some((o) => o.status === "acceptee"));
  if (committed) return status === "conversation" ? w : add;
  if (pv.vendorSlug && status === "conversation") return w;
  return { ...w, vendors: w.vendors.map((x) => (x === pv ? { ...x, vendorSlug: slug, status } : x)) };
}

function setVendorStatus(w: Wedding, slug: string, status: VendorStatus, onlyFrom?: VendorStatus) {
  return { ...w, vendors: w.vendors.map((x) => (x.vendorSlug === slug && (!onlyFrom || x.status === onlyFrom) ? { ...x, status } : x)) };
}

const later = (now: Date, ms: number) => now.getTime() + ms;

// Le prestataire a pris la main depuis son espace : plus aucune réponse simulée pour lui.
const isManual = (w: Wedding, slug: string) => !!w.manualVendors?.includes(slug);
function autoReplies(w: Wedding, slug: string): Wedding {
  return isManual(w, slug) ? { ...w, conversations: w.conversations.map((c) => (c.vendorSlug === slug ? { ...c, pending: [] } : c)) } : w;
}

export type Draft = { text: string; replyTo?: string; file?: { name: string; size: number }; card?: MessageCard };

export function sendMessage(w: Wedding, slug: string, d: Draft, now = new Date()): Wedding {
  const at = stamp(now);
  const next = withConv(w, slug, (c) => ({
    ...c,
    readAt: at,
    messages: [...c.messages, { id: uid(), from: "couple", at, ...d }],
    pending: c.pending.some((p) => p.kind === "reply") ? c.pending : [...c.pending, { id: uid(), at: later(now, 2600), kind: "reply" }],
  }));
  return autoReplies(attachVendor(next, slug), slug);
}

export function markRead(w: Wedding, slug: string, now = new Date()): Wedding {
  const c = conversationOf(w, slug);
  if (!c || !unreadCount(c)) return w;
  return withConv(w, slug, (x) => ({ ...x, readAt: stamp(now) }));
}

// Indiquer son budget ou demander une adaptation (§11.3) : l'offre passe « en discussion ».
export function requestAdaptation(w: Wedding, slug: string, req: AdaptRequest, now = new Date()): Wedding {
  const o = latestOffer(conversationOf(w, slug));
  if (!o) return w;
  const parts: string[] = [];
  if (req.target) parts.push(`Notre budget pour ce poste est de ${euros(req.target)}.`);
  const named = req.drop
    .map((k) => o.lines.find((l) => l.key === k))
    .filter((l): l is OfferLine => !!l)
    .map((l) => (l.reduced ? `${lc(l.label)} (une version plus courte nous irait)` : lc(l.label)));
  if (named.length) parts.push(`Nous pourrions nous passer de : ${named.join(", ")}.`);
  if (req.note?.trim()) parts.push(req.note.trim());
  if (!parts.length) parts.push("Pourriez-vous nous envoyer une version à jour de l'offre ?");
  const at = stamp(now);
  return autoReplies(withConv(w, slug, (c) => ({
    ...c,
    readAt: at,
    offers: c.offers.map((x) => (x.id === o.id && isOpen(x.status) ? { ...x, status: "en-discussion" } : x)),
    messages: [...c.messages, { id: uid(), from: "couple", at, text: parts.join(" ") }],
    // Une nouvelle demande remplace la précédente : une seule version adaptée en retour.
    pending: [...c.pending.filter((p) => p.kind !== "reply" && p.kind !== "adapt"), { id: uid(), at: later(now, 3400), kind: "adapt", target: req.target, drop: req.drop }],
  })), slug);
}

// Offre finale acceptée (§13.1, étapes 8 à 10) : version figée et contrat généré. La réservation n'est
// confirmée qu'après signature et premier paiement (étapes 11 à 14, voir booking.ts).
export function acceptOffer(w: Wedding, slug: string, offerId: string, now = new Date()): Wedding {
  const o = conversationOf(w, slug)?.offers.find((x) => x.id === offerId);
  const today = isoDate(now);
  if (!o || !canAnswer(w, slug, o)) return w;
  const at = stamp(now);
  let next = withConv(w, slug, (c) => ({
    ...c,
    readAt: at,
    offers: c.offers.map((x) => (x.id === o.id ? { ...x, status: "acceptee", acceptedAt: at } : x)),
    // Accepter clôt la négociation : une adaptation encore attendue n'a plus lieu d'être.
    pending: c.pending.filter((p) => p.kind !== "adapt"),
    messages: [
      ...c.messages,
      { id: uid(), from: "couple", at, text: `Nous acceptons l'offre « ${o.name} », version ${o.version}.`, card: { kind: "offre", offerId: o.id } },
      {
        id: uid(),
        from: "celeste",
        at,
        text: `Version ${o.version} acceptée et figée pour le contrat. Pour confirmer la réservation : signez le contrat, puis réglez l'acompte ou la totalité.`,
      },
    ],
  }));
  next = setVendorStatus(attachVendor(next, slug, "offre"), slug, "offre", "conversation");
  return {
    ...next,
    documents: [...next.documents, { id: uid(), vendorSlug: slug, kind: "Contrat", label: `Contrat, offre « ${o.name} » version ${o.version}`, date: today, status: "À signer" }],
  };
}

export function declineOffer(w: Wedding, slug: string, offerId: string, now = new Date()): Wedding {
  const o = conversationOf(w, slug)?.offers.find((x) => x.id === offerId);
  if (!o || !canAnswer(w, slug, o)) return w;
  const at = stamp(now);
  const next = withConv(w, slug, (c) => ({
    ...c,
    readAt: at,
    offers: c.offers.map((x) => (x.id === offerId ? { ...x, status: "refusee" } : x)),
    messages: [...c.messages, { id: uid(), from: "couple", at, text: "Merci pour votre proposition. Nous avons décidé de ne pas y donner suite." }],
    pending: [...c.pending.filter((p) => p.kind !== "adapt"), { id: uid(), at: later(now, 2600), kind: "decline" }],
  }));
  return autoReplies(setVendorStatus(next, slug, "conversation", "offre"), slug);
}

const ARTICLE: Record<AppointmentKind, string> = { Visite: "une visite", "Rendez-vous": "un rendez-vous", Dégustation: "une dégustation", Essai: "un essai" };

// Demande de créneau (§12) : le prestataire accepte ou propose une alternative.
export function proposeAppointment(w: Wedding, slug: string, kind: AppointmentKind, date: string, note = "", now = new Date()): Wedding {
  const id = uid();
  const at = stamp(now);
  const next = withConv({ ...w, appointments: [...w.appointments, { id, vendorSlug: slug, kind, date, status: "Demandée" }] }, slug, (c) => ({
    ...c,
    readAt: at,
    messages: [...c.messages, { id: uid(), from: "couple", at, text: note.trim() || `Nous aimerions organiser ${ARTICLE[kind]}. Ce créneau vous conviendrait-il ?`, card: { kind: "rdv", appointmentId: id } }],
    pending: [...c.pending.filter((p) => p.kind !== "reply"), { id: uid(), at: later(now, 3000), kind: "rdv", appointmentId: id }],
  }));
  return autoReplies(attachVendor(next, slug), slug);
}

// Le couple confirme le créneau alternatif, ou en demande un autre (§12, étapes 5 et 6).
export function answerSlot(w: Wedding, appointmentId: string, accept: boolean, now = new Date(), chosen?: string): Wedding {
  const found = w.appointments.find((x) => x.id === appointmentId);
  if (!found) return w;
  // Plusieurs créneaux proposés : le couple confirme celui qu'il choisit.
  const a = accept && chosen ? { ...found, date: chosen } : found;
  const at = stamp(now);
  const next = { ...w, appointments: w.appointments.map((x) => (x.id === a.id ? { ...a, alternatives: undefined, status: accept ? ("Confirmée" as const) : ("Demandée" as const) } : x)) };
  return autoReplies(withConv(next, a.vendorSlug, (c) => ({
    ...c,
    readAt: at,
    messages: [
      ...c.messages,
      accept
        ? { id: uid(), from: "couple", at, text: `Le ${formatWeekday(a.date)} à ${formatTime(a.date)} nous convient parfaitement.`, card: { kind: "rdv", appointmentId: a.id } }
        : { id: uid(), from: "couple", at, text: "Ce créneau ne nous arrange pas. Pourriez-vous nous en proposer un autre ?" },
    ],
    pending: accept ? c.pending : [...c.pending, { id: uid(), at: later(now, 3000), kind: "rdv", appointmentId: a.id, retry: true }],
  })), a.vendorSlug);
}

/* ---------- Actions du prestataire (espace pro, §30.2) ---------- */

const vendorStamp = (c: Conversation, at: string) => ({ ...c, vendorReadAt: at });

export function vendorMessage(w: Wedding, slug: string, text: string, now = new Date()): Wedding {
  const at = stamp(now);
  return withConv(w, slug, (c) => ({ ...vendorStamp(c, at), pending: c.pending.filter((p) => p.kind !== "reply"), messages: [...c.messages, { id: uid(), from: "vendor", at, text }] }));
}

// Messages du couple non lus par le prestataire. Sans repère enregistré : ceux qui suivent sa dernière réponse.
export function vendorUnread(c: Conversation) {
  const since = c.vendorReadAt ?? [...c.messages].reverse().find((m) => m.from === "vendor")?.at ?? "";
  return c.messages.filter((m) => m.from === "couple" && m.at > since).length;
}

export function markVendorRead(w: Wedding, slug: string, now = new Date()): Wedding {
  const c = conversationOf(w, slug);
  if (!c || !vendorUnread(c)) return w;
  return withConv(w, slug, (x) => vendorStamp(x, stamp(now)));
}

// Création ou révision d'une offre (§11.3) : nouvelle version, l'ancienne reste dans l'historique (§11.4).
export function vendorOffer(w: Wedding, slug: string, draft: { name: string; lines: OfferLine[] }, note: string, hold: boolean, now = new Date()): Wedding {
  const text = note.trim() || (latestOffer(conversationOf(w, slug)) ? "Voici une nouvelle version de l'offre." : "Voici ma proposition détaillée. Tout est ajustable.");
  const next = sendOffer(w, slug, draft, now, text, hold);
  return withConv(next, slug, (c) => ({ ...vendorStamp(c, stamp(now)), pending: c.pending.filter((p) => p.kind !== "adapt" && p.kind !== "reply") }));
}

export function withdrawOffer(w: Wedding, slug: string, offerId: string, now = new Date()): Wedding {
  const o = conversationOf(w, slug)?.offers.find((x) => x.id === offerId);
  if (!o || !isOpen(o.status)) return w;
  const at = stamp(now);
  const next = withConv(w, slug, (c) => ({
    ...vendorStamp(c, at),
    pending: c.pending.filter((p) => p.kind !== "adapt" && p.kind !== "reply"),
    offers: c.offers.map((x) => (x.id === offerId ? { ...x, status: "retiree", holdUntil: undefined } : x)),
    messages: [...c.messages, { id: uid(), from: "vendor", at, text: `J'ai retiré la version ${o.version} de l'offre.` }],
  }));
  return setVendorStatus(next, slug, "conversation", "offre");
}

// Réponse à une demande de créneau (§12) : accepter, ou proposer une alternative.
export function vendorAnswerSlot(w: Wedding, appointmentId: string, alternatives?: string | string[], now = new Date()): Wedding {
  const a = w.appointments.find((x) => x.id === appointmentId);
  if (!a) return w;
  const at = stamp(now);
  const alts = (Array.isArray(alternatives) ? alternatives : alternatives ? [alternatives] : []).filter(Boolean).sort();
  const answered: Appointment = alts.length ? { ...a, date: alts[0], alternatives: alts, status: "Créneau alternatif proposé" } : { ...a, alternatives: undefined, status: "Confirmée" };
  const text = alts.length ? slotProposal(alts) : `C'est confirmé pour le ${formatWeekday(a.date)} à ${formatTime(a.date)}. À très vite !`;
  const next = { ...w, appointments: w.appointments.map((x) => (x.id === a.id ? answered : x)) };
  return withConv(next, a.vendorSlug, (c) => ({
    ...vendorStamp(c, at),
    pending: c.pending.filter((p) => p.appointmentId !== a.id),
    messages: [...c.messages, { id: uid(), from: "vendor", at, text, card: { kind: "rdv", appointmentId: a.id } }],
  }));
}

// « Répondre moi-même » : coupe les réponses simulées pour ce prestataire et annule celles en attente.
export function setManualVendor(w: Wedding, slug: string, on: boolean): Wedding {
  const list = new Set(w.manualVendors ?? []);
  if (on) list.add(slug);
  else list.delete(slug);
  return autoReplies({ ...w, manualVendors: [...list] }, slug);
}

/* ---------- Réponses du prestataire (simulation) ---------- */

export const hasPending = (w: Wedding) => w.conversations.some((c) => c.pending.length > 0);
export const nextPendingAt = (w: Wedding) => Math.min(...w.conversations.flatMap((c) => c.pending.map((p) => p.at)));

export function resolvePending(w: Wedding, nowMs = Date.now()): Wedding {
  let next = w;
  for (const c of w.conversations) for (const p of c.pending) if (p.at <= nowMs) next = respond(next, c.vendorSlug, p);
  return next;
}

const GENERIC_REPLIES = [
  "Merci pour votre message ! Je regarde cela et je reviens vers vous très vite.",
  "Bien noté, merci. N'hésitez pas si vous avez d'autres questions.",
  "Avec plaisir. Je reste disponible ici pour ajuster ce qu'il faut.",
];

function replyText(w: Wedding, c: Conversation) {
  const last = [...c.messages].reverse().find((m) => m.from === "couple");
  const t = (last?.text ?? "").toLowerCase();
  if (last?.file) return `Merci pour « ${last.file.name} », je le regarde attentivement.`;
  if (last?.card?.kind === "fiche") return `Merci du partage, je vais regarder la fiche de ${getVendor(last.card.slug)?.name ?? "ce prestataire"}.`;
  if (/budget|prix|tarif|cher|remise|réduc/.test(t)) return "Bien noté. Le plus simple : indiquez votre budget depuis l'offre. Je vous prépare une version adaptée, en ajustant la durée ou les options plutôt que la qualité.";
  if (/dispo|date|libre/.test(t)) return `Bonne nouvelle : le ${formatDate(w.date)} est encore libre de mon côté.`;
  return GENERIC_REPLIES[c.messages.filter((m) => m.from === "vendor").length % GENERIC_REPLIES.length];
}

// Première offre d'un prestataire, construite à partir de sa formule intermédiaire : la prestation principale
// porte l'essentiel du prix, le premier élément annexe est inclus, les suivants sont des options chiffrées
// (environ 10 % chacune) que le couple peut retirer pendant la négociation (§11.3).
function firstOfferFor(w: Wedding, slug: string): { name: string; lines: OfferLine[] } | null {
  const v = getVendor(slug);
  const pkg = v?.packages[1] ?? v?.packages[0];
  if (!v || !pkg) return null;
  const perGuest = v.category === "traiteurs" || v.category === "patisserie";
  const price = perGuest ? pkg.price * w.guests : pkg.price;
  const [main, ...rest] = pkg.includes;
  const round = (n: number) => Math.round(n / 10) * 10;
  const option = round(price * 0.1);
  const mainAmount = price - option * Math.max(0, rest.length - 1);
  return {
    name: pkg.name,
    lines: [
      {
        key: "base",
        label: perGuest ? `${main}, ${w.guests} invités` : main,
        amount: mainAmount,
        reduced: { label: perGuest ? `${main}, ${w.guests} invités, formule allégée` : `${main}, formule allégée`, amount: round(mainAmount * 0.8) },
      },
      ...rest.map((label, i) => ({ key: `opt${i}`, label, amount: i === 0 ? 0 : option, removable: i > 0 })),
    ],
  };
}

function sendOffer(w: Wedding, slug: string, draft: { name: string; lines: OfferLine[] }, when: Date, text: string, hold = false): Wedding {
  const prev = latestOffer(conversationOf(w, slug));
  const offer: Offer = {
    id: uid(),
    version: (prev?.version ?? 0) + 1,
    name: draft.name,
    lines: draft.lines,
    status: prev ? "revisee" : "envoyee",
    sentAt: stamp(when),
    validUntil: addDays(isoDate(when), OFFER_VALIDITY_DAYS),
    ...(hold ? { holdUntil: stamp(new Date(when.getTime() + DATE_HOLD_HOURS * 3_600_000)) } : {}),
  };
  const next = withConv(w, slug, (c) => ({
    ...c,
    offers: [...c.offers, offer],
    messages: [...c.messages, { id: uid(), from: "vendor", at: stamp(when), text, card: { kind: "offre", offerId: offer.id } }],
  }));
  // Chaque version devient un document consultable et le prestataire passe en « Offre reçue » (§3, §5.4).
  return {
    ...setVendorStatus(next, slug, "offre", "conversation"),
    documents: [...next.documents, { id: uid(), vendorSlug: slug, kind: "Devis", label: `Offre « ${offer.name} », version ${offer.version}`, date: isoDate(when), status: "Reçu" }],
  };
}

const localMinute = (d: Date) => stamp(d).slice(0, 16);

// Le prestataire valide le créneau, ou en propose un autre (§12) : en dehors de 9 h à 19 h, le dimanche,
// ou quand le couple a demandé une nouvelle proposition.
// Message du prestataire qui propose un ou plusieurs créneaux.
function slotProposal(alts: string[]) {
  const list = alts.map((x) => `le ${formatWeekday(x)} à ${formatTime(x)}`);
  return alts.length === 1
    ? `Je ne suis pas disponible à ce moment-là. Je vous propose ${list[0]} : est-ce que cela vous convient ?`
    : `Je ne suis pas disponible à ce moment-là. Je vous propose ${list.slice(0, -1).join(", ")} ou ${list[list.length - 1]} : choisissez celui qui vous arrange.`;
}

function vendorSlot(a: Appointment, retry: boolean): Appointment {
  const d = new Date(a.date);
  const minutes = d.getHours() * 60 + d.getMinutes();
  if (!retry && d.getDay() !== 0 && minutes >= 9 * 60 && minutes <= 19 * 60) return { ...a, alternatives: undefined, status: "Confirmée" };
  // Deux créneaux au choix, les jours ouvrés suivants (§12 : un ou plusieurs créneaux alternatifs).
  const next = (from: Date, hours: number, mins: number) => {
    const x = new Date(from);
    x.setDate(x.getDate() + 1);
    if (x.getDay() === 0) x.setDate(x.getDate() + 1);
    x.setHours(hours, mins, 0, 0);
    return x;
  };
  const first = next(d, retry ? 11 : 17, retry ? 0 : 30);
  const second = next(first, retry ? 15 : 10, 0);
  const alts = [localMinute(first), localMinute(second)];
  return { ...a, date: alts[0], alternatives: alts, status: "Créneau alternatif proposé" };
}

function respond(w: Wedding, slug: string, p: Pending): Wedding {
  let next = withConv(w, slug, (c) => ({ ...c, pending: c.pending.filter((x) => x.id !== p.id) }));
  const c = conversationOf(next, slug)!;
  // Une réponse traitée en retard (couple hors de l'espace) ne doit pas passer avant des messages plus récents.
  const last = lastMessage(c);
  const when = new Date(Math.max(p.at, last ? new Date(last.at).getTime() + 1000 : 0));
  const at = stamp(when);
  const say = (text: string, card?: MessageCard) => (x: Conversation) => ({ ...x, messages: [...x.messages, { id: uid(), from: "vendor" as const, at, text, ...(card ? { card } : {}) }] });

  switch (p.kind) {
    case "reply": {
      next = withConv(next, slug, say(replyText(next, c)));
      const first = c.offers.length ? null : firstOfferFor(next, slug);
      if (first) next = sendOffer(next, slug, first, new Date(when.getTime() + 1000), "Voici une proposition détaillée pour votre mariage. Tout est ajustable : dites-moi ce qui compte le plus pour vous.");
      return next;
    }
    case "decline":
      return withConv(next, slug, say("C'est bien noté, merci pour votre retour. Je vous souhaite une très belle préparation !"));
    case "rdv": {
      const a = next.appointments.find((x) => x.id === p.appointmentId);
      if (!a) return next;
      const answered = vendorSlot(a, !!p.retry);
      next = { ...next, appointments: next.appointments.map((x) => (x.id === a.id ? answered : x)) };
      const text = answered.status === "Confirmée" ? `C'est confirmé pour le ${formatWeekday(answered.date)} à ${formatTime(answered.date)}. À très vite !` : slotProposal(answered.alternatives ?? [answered.date]);
      return withConv(next, slug, say(text, { kind: "rdv", appointmentId: a.id }));
    }
    case "adapt": {
      const o = latestOffer(c);
      // Offre déjà acceptée entre-temps : pas de nouvelle version.
      if (!o || c.offers.some((x) => x.status === "acceptee")) return next;
      const refresh = p.target === undefined && !p.drop?.length;
      const { lines, total, reachable } = adaptLines(o.lines, { target: p.target, drop: p.drop ?? [] });
      const changes = offerChanges(o, { lines });
      if (!refresh && !changes.length) {
        return withConv(next, slug, say(`Je ne peux pas alléger davantage sans dégrader la prestation : ${euros(offerTotal(o))} est mon offre la plus juste. Je reste disponible pour en parler.`));
      }
      const summary = changes.map(describeChange).join(", ");
      const text = refresh
        ? `Voici l'offre mise à jour, valable jusqu'au ${formatDay(addDays(isoDate(when), OFFER_VALIDITY_DAYS))}.`
        : reachable
          ? `Plutôt que de baisser mes tarifs, j'ai adapté la prestation : ${summary}. Le prix de chaque élément reste le même. Je bloque votre date ${DATE_HOLD_HOURS} h, le temps d'en discuter.`
          : `Voici le plus juste que je puisse proposer sans dégrader la prestation : ${summary}, soit ${euros(total)}. Je bloque votre date ${DATE_HOLD_HOURS} h, le temps d'en discuter.`;
      return sendOffer(next, slug, { name: o.name, lines }, when, text, !refresh);
    }
  }
}

/* ---------- Conversations de démonstration ---------- */

type Seed = { messages: Message[]; offers: Offer[] };

function seedFor(slug: string, w: Wedding, now: Date): Seed | null {
  const ago = (days: number, time: string) => `${addDays(isoDate(now), -days)}T${time}:00`;
  const first = vendorFirstName(slug);
  const names = coupleNames(w);
  const appt = (id: string) => w.appointments.find((a) => a.id === id && a.vendorSlug === slug);
  const m = (from: Message["from"], at: string, text: string, card?: MessageCard): Message => ({ id: uid(), from, at, text, ...(card ? { card } : {}) });

  switch (slug) {
    case "studio-aube": {
      const v1: Offer = {
        id: "o-aube-1",
        version: 1,
        name: "Journée complète",
        status: "en-discussion",
        sentAt: ago(6, "11:05"),
        validUntil: addDays(isoDate(now), 8),
        lines: [
          { key: "presence", label: "Présence de 10 h, des préparatifs à la première danse", amount: 1100, reduced: { label: "Présence de 8 h, de la cérémonie au dîner", amount: 900 } },
          { key: "photos", label: "500 photos retouchées et galerie en ligne", amount: 210 },
          { key: "album", label: "Album 30×30 cm, 40 pages", amount: 320, removable: true },
          { key: "seance", label: "Séance couple avant le mariage", amount: 180, removable: true },
        ],
      };
      const sent2 = ago(1, "17:42");
      const v2: Offer = {
        id: "o-aube-2",
        version: 2,
        name: "Journée, sans album",
        status: "revisee",
        sentAt: sent2,
        validUntil: addDays(isoDate(now), 13),
        holdUntil: stamp(new Date(new Date(sent2).getTime() + DATE_HOLD_HOURS * 3_600_000)),
        lines: [{ key: "presence", label: "Présence de 8 h, de la cérémonie au dîner", amount: 900 }, v1.lines[1], v1.lines[3]],
      };
      const a1 = appt("a1");
      return {
        offers: [v1, v2],
        messages: [
          m("couple", ago(6, "10:12"), `Bonjour ${first} ! Nous nous marions le ${formatDate(w.date)}, avec ${w.guests} invités. Votre travail en reportage nous plaît beaucoup : seriez-vous disponible ?`),
          m("vendor", ago(6, "11:03"), `Bonjour ${names}, merci pour votre message ! Le ${formatDay(w.date)} est encore libre. Je connais bien le Château des Lys : la lumière du parc en fin de journée est superbe.`),
          m("vendor", ago(6, "11:05"), "Voici une première proposition. Tout est ajustable : dites-moi ce qui compte le plus pour vous.", { kind: "offre", offerId: v1.id }),
          m("couple", ago(4, "20:30"), "Merci, elle nous plaît beaucoup ! Notre budget pour la photo est de 1 300 €, et l'album n'est pas indispensable pour nous."),
          m("vendor", ago(1, "17:40"), "Je comprends tout à fait. Plutôt que de baisser mes tarifs, j'ai adapté la prestation : 8 h de présence au lieu de 10, et sans album. Je garde la séance couple, c'est souvent celle que les couples préfèrent."),
          m("vendor", sent2, `Voici la nouvelle version. Je bloque votre date ${DATE_HOLD_HOURS} h, le temps que vous en discutiez.`, { kind: "offre", offerId: v2.id }),
          ...(a1
            ? [m("vendor", ago(1, "17:50"), `Pour notre rendez-vous de présentation, je ne suis pas libre à l'heure demandée. Je vous propose le ${formatWeekday(a1.date)} à ${formatTime(a1.date)}.`, { kind: "rdv", appointmentId: a1.id })]
            : []),
        ],
      };
    }
    case "chateau-des-lys": {
      const v1: Offer = {
        id: "o-lys-1",
        version: 1,
        name: "Exclusivité du domaine",
        status: "en-discussion",
        sentAt: ago(49, "14:10"),
        validUntil: ago(35, "00:00").slice(0, 10),
        lines: [
          { key: "weekend", label: "Location du samedi et du dimanche", amount: 5200 },
          { key: "hebergement", label: "Hébergement de 20 personnes", amount: 1300 },
          { key: "vendredi", label: "Accès dès le vendredi pour l'installation", amount: 1800, removable: true },
        ],
      };
      const v2: Offer = { ...v1, id: "o-lys-2", version: 2, name: `Week-end, ${w.guests} invités`, status: "acceptee", sentAt: ago(47, "10:20"), lines: v1.lines.slice(0, 2) };
      return {
        offers: [v1, v2],
        messages: [
          m("couple", ago(49, "09:30"), `Bonjour, nous cherchons un lieu pour le ${formatDate(w.date)}, environ ${w.guests} invités. Le château est-il libre ce week-end-là ?`),
          m("vendor", ago(49, "14:10"), "Bonjour ! Oui, le week-end est libre. Voici notre proposition pour l'exclusivité du domaine.", { kind: "offre", offerId: v1.id }),
          m("couple", ago(48, "21:04"), "Nous n'avons pas besoin d'arriver dès le vendredi. Peut-on garder seulement le week-end ?"),
          m("vendor", ago(47, "10:20"), "Bien sûr : j'ai retiré l'accès du vendredi, le reste est identique.", { kind: "offre", offerId: v2.id }),
          m("couple", ago(47, "18:45"), `Nous acceptons l'offre « ${v2.name} », version 2.`, { kind: "offre", offerId: v2.id }),
          m("celeste", ago(47, "18:45"), "Version 2 acceptée et figée pour le contrat."),
          m("vendor", ago(46, "09:15"), "Merci pour votre confiance ! Nous travaillons souvent avec Maison Saveurs : ils connaissent nos cuisines et nos équipes.", { kind: "fiche", slug: "maison-saveurs" }),
        ],
      };
    }
    case "maison-saveurs": {
      const a2 = appt("a2");
      return {
        offers: [],
        messages: [
          m("couple", ago(3, "12:40"), "Bonjour ! Nous aimerions goûter votre cuisine avant de nous décider. Proposez-vous des dégustations ?"),
          m("vendor", ago(3, "15:02"), "Bonjour, avec plaisir ! La dégustation est offerte pour deux personnes."),
          ...(a2 ? [m("vendor", ago(3, "15:03"), `Je vous propose le ${formatWeekday(a2.date)} à ${formatTime(a2.date)}, c'est noté de mon côté.`, { kind: "rdv", appointmentId: a2.id })] : []),
          m("couple", ago(2, "09:10"), "Parfait, à bientôt !"),
        ],
      };
    }
    case "eclat-mariee": {
      const v1: Offer = {
        id: "o-eclat-1",
        version: 1,
        name: "Mariée et 2 proches, essai inclus",
        status: "acceptee",
        sentAt: ago(17, "16:20"),
        validUntil: ago(3, "00:00").slice(0, 10),
        lines: [
          { key: "mariee", label: "Coiffure et maquillage de la mariée", amount: 280 },
          { key: "proches", label: "Coiffure et maquillage de 2 proches", amount: 160, removable: true },
          { key: "essai", label: "Essai complet avant le mariage", amount: 80, removable: true },
        ],
      };
      const a3 = appt("a3");
      return {
        offers: [v1],
        messages: [
          m("couple", ago(18, "11:00"), "Bonjour, nous cherchons coiffure et maquillage pour la mariée et deux proches, avec un essai avant."),
          m("vendor", ago(17, "16:20"), "Bonjour ! Voici ma proposition, essai compris.", { kind: "offre", offerId: v1.id }),
          m("couple", ago(16, "10:05"), `Nous acceptons l'offre « ${v1.name} », version 1.`, { kind: "offre", offerId: v1.id }),
          m("celeste", ago(16, "10:05"), "Version 1 acceptée et figée pour le contrat."),
          ...(a3 ? [m("vendor", ago(15, "09:30"), `Merci ! Je vous ai réservé l'essai le ${formatWeekday(a3.date)} à ${formatTime(a3.date)}.`, { kind: "rdv", appointmentId: a3.id })] : []),
        ],
      };
    }
    case "papier-et-plume": {
      const v1: Offer = {
        id: "o-plume-1",
        version: 1,
        name: "Faire-part et menus",
        status: "acceptee",
        sentAt: ago(42, "15:00"),
        validUntil: ago(28, "00:00").slice(0, 10),
        acceptedAt: ago(40, "21:10"),
        lines: [
          { key: "fairepart", label: `${w.guests} faire-part letterpress, enveloppes calligraphiées`, amount: 240 },
          { key: "menus", label: "Menus assortis pour le dîner", amount: 100, removable: true },
        ],
      };
      return {
        offers: [v1],
        messages: [
          m("vendor", ago(42, "15:00"), "Bonjour ! Voici ma proposition pour vos faire-part et vos menus.", { kind: "offre", offerId: v1.id }),
          m("couple", ago(40, "21:10"), `Nous acceptons l'offre « ${v1.name} », version 1.`, { kind: "offre", offerId: v1.id }),
          m("celeste", ago(39, "09:00"), "Réservation confirmée."),
          m("vendor", ago(6, "11:30"), "Vos faire-part sont prêts et livrés ! Belle fin de préparation."),
        ],
      };
    }
    default:
      return null;
  }
}

// Conversations d'exemple pour les prestataires du projet. L'état des offres suit celui du prestataire :
// un prestataire réservé a forcément une version acceptée.
export function seedConversations(w: Wedding, now = new Date()): Conversation[] {
  return w.vendors.flatMap((pv) => {
    const seed = pv.vendorSlug ? seedFor(pv.vendorSlug, w, now) : null;
    if (!seed || !pv.vendorSlug) return [];
    const booked = isBookedStatus(pv.status);
    const last = seed.offers[seed.offers.length - 1];
    const offers = seed.offers.map((o) => (o === last && booked ? { ...o, status: "acceptee" as const } : o));
    const readUpTo = pv.vendorSlug === "studio-aube" ? `${addDays(isoDate(now), -4)}T20:31:00` : seed.messages[seed.messages.length - 1].at;
    return [{ vendorSlug: pv.vendorSlug, messages: seed.messages, offers, readAt: readUpTo, pending: [] }];
  });
}
