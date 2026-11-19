// Paramètres de la marketplace, administrables depuis le back-office (CDC §20.3).
// Les valeurs ci-dessous sont celles du cahier des charges, utilisées par défaut. Le back-office (/admin) peut
// les ajuster sans déploiement : ses réglages s'appliquent par-dessus (applyOverrides, plus bas) et chaque
// modification est tracée dans le journal d'audit (§20.5).
// Prototype : réglages enregistrés dans le navigateur. En production, ils viendront de l'API.

/* ---------- Best Match (§7) ---------- */

// Dépassement de budget toléré quand la compatibilité est forte (§7.6).
// À AUDITER : la valeur doit reprendre la logique de l'agent développé par Bovo avant mise en production (§32).
export let BUDGET_TOLERANCE = 0.1;

// Pondérations du score (§7.2). Leur somme vaut 1 ; aucune pondération ne dépend d'un abonnement payant (§3).
export const MATCH_WEIGHTS: Record<"style" | "miniTest" | "budget" | "availability" | "zone" | "reputation" | "capacity", number> = {
  style: 0.28,
  miniTest: 0.14,
  budget: 0.2,
  availability: 0.15,
  zone: 0.1,
  reputation: 0.08,
  capacity: 0.05,
};

// Bonus quand le métier fait partie des priorités du couple, et plafond du score affiché.
export let PRIORITY_BONUS = 0.03;
export let MAX_SCORE = 0.97;

// Part indicative du budget global consacrée à chaque métier, pour estimer l'enveloppe par catégorie.
export const BUDGET_SHARE: Record<string, number> = {
  lieux: 0.3,
  traiteurs: 0.3,
  photographes: 0.1,
  videastes: 0.07,
  dj: 0.05,
  musique: 0.04,
  fleuristes: 0.05,
  decoration: 0.06,
  "wedding-planners": 0.08,
  animation: 0.03,
  transport: 0.02,
  location: 0.04,
  papeterie: 0.01,
  patisserie: 0.02,
  beaute: 0.02,
  tenues: 0.06,
};
export const DEFAULT_BUDGET_SHARE = 0.05;

/* ---------- Paiement et réservation (§14) ---------- */

// Paiement en une fois, ou acompte puis solde en 1 à 3 échéances (§14.1).
export let DEPOSIT_RATE = 0.3;
export let MAX_INSTALLMENTS = 3;

// Blocage temporaire d'une date pendant une négociation avancée (§14.5).
export let DATE_HOLD_HOURS = 48;
export const DATE_HOLD_MAX_HOURS = 72;

// Durée de validité d'une offre envoyée dans la Deal Room, avant l'état « Expirée » (§11.2).
// Non fixée par le cahier des charges : valeur de démonstration, à valider avec les prestataires.
export let OFFER_VALIDITY_DAYS = 14;

// Disponibilités : horizon minimal du calendrier prestataire (§17).
export const CALENDAR_MONTHS = 24;

/* ---------- Céleste Select (§18.2) ---------- */

export const SELECT_THRESHOLDS = {
  completedBookings: 5,
  verifiedReviews: 5,
  minRating: 4.5,
  minResponseRate: 0.9, // sur les 90 derniers jours
  maxCancellationRate: 0.05,
};

// Non définis ici, volontairement : commission prestataire, frais de service couple, barème d'annulation,
// délai de reversement. Ils dépendent de validations juridiques et fiscales (§21.4, §32) que le front ne doit pas inventer.

/* ---------- Réglages du back-office (§20.3) ---------- */

// Catégories désactivées depuis le back-office (§4) : masquées des parcours de choix de métier.
export let CATEGORIES_OFF: string[] = [];

export type Settings = {
  budgetTolerance: number;
  priorityBonus: number;
  maxScore: number;
  weights: typeof MATCH_WEIGHTS;
  select: typeof SELECT_THRESHOLDS;
  depositRate: number;
  maxInstallments: number;
  dateHoldHours: number;
  offerValidityDays: number;
  budgetShare: Record<string, number>;
  categoriesOff: string[];
};

export type Overrides = Partial<Omit<Settings, "weights" | "select">> & { weights?: Partial<Settings["weights"]>; select?: Partial<Settings["select"]> };

export function currentSettings(): Settings {
  return {
    budgetTolerance: BUDGET_TOLERANCE,
    priorityBonus: PRIORITY_BONUS,
    maxScore: MAX_SCORE,
    weights: { ...MATCH_WEIGHTS },
    select: { ...SELECT_THRESHOLDS },
    depositRate: DEPOSIT_RATE,
    maxInstallments: MAX_INSTALLMENTS,
    dateHoldHours: DATE_HOLD_HOURS,
    offerValidityDays: OFFER_VALIDITY_DAYS,
    budgetShare: { ...BUDGET_SHARE },
    categoriesOff: [...CATEGORIES_OFF],
  };
}

