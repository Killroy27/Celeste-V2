// Best Match : questions et moteur de score (prototype).
// Conforme au cahier des charges : Wedding DNA commun (§6), une porte d'entrée (§8.1), mini-test de 1 à 2
// questions par métier en cartes visuelles (§7.1), critères bloquants choisis par le couple (§7.4),
// score déterministe et expliqué (§7.5, §7.7), léger dépassement de budget toléré (§7.6).

import { categories, vendorsIn, type Vendor } from "./content";
import { availabilityFor } from "./vendorDetail";

/* ---------- Wedding DNA ---------- */

export type Dna = {
  ambiances: string[];
  inspirations: string[]; // photos aimées
  tags: string[]; // tags tirés des inspirations, corrigibles (§6.2)
  season?: string;
  date?: string;
  flexible: boolean;
  zone?: string;
  guests: number;
  budget: number;
  priorities: string[];
  musts: string[]; // critères indispensables (§7.4)
};

export const emptyDna: Dna = { ambiances: [], inspirations: [], tags: [], flexible: true, guests: 100, budget: 25000, priorities: [], musts: [] };

export const ambiances = [
  { value: "romantique", label: "Romantique", photo: "/photos/rings.jpg", styles: ["Romantique", "Intemporel", "Naturel", "Pièce montée", "Wedding cake", "Cérémonie classique"] },
  { value: "champetre", label: "Champêtre", photo: "/photos/field.jpg", styles: ["Champêtre", "Bistronomie", "Naturel", "Reportage"] },
  { value: "boheme", label: "Bohème", photo: "/photos/deco.jpg", styles: ["Bohème", "Reportage", "Documentaire", "Naturel"] },
  { value: "chateau", label: "Château", photo: "/photos/chateau.jpg", styles: ["Château", "Intemporel", "Gastronomique", "Cérémonie classique"] },
  { value: "urbain", label: "Urbain chic", photo: "/photos/rain.jpg", styles: ["Urbain", "Moderne", "Open format", "Cinématique", "Cocktail dînatoire"] },
  { value: "mer", label: "Bord de mer", photo: "/photos/beach.jpg", styles: ["Destination", "Teaser", "Naturel"] },
  { value: "festive", label: "Festive", photo: "/photos/dance.jpg", styles: ["Soirée", "Open format", "Afro & Amapiano", "Cocktail dînatoire"] },
  { value: "multiculturel", label: "Multiculturel", photo: "/photos/kente.jpg", styles: ["Traditionnel", "Afro-fusion", "Afro & Amapiano", "Wax chic", "Cheveux texturés"] },
];

// Inspirations : chaque photo porte des tags que le couple peut corriger (§6.2).
export const inspirationPool: { src: string; tags: string[] }[] = [
  { src: "/photos/aisle.jpg", tags: ["Champêtre", "Cérémonie en plein air"] },
  { src: "/photos/rings.jpg", tags: ["Romantique", "Détails"] },
  { src: "/photos/rain.jpg", tags: ["Urbain", "Paris"] },
  { src: "/photos/kente.jpg", tags: ["Multiculturel", "Couleurs"] },
  { src: "/photos/deco.jpg", tags: ["Bohème", "Bougies"] },
  { src: "/photos/chateau.jpg", tags: ["Château", "Dîner"] },
  { src: "/photos/dance.jpg", tags: ["Festive", "Soirée"] },
  { src: "/photos/beach.jpg", tags: ["Bord de mer", "Coucher de soleil"] },
  { src: "/photos/florist.jpg", tags: ["Fleurs de saison"] },
  { src: "/photos/cake.jpg", tags: ["Pièce montée", "Romantique"] },
  { src: "/photos/field.jpg", tags: ["Champêtre", "Golden hour"] },
  { src: "/photos/bridesmaids.jpg", tags: ["Témoins", "Pastel"] },
];

export const seasons = [
  { value: "printemps", label: "Printemps", sub: "Mars à juin", months: ["Mai 2027", "Juin 2027"] },
  { value: "ete", label: "Été", sub: "Juin à septembre", months: ["Juin 2027", "Juil. 2027", "Août 2027", "Sept. 2027"] },
  { value: "automne", label: "Automne", sub: "Septembre à novembre", months: ["Sept. 2027", "Oct. 2027"] },
  { value: "hiver", label: "Hiver", sub: "Décembre à février", months: [] as string[] },
];

export const zones = [
  { value: "paris", label: "Paris", idf: true },
  { value: "idf", label: "Île-de-France", idf: true },
  { value: "provence", label: "Provence", idf: false },
  { value: "cote-azur", label: "Côte d'Azur", idf: false },
  { value: "bretagne", label: "Bretagne", idf: false },
  { value: "autre", label: "Ailleurs en France", idf: false },
];

