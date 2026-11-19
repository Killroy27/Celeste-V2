"use client";

// Back-office administrateur (CDC §20, §22.3, §23, §24, écrans §30.3). Démonstration : les données des
// prestataires viennent du catalogue, les réservations des espaces couple et prestataire de cet appareil,
// le reste (litiges, signalements, tickets) est d'exemple. Toute action sensible demande un motif et
// s'inscrit au journal d'audit (§20.5). À remplacer par l'API, avec contrôle des rôles côté serveur (§26).

import { useCallback, useSyncExternalStore } from "react";
import { coupleNames, offerOf } from "./deal";
import { addDays, isoDate, stamp } from "./format";
import { vendors, vendorsIn } from "./content";
import { PRO_SLUG, type Pro } from "./pro";
import { openDisputeList, type Dispute } from "./disputes";
import { meetsSelect } from "./select";
export { vendorMetrics } from "./select";
import type { Payment, Wedding } from "./wedding";

/* ---------- Rôles (§20.6) ---------- */

export type Role = "Super Admin" | "Support" | "Finance" | "Modération" | "Marketing / contenu";
export const ROLES: Role[] = ["Super Admin", "Support", "Finance", "Modération", "Marketing / contenu"];

export type Section = "dashboard" | "utilisateurs" | "prestataires" | "marketplace" | "reservations" | "finance" | "support" | "parametres";

// Qui peut agir dans chaque section. Tout le monde peut consulter le tableau de bord.
export const PERMISSIONS: Record<Section, Role[]> = {
  dashboard: ROLES,
  utilisateurs: ["Super Admin", "Support"],
  prestataires: ["Super Admin", "Modération", "Support"],
  marketplace: ["Super Admin", "Marketing / contenu", "Modération"],
  reservations: ["Super Admin", "Support", "Finance"],
  finance: ["Super Admin", "Finance"],
  support: ["Super Admin", "Support", "Modération"],
  parametres: ["Super Admin"],
};

export const can = (role: Role, section: Section) => PERMISSIONS[section].includes(role);

/* ---------- Types ---------- */

export type AuditEntry = { id: string; at: string; role: Role; action: string; target: string; reason: string };

export type DocStatus = "Validé" | "À vérifier" | "Refusé" | "Manquant";
export type VendorCase = {
  slug: string;
  docs: { id: string; label: string; status: DocStatus }[];
  submittedAt?: string;
  suspended: boolean;
  selectRevoked: boolean;
};

// Signal anti-contournement (§22.1) : le type de motif détecté, jamais le contenu du message.
export type Signal = { id: string; vendorSlug: string; at: string; kind: string; warned: boolean };

// Les litiges sont partagés avec les espaces couple et prestataire (src/lib/disputes.ts).
export { DISPUTE_STEPS, type Dispute, type DisputeDecision } from "./disputes";

export type ReportedReview = { id: string; vendorSlug: string; author: string; rating: number; text: string; reason: string; verifiedBooking: boolean; status: "Signalé" | "Conservé" | "Retiré" };
export type Ticket = { id: string; from: string; role: "Couple" | "Prestataire"; subject: string; at: string; status: "Ouvert" | "Résolu" };
export type FailedPayment = { id: string; couple: string; vendorSlug: string; amount: number; at: string; reason: string; status: "Échoué" | "Relancé" };

export type Admin = {
  role: Role;
  audit: AuditEntry[];
  cases: Record<string, VendorCase>;
  signals: Signal[];
  reviews: ReportedReview[];
  tickets: Ticket[];
  failed: FailedPayment[];
  categoriesOff: string[]; // catégories masquées de la marketplace
};

/* ---------- Données de démonstration ---------- */

const uid = () => Math.random().toString(36).slice(2, 10);

