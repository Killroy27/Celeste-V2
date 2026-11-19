"use client";

// Projet de mariage du couple : source de données unique de l'espace connecté (CDC §5, §15).
// Budget, planning, timeline, documents et priorités du Cockpit sont tous calculés à partir de cet objet,
// pour qu'une action mette à jour tout le reste sans ressaisie (§3, §15.3).
// Prototype : enregistré dans le navigateur. À remplacer par l'API (un seul compte couple, §2).

import { useCallback, useSyncExternalStore } from "react";
import { getCategory, getVendor } from "./content";
import { pendingBookings } from "./booking";
import { isBookedStatus, isOpen, offerOf, seedConversations, type Conversation, unreadCount, vendorFirstName } from "./deal";
import { loadDna, saveDna } from "./dna";
import { addDays, daysUntil, euros, formatDay, formatTime, isoDate } from "./format";
import type { Dna } from "./match";
import { BUDGET_SHARE, DEFAULT_BUDGET_SHARE } from "./settings";

/* ---------- Types ---------- */

// Statuts d'un prestataire dans le projet (§5.4).
export type VendorStatus = "a-rechercher" | "conversation" | "offre" | "reserve" | "termine";

export const VENDOR_STATUSES: { value: VendorStatus; label: string }[] = [
  { value: "a-rechercher", label: "À rechercher" },
  { value: "conversation", label: "Conversation en cours" },
  { value: "offre", label: "Offre reçue" },
  { value: "reserve", label: "Réservé" },
  { value: "termine", label: "Terminé" },
];

// L'offre d'un prestataire n'est pas recopiée ici : elle se lit dans la Deal Room avec offerOf() (§11.4).
export type ProjectVendor = {
  category: string;
  vendorSlug?: string; // absent tant que le couple cherche encore
  status: VendorStatus;
};

export type Payment = { id: string; vendorSlug: string; label: string; amount: number; due: string; paid: boolean; paidAt?: string; method?: string };
export type AppointmentKind = "Visite" | "Rendez-vous" | "Dégustation" | "Essai";
// Workflow validé (§12) : demande du couple, acceptation ou créneau alternatif proposé par le prestataire.
export type AppointmentStatus = "Demandée" | "Confirmée" | "Créneau alternatif proposé";
// alternatives : créneaux proposés par le prestataire quand il ne peut pas à la date demandée (§12, « un ou plusieurs »).
export type Appointment = { id: string; vendorSlug: string; kind: AppointmentKind; date: string; status: AppointmentStatus; alternatives?: string[] };
export type Expense = { id: string; label: string; category: string; amount: number; paid: boolean }; // dépense hors Céleste (§15.1)
export type DocKind = "Devis" | "Contrat" | "Facture";
export type DocStatus = "À signer" | "Signé" | "Reçu" | "Payée";
export type WeddingDoc = { id: string; vendorSlug: string; kind: DocKind; label: string; date: string; status: DocStatus; signedBy?: string; signedAt?: string };
export type Ceremony = "civile" | "religieuse" | "laique";
export type CustomTask = { id: string; label: string; due: string; done: boolean };

// Avis vérifié (§24) : publié par le couple après une prestation réservée et payée via Céleste.
export const REVIEW_CRITERIA = ["Qualité de la prestation", "Communication", "Ponctualité", "Conformité à l'offre", "Rapport qualité-prix"] as const;
export type CoupleReview = { id: string; vendorSlug: string; at: string; scores: number[]; text: string };

export type Wedding = {
  names: [string, string];
  email: string;
  date: string; // AAAA-MM-JJ
  guests: number;
  budget: number;
  zone: string;
  ceremony: Ceremony;
  vendors: ProjectVendor[];
  payments: Payment[];
  appointments: Appointment[];
  expenses: Expense[];
  documents: WeddingDoc[];
  customTasks: CustomTask[];
  conversations: Conversation[]; // messagerie et Deal Room (§11)
  manualVendors?: string[]; // prestataires qui répondent eux-mêmes depuis l'espace pro (plus de simulation)
  reviews?: CoupleReview[];
  requests?: { id: string; vendorSlug: string; kind: "report" | "annulation" | "force-majeure"; reason: string; newDate?: string; at: string }[]; // §14.3, §14.4
  notifReadAt?: string; // centre de notifications : tout ce qui précède est lu (§25)
  notifSeen?: string[]; // notifications ouvertes une à une depuis le dernier « tout marquer comme lu »
  emailOff?: string[]; // types de notifications dont le couple ne veut pas d'e-mail
  // État des tâches générées par Céleste : cochée, renommée ou retirée par le couple (§15.2).
  taskState: Record<string, { done?: boolean; removed?: boolean; label?: string }>;
  createdAt?: string; // AAAA-MM-JJ : sert à étaler la checklist sur le temps réellement disponible
  estimated?: ("date" | "guests")[]; // valeurs posées par défaut à la création, pas encore confirmées par le couple
  demo: boolean;
};

