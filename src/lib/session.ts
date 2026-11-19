// Connexion et session (CDC §2 rôles séparés, §26 sessions fiables, accès admin restreint).
// PROTOTYPE FRONT : tout reste dans le navigateur. L'empreinte du mot de passe n'est PAS une sécurité réelle ;
// en production, l'authentification, les sessions et les rôles sont gérés côté serveur.
// Un appareil garde un seul espace ouvert par rôle : quand un autre compte se connecte, l'espace du précédent
// est mis de côté sur l'appareil puis restauré à son retour, pour qu'aucun compte ne voie les données d'un autre.

import { useCallback, useSyncExternalStore } from "react";
import { demoAdmin, reloadAdmin } from "./admin";
import { stamp } from "./format";
import { demoPro, reloadPro } from "./pro";
import { demoWedding, newWedding, reloadWedding } from "./wedding";

export type Role = "couple" | "pro" | "admin";
export type Account = { email: string; role: Role; name: string; pwd?: string; demo?: boolean; createdAt: string };
export type Session = { email: string; role: Role; name: string; at: string };

export const ROLE_LABEL: Record<Role, string> = { couple: "Couple", pro: "Prestataire", admin: "Équipe Céleste" };
export const HOME: Record<Role, string> = { couple: "/espace", pro: "/espace-pro", admin: "/admin" };

const SESSION_KEY = "celeste:session";
const ACCOUNTS_KEY = "celeste:accounts";
const DATA_KEY: Record<Role, string> = { couple: "celeste:wedding", pro: "celeste:pro", admin: "celeste:admin" };
const OWNER_KEY = (r: Role) => `celeste:owner:${r}`;
const ARCHIVE_KEY = (r: Role, email: string) => `celeste:archive:${r}:${email}`;
const RELOAD: Record<Role, () => void> = { couple: reloadWedding, pro: reloadPro, admin: reloadAdmin };

// Comptes de démonstration : un par rôle, avec leurs données d'exemple.
export const DEMO: Record<Role, { email: string; name: string; data: () => unknown }> = {
  couple: { email: "claire.thomas@exemple.fr", name: "Claire & Thomas", data: () => demoWedding() },
  pro: { email: "aissatou@studio-aube.fr", name: "Aïssatou Ba · Studio Aube", data: () => demoPro() },
  admin: { email: "equipe@celeste.fr", name: "Équipe Céleste", data: () => demoAdmin() },
};

export const normEmail = (e: string) => e.trim().toLowerCase();

// Empreinte locale du mot de passe (simulation, voir l'en-tête du fichier).
function fingerprint(email: string, pwd: string) {
  let h = 5381;
  for (const ch of `${normEmail(email)}:${pwd}`) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0;
  return h.toString(36);
}

/* ---------- Stockage ---------- */

const get = <T>(k: string): T | null => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};
const raw = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const set = (k: string, v: unknown) => {
  try {
    if (v === null || v === undefined) localStorage.removeItem(k);
    else localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
  } catch {
    /* navigation privée */
  }
};

export function accounts(): Account[] {
  const list = get<Account[]>(ACCOUNTS_KEY);
  if (list) return list;
  // Premier passage : les espaces déjà ouverts sur cet appareil deviennent des comptes (sans mot de passe :
  // il sera choisi à la première connexion). Personne n'est connecté d'office.
  const found: Account[] = [];
  const w = get<{ email?: string; names?: string[] }>(DATA_KEY.couple);
  if (w?.email) found.push({ email: normEmail(w.email), role: "couple", name: (w.names ?? []).filter(Boolean).join(" & ") || w.email, createdAt: stamp() });
  const p = get<{ account?: { email: string; name: string; company: string } }>(DATA_KEY.pro);
  if (p?.account?.email) found.push({ email: normEmail(p.account.email), role: "pro", name: `${p.account.name} · ${p.account.company}`, createdAt: stamp() });
  for (const f of found) set(OWNER_KEY(f.role), f.email);
  set(ACCOUNTS_KEY, found);
  return found;
}

const saveAccounts = (list: Account[]) => set(ACCOUNTS_KEY, list);
const findAccount = (email: string, role: Role) => accounts().find((a) => a.email === normEmail(email) && a.role === role);

function upsertAccount(a: Account) {
  saveAccounts([...accounts().filter((x) => !(x.email === a.email && x.role === a.role)), a]);
}

// Ouvre sur l'appareil l'espace du compte : celui d'un autre compte est mis de côté, le sien est restauré.
function switchData(role: Role, email: string, fresh?: () => unknown) {
  const owner = raw(OWNER_KEY(role));
  const current = raw(DATA_KEY[role]);
  if (owner !== email) {
    if (owner && current) set(ARCHIVE_KEY(role, owner), current);
    const archived = raw(ARCHIVE_KEY(role, email));
    set(DATA_KEY[role], archived ?? (fresh ? fresh() : null));
    set(ARCHIVE_KEY(role, email), null);
    set(OWNER_KEY(role), email);
  } else if (!current && fresh) {
    set(DATA_KEY[role], fresh());
  }
  RELOAD[role]();
}