// Valeurs du cahier des charges, figées au chargement : base de toute remise à zéro.
export const DEFAULT_SETTINGS: Settings = currentSettings();

const clamp = (n: unknown, min: number, max: number, fallback: number) => (typeof n === "number" && Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback);

// Applique les réglages du back-office par-dessus les valeurs par défaut, avec des bornes de sécurité.
// Les modules qui importent ces constantes lisent toujours la valeur à jour (liaisons ES vivantes).
export function applyOverrides(input: Overrides | null = {}) {
  const o: Overrides = input && typeof input === "object" ? input : {};
  const d = DEFAULT_SETTINGS;
  BUDGET_TOLERANCE = clamp(o.budgetTolerance, 0, 0.5, d.budgetTolerance);
  PRIORITY_BONUS = clamp(o.priorityBonus, 0, 0.2, d.priorityBonus);
  MAX_SCORE = clamp(o.maxScore, 0.5, 1, d.maxScore);
  DEPOSIT_RATE = clamp(o.depositRate, 0.1, 0.9, d.depositRate);
  MAX_INSTALLMENTS = Math.round(clamp(o.maxInstallments, 1, 6, d.maxInstallments));
  DATE_HOLD_HOURS = Math.round(clamp(o.dateHoldHours, 0, DATE_HOLD_MAX_HOURS, d.dateHoldHours));
  OFFER_VALIDITY_DAYS = Math.round(clamp(o.offerValidityDays, 1, 90, d.offerValidityDays));
  for (const k of Object.keys(MATCH_WEIGHTS) as (keyof typeof MATCH_WEIGHTS)[]) MATCH_WEIGHTS[k] = clamp(o.weights?.[k], 0, 1, d.weights[k]);
  // Les pondérations font toujours 100 % : sinon tous les scores seraient gonflés ou écrasés.
  const sum = Object.values(MATCH_WEIGHTS).reduce((t, w) => t + w, 0);
  for (const k of Object.keys(MATCH_WEIGHTS) as (keyof typeof MATCH_WEIGHTS)[]) MATCH_WEIGHTS[k] = sum > 0 ? MATCH_WEIGHTS[k] / sum : d.weights[k];
  // Bornes propres à chaque seuil : un nombre, une note sur 5, ou un taux entre 0 et 1.
  const selectMax: Record<keyof typeof SELECT_THRESHOLDS, number> = { completedBookings: 1000, verifiedReviews: 1000, minRating: 5, minResponseRate: 1, maxCancellationRate: 1 };
  for (const k of Object.keys(SELECT_THRESHOLDS) as (keyof typeof SELECT_THRESHOLDS)[]) SELECT_THRESHOLDS[k] = clamp(o.select?.[k], 0, selectMax[k], d.select[k]);
  for (const k of Object.keys(BUDGET_SHARE)) BUDGET_SHARE[k] = clamp(o.budgetShare?.[k], 0, 1, d.budgetShare[k]);
  CATEGORIES_OFF = Array.isArray(o.categoriesOff) ? o.categoriesOff.filter((x): x is string => typeof x === "string") : [];
}

// Règle de paiement en clair, une seule formulation partout (§14.1).
export function paymentRule(deposit = DEPOSIT_RATE, installments = MAX_INSTALLMENTS) {
  const d = Math.round(deposit * 100);
  return { deposit: d, balance: installments > 1 ? `le solde en 1 à ${installments} fois` : "le solde en une fois" };
}

export const SETTINGS_KEY = "celeste:settings";

export function loadOverrides(): Overrides {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Overrides) : {};
  } catch {
    return {};
  }
}

// Enregistre des réglages du back-office et les applique tout de suite. Les écrans affichés ensuite
// (et les autres onglets, à leur prochain chargement) utilisent les nouvelles valeurs. Renvoie les valeurs
// réellement appliquées, après bornes de sécurité.
export function saveOverrides(patch: Overrides): Settings {
  const next = { ...loadOverrides(), ...patch };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    /* navigation privée : appliqué pour cette session seulement */
  }
  applyOverrides(next);
  return currentSettings();
}

// Navigateur : on applique les réglages enregistrés dès le chargement, et ceux d'un autre onglet (back-office)
// dès qu'ils changent. Côté serveur, les valeurs par défaut s'appliquent.
if (typeof window !== "undefined") {
  applyOverrides(loadOverrides());
  window.addEventListener("storage", (e) => {
    if (e.key === SETTINGS_KEY || e.key === null) applyOverrides(loadOverrides());
  });
}