export const priorities = [
  { value: "lieux", label: "Le lieu" },
  { value: "photographes", label: "Les photos" },
  { value: "traiteurs", label: "Le repas" },
  { value: "dj", label: "La fête" },
  { value: "fleuristes", label: "Les fleurs" },
  { value: "decoration", label: "La décoration" },
];

export const mustOptions = [
  { value: "date", label: "Notre date", sub: "Libre le jour J" },
  { value: "zone", label: "Notre région", sub: "Se déplace jusqu'à nous" },
  { value: "budget", label: "Notre budget", sub: "Reste dans notre enveloppe" },
  { value: "capacity", label: "Le nombre d'invités", sub: "Accueille tout le monde" },
];

/* ---------- Mini-tests par métier (§7.1 : 1 à 2 questions, cartes visuelles, un tap) ---------- */

export type MiniOption = { value: string; label: string; sub?: string; photo?: string; styles?: string[]; tier?: number };
export type MiniQuestion = { key: string; label: string; options: MiniOption[] };

export const miniTests: Record<string, MiniQuestion[]> = {
  photographes: [
    {
      key: "style",
      label: "Quelles photos vous font vibrer ?",
      options: [
        { value: "reportage", label: "Reportage spontané", sub: "Authentique, sans pose", photo: "/photos/confetti.jpg", styles: ["Reportage", "Documentaire", "Naturel"] },
        { value: "editorial", label: "Posé et éditorial", sub: "Soigné, façon magazine", photo: "/photos/field.jpg", styles: ["Intemporel", "Champêtre", "Destination"] },
        { value: "melange", label: "Un peu des deux", sub: "Le naturel, avec quelques portraits", photo: "/photos/rain.jpg" },
      ],
    },
    {
      key: "coverage",
      label: "Jusqu'où vous suivre ?",
      options: [
        { value: "essentiel", label: "Cérémonie et cocktail", sub: "L'essentiel", photo: "/photos/aisle.jpg", tier: 0 },
        { value: "journee", label: "Toute la journée", sub: "Des préparatifs à la première danse", photo: "/photos/bride.jpg", tier: 1 },
        { value: "signature", label: "Du matin au bout de la nuit", sub: "Deux photographes, album", photo: "/photos/dance.jpg", tier: 2 },
      ],
    },
  ],
  lieux: [
    {
      key: "type",
      label: "Quel lieu vous fait rêver ?",
      options: [
        { value: "chateau", label: "Château", photo: "/photos/chateau.jpg", styles: ["Château", "Intemporel"] },
        { value: "domaine", label: "Domaine champêtre", photo: "/photos/aisle.jpg", styles: ["Champêtre"] },
        { value: "jardin", label: "Jardin ou rooftop", photo: "/photos/hero.jpg", styles: ["Moderne"] },
      ],
    },
    {
      key: "traiteur",
      label: "Et pour le traiteur ?",
      options: [
        { value: "libre", label: "Liberté totale", sub: "Nous choisissons notre traiteur", photo: "/photos/chef.jpg" },
        { value: "inclus", label: "Clé en main", sub: "Le lieu s'occupe de tout", photo: "/photos/deco.jpg" },
      ],
    },
  ],
  traiteurs: [
    {
      key: "format",
      label: "Quel repas imaginez-vous ?",
      options: [
        { value: "table", label: "Dîner servi à table", photo: "/photos/chef.jpg", styles: ["Gastronomique", "Bistronomie"] },
        { value: "buffet", label: "Buffet convivial", photo: "/photos/kente.jpg", styles: ["Afro-fusion", "Bistronomie"] },
        { value: "cocktail", label: "Cocktail dînatoire", photo: "/photos/deco.jpg", styles: ["Cocktail dînatoire"] },
      ],
    },
  ],
  videastes: [
    {
      key: "film",
      label: "Quel film voulez-vous garder ?",
      options: [
        { value: "cinema", label: "Cinématique", sub: "Monté comme un film", photo: "/photos/hero.jpg", styles: ["Cinématique"] },
        { value: "doc", label: "Documentaire", sub: "Le déroulé fidèle", photo: "/photos/dance.jpg", styles: ["Documentaire"] },
        { value: "teaser", label: "Un teaser court", sub: "À partager", photo: "/photos/confetti.jpg", styles: ["Teaser"] },
      ],
    },
  ],
  dj: [
    {
      key: "music",
      label: "Quelle musique pour la soirée ?",
      options: [
        { value: "open", label: "Un peu de tout", sub: "Des tubes pour tout le monde", photo: "/photos/dance.jpg", styles: ["Open format"] },
        { value: "afro", label: "Afro et amapiano", photo: "/photos/kente.jpg", styles: ["Afro & Amapiano"] },
        { value: "live", label: "Musiciens en live", sub: "Pour la cérémonie", photo: "/photos/aisle.jpg", styles: ["Cérémonie classique"] },
      ],
    },
  ],
  fleuristes: [
    {
      key: "flowers",
      label: "Quelles fleurs vous ressemblent ?",
      options: [
        { value: "sauvage", label: "Sauvages et champêtres", photo: "/photos/field.jpg", styles: ["Champêtre"] },
        { value: "opulent", label: "Généreuses et romantiques", photo: "/photos/rings.jpg", styles: ["Romantique"] },
        { value: "graphique", label: "Graphiques et modernes", photo: "/photos/florist.jpg", styles: ["Moderne"] },
      ],
    },
  ],
  decoration: [
    {
      key: "decor",
      label: "Quel décor imaginez-vous ?",
      options: [
        { value: "boheme", label: "Bohème", photo: "/photos/deco.jpg", styles: ["Bohème"] },
        { value: "classique", label: "Chic et intemporel", photo: "/photos/chateau.jpg", styles: ["Intemporel"] },
        { value: "wax", label: "Wax et couleurs", photo: "/photos/kente.jpg", styles: ["Wax chic"] },
      ],
    },
  ],
  patisserie: [
    {
      key: "cake",
      label: "Quel gâteau pour le dessert ?",
      options: [
        { value: "piece", label: "Pièce montée", photo: "/photos/cake.jpg", styles: ["Pièce montée"] },
        { value: "wedding", label: "Wedding cake", photo: "/photos/rings.jpg", styles: ["Wedding cake"] },
      ],
    },
  ],
  beaute: [
    {
      key: "look",
      label: "Quel look pour le jour J ?",
      options: [
        { value: "naturel", label: "Naturel et lumineux", photo: "/photos/bride.jpg", styles: ["Naturel"] },
        { value: "textures", label: "Cheveux texturés sublimés", photo: "/photos/bridesmaids.jpg", styles: ["Cheveux texturés"] },
      ],
    },
  ],
};