/* ---------- Session (abonnement React) ---------- */

const listeners = new Set<() => void>();
let cache: Session | null | undefined;

function read(): Session | null {
  if (cache !== undefined) return cache;
  cache = get<Session>(SESSION_KEY);
  return cache;
}

function writeSession(s: Session | null) {
  cache = s;
  set(SESSION_KEY, s);
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== SESSION_KEY && e.key !== null) return;
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

function open(a: Account) {
  writeSession({ email: a.email, role: a.role, name: a.name, at: stamp() });
}

/* ---------- Actions ---------- */

export type SignInResult = { ok: true; role: Role } | { ok: false; error: string; needsPassword?: boolean };

export function signIn(role: Role, email: string, pwd: string): SignInResult {
  const a = findAccount(email, role);
  if (!a) return { ok: false, error: role === "admin" ? "Aucun accès équipe pour cette adresse." : "Aucun compte avec cette adresse. Vérifiez l'e-mail ou créez votre compte." };
  if (!a.pwd) return { ok: false, needsPassword: true, error: "Votre espace a été créé sans mot de passe (en écrivant à un prestataire). Choisissez-en un pour continuer." };
  if (a.pwd !== fingerprint(a.email, pwd)) return { ok: false, error: "Mot de passe incorrect." };
  switchData(role, a.email);
  open(a);
  return { ok: true, role };
}

// Première connexion d'un compte créé sans mot de passe : il le choisit, puis il est connecté.
export function setPasswordAndSignIn(role: Role, email: string, pwd: string): SignInResult {
  const a = findAccount(email, role);
  if (!a) return { ok: false, error: "Aucun compte avec cette adresse." };
  if (a.pwd) return { ok: false, error: "Ce compte a déjà un mot de passe." };
  const next = { ...a, pwd: fingerprint(a.email, pwd) };
  upsertAccount(next);
  switchData(role, a.email);
  open(next);
  return { ok: true, role };
}

// Création du compte couple depuis la page de connexion : l'espace mariage est ouvert aussitôt (§2, un seul compte).
export function signUpCouple(input: { firstName: string; partner?: string; email: string; pwd: string }): SignInResult {
  const email = normEmail(input.email);
  if (findAccount(email, "couple")) return { ok: false, error: "Un compte existe déjà avec cette adresse. Connectez-vous." };
  const name = [input.firstName.trim(), input.partner?.trim()].filter(Boolean).join(" & ");
  const a: Account = { email, role: "couple", name, pwd: fingerprint(email, input.pwd), createdAt: stamp() };
  upsertAccount(a);
  switchData("couple", email, () => {
    const w = newWedding({ firstName: input.firstName.trim(), email });
    return { ...w, names: [input.firstName.trim(), input.partner?.trim() ?? ""] };
  });
  open(a);
  return { ok: true, role: "couple" };
}

// Inscription prestataire (/devenir-prestataire) : le compte et la session sont créés avec l'espace pro.
// L'espace lui-même est écrit par l'appelant (newPro) juste après, sur l'emplacement libéré ici.
export function registerPro(input: { email: string; name: string; company: string; pwd: string }): SignInResult {
  const email = normEmail(input.email);
  if (findAccount(email, "pro")) return { ok: false, error: "Un compte prestataire existe déjà avec cette adresse. Connectez-vous." };
  const a: Account = { email, role: "pro", name: `${input.name} · ${input.company}`, pwd: fingerprint(email, input.pwd), createdAt: stamp() };
  upsertAccount(a);
  switchData("pro", email);
  open(a);
  return { ok: true, role: "pro" };
}

// Espace créé en écrivant à un prestataire (carte de contact) : compte sans mot de passe, connecté tout de suite.
// Renvoie true si ce compte avait déjà un espace sur l'appareil ; sinon l'appelant le crée (newWedding).
export function registerCoupleFromContact(email: string, firstName: string) {
  const e = normEmail(email);
  const existing = findAccount(e, "couple");
  const a: Account = existing ?? { email: e, role: "couple", name: firstName.trim() || e, createdAt: stamp() };
  if (!existing) upsertAccount(a);
  switchData("couple", e);
  open(a);
  return raw(DATA_KEY.couple) !== null;
}

// Comptes de démonstration : connexion immédiate avec les données d'exemple du rôle.
export function signInDemo(role: Role) {
  const d = DEMO[role];
  const a: Account = findAccount(d.email, role) ?? { email: d.email, role, name: d.name, demo: true, createdAt: stamp() };
  upsertAccount({ ...a, demo: true });
  switchData(role, d.email, d.data);
  open(a);
}

// Déconnexion : l'espace reste sur l'appareil, rattaché à son compte, mais n'est plus accessible.
export function signOut() {
  writeSession(null);
}

export function useSession() {
  const session = useSyncExternalStore(subscribe, read, () => null);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const out = useCallback(() => signOut(), []);
  return { session, ready, signOut: out };
}

// Initiales affichées dans l'en-tête (« Claire & Thomas » → « CT »).
export function initials(name: string) {
  const parts = name
    .split(/[\s&·]+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((p) => p[0]!.toUpperCase()).join("") || "?";
}