export function demoAdmin(now = new Date()): Admin {
  const ago = (d: number, t = "10:00") => `${addDays(isoDate(now), -d)}T${t}:00`;
  const cases: Record<string, VendorCase> = {};
  vendors.forEach((v, i) => {
    const pending = !v.verified;
    cases[v.slug] = {
      slug: v.slug,
      suspended: false,
      selectRevoked: false,
      ...(pending ? { submittedAt: ago(1 + (i % 6), "09:30") } : {}),
      docs: [
        { id: "siret", label: "SIRET ou justificatif professionnel", status: "Validé" },
        { id: "identite", label: "Identité du représentant légal", status: pending ? "À vérifier" : "Validé" },
        { id: "kyc", label: "Compte de paiement (KYC)", status: pending ? (i % 2 ? "Manquant" : "À vérifier") : "Validé" },
        { id: "coordonnees", label: "Coordonnées professionnelles", status: "Validé" },
        { id: "rc", label: "Assurance responsabilité civile professionnelle", status: pending ? "À vérifier" : "Validé" },
      ],
    };
  });
  const traiteur = vendorsIn("traiteurs")[1]?.slug ?? "maison-saveurs";
  return {
    role: "Super Admin",
    cases,
    signals: [
      { id: uid(), vendorSlug: "groove-maison", at: ago(0, "11:42"), kind: "Numéro de téléphone", warned: false },
      { id: uid(), vendorSlug: "groove-maison", at: ago(2, "18:05"), kind: "Invitation à payer hors de Céleste", warned: false },
      { id: uid(), vendorSlug: "table-de-yaa", at: ago(4, "09:12"), kind: "Adresse e-mail", warned: true },
    ],
    reviews: [
      { id: "r1", vendorSlug: traiteur, author: "Paul D.", rating: 2, text: "Le service était lent et le plat principal est arrivé froid pour une partie des invités.", reason: "Le prestataire conteste les faits décrits", verifiedBooking: true, status: "Signalé" },
      { id: "r2", vendorSlug: "atelier-kofi-ama", author: "Anonyme", rating: 1, text: "Arnaque totale, fuyez !!!", reason: "Propos injurieux, sans description de la prestation", verifiedBooking: true, status: "Signalé" },
    ],
    tickets: [
      { id: "t1", from: "Nina et Omar", role: "Couple", subject: "Mon paiement a été refusé, que faire ?", at: ago(0, "09:05"), status: "Ouvert" },
      { id: "t2", from: "Fleurs de Saison", role: "Prestataire", subject: "Comment indiquer que je peux faire deux mariages le même jour ?", at: ago(1, "15:30"), status: "Ouvert" },
      { id: "t3", from: "Julie et Hugo", role: "Couple", subject: "Demande d'export de nos données", at: ago(3, "11:00"), status: "Résolu" },
    ],
    failed: [
      { id: "f1", couple: "Nina et Omar", vendorSlug: traiteur, amount: 2340, at: ago(0, "08:58"), reason: "Fonds insuffisants", status: "Échoué" },
      { id: "f2", couple: "Inès et Karim", vendorSlug: "chateau-des-lys", amount: 1950, at: ago(6, "14:20"), reason: "Authentification 3-D Secure abandonnée", status: "Relancé" },
    ],
    categoriesOff: [],
    audit: [
      { id: uid(), at: ago(2, "16:10"), role: "Modération", action: "Document validé", target: "Studio Aube · Assurance RC pro", reason: "Attestation 2027 conforme" },
      { id: uid(), at: ago(5, "11:25"), role: "Super Admin", action: "Règle modifiée", target: "Seuils Select", reason: "Valeurs de lancement du cahier des charges" },
    ],
  };
}

/* ---------- Stockage (navigateur) ---------- */

const KEY = "celeste:admin";
const listeners = new Set<() => void>();
let cache: Admin | null | undefined;

function read(): Admin | null {
  if (cache !== undefined) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Admin>) : null;
    cache = parsed && Array.isArray(parsed.audit) ? ({ ...demoAdmin(), ...parsed } as Admin) : null;
  } catch {
    cache = null;
  }
  return cache;
}

function write(next: Admin | null) {
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
export function reloadAdmin() {
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

export function useAdmin() {
  const admin = useSyncExternalStore(subscribe, read, () => null);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const update = useCallback((fn: (a: Admin) => Admin) => {
    const cur = read();
    if (cur) write(fn(cur));
  }, []);
  // Action sensible : appliquée et tracée en une seule écriture, avec le rôle courant et le motif (§20.5).
  const act = useCallback((action: string, target: string, reason: string, fn: (a: Admin) => Admin = (a) => a) => {
    const cur = read();
    if (!cur) return;
    const next = fn(cur);
    write({ ...next, audit: [{ id: uid(), at: stamp(), role: cur.role, action, target, reason: reason.trim() }, ...next.audit] });
  }, []);
  const start = useCallback(() => write(demoAdmin()), []);
  return { admin, ready, update, act, start };
}

/* ---------- Vues calculées ---------- */

// « À vérifier » : un document attend l'équipe. « Incomplet » : on attend le prestataire (document refusé ou manquant).
export type VendorState = "Vérifié" | "À vérifier" | "Incomplet" | "Suspendu";

export function vendorState(a: Admin, slug: string): VendorState {
  const c = a.cases[slug];
  if (!c) return "Incomplet";
  if (c.suspended) return "Suspendu";
  if (c.docs.every((d) => d.status === "Validé")) return "Vérifié";
  return c.docs.some((d) => d.status === "À vérifier") ? "À vérifier" : "Incomplet";
}

// Select calculé sur la performance avec les seuils administrables (§18.2, §20.3). Seul un retrait motivé
// (litige grave, fraude) peut l'enlever à un prestataire qui remplit les critères.
export function isSelect(a: Admin, slug: string, disputes: Dispute[] = []) {
  if (vendorState(a, slug) !== "Vérifié" || a.cases[slug]?.selectRevoked) return false;
  return meetsSelect(slug) && !openDisputeList(disputes).some((d) => d.vendorSlug === slug);
}

export type MarketBooking = { id: string; couple: string; vendorSlug: string; total: number; status: "Acceptée" | "Confirmée"; date: string; payments: Payment[]; source: string };

// Réservations de la marketplace visibles sur cet appareil : celles de l'espace couple et de l'espace pro.
export function marketBookings(wedding: Wedding | null, pro: Pro | null): MarketBooking[] {
  const out: MarketBooking[] = [];
  const add = (w: Wedding, slug: string, source: string) => {
    const o = offerOf(w, slug);
    if (!o || (o.status !== "acceptee" && o.status !== "confirmee")) return;
    out.push({ id: `${source}-${slug}-${w.names.join("")}`, couple: coupleNames(w), vendorSlug: slug, total: o.total, status: o.status === "confirmee" ? "Confirmée" : "Acceptée", date: w.date, payments: w.payments.filter((p) => p.vendorSlug === slug), source });
  };
  if (wedding) for (const c of wedding.conversations) add(wedding, c.vendorSlug, "Espace couple");
  for (const c of pro?.clients ?? []) add(c.w, PRO_SLUG, "Espace prestataire");
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export { openDisputeList as openDisputes } from "./disputes";
