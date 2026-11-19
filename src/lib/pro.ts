"use client";

// Espace prestataire (CDC §16 à §19, écrans §30.2). Démonstration : le prestataire connecté est Studio Aube.
// Sa conversation avec le couple de l'espace couple est la vraie (même stockage : une offre envoyée ici
// apparaît chez le couple, y compris dans un autre onglet). Ses autres clients sont des projets d'exemple au
// même format que celui d'un couple : la Deal Room et la réservation s'appliquent sans code à part.
// À remplacer par l'API (comptes prestataires, §16.2).

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getCategory, getVendor } from "./content";
import { coupleNames, conversationOf, offerOf, offerTotal, vendorOffer, type Conversation, type Message, type Offer, type OfferLine } from "./deal";
import { addDays, isoDate, stamp } from "./format";
import { personFor } from "./vendorDetail";
import { CALENDAR_MONTHS, SELECT_THRESHOLDS } from "./settings";
import type { Availability } from "./vendorDetail";
import { useWedding, type Appointment, type Payment, type VendorStatus, type Wedding, type WeddingDoc } from "./wedding";

export const PRO_SLUG = "studio-aube";

/* ---------- Types ---------- */

export type Formula = { id: string; name: string; price: number | null; includes: string[] }; // null : sur devis (§16.4)
export type ProOption = { id: string; label: string; price: number };
export type VerifStatus = "Validé" | "En attente" | "À fournir";
export type VerifItem = { id: string; label: string; status: VerifStatus; detail?: string };
export type OpportunityStatus = "nouvelle" | "repondue" | "declinee";

// Opportunité commerciale (§19) : créée par Céleste quand le profil correspond à une demande.
export type Opportunity = {
  id: string;
  names: [string, string];
  date: string;
  zone: string;
  guests: number;
  budget: number; // budget du couple pour ce métier
  style: string;
  need: string;
  compat: number; // compatibilité Best Match, en %
  slots: { max: number; taken: number }; // nombre de prestataires autorisés à répondre
  receivedAt: string;
  status: OpportunityStatus;
  clientId?: string;
};

export type ProClient = { id: string; style: string; w: Wedding };

// Compte créé depuis « Devenir prestataire » (§16.2) : identité propre, hors catalogue de démonstration.
export type ProAccount = { name: string; company: string; category: string; email: string; phone: string; city: string; createdAt: string; published: boolean };

export type Pro = {
  account?: ProAccount; // absent : espace de démonstration au nom de Studio Aube
  photos?: string[]; // noms des photos ajoutées (prototype : rien n'est envoyé)
  specs?: Record<string, string>; // informations propres au métier (§10.2), saisies une seule fois (§10.3)
  profile: { description: string; responseTime: string; area: string; style: string; languages: string; team: string };
  capacity: number; // événements simultanés (§17)
  formulas: Formula[];
  options: ProOption[];
  availability: Record<string, Availability>; // statuts posés à la main, par date
  clients: ProClient[];
  opportunities: Opportunity[];
  replies: Record<number, string>; // réponses publiques aux avis
  reports?: Record<number, { reason: string; at: string; status: "Signalé" | "Conservé" | "Retiré"; decidedAt?: string }>; // avis signalés à la modération (§24)
  notifReadAt?: string; // centre de notifications (§25)
  notifSeen?: string[]; // notifications ouvertes une à une depuis le dernier « tout marquer comme lu »
  emailOff?: string[]; // types sans e-mail
  verification: VerifItem[];
  metrics: { completedBookings: number; verifiedReviews: number; rating: number; responseRate: number; cancellationRate: number; openDisputes: number; lastActivity: string };
};

/* ---------- Données de démonstration ---------- */

const uid = () => Math.random().toString(36).slice(2, 10);

function project(names: [string, string], date: string, guests: number, budget: number, zone: string, extra: Partial<Wedding>): Wedding {
  return {
    names,
    email: `${names[0].toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")}@exemple.fr`,
    date,
    guests,
    budget,
    zone,
    ceremony: "civile",
    vendors: [],
    payments: [],
    appointments: [],
    expenses: [],
    documents: [],
    customTasks: [],
    conversations: [],
    taskState: {},
    createdAt: isoDate(),
    demo: true,
    manualVendors: [PRO_SLUG],
    ...extra,
  };
}

