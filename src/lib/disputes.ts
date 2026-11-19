"use client";

// Médiation et litiges (CDC §23) : un dossier ouvert depuis une réservation par le couple ou le prestataire,
// suivi par les deux parties et traité par l'équipe Céleste dans le back-office. Les trois espaces lisent le
// même stockage, pour que chacun voie le même état du dossier.
// Prototype : stockage navigateur ; en production, API avec accès restreint aux parties et au support (§22.3).

import { useCallback, useSyncExternalStore } from "react";
import { vendorsIn } from "./content";
import { addDays, isoDate, stamp } from "./format";

// Étapes du processus de médiation, dans l'ordre (§23).
export const DISPUTE_STEPS = [
  "Dossier ouvert",
  "Accusé de réception et motif qualifié",
  "Reversement gelé",
  "Preuves collectées",
  "Réponse des parties (5 jours ouvrés)",
  "Résolution proposée",
  "Dossier clos",
] as const;

export type DisputeDecision = "Remboursement total" | "Remboursement partiel" | "Report" | "Rejet" | "Autre solution acceptée";

export const DISPUTE_MOTIFS = [
  "Prestation non conforme à l'offre",
  "Retard ou absence du prestataire",
  "Annulation par l'autre partie",
  "Problème de paiement",
  "Autre",
] as const;

export type DisputeNote = { id: string; from: "couple" | "prestataire" | "celeste"; at: string; text: string };

export type Dispute = {
  id: string;
  ref: string;
  couple: string;
  coupleEmail?: string; // lien stable avec le projet du couple (le nom affiché peut changer)
  vendorSlug: string;
  amount: number;
  motif: string;
  openedBy: "couple" | "prestataire";
  openedAt: string;
  step: number; // index dans DISPUTE_STEPS
  frozen: boolean;
  evidence: string[];
  notes?: DisputeNote[]; // échanges visibles par les deux parties et par Céleste
  decision?: { kind: DisputeDecision; note: string; at?: string };
  conversationAccess?: boolean; // accès exceptionnel accordé (§22.3)
};

const uid = () => Math.random().toString(36).slice(2, 10);

function demoDisputes(now = new Date()): Dispute[] {
  const ago = (d: number, t = "10:00") => `${addDays(isoDate(now), -d)}T${t}:00`;
  const dj = vendorsIn("dj")[0]?.slug ?? "dj-solal";
  return [
    {
      id: "d1",
      ref: "LIT-2026-014",
      couple: "Sophie et Antoine",
      vendorSlug: "maison-lumen",
      amount: 1240,
      motif: "Photos livrées avec six semaines de retard sur le délai prévu au contrat.",
      openedBy: "couple",
      openedAt: ago(1, "20:15"),
      step: 1,
      frozen: false,
      evidence: ["Offre version 2 acceptée", "Contrat signé"],
    },
    {
      id: "d2",
      ref: "LIT-2026-011",
      couple: "Emma et Lucas",
      vendorSlug: dj,
      amount: 950,
      motif: "Prestation arrêtée une heure avant l'horaire prévu par l'offre.",
      openedBy: "couple",
      openedAt: ago(8, "10:40"),
      step: 4,
      frozen: true,
      evidence: ["Offre version 1 acceptée", "Contrat signé", "Message du couple du lendemain", "Réponse du prestataire"],
    },
  ];
}

const KEY = "celeste:disputes";
const listeners = new Set<() => void>();
let cache: Dispute[] | undefined;

function read(): Dispute[] {
  if (cache !== undefined) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    cache = Array.isArray(parsed) ? (parsed as Dispute[]) : demoDisputes();
  } catch {
    cache = demoDisputes();
  }
  return cache;
}

function write(next: Dispute[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
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

const subscribe = (l: () => void) => {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(l);
  return () => {
    listeners.delete(l);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
};

const EMPTY: Dispute[] = [];

export function useDisputes() {
  const disputes = useSyncExternalStore(subscribe, read, () => EMPTY);
  const update = useCallback((fn: (list: Dispute[]) => Dispute[]) => write(fn(read())), []);
  // Ouverture par une partie (§23, étape 16) : accusé de réception immédiat, objectif de prise en charge rappelé.
  const open = useCallback((d: Omit<Dispute, "id" | "ref" | "openedAt" | "step" | "frozen" | "notes">, firstNote: string) => {
    const list = read();
    const at = stamp();
    const ref = `LIT-${new Date().getFullYear()}-${String(15 + list.length).padStart(3, "0")}`;
    const created: Dispute = {
      ...d,
      id: uid(),
      ref,
      openedAt: at,
      step: 0,
      frozen: false,
      notes: [
        { id: uid(), from: d.openedBy, at, text: firstNote },
        { id: uid(), from: "celeste", at, text: `Accusé de réception : votre dossier ${ref} est ouvert. Notre objectif est une première prise en charge sous 2 jours ouvrés ; chaque partie pourra ensuite apporter ses éléments.` },
      ],
    };
    write([created, ...list]);
    return created;
  }, []);
  const addNote = useCallback((id: string, from: DisputeNote["from"], text: string) => {
    write(read().map((x) => (x.id === id ? { ...x, notes: [...(x.notes ?? []), { id: uid(), from, at: stamp(), text: text.trim() }] } : x)));
  }, []);
  return { disputes, update, open, addNote };
}

export const openDisputeList = (list: Dispute[]) => list.filter((d) => d.step < DISPUTE_STEPS.length - 1);
// Dossiers d'un couple avec un prestataire : par e-mail quand il est connu, sinon par le nom affiché.
export const isCouple = (d: Dispute, couple: string, email?: string) => (d.coupleEmail && email ? d.coupleEmail === email : d.couple === couple);
export const disputesFor = (list: Dispute[], couple: string, vendorSlug: string, email?: string) => list.filter((d) => d.vendorSlug === vendorSlug && isCouple(d, couple, email));