/* ---------- Données de démonstration ---------- */

const uid = () => Math.random().toString(36).slice(2, 10);

export { addDays, daysUntil, euros, formatDate, formatDay, formatTime, isoDate } from "./format";

export { isBookedStatus } from "./deal";

export function demoWedding(): Wedding {
  // Une donnée saisie une seule fois (§3) : on reprend le Wedding DNA s'il existe.
  const dna = loadDna();
  const w: Wedding = {
    names: ["Claire", "Thomas"],
    email: "claire.thomas@exemple.fr",
    date: dna?.date ?? "2027-06-12",
    guests: dna?.guests ?? 120,
    budget: dna?.budget ?? 32000,
    zone: dna?.zone ?? "idf",
    ceremony: "laique",
    vendors: [
      { category: "lieux", vendorSlug: "chateau-des-lys", status: "reserve" },
      { category: "photographes", vendorSlug: "studio-aube", status: "offre" },
      { category: "traiteurs", vendorSlug: "maison-saveurs", status: "conversation" },
      { category: "fleuristes", status: "a-rechercher" },
      { category: "dj", status: "a-rechercher" },
      { category: "beaute", vendorSlug: "eclat-mariee", status: "reserve" },
      // Prestation déjà réalisée avant le mariage (faire-part livrés) : le couple peut laisser un avis (§24).
      { category: "papeterie", vendorSlug: "papier-et-plume", status: "termine" },
    ],
    payments: [
      { id: "p1", vendorSlug: "chateau-des-lys", label: "Acompte 30 %", amount: 1950, due: "2026-10-02", paid: true },
      { id: "p2", vendorSlug: "chateau-des-lys", label: "Échéance 1 sur 2", amount: 2275, due: "2026-12-15", paid: false },
      { id: "p3", vendorSlug: "chateau-des-lys", label: "Échéance 2 sur 2", amount: 2275, due: "2027-04-15", paid: false },
      { id: "p4", vendorSlug: "eclat-mariee", label: "Paiement intégral", amount: 520, due: "2026-11-03", paid: true },
      { id: "p5", vendorSlug: "papier-et-plume", label: "Paiement intégral", amount: 340, due: "2026-10-10", paid: true },
    ],
    appointments: [
      { id: "a1", vendorSlug: "studio-aube", kind: "Rendez-vous", date: "2026-11-28T18:30", status: "Créneau alternatif proposé" },
      { id: "a2", vendorSlug: "maison-saveurs", kind: "Dégustation", date: "2026-12-05T12:00", status: "Confirmée" },
      { id: "a3", vendorSlug: "eclat-mariee", kind: "Essai", date: "2027-05-08T10:00", status: "Confirmée" },
    ],
    expenses: [
      { id: "e1", label: "Alliances", category: "Bijoux", amount: 1400, paid: true },
      { id: "e2", label: "Costume du marié", category: "Tenues", amount: 890, paid: false },
    ],
    documents: [
      { id: "d1", vendorSlug: "chateau-des-lys", kind: "Contrat", label: "Contrat de location, version 2", date: "2026-10-01", status: "Signé" },
      { id: "d2", vendorSlug: "chateau-des-lys", kind: "Facture", label: "Facture d'acompte", date: "2026-10-02", status: "Payée" },
      { id: "d3", vendorSlug: "eclat-mariee", kind: "Contrat", label: "Contrat de prestation", date: "2026-11-02", status: "Signé" },
      { id: "d4", vendorSlug: "studio-aube", kind: "Devis", label: "Offre « Journée », version 2", date: "2026-11-14", status: "Reçu" },
      { id: "d5", vendorSlug: "papier-et-plume", kind: "Contrat", label: "Contrat, offre « Faire-part et menus » version 1", date: "2026-10-09", status: "Signé" },
      { id: "d6", vendorSlug: "papier-et-plume", kind: "Facture", label: "Facture, paiement intégral", date: "2026-10-10", status: "Payée" },
    ],
    customTasks: [{ id: "c1", label: "Choisir les témoins", due: "2026-12-20", done: true }],
    conversations: [],
    taskState: {},
    createdAt: isoDate(),
    demo: true,
  };
  return { ...w, conversations: seedConversations(w) };
}