const LINES: OfferLine[] = [
  { key: "presence", label: "Présence de 10 h, des préparatifs à la première danse", amount: 1100, reduced: { label: "Présence de 8 h, de la cérémonie au dîner", amount: 900 } },
  { key: "photos", label: "500 photos retouchées et galerie en ligne", amount: 210 },
  { key: "album", label: "Album 30×30 cm, 40 pages", amount: 320, removable: true },
  { key: "seance", label: "Séance couple avant le mariage", amount: 180, removable: true },
];

function seedClients(now: Date): ProClient[] {
  const ago = (d: number, t: string) => `${addDays(isoDate(now), -d)}T${t}:00`;
  const msg = (from: Message["from"], at: string, text: string, card?: Message["card"]): Message => ({ id: uid(), from, at, text, ...(card ? { card } : {}) });
  const conv = (messages: Message[], offers: Offer[], vendorReadAt?: string): Conversation => ({ vendorSlug: PRO_SLUG, messages, offers, readAt: messages[messages.length - 1]?.at ?? "", pending: [], ...(vendorReadAt ? { vendorReadAt } : {}) });
  const offer = (id: string, version: number, name: string, lines: OfferLine[], status: Offer["status"], sentAt: string, extra: Partial<Offer> = {}): Offer => ({
    id,
    version,
    name,
    lines,
    status,
    sentAt,
    validUntil: addDays(sentAt.slice(0, 10), 14),
    ...extra,
  });
  const pv = (status: VendorStatus) => [{ category: "photographes", vendorSlug: PRO_SLUG, status }];

  // Offre envoyée sans réponse depuis 5 jours : à relancer.
  const ines = offer("o-ines-1", 1, "Journée complète", LINES, "envoyee", ago(5, "16:10"));
  // Réservation confirmée, solde à venir.
  const sarahLines = [LINES[0], LINES[1], LINES[3]];
  const sarah = offer("o-sarah-2", 2, "Journée, avec séance couple", sarahLines, "acceptee", ago(34, "11:00"), { acceptedAt: ago(31, "20:15") });
  const sarahTotal = offerTotal(sarah);
  const sarahDeposit = Math.round(sarahTotal * 0.3);
  // Mariage passé, tout réglé.
  const amaLines: OfferLine[] = [...LINES, { key: "second", label: "Second photographe pour la cérémonie traditionnelle", amount: 450, removable: true }];
  const ama = offer("o-ama-1", 1, "Deux jours, deux photographes", amaLines, "acceptee", "2025-11-20T10:00:00", { acceptedAt: "2025-11-24T18:00:00" });
  const amaTotal = offerTotal(ama);
  // Offre déclinée par le couple.
  const lea = offer("o-lea-1", 1, "Journée complète", LINES, "refusee", ago(14, "09:30"));

  const julieAppt: Appointment = { id: "a-julie", vendorSlug: PRO_SLUG, kind: "Rendez-vous", date: `${addDays(isoDate(now), 6)}T19:30`, status: "Demandée" };

  return [
    {
      id: "c-ines",
      style: "Bohème",
      w: project(["Inès", "Karim"], "2027-07-03", 150, 38000, "idf", {
        vendors: pv("offre"),
        conversations: [
          conv(
            [
              msg("couple", ago(6, "10:20"), "Bonjour Aïssatou ! Nous nous marions le 3 juillet 2027 à Fontainebleau, 150 invités. Votre style nous plaît beaucoup."),
              msg("vendor", ago(5, "16:10"), "Bonjour Inès et Karim, merci ! Voici ma proposition détaillée. Tout est ajustable.", { kind: "offre", offerId: ines.id }),
            ],
            [ines],
            ago(5, "16:10"),
          ),
        ],
        documents: [{ id: uid(), vendorSlug: PRO_SLUG, kind: "Devis", label: "Offre « Journée complète », version 1", date: ago(5, "16:10").slice(0, 10), status: "Reçu" }],
      }),
    },
    {
      id: "c-julie",
      style: "Champêtre",
      w: project(["Julie", "Hugo"], "2027-09-18", 90, 24000, "idf", {
        vendors: pv("conversation"),
        appointments: [julieAppt],
        conversations: [
          conv(
            [
              msg("couple", ago(1, "21:05"), "Bonjour, nous préparons un mariage champêtre en septembre 2027. Pourrions-nous nous rencontrer pour en parler ?"),
              msg("couple", ago(0, "09:12"), "Nous vous proposons un rendez-vous en visio.", { kind: "rdv", appointmentId: julieAppt.id }),
            ],
            [],
            ago(2, "08:00"),
          ),
        ],
      }),
    },
    {
      id: "c-sarah",
      style: "Moderne",
      w: project(["Sarah", "Malik"], "2027-05-22", 110, 30000, "idf", {
        vendors: pv("reserve"),
        payments: [
          { id: uid(), vendorSlug: PRO_SLUG, label: "Acompte 30 %", amount: sarahDeposit, due: ago(31, "00:00").slice(0, 10), paid: true, paidAt: ago(31, "20:20"), method: "Carte •••• 1881" },
          { id: uid(), vendorSlug: PRO_SLUG, label: "Solde", amount: sarahTotal - sarahDeposit, due: "2027-04-22", paid: false },
        ],
        documents: [
          { id: uid(), vendorSlug: PRO_SLUG, kind: "Contrat", label: `Contrat, offre « ${sarah.name} » version 2`, date: ago(31, "00:00").slice(0, 10), status: "Signé", signedBy: "Sarah Benali", signedAt: ago(31, "20:18") },
          { id: uid(), vendorSlug: PRO_SLUG, kind: "Facture", label: "Facture d'acompte", date: ago(31, "00:00").slice(0, 10), status: "Payée" },
        ],
        conversations: [
          conv(
            [
              msg("vendor", ago(34, "11:00"), "Voici la version avec la séance couple, sans album.", { kind: "offre", offerId: sarah.id }),
              msg("couple", ago(31, "20:15"), `Nous acceptons l'offre « ${sarah.name} », version 2.`, { kind: "offre", offerId: sarah.id }),
              msg("celeste", ago(31, "20:20"), "Réservation confirmée."),
              msg("couple", ago(3, "18:40"), "Bonjour ! Nous avons fixé l'heure de la cérémonie : 15 h à la mairie du 11e."),
            ],
            [sarah],
            ago(4, "09:00"),
          ),
        ],
      }),
    },
    {
      id: "c-ama",
      style: "Traditionnel",
      w: project(["Ama", "Kwame"], "2026-09-12", 220, 45000, "idf", {
        vendors: pv("termine"),
        payments: [
          { id: uid(), vendorSlug: PRO_SLUG, label: "Acompte 30 %", amount: Math.round(amaTotal * 0.3), due: "2025-11-24", paid: true, paidAt: "2025-11-24T18:05:00", method: "Carte •••• 4417" },
          { id: uid(), vendorSlug: PRO_SLUG, label: "Solde", amount: amaTotal - Math.round(amaTotal * 0.3), due: "2026-08-13", paid: true, paidAt: "2026-08-10T12:00:00", method: "Carte •••• 4417" },
        ],
        documents: [{ id: uid(), vendorSlug: PRO_SLUG, kind: "Contrat", label: `Contrat, offre « ${ama.name} » version 1`, date: "2025-11-24", status: "Signé", signedBy: "Ama Mensah", signedAt: "2025-11-24T18:02:00" }],
        conversations: [conv([msg("couple", "2026-09-20T10:00:00", "Merci Aïssatou, les photos sont magnifiques ! Toute la famille est émue.")], [ama], "2026-09-20T11:00:00")],
      }),
    },
    {
      id: "c-lea",
      style: "Intemporel",
      w: project(["Léa", "Tom"], "2027-06-26", 70, 18000, "idf", {
        vendors: pv("conversation"),
        conversations: [
          conv(
            [
              msg("vendor", ago(14, "09:30"), "Voici ma proposition.", { kind: "offre", offerId: lea.id }),
              msg("couple", ago(12, "19:00"), "Merci pour votre proposition. Nous avons décidé de ne pas y donner suite."),
            ],
            [lea],
            ago(12, "19:30"),
          ),
        ],
      }),
    },
  ];
}

