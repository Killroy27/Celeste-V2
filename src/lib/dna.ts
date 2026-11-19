"use client";

import { useEffect, useState } from "react";
import { emptyDna, type Dna } from "./match";

export const DNA_KEY = "celeste:dna";

export function loadDna(): Dna | null {
  try {
    const raw = localStorage.getItem(DNA_KEY);
    return raw ? { ...emptyDna, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

export function saveDna(dna: Dna) {
  try {
    localStorage.setItem(DNA_KEY, JSON.stringify(dna));
  } catch {
    /* navigation privée */
  }
}

// Images enregistrées depuis Inspirations avant que le Wedding DNA existe : gardées à part, puis reprises
// quand le couple crée son Wedding DNA (§6.1). Un DNA vide n'est jamais créé à sa place.
const DRAFT_KEY = "celeste:inspirations";
export function loadDraftInspirations(): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
export function saveDraftInspirations(list: string[]) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(list));
  } catch {
    /* navigation privée */
  }
}

// Wedding DNA enregistré par le parcours Best Match (null tant qu'il n'existe pas).
export function useDna() {
  const [dna, setDna] = useState<Dna | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setDna(loadDna());
    setReady(true);
  }, []);
  return { dna, ready };
}
