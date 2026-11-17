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