function seedOpportunities(now: Date): Opportunity[] {
  const ago = (d: number, t: string) => `${addDays(isoDate(now), -d)}T${t}:00`;
  return [
    {
      id: "op-nadia",
      names: ["Nadia", "Yanis"],
      date: "2027-06-19",
      zone: "Paris 11e",
      guests: 130,
      budget: 1600,
      style: "Reportage, lumière naturelle",
      need: "Reportage de la mairie au dîner, sans longues séances de photos posées. Un album serait un plus.",
      compat: 94,
      slots: { max: 3, taken: 1 },
      receivedAt: ago(0, "08:40"),
      status: "nouvelle",
    },
    {
      id: "op-camille",
      names: ["Camille", "Jules"],
      date: "2027-08-28",
      zone: "Yvelines",
      guests: 80,
      budget: 1200,
      style: "Champêtre",
      need: "Mariage dans une grange : préparatifs, cérémonie laïque en extérieur, cocktail. Pas besoin de la soirée dansante.",
      compat: 88,
      slots: { max: 3, taken: 2 },
      receivedAt: ago(1, "17:25"),
      status: "nouvelle",
    },
    {
      id: "op-fatou",
      names: ["Fatou", "Ibrahim"],
      date: "2027-10-09",
      zone: "Seine-Saint-Denis",
      guests: 250,
      budget: 2400,
      style: "Traditionnel et moderne",
      need: "Deux jours : cérémonie traditionnelle le samedi, réception le dimanche. Deux photographes souhaités.",
      compat: 81,
      slots: { max: 4, taken: 4 },
      receivedAt: ago(3, "12:10"),
      status: "nouvelle",
    },
  ];
}