/* ---------- Moteur de score (déterministe, §7.7) ---------- */

// Part indicative du budget global consacrée à chaque métier.
const budgetShare: Record<string, number> = {
  lieux: 0.3,
  traiteurs: 0.3,
  photographes: 0.1,
  videastes: 0.07,
  dj: 0.05,
  fleuristes: 0.05,
  decoration: 0.06,
  patisserie: 0.02,
  beaute: 0.02,
};

export type Match = {
  vendor: Vendor;
  score: number;
  reasons: string[];
  gaps: string[];
  availability: string;
  confidence: "Élevé" | "Bon" | "À préciser";
  withinBudget: boolean;
  excluded: boolean;
};

export function computeMatches(dna: Dna, category: string, answers: Record<string, string>): Match[] {
  const amb = ambiances.filter((a) => dna.ambiances.includes(a.value)).flatMap((a) => a.styles);
  const tagStyles = dna.tags;
  const test = miniTests[category] ?? [];
  const chosen = test.map((q) => q.options.find((o) => o.value === answers[q.key])).filter(Boolean) as MiniOption[];
  const testStyles = chosen.flatMap((o) => o.styles ?? []);
  const tier = chosen.find((o) => o.tier !== undefined)?.tier ?? 1;
  const zone = zones.find((z) => z.value === dna.zone);
  const months = seasons.find((s) => s.value === dna.season)?.months ?? [];
  const perGuest = category === "traiteurs" || category === "patisserie";
  const target = dna.budget * (budgetShare[category] ?? 0.05);
  const answered = [dna.ambiances.length, dna.season, dna.zone, dna.budget, chosen.length].filter(Boolean).length;

  return vendorsIn(category)
    .map((v) => {
      const reasons: string[] = [];
      const gaps: string[] = [];

      // Style (Wedding DNA + inspirations)
      const styleHit = amb.includes(v.style) || tagStyles.some((t) => t.toLowerCase() === v.style.toLowerCase());
      if (styleHit) reasons.push(`Style ${v.style.toLowerCase()}, comme le vôtre`);
      const sStyle = styleHit ? 1 : amb.length ? 0.45 : 0.7;

      // Mini-test métier
      const testHit = testStyles.includes(v.style);
      if (testHit && !styleHit) reasons.push(`${v.style} : ce que vous recherchez`);
      const sTest = testStyles.length ? (testHit ? 1 : 0.4) : 0.7;

      // Budget (léger dépassement toléré jusqu'à 10 %, §7.6)
      const pack = v.packages[Math.min(tier, v.packages.length - 1)];
      const cost = perGuest ? pack.price * dna.guests : pack.price;
      let sBudget = 1;
      let withinBudget = true;
      if (cost <= target) reasons.push("Dans votre budget");
      else if (cost <= target * 1.1) {
        sBudget = 0.75;
        withinBudget = false;
        gaps.push(`${Math.round(cost - target).toLocaleString("fr-FR")} € au-dessus de votre budget`);
      } else {
        sBudget = 0.3;
        withinBudget = false;
        gaps.push(`Au-dessus de votre budget (${Math.round(cost).toLocaleString("fr-FR")} € estimés)`);
      }

      // Disponibilité (calendrier §17)
      const cal = availabilityFor(v);
      const inSeason = months.length ? cal.filter((c) => months.includes(c.month)) : [];
      const free = inSeason.some((c) => c.status === "Disponible");
      const partly = inSeason.some((c) => c.status === "Capacité limitée" || c.status === "À confirmer");
      const sDispo = !months.length ? 0.7 : free ? 1 : partly ? 0.65 : 0.2;
      const availability = !months.length ? "À confirmer avec votre date" : free ? "Disponible à votre période" : partly ? "Places limitées à votre période" : "Complet à votre période";
      if (free) reasons.push("Disponible à votre période");
      else if (months.length && !free) gaps.push(availability);

      // Zone
      const sZone = !zone ? 0.7 : zone.idf ? 1 : 0.5;
      if (zone?.idf) reasons.push(`Se déplace ${zone.value === "paris" ? "à Paris" : "dans votre région"}`);
      else if (zone) gaps.push("Se déplace hors Île-de-France sur demande");

      // Capacité (lieux)
      let sCap = 1;
      if (category === "lieux") {
        if (dna.guests <= 180) reasons.push(`Accueille vos ${dna.guests} invités`);
        else {
          sCap = 0.3;
          gaps.push("Capacité inférieure à votre nombre d'invités");
        }
      }

      // Réputation
      const sRep = parseFloat(v.rating.replace(",", ".")) / 5;
      if (sRep >= 0.98) reasons.push(`Noté ${v.rating} par les couples`);

      // Priorité du couple
      const priority = dna.priorities.includes(category) ? 0.03 : 0;

      const score = Math.round(
        Math.min(0.97, 0.28 * sStyle + 0.14 * sTest + 0.2 * sBudget + 0.15 * sDispo + 0.1 * sZone + 0.08 * sRep + 0.05 * sCap + priority) * 100,
      );

      // Critères indispensables (§7.4) : ils excluent au lieu de seulement pénaliser.
      const excluded =
        (dna.musts.includes("budget") && sBudget < 0.7) ||
        (dna.musts.includes("date") && months.length > 0 && sDispo < 0.3) ||
        (dna.musts.includes("zone") && sZone < 1 && !!zone) ||
        (dna.musts.includes("capacity") && sCap < 1);

      return {
        vendor: v,
        score,
        reasons: reasons.slice(0, 4),
        gaps: gaps.slice(0, 2),
        availability,
        confidence: answered >= 5 ? ("Élevé" as const) : answered >= 3 ? ("Bon" as const) : ("À préciser" as const),
        withinBudget,
        excluded,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((m) => ({ ...m, vendor: m.vendor }));
}

export const exploreCategories = categories;

/* ---------- Résumé du Wedding DNA (§7.7 : l'IA peut résumer ; ici, gabarit déterministe) ---------- */

export function summarize(dna: Dna) {
  const amb = ambiances.filter((a) => dna.ambiances.includes(a.value)).map((a) => a.label.toLowerCase());
  const season = seasons.find((s) => s.value === dna.season)?.label.toLowerCase();
  const zone = zones.find((z) => z.value === dna.zone)?.label;
  const parts = [
    amb.length ? `Un mariage ${amb.join(", ")}` : "Votre mariage",
    season ? (season === "été" ? "en été" : season === "automne" ? "en automne" : season === "hiver" ? "en hiver" : "au printemps") : "",
    zone ? (zone === "Paris" ? "à Paris" : zone === "Ailleurs en France" ? "ailleurs en France" : `en ${zone}`) : "",
    `pour ${dna.guests} invités`,
    `avec environ ${dna.budget.toLocaleString("fr-FR")} € de budget`,
  ].filter(Boolean);
  return parts.join(" ") + ".";
}
