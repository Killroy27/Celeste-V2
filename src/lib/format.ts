// Formats de dates et de montants partagés par l'espace couple, la Deal Room et le planning.

// Date du jour au format AAAA-MM-JJ, en heure locale (toISOString est en UTC : décalé la nuit en France).
export function isoDate(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Horodatage local AAAA-MM-JJTHH:MM:SS : comparable comme une chaîne, lisible par new Date().
export function stamp(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${isoDate(d)}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso.slice(0, 10)}T12:00`);
  d.setDate(d.getDate() + days);
  return isoDate(d);
};

// « AAAA-MM-JJ » seul est lu en UTC par new Date() : décalé d'un jour à l'ouest de Greenwich.
// On le lit à midi, heure locale ; un horodatage complet est lu tel quel.
export const parseDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00` : iso);

export const euros = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;

const dayFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });
const fullFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });
const weekdayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });

// « 1er décembre » et non « 1 décembre » : Intl ne gère pas l'ordinal du premier jour du mois.
const first = (s: string) => s.replace(/(^|\s)1 (?=\p{L})/u, "$11er ");

export const formatDay = (iso: string) => first(dayFmt.format(parseDate(iso)));
export const formatDate = (iso: string) => first(fullFmt.format(parseDate(iso)));
export const formatTime = (iso: string) => (iso.includes("T") ? timeFmt.format(parseDate(iso)) : "");
export const formatWeekday = (iso: string) => first(weekdayFmt.format(parseDate(iso)));
// Jours restants jusqu'au début de la journée visée, en heure locale.
export const daysUntil = (iso: string, from = new Date()) => Math.ceil((new Date(iso.length === 10 ? `${iso}T00:00` : iso).getTime() - from.getTime()) / 86_400_000);

// « Aujourd'hui », « Hier » ou la date : séparateurs de la messagerie.
export function relativeDay(iso: string, now = new Date()) {
  const day = iso.slice(0, 10);
  if (day === isoDate(now)) return "Aujourd'hui";
  if (day === addDays(isoDate(now), -1)) return "Hier";
  return formatWeekday(iso);
}

// Heure si c'est aujourd'hui, sinon date courte : liste des conversations.
export function shortWhen(iso: string, now = new Date()) {
  const day = iso.slice(0, 10);
  if (day === isoDate(now)) return formatTime(iso);
  if (day === addDays(isoDate(now), -1)) return "Hier";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(parseDate(iso)).replace(".", "");
}

const MONTH_NAMES = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

// Libellé lisible d'une date de recherche : jour précis (AAAA-MM-JJ), mois (AAAA-MM) ou texte libre.
export function whenLabel(v: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return formatDate(v);
  if (/^\d{4}-\d{2}$/.test(v)) return `${MONTH_NAMES[Number(v.slice(5)) - 1]} ${v.slice(0, 4)}`;
  return v;
}