export function demoPro(now = new Date()): Pro {
  const v = getVendor(PRO_SLUG)!;
  return {
    profile: {
      description: v.description,
      responseTime: v.responseTime,
      area: v.area,
      style: v.style,
      languages: "Français, anglais, wolof",
      team: "En solo",
    },
    capacity: 1,
    formulas: [
      ...v.packages.map((p, i) => ({ id: `f${i}`, name: p.name, price: p.price, includes: p.includes })),
      { id: "f-destination", name: "Destination", price: null, includes: ["Mariage hors d'Île-de-France", "Déplacement et hébergement compris", "Programme sur mesure"] },
    ],
    options: [
      { id: "opt-album", label: "Album 30×30 cm, 40 pages", price: 320 },
      { id: "opt-second", label: "Second photographe", price: 450 },
      { id: "opt-seance", label: "Séance couple avant le mariage", price: 180 },
      { id: "opt-express", label: "Livraison express sous 10 jours", price: 150 },
    ],
    availability: { "2027-06-05": "Complet", "2027-08-14": "À confirmer" },
    clients: seedClients(now),
    opportunities: seedOpportunities(now),
    replies: {},
    verification: [
      { id: "siret", label: "SIRET ou justificatif professionnel", status: "Validé", detail: "Entreprise individuelle, active" },
      { id: "identite", label: "Identité du représentant légal", status: "Validé" },
      { id: "kyc", label: "Compte de paiement (KYC)", status: "Validé" },
      { id: "coordonnees", label: "Coordonnées professionnelles", status: "Validé" },
      { id: "rc", label: "Assurance responsabilité civile professionnelle", status: "En attente", detail: "Attestation 2027 envoyée, en cours de vérification" },
    ],
    metrics: { completedBookings: 12, verifiedReviews: 9, rating: 4.9, responseRate: 0.96, cancellationRate: 0, openDisputes: 0, lastActivity: isoDate(now) },
  };
}

// Répondre à une opportunité (§19) : une proposition structurée, pas un simple message de prospection.
// Le dossier du couple est créé avec sa demande, puis l'offre version 1.
export function answerOpportunity(p: Pro, id: string, draft: { name: string; lines: OfferLine[] }, note: string, hold: boolean, now = new Date()): { pro: Pro; clientId: string | null } {
  const o = p.opportunities.find((x) => x.id === id);
  if (!o || o.status !== "nouvelle" || o.slots.taken >= o.slots.max) return { pro: p, clientId: null };
  const at = stamp(now);
  const base = project(o.names, o.date, o.guests, 0, "idf", {
    vendors: [{ category: "photographes", vendorSlug: PRO_SLUG, status: "conversation" }],
    conversations: [
      {
        vendorSlug: PRO_SLUG,
        readAt: at,
        vendorReadAt: at,
        pending: [],
        offers: [],
        messages: [
          { id: uid(), from: "celeste", at: o.receivedAt, text: `Demande transmise par Céleste : ${o.compat} % de compatibilité avec votre profil. Budget photo indiqué : ${o.budget.toLocaleString("fr-FR")} €.` },
          { id: uid(), from: "couple", at: o.receivedAt, text: o.need },
        ],
      },
    ],
  });
  const clientId = `c-${o.id}`;
  const w = vendorOffer(base, PRO_SLUG, draft, note, hold, now);
  return {
    clientId,
    pro: {
      ...p,
      clients: [...p.clients, { id: clientId, style: o.style, w }],
      opportunities: p.opportunities.map((x) => (x.id === id ? { ...x, status: "repondue", clientId, slots: { ...x.slots, taken: x.slots.taken + 1 } } : x)),
    },
  };
}