// Premier contact depuis une fiche, sans projet existant : un espace vierge construit avec ce que
// le couple vient de saisir (§3), sans aucune donnée d'exemple. Tout reste modifiable dans le profil.
export function newWedding(input: { firstName: string; email: string; date?: string; guests?: number }): Wedding {
  const dna = loadDna();
  return {
    names: [input.firstName, ""],
    email: input.email,
    date: input.date || dna?.date || addDays(isoDate(), 365),
    guests: input.guests || dna?.guests || 100,
    budget: dna?.budget ?? 0,
    zone: dna?.zone ?? "idf",
    ceremony: "civile",
    vendors: ["lieux", "traiteurs", "photographes", "dj", "fleuristes"].map((category) => ({ category, status: "a-rechercher" as const })),
    payments: [],
    appointments: [],
    expenses: [],
    documents: [],
    customTasks: [],
    conversations: [],
    taskState: {},
    createdAt: isoDate(),
    // Date et invités non saisis : valeurs provisoires, signalées dans « Complétez votre profil ».
    estimated: [...(input.date || dna?.date ? [] : ["date" as const]), ...(input.guests || dna?.guests ? [] : ["guests" as const])],
    demo: false,
  };
}

// « Complétez votre profil » (benchmark Airbnb, CDC §6.3) : ce qui manque pour que budget, checklist et
// Best Match soient justes. field : champ du profil à remplir ; href : écran où le faire.
export function profileSteps(w: Wedding, hasDna: boolean) {
  const est = w.estimated ?? [];
  return [
    { id: "partner", label: "Ajoutez le prénom de votre partenaire", done: !!w.names[1]?.trim(), field: "profil-name2", href: "/espace/profil" },
    { id: "date", label: "Confirmez la date du mariage", done: !est.includes("date"), field: "profil-date", href: "/espace/profil" },
    { id: "guests", label: "Indiquez le nombre d'invités", done: !est.includes("guests"), field: "profil-guests", href: "/espace/profil" },
    { id: "budget", label: "Fixez votre budget global", done: w.budget > 0, field: "profil-budget", href: "/espace/profil" },
    { id: "dna", label: "Créez votre Wedding DNA", done: hasDna, field: undefined, href: "/matchs" },
  ];
}

/* ---------- Stockage (navigateur) ---------- */

const KEY = "celeste:wedding";
const listeners = new Set<() => void>();
let cache: Wedding | null | undefined;

// Complète un projet enregistré par une version antérieure (ou modifié à la main) avec les valeurs par défaut,
// pour qu'un champ manquant ne fasse jamais planter l'espace.
function normalize(raw: unknown): Wedding | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<Wedding>;
  if (typeof r.date !== "string") return null;
  const arr = <T,>(v: T[] | undefined) => (Array.isArray(v) ? v : []);
  const w: Wedding = {
    names: Array.isArray(r.names) && r.names.length === 2 ? r.names : ["", ""],
    email: r.email ?? "",
    date: r.date,
    guests: Number(r.guests) || 100,
    budget: Number(r.budget) || 0,
    zone: r.zone ?? "idf",
    ceremony: r.ceremony ?? "civile",
    vendors: arr(r.vendors),
    payments: arr(r.payments),
    appointments: arr(r.appointments),
    expenses: arr(r.expenses),
    documents: arr(r.documents),
    customTasks: arr(r.customTasks),
    conversations: arr(r.conversations).map((c) => ({ ...c, messages: arr(c.messages), offers: arr(c.offers), pending: arr(c.pending), readAt: c.readAt ?? "" })),
    taskState: r.taskState && typeof r.taskState === "object" ? r.taskState : {},
    manualVendors: Array.isArray(r.manualVendors) ? r.manualVendors : [],
    reviews: Array.isArray(r.reviews) ? r.reviews : [],
    requests: Array.isArray(r.requests) ? r.requests : [],
    notifReadAt: typeof r.notifReadAt === "string" ? r.notifReadAt : undefined,
    emailOff: Array.isArray(r.emailOff) ? r.emailOff : [],
    notifSeen: Array.isArray(r.notifSeen) ? r.notifSeen : [],
    createdAt: r.createdAt ?? isoDate(),
    estimated: Array.isArray(r.estimated) ? r.estimated.filter((e) => e === "date" || e === "guests") : [],
    demo: !!r.demo,
  };
  // Projet enregistré avant la Deal Room : on recrée les conversations d'exemple de ses prestataires.
  return Array.isArray(r.conversations) ? w : { ...w, conversations: seedConversations(w) };
}

