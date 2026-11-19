// Céleste Select (CDC §18.2) calculé sur la performance, avec les seuils administrables (§20.3).
// Commun au catalogue public, au back-office et à l'espace prestataire, pour que tous montrent le même badge.

import { getVendor } from "./content";
import { SELECT_THRESHOLDS } from "./settings";

const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

// Indicateurs sur Céleste (démonstration, stables par prestataire). Studio Aube reprend ceux de l'espace
// prestataire de démonstration. En production : calculés depuis les réservations, avis et messages réels.
export function vendorMetrics(slug: string) {
  const v = getVendor(slug);
  if (slug === "studio-aube") return { completedBookings: 12, verifiedReviews: 9, rating: 4.9, responseRate: 0.96, cancellationRate: 0, openDisputes: 0 };
  const h = hash(slug);
  const completed = h % 14;
  return {
    completedBookings: completed,
    verifiedReviews: Math.min(completed, v?.reviewsCount ?? 0),
    rating: Number((v?.rating ?? "0").replace(",", ".")),
    responseRate: 0.82 + (h % 17) / 100,
    cancellationRate: h % 9 === 0 ? 0.06 : 0,
    openDisputes: 0,
  };
}

// Critères de performance remplis (hors vérification et litiges, contrôlés par l'appelant quand il les connaît).
export function meetsSelect(slug: string) {
  const m = vendorMetrics(slug);
  const t = SELECT_THRESHOLDS;
  return m.completedBookings >= t.completedBookings && m.verifiedReviews >= t.verifiedReviews && m.rating >= t.minRating && m.responseRate >= t.minResponseRate && m.cancellationRate <= t.maxCancellationRate;
}

// Badge affiché dans le catalogue : prestataire vérifié qui remplit les critères.
export const isSelectPublic = (slug: string) => !!getVendor(slug)?.verified && meetsSelect(slug);