// Brouillon d'offre de départ : la formule la plus complète qui tient dans le budget, sinon la plus accessible ;
// une formule « sur devis » ou un catalogue vide donnent une ligne à chiffrer.
export function startingDraft(pro: Pro, budget?: number): { name: string; lines: OfferLine[] } {
  const priced = pro.formulas.filter((f) => f.price !== null).sort((a, b) => a.price! - b.price!);
  const f = (budget ? [...priced].reverse().find((x) => x.price! <= budget) : undefined) ?? priced[0] ?? pro.formulas[0];
  if (!f) return { name: "Offre sur mesure", lines: [{ key: "l0", label: "Prestation", amount: 0 }] };
  const includes = f.includes.filter((x) => x.trim());
  return { name: f.name, lines: (includes.length ? includes : ["Prestation"]).map((label, i) => ({ key: `l${i}`, label, amount: i === 0 ? (f.price ?? 0) : 0 })) };
}

// Inscription ouverte (§16.2) : le compte existe tout de suite ; la publication et la confiance évoluent
// ensuite selon la complétude du profil, la vérification et l'activité.
export function newPro(a: Omit<ProAccount, "createdAt" | "published">, now = new Date()): Pro {
  return {
    account: { ...a, createdAt: isoDate(now), published: false },
    photos: [],
    profile: { description: "", responseTime: "moins de 24 h", area: a.city, style: "", languages: "Français", team: "En solo" },
    capacity: 1,
    formulas: [],
    options: [],
    availability: {},
    clients: [],
    opportunities: [],
    replies: {},
    verification: [
      { id: "siret", label: "SIRET ou justificatif professionnel", status: "À fournir" },
      { id: "identite", label: "Identité du représentant légal", status: "À fournir" },
      { id: "kyc", label: "Compte de paiement (KYC)", status: "À fournir" },
      { id: "coordonnees", label: "Coordonnées professionnelles", status: "Validé", detail: a.email },
      { id: "rc", label: "Assurance responsabilité civile professionnelle", status: "À fournir" },
    ],
    metrics: { completedBookings: 0, verifiedReviews: 0, rating: 0, responseRate: 0, cancellationRate: 0, openDisputes: 0, lastActivity: isoDate(now) },
  };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Identité affichée dans l'espace pro, que le compte vienne du catalogue (démo) ou d'une inscription.
export function proIdentity(p: Pro) {
  if (p.account) {
    return {
      slug: null as string | null,
      name: p.account.company,
      firstName: p.account.name.trim().split(/\s+/)[0] || p.account.company,
      category: p.account.category,
      categoryLabel: cap(getCategory(p.account.category)?.singular ?? p.account.category),
      area: p.profile.area || p.account.city,
      photo: null as string | null,
      pos: undefined as string | undefined,
      rating: null as string | null,
      reviewsCount: 0,
    };
  }
  const v = getVendor(PRO_SLUG)!;
  return {
    slug: PRO_SLUG as string | null,
    name: v.name,
    firstName: personFor(v).firstName,
    category: v.category,
    categoryLabel: cap(getCategory(v.category)?.singular ?? v.category),
    area: p.profile.area,
    photo: v.photo as string | null,
    pos: v.pos,
    rating: v.rating as string | null,
    reviewsCount: v.reviewsCount,
  };
}

// Échelle de statuts du prestataire (§16.2, §18) : chacun s'appuie sur le précédent.
export function proStatus(p: Pro, openDisputes?: number) {
  const published = p.account ? p.account.published : true;
  const verified = isVerified(p);
  const select = verified && selectCriteria(p, openDisputes).every((c) => c.ok);
  return { published, verified, select, label: select ? "Select" : verified ? "Vérifié" : published ? "Profil publié" : "Inscrit" };
}

// Conditions de publication : de quoi présenter une offre réelle aux couples.
export function publishChecks(p: Pro) {
  return [
    { id: "presentation", label: "Présenter votre activité", ok: p.profile.description.trim().length >= 120, href: "/espace-pro/profil?vue=fiche" },
    { id: "photos", label: "Ajouter au moins 3 photos", ok: (p.photos?.length ?? 0) >= 3, href: "/espace-pro/profil?vue=fiche" },
    { id: "formules", label: "Créer au moins une formule", ok: p.formulas.length > 0, href: "/espace-pro/profil?vue=catalogue" },
    { id: "calendrier", label: "Indiquer vos disponibilités", ok: Object.keys(p.availability).length > 0, href: "/espace-pro/activite?vue=calendrier" },
  ];
}

/* ---------- Stockage (navigateur) ---------- */

const KEY = "celeste:pro";
const listeners = new Set<() => void>();
let cache: Pro | null | undefined;

function read(): Pro | null {
  if (cache !== undefined) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Pro>) : null;
    cache = parsed && Array.isArray(parsed.clients) && Array.isArray(parsed.opportunities) ? { ...demoPro(), ...parsed } as Pro : null;
  } catch {
    cache = null;
  }
  return cache;
}