function read(): Wedding | null {
  if (cache !== undefined) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    cache = normalize(parsed);
    // Projet complété (date de création, conversations d'exemple) : on l'enregistre tout de suite, sinon les
    // identifiants des messages et l'horizon du planning changeraient à chaque lecture.
    if (cache && parsed && (!parsed.createdAt || !Array.isArray(parsed.conversations))) localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    cache = null;
  }
  return cache;
}

function write(next: Wedding | null) {
  cache = next;
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch {
    /* navigation privée : on garde en mémoire */
  }
  listeners.forEach((l) => l());
}

// Un autre onglet a modifié le projet : on relit le stockage au lieu d'écraser ses changements.
function onStorage(e: StorageEvent) {
  if (e.key !== KEY && e.key !== null) return;
  cache = undefined;
  listeners.forEach((l) => l());
}

// Le stockage a été modifié hors de ce module (changement de compte, src/lib/session.ts) : on relit.
export function reloadWedding() {
  cache = undefined;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(l);
  return () => {
    listeners.delete(l);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
};

// Données partagées entre le projet et le Wedding DNA, saisies une seule fois (§3).
const SHARED = ["date", "guests", "budget", "zone"] as const;

// Le profil a changé une donnée partagée : le Wedding DNA suit, et le Best Match recalcule (§6.3).
// Rien n'est écrit si seules d'autres données ont changé (tâche cochée, paiement…).
function syncDna(prev: Wedding, next: Wedding) {
  if (SHARED.every((k) => prev[k] === next[k])) return;
  const dna = loadDna();
  if (dna) saveDna({ ...dna, date: next.date, guests: next.guests, budget: next.budget, zone: next.zone });
}

// Sens inverse : un Wedding DNA enregistré depuis le Best Match met à jour le projet existant.
export function adoptDna(dna: Dna) {
  const cur = read();
  if (!cur) return;
  write({ ...cur, guests: dna.guests, budget: dna.budget, zone: dna.zone ?? cur.zone, date: dna.date ?? cur.date });
}

// null pendant le rendu serveur et tant qu'aucun projet n'existe.
export function useWedding() {
  const wedding = useSyncExternalStore(subscribe, read, () => null);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const update = useCallback((fn: (w: Wedding) => Wedding) => {
    const cur = read();
    if (!cur) return;
    const next = fn(cur);
    write(next);
    syncDna(cur, next);
  }, []);
  const start = useCallback(() => write(demoWedding()), []);
  const create = useCallback((w: Wedding) => write(w), []);
  const reset = useCallback(() => write(null), []);
  return { wedding, ready, update, start, create, reset, newId: uid };
}

/* ---------- Noms ---------- */

export const vendorName = (slug?: string) => (slug ? (getVendor(slug)?.name ?? slug) : "");
export const categoryLabel = (slug: string) => getCategory(slug)?.plural ?? slug;
export const categorySingular = (slug: string) => getCategory(slug)?.singular ?? slug;

/* ---------- Checklist intelligente (§15.2) ---------- */

export type Task = { id: string; label: string; due: string; done: boolean; generated: boolean; important: boolean; category?: string };

type Template = { id: string; label: string; monthsBefore: number; category?: string; important?: boolean; when?: (w: Wedding) => boolean };

// Tâches proposées par Céleste selon la date, le type de cérémonie, le nombre d'invités et les réservations.
const TEMPLATES: Template[] = [
  { id: "lieu", label: "Réserver le lieu de réception", monthsBefore: 12, category: "lieux", important: true },
  { id: "budget", label: "Répartir le budget par poste", monthsBefore: 12 },
  { id: "invites", label: "Établir la liste des invités", monthsBefore: 11 },
  { id: "traiteur", label: "Choisir le traiteur", monthsBefore: 10, category: "traiteurs", important: true },
  { id: "photo", label: "Réserver le photographe", monthsBefore: 10, category: "photographes", important: true },
  { id: "planner", label: "Envisager un wedding planner ou une coordination jour J", monthsBefore: 10, when: (w) => w.guests >= 150 },
  { id: "hebergement", label: "Bloquer des hébergements pour les invités", monthsBefore: 9, when: (w) => w.guests >= 150 },
  { id: "save", label: "Envoyer les save the date", monthsBefore: 8 },
  { id: "dj", label: "Réserver le DJ ou les musiciens", monthsBefore: 8, category: "dj", important: true },
  { id: "fleurs", label: "Choisir le fleuriste", monthsBefore: 7, category: "fleuristes" },
  { id: "tenue", label: "Trouver les tenues des mariés", monthsBefore: 7, category: "tenues" },
  { id: "officiant", label: "Choisir l'officiant de la cérémonie laïque", monthsBefore: 6, when: (w) => w.ceremony === "laique" },
  { id: "culte", label: "Rencontrer le ministre du culte et fixer la date", monthsBefore: 9, when: (w) => w.ceremony === "religieuse" },
  { id: "mairie", label: "Déposer le dossier de mariage en mairie", monthsBefore: 3, important: true },
  { id: "fairepart", label: "Envoyer les faire-part", monthsBefore: 4 },
  { id: "beaute", label: "Réserver coiffure et maquillage", monthsBefore: 5, category: "beaute" },
  { id: "transport", label: "Organiser le transport des invités", monthsBefore: 3, category: "transport", when: (w) => w.guests >= 80 },
  { id: "plan", label: "Faire le plan de table", monthsBefore: 1 },
  { id: "deroule", label: "Envoyer le déroulé du jour J aux prestataires", monthsBefore: 0.5, important: true },
];

const minusMonths = (iso: string, months: number) => addDays(iso, -Math.round(months * 30.4));

// Le calendrier type suppose 12 mois de préparation. Un couple qui commence plus tard ne doit pas
// ouvrir son espace sur une liste de retards : les échéances sont resserrées sur le temps disponible.
const PLAN_MONTHS = 12;
function horizonFactor(w: Wedding) {
  const start = new Date(w.createdAt ?? isoDate());
  const months = (new Date(w.date).getTime() - start.getTime()) / (30.4 * 86_400_000);
  return Math.min(1, Math.max(0.1, months / PLAN_MONTHS));
}

const isBooked = (w: Wedding, category?: string) => !!category && w.vendors.some((v) => v.category === category && isBookedStatus(v.status));

export function tasksFor(w: Wedding): Task[] {
  const factor = horizonFactor(w);
  const generated = TEMPLATES.filter((t) => !t.when || t.when(w))
    .filter((t) => !w.taskState[t.id]?.removed)
    .map((t) => ({
      id: t.id,
      label: w.taskState[t.id]?.label ?? t.label,
      due: minusMonths(w.date, t.monthsBefore * factor),
      // Une réservation coche la tâche correspondante (§3 : une action met à jour tout le reste).
      done: w.taskState[t.id]?.done ?? isBooked(w, t.category),
      generated: true,
      important: !!t.important,
      category: t.category,
    }));
  const custom = w.customTasks.map((t) => ({ ...t, generated: false, important: false }));
  return [...generated, ...custom].sort((a, b) => a.due.localeCompare(b.due));
}

/* ---------- Budget (§15.1) ---------- */

export type BudgetLine = { key: string; category: string; label: string; planned: number; engaged: number; paid: number; external: boolean; status?: VendorStatus };

export function budgetFor(w: Wedding) {
  const lines: BudgetLine[] = w.vendors.map((v, i) => {
    // Engagé dès l'offre acceptée, même si la réservation attend encore signature et acompte.
    const offer = offerOf(w, v.vendorSlug);
    const engaged = isBookedStatus(v.status) || offer?.status === "acceptee" ? (offer?.total ?? 0) : 0;
    const paid = w.payments.filter((p) => p.vendorSlug === v.vendorSlug && p.paid).reduce((s, p) => s + p.amount, 0);
    // Deux prestataires du même métier : l'enveloppe prévue n'est comptée qu'une fois.
    const firstOfCategory = w.vendors.findIndex((x) => x.category === v.category) === i;
    return {
      key: firstOfCategory ? v.category : `${v.category}:${v.vendorSlug}`,
      category: v.category,
      label: firstOfCategory ? categoryLabel(v.category) : `${categoryLabel(v.category)} · ${vendorName(v.vendorSlug)}`,
      planned: firstOfCategory ? w.budget * (BUDGET_SHARE[v.category] ?? DEFAULT_BUDGET_SHARE) : 0,
      engaged,
      paid,
      external: false,
      status: v.status,
    };
  });
  const externalLines: BudgetLine[] = w.expenses.map((e) => ({ key: e.id, category: "", label: e.label, planned: e.amount, engaged: e.amount, paid: e.paid ? e.amount : 0, external: true }));
  const all = [...lines, ...externalLines];
  const engaged = all.reduce((s, l) => s + l.engaged, 0);
  const paid = all.reduce((s, l) => s + l.paid, 0);
  return { lines, externalLines, total: w.budget, engaged, paid, toPay: engaged - paid, available: w.budget - engaged };
}

/* ---------- Timeline (§15.3) : une seule source pour rendez-vous, paiements et tâches ---------- */

export type TimelineItem = { id: string; date: string; kind: "rdv" | "paiement" | "tache"; title: string; detail: string; status?: string };

export function timelineFor(w: Wedding, from = new Date(), tasks = tasksFor(w)): TimelineItem[] {
  const today = isoDate(from);
  const upcoming = (iso: string) => iso.slice(0, 10) >= today;
  const items: TimelineItem[] = [
    ...w.appointments
      .filter((a) => upcoming(a.date))
      .map((a) => ({ id: a.id, date: a.date, kind: "rdv" as const, title: `${a.kind} · ${vendorName(a.vendorSlug)}`, detail: formatTime(a.date), status: a.status })),
    // Un paiement non réglé reste affiché même après son échéance : en retard, il est encore plus important.
    ...w.payments
      .filter((p) => !p.paid)
      .map((p) => ({ id: p.id, date: p.due, kind: "paiement" as const, title: `${p.label} · ${vendorName(p.vendorSlug)}`, detail: euros(p.amount), status: upcoming(p.due) ? "Paiement à venir" : "En retard" })),
    ...tasks
      .filter((t) => !t.done && t.important && upcoming(t.due))
      .map((t) => ({ id: t.id, date: t.due, kind: "tache" as const, title: t.label, detail: "Tâche importante" })),
  ];
  return items.sort((a, b) => a.date.localeCompare(b.date));
}

/* ---------- Cockpit (§5.2) ---------- */

export function progressFor(w: Wedding, tasks = tasksFor(w)) {
  const doneTasks = tasks.filter((t) => t.done).length / Math.max(1, tasks.length);
  const booked = w.vendors.filter((v) => isBookedStatus(v.status)).length / Math.max(1, w.vendors.length);
  return Math.round((doneTasks * 0.6 + booked * 0.4) * 100);
}

export type Action = { id: string; title: string; detail: string; href: string; cta: string };

// Trois actions prioritaires au maximum (§5.2) : ce qui peut faire perdre une date ou de l'argent passe en premier.
export function priorityActions(w: Wedding, from = new Date(), tasks = tasksFor(w)): Action[] {
  const actions: Action[] = [];
  // Offre acceptée mais réservation pas encore confirmée : la date n'est pas encore garantie au couple.
  for (const b of pendingBookings(w)) {
    actions.push({ id: `b-${b.slug}`, title: `Finaliser la réservation de ${vendorName(b.slug)}`, detail: b.signed ? `Contrat signé · reste le paiement de ${euros(b.total)} ou de l'acompte` : `Contrat à signer, puis paiement · ${euros(b.total)}`, href: `/espace/reservation/${b.slug}`, cta: "Finaliser" });
  }
  for (const a of w.appointments.filter((x) => x.status === "Créneau alternatif proposé")) {
    actions.push({ id: a.id, title: `Confirmer le nouveau créneau de ${vendorName(a.vendorSlug)}`, detail: `${a.kind} proposé le ${formatDay(a.date)} à ${formatTime(a.date)}`, href: "/espace/mariage/planning", cta: "Voir le créneau" });
  }
  for (const p of w.payments.filter((x) => !x.paid && daysUntil(x.due, from) <= 45)) {
    actions.push({ id: p.id, title: `Régler ${p.label.toLowerCase()} · ${vendorName(p.vendorSlug)}`, detail: `${euros(p.amount)} à payer avant le ${formatDay(p.due)}`, href: "/espace/mariage/budget", cta: "Voir l'échéance" });
  }
  for (const v of w.vendors.filter((x) => x.status === "offre")) {
    const o = offerOf(w, v.vendorSlug);
    if (!o || !isOpen(o.status)) continue;
    actions.push({ id: `o-${v.category}`, title: `Répondre à l'offre de ${vendorName(v.vendorSlug)}`, detail: `${o.offer.name} · ${euros(o.total)}, version ${o.offer.version}`, href: `/espace/messages?c=${v.vendorSlug}&offre=1`, cta: "Voir l'offre" });
  }
  // Nouveaux messages (§25) : après ce qui engage une date ou de l'argent.
  for (const c of w.conversations.filter((x) => unreadCount(x) > 0)) {
    const n = unreadCount(c);
    actions.push({ id: `m-${c.vendorSlug}`, title: `${n > 1 ? `${n} nouveaux messages` : "Nouveau message"} de ${vendorFirstName(c.vendorSlug)}, ${vendorName(c.vendorSlug)}`, detail: "Réponse en attente dans votre messagerie", href: `/espace/messages?c=${c.vendorSlug}`, cta: "Lire" });
  }
  for (const v of w.vendors.filter((x) => x.vendorSlug && canReview(w, x.vendorSlug, from))) {
    actions.push({ id: `avis-${v.vendorSlug}`, title: `Donnez votre avis sur ${vendorName(v.vendorSlug)}`, detail: "Prestation terminée : votre avis vérifié aide les autres couples", href: "/espace/mariage/prestataires", cta: "Donner mon avis" });
  }
  const next = tasks.find((t) => !t.done && t.important);
  if (next) actions.push({ id: next.id, title: next.label, detail: `À faire avant le ${formatDay(next.due)}`, href: "/espace/mariage/planning", cta: "Voir la checklist" });
  return actions.slice(0, 3);
}

// Recommandation contextualisée (§5.2) : le prochain métier à réserver, avec un accès direct au Best Match (§8).
export function recommendationFor(w: Wedding, from = new Date()) {
  const order = ["lieux", "traiteurs", "photographes", "dj", "fleuristes", "tenues", "beaute", "decoration"];
  const missing = order.find((c) => {
    const v = w.vendors.find((x) => x.category === c);
    return !v || v.status === "a-rechercher";
  });
  if (!missing) return null;
  const months = Math.max(0, Math.round(daysUntil(w.date, from) / 30.4));
  return {
    category: missing,
    title: `C'est le bon moment pour trouver votre ${categorySingular(missing)}`,
    text: `Il reste environ ${months} mois avant le mariage. Céleste connaît déjà votre date, votre budget et votre style : une ou deux questions suffisent pour voir vos meilleurs matchs.`,
  };
}


/* ---------- Avis vérifiés (§24) ---------- */

// Un avis n'est possible qu'après une prestation réservée et payée via Céleste : prestataire « terminé »,
// ou réservé et mariage passé. Un seul avis par prestataire.
export function canReview(w: Wedding, slug: string, from = new Date()) {
  const pv = w.vendors.find((v) => v.vendorSlug === slug);
  if (!pv || w.reviews?.some((r) => r.vendorSlug === slug)) return false;
  const paid = w.payments.some((p) => p.vendorSlug === slug && p.paid);
  return paid && (pv.status === "termine" || (pv.status === "reserve" && w.date < isoDate(from)));
}

export const reviewOf = (w: Wedding, slug?: string) => (slug ? w.reviews?.find((r) => r.vendorSlug === slug) : undefined);