function write(next: Pro | null) {
  cache = next;
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch {
    /* navigation privée */
  }
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== KEY && e.key !== null) return;
  cache = undefined;
  listeners.forEach((l) => l());
}

// Le stockage a été modifié hors de ce module (changement de compte, src/lib/session.ts) : on relit.
export function reloadPro() {
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

export function usePro() {
  const pro = useSyncExternalStore(subscribe, read, () => null);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const update = useCallback((fn: (p: Pro) => Pro) => {
    const cur = read();
    if (cur) write(fn(cur));
  }, []);
  const start = useCallback(() => write(demoPro()), []);
  const create = useCallback((p: Pro) => write(p), []);
  const reset = useCallback(() => write(null), []);
  return { pro, ready, update, start, create, reset };
}

/* ---------- Dossiers : le couple réel + les clients d'exemple ---------- */

export type ProDeal = { id: string; live: boolean; style: string; w: Wedding; conv: Conversation };

export const LIVE_ID = "couple";

// Tous les dossiers du prestataire, et une seule façon de les modifier, qu'ils viennent de l'espace couple
// ou des données d'exemple.
export function useDeals() {
  const { pro, update: updatePro } = usePro();
  const { wedding, update: updateWedding } = useWedding();
  const deals = useMemo(() => {
    const list: ProDeal[] = [];
    const live = wedding && !pro?.account ? conversationOf(wedding, PRO_SLUG) : undefined;
    if (wedding && live) list.push({ id: LIVE_ID, live: true, style: "Votre démo couple", w: wedding, conv: live });
    for (const c of pro?.clients ?? []) {
      const conv = conversationOf(c.w, PRO_SLUG);
      if (conv) list.push({ id: c.id, live: false, style: c.style, w: c.w, conv });
    }
    return list;
  }, [pro, wedding]);
  const apply = useCallback(
    (id: string, fn: (w: Wedding) => Wedding) => {
      if (id === LIVE_ID) updateWedding(fn);
      else updatePro((p) => ({ ...p, clients: p.clients.map((c) => (c.id === id ? { ...c, w: fn(c.w) } : c)) }));
    },
    [updatePro, updateWedding],
  );
  return { deals, apply, pro, updatePro };
}

export const dealName = (d: ProDeal) => coupleNames(d.w);
export const dealOffer = (d: ProDeal) => offerOf(d.w, PRO_SLUG);

// Réservation confirmée (acompte réglé) ou prestation terminée.
export const isBooking = (d: ProDeal) => {
  const s = dealOffer(d)?.status;
  return s === "confirmee" || d.w.vendors.some((v) => v.vendorSlug === PRO_SLUG && v.status === "termine");
};

export const dealPayments = (d: ProDeal): Payment[] => d.w.payments.filter((p) => p.vendorSlug === PRO_SLUG);
export const dealAppointments = (d: ProDeal): Appointment[] => d.w.appointments.filter((a) => a.vendorSlug === PRO_SLUG);
export const dealDocuments = (d: ProDeal): WeddingDoc[] => d.w.documents.filter((x) => x.vendorSlug === PRO_SLUG);

/* ---------- Calendrier et capacité (§17) ---------- */

// Statut d'une date : les réservations confirmées priment (capacité), puis les offres acceptées en attente
// d'acompte, puis le statut posé par le prestataire. Sans information : « Probablement disponible ».
export function dayStatus(pro: Pro, deals: ProDeal[], iso: string): { status: Availability; booked: number; source: "reservation" | "offre" | "manuel" | "defaut" } {
  const booked = deals.filter((d) => d.w.date === iso && isBooking(d)).length;
  if (booked >= pro.capacity) return { status: "Complet", booked, source: "reservation" };
  if (booked > 0) return { status: "Capacité limitée", booked, source: "reservation" };
  if (deals.some((d) => d.w.date === iso && dealOffer(d)?.status === "acceptee")) return { status: "À confirmer", booked, source: "offre" };
  const manual = pro.availability[iso];
  if (manual) return { status: manual, booked, source: "manuel" };
  return { status: "Probablement disponible", booked, source: "defaut" };
}

export const calendarEnd = (from = new Date()) => {
  const d = new Date(from.getFullYear(), from.getMonth() + CALENDAR_MONTHS, 0);
  return isoDate(d);
};

/* ---------- Confiance : Vérifié et Select (§18) ---------- */

export const isVerified = (pro: Pro) => pro.verification.filter((v) => v.id !== "rc").every((v) => v.status === "Validé");

// Critères Select : seuils administrables (settings), jamais achetables.
export function selectCriteria(pro: Pro, openDisputes = pro.metrics.openDisputes) {
  const m = pro.metrics;
  const t = SELECT_THRESHOLDS;
  return [
    { label: "Statut Vérifié actif", ok: isVerified(pro), value: isVerified(pro) ? "Actif" : "En cours" },
    { label: `Au moins ${t.completedBookings} réservations Céleste terminées`, ok: m.completedBookings >= t.completedBookings, value: String(m.completedBookings) },
    { label: `Au moins ${t.verifiedReviews} avis vérifiés`, ok: m.verifiedReviews >= t.verifiedReviews, value: String(m.verifiedReviews) },
    { label: `Note moyenne d'au moins ${String(t.minRating).replace(".", ",")} / 5`, ok: m.rating >= t.minRating, value: String(m.rating).replace(".", ",") },
    { label: `Taux de réponse d'au moins ${Math.round(t.minResponseRate * 100)} % sur 90 jours`, ok: m.responseRate >= t.minResponseRate, value: `${Math.round(m.responseRate * 100)} %` },
    { label: `Annulations de votre fait : ${Math.round(t.maxCancellationRate * 100)} % au plus`, ok: m.cancellationRate <= t.maxCancellationRate, value: `${Math.round(m.cancellationRate * 100)} %` },
    { label: "Aucun litige grave non résolu", ok: openDisputes === 0, value: String(openDisputes) },
  ];
}

/* ---------- Profil à compléter (§16.3) ---------- */

export function profileCompletion(pro: Pro) {
  const checks = [
    { label: "Présentation d'au moins 120 caractères", ok: pro.profile.description.trim().length >= 120 },
    ...(pro.account ? [{ label: "Au moins 3 photos", ok: (pro.photos?.length ?? 0) >= 3 }] : []),
    { label: "Au moins deux formules", ok: pro.formulas.length >= 2 },
    { label: "Des options chiffrées", ok: pro.options.length > 0 },
    { label: "Langues parlées", ok: !!pro.profile.languages.trim() },
    { label: "Calendrier renseigné pour les 3 prochains mois", ok: Object.keys(pro.availability).some((d) => d >= isoDate() && d <= addDays(isoDate(), 92)) },
    { label: "Vérification complète", ok: pro.verification.every((v) => v.status === "Validé") },
  ];
  return { percent: Math.round((checks.filter((c) => c.ok).length / checks.length) * 100), checks };
}

