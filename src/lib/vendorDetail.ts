// Données de démonstration de la fiche prestataire, structurées selon le cahier des charges :
// socle commun (§10.1), champs par métier (§10.2), calendrier (§17), avis détaillés (§24),
// conditions (§14). À remplacer par l'API.

import type { Vendor } from "./content";

export type Person = {
  firstName: string;
  lastName: string;
  role: string;
  since: number;
  team: string;
  languages: string;
  photo?: string;
  pos?: string;
  bio: string;
};

const people: [string, string][] = [
  ["Inès", "Martin"],
  ["Ama", "Mensah"],
  ["Camille", "Durand"],
  ["Malik", "Benali"],
  ["Sophie", "Laurent"],
  ["Yaw", "Asante"],
  ["Claire", "Moreau"],
  ["Nadia", "Haddad"],
  ["Julien", "Roux"],
  ["Fatou", "Diallo"],
  ["Thomas", "Leroy"],
  ["Aïssatou", "Ba"],
];

// Rôle exprimé par l'activité, pour rester juste quel que soit le prénom.
const roles: Record<string, string> = {
  photographes: "Fondation · photographie",
  lieux: "Direction du domaine",
  traiteurs: "Fondation · cuisine",
  videastes: "Fondation · vidéo",
  dj: "Direction musicale",
  fleuristes: "Fondation · fleurs",
  decoration: "Fondation · scénographie",
  patisserie: "Fondation · pâtisserie",
  beaute: "Maquillage et coiffure",
};

// Portraits disponibles dans la photothèque ; sinon, des initiales.
const portraits: Record<string, { photo: string; pos: string }> = {
  photographes: { photo: "/photos/photog.jpg", pos: "30% 55%" },
  traiteurs: { photo: "/photos/chef.jpg", pos: "60% 20%" },
  fleuristes: { photo: "/photos/florist.jpg", pos: "45% 22%" },
  decoration: { photo: "/photos/florist.jpg", pos: "45% 22%" },
};

const bios: Record<string, string> = {
  photographes: "Je photographie des mariages depuis {since}. J'aime les instants que personne n'a vus venir : un regard, un fou rire, une main qui serre.",
  lieux: "Je reçois des mariages au domaine depuis {since}. Je connais chaque recoin, et je vous aide à imaginer votre journée avant même la visite.",
  traiteurs: "Je cuisine pour les mariages depuis {since}. Chaque menu part d'une dégustation, et de vos souvenirs de famille.",
  videastes: "Je filme des mariages depuis {since}, sans mise en scène. Vous revivrez la journée telle qu'elle était.",
  dj: "J'anime des soirées de mariage depuis {since}. Je prépare la playlist avec vous, et je lis la piste en direct.",
  fleuristes: "Je compose des fleurs de mariage depuis {since}, toujours avec des fleurs de saison et de producteurs proches.",
  decoration: "J'imagine des décors de mariage depuis {since}. De la première esquisse au démontage, je m'occupe de tout.",
  patisserie: "Je crée des pièces montées et des wedding cakes depuis {since}. Dégustation offerte avant de valider le gâteau.",
  beaute: "Je maquille et coiffe des mariées depuis {since}, à domicile. L'essai permet de trouver ensemble le bon look.",
};

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function personFor(v: Vendor): Person {
  const h = hash(v.slug);
  const [firstName, lastName] = people[h % people.length];
  const since = 2008 + (h % 12);
  const teamSize = 1 + (h % 4);
  return {
    firstName,
    lastName,
    role: roles[v.category] ?? "Prestataire",
    since,
    team: teamSize === 1 ? "En solo" : `Équipe de ${teamSize} personnes`,
    languages: h % 3 === 0 ? "Français, anglais, twi" : h % 3 === 1 ? "Français, anglais" : "Français, arabe",
    ...portraits[v.category],
    bio: (bios[v.category] ?? "Je travaille dans le mariage depuis {since}.").replace("{since}", String(since)),
  };
}

// Champs spécifiques par métier (CDC §10.2).
export function specsFor(v: Vendor): [string, string][] {
  const map: Record<string, [string, string][]> = {
    photographes: [
      ["Style", `${v.style}, naturel`],
      ["Couverture", "Jusqu'à 12 h"],
      ["Second photographe", "En option"],
      ["Album", "En option"],
      ["Drone", "Selon le lieu"],
      ["Délai de livraison", "6 à 8 semaines"],
    ],
    lieux: [
      ["Capacité", "Jusqu'à 180 invités"],
      ["Couchages", "20 personnes"],
      ["Espaces", "Salle, jardin, terrasse"],
      ["Fin de soirée", "4 h du matin"],
      ["Traiteur", "Libre"],
      ["Parking", "80 places"],
    ],
    traiteurs: [
      ["Cuisine", v.style],
      ["Service", "Cocktail, dîner assis, buffet"],
      ["Régimes", "Végétarien, halal, sans gluten"],
      ["Personnel", "Inclus"],
      ["Vaisselle", "Fournie"],
      ["Brunch du lendemain", "En option"],
    ],
    videastes: [
      ["Style", v.style],
      ["Formats", "Film long, teaser"],
      ["Drone", "Selon le lieu"],
      ["Délai de livraison", "8 à 10 semaines"],
    ],
    dj: [
      ["Styles musicaux", v.style],
      ["Animation micro", "Oui"],
      ["Son et lumières", "Inclus"],
      ["Sonorisation de la cérémonie", "En option"],
      ["Durée", "Jusqu'à 4 h du matin"],
    ],
    fleuristes: [
      ["Style", v.style],
      ["Zones décorées", "Cérémonie et réception"],
      ["Installation et démontage", "Inclus"],
      ["Location", "Arches, vases, chandeliers"],
      ["Fleurs", "De saison"],
    ],
    decoration: [
      ["Style", v.style],
      ["Zones décorées", "Cérémonie et réception"],
      ["Installation et démontage", "Inclus"],
      ["Location", "Mobilier, arches, linge de table"],
    ],
    patisserie: [
      ["Créations", "Pièce montée, wedding cake, buffet sucré"],
      ["Régimes", "Sans gluten, sans lactose"],
      ["Dégustation", "Offerte"],
      ["Livraison", "Incluse en Île-de-France"],
    ],
    beaute: [
      ["Prestations", "Maquillage et coiffure"],
      ["Essai", "Inclus"],
      ["Déplacement", "À domicile"],
      ["Cortège", "Jusqu'à 6 personnes"],
    ],
  };
  return map[v.category] ?? [];
}

// Calendrier sur les prochains mois (CDC §17 : statuts de disponibilité).
export type Availability = "Disponible" | "À confirmer" | "Capacité limitée" | "Complet";

export function availabilityFor(v: Vendor): { month: string; status: Availability }[] {
  const months = ["Mai 2027", "Juin 2027", "Juil. 2027", "Août 2027", "Sept. 2027", "Oct. 2027"];
  const statuses: Availability[] = ["Disponible", "Capacité limitée", "Complet", "Disponible", "À confirmer", "Disponible"];
  const h = hash(v.slug);
  return months.map((month, i) => ({ month, status: statuses[(i + h) % statuses.length] }));
}

// Avis détaillés (CDC §24).
export function criteriaFor(v: Vendor): [string, number][] {
  const base = parseFloat(v.rating.replace(",", "."));
  const h = hash(v.slug);
  const labels = ["Qualité de la prestation", "Communication", "Ponctualité", "Conformité à l'offre", "Rapport qualité-prix"];
  return labels.map((l, i) => [l, Math.min(5, Math.round((base - ((h >> i) % 3) * 0.1) * 10) / 10)]);
}

export function faqFor(v: Vendor, first: string): [string, string][] {
  return [
    ["Des déplacements hors d'Île-de-France ?", "Oui, sur demande. Les frais de déplacement éventuels sont précisés dans l'offre, avant toute réservation."],
    ["Peut-on adapter une formule ?", `Oui. Indiquez votre budget dans la conversation : ${first} peut ajuster la durée ou les options et vous envoyer une nouvelle version de l'offre.`],
    ["Notre date peut-elle être bloquée ?", "Quand la discussion est avancée, la date peut être bloquée 48 heures, le temps de vous décider sereinement."],
  ];
}

// Coordonnées approximatives des zones d'activité (prototype, à remplacer par la localisation saisie par le prestataire).
const places: Record<string, [number, number]> = {
  "Paris 2e": [48.8686, 2.3417],
  "Paris 3e": [48.8637, 2.3615],
  "Paris 4e": [48.8543, 2.3576],
  "Paris 5e": [48.8445, 2.3497],
  "Paris 6e": [48.8491, 2.3329],
  "Paris 7e": [48.8562, 2.3121],
  "Paris 8e": [48.8727, 2.3125],
  "Paris 9e": [48.8771, 2.3375],
  "Paris 10e": [48.8761, 2.3608],
  "Paris 11e": [48.8591, 2.3797],
  "Paris 12e": [48.8396, 2.3958],
  "Paris 13e": [48.8322, 2.3561],
  "Paris 15e": [48.8421, 2.2928],
  "Paris 16e": [48.8637, 2.2769],
  "Paris 17e": [48.8873, 2.3067],
  "Paris 18e": [48.8925, 2.3444],
  "Paris 19e": [48.8871, 2.3848],
  "Paris 20e": [48.8638, 2.4011],
  Yvelines: [48.8049, 1.9800],
  "Seine-et-Marne": [48.6150, 2.8900],
  "Val-d'Oise": [49.0500, 2.1000],
  Montreuil: [48.8611, 2.4436],
  Versailles: [48.8049, 2.1204],
  Boulogne: [48.8397, 2.2399],
  "Saint-Denis": [48.9362, 2.3574],
  Vincennes: [48.8474, 2.4392],
  Neuilly: [48.8846, 2.2697],
};

export function coordsFor(v: Vendor): [number, number] {
  return places[v.area] ?? [48.8566, 2.3522];
}

// Coéquipiers affichés avec la personne principale (prototype).
const mates = ["Léo", "Maëlle", "Kofi", "Sarah", "Hugo", "Awa"];
export function teamFor(v: Vendor, p: Person): { name: string; role: string }[] {
  const size = p.team === "En solo" ? 1 : parseInt(p.team.replace(/\D/g, ""), 10) || 1;
  const h = hash(v.slug);
  return Array.from({ length: Math.min(size, 4) - 1 }, (_, i) => ({ name: mates[(h + i) % mates.length], role: "Équipe" }));
}

// Action principale adaptée au métier (CDC §12 visites et rendez-vous ; types du projet d'origine :
// visite, dégustation, réunion, appel). Une seule action principale par écran (CDC §27).
export type ActionKind = "message" | "visit" | "tasting" | "trial";

export type VendorActions = {
  primary: { kind: ActionKind; label: string; title: string; submit: string; note: string };
  secondary: { kind: ActionKind | "meeting"; label: string };
};

export function actionsFor(v: Vendor, first: string): VendorActions {
  const message = {
    kind: "message" as const,
    label: `Écrire à ${first}`,
    title: `Votre message à ${first}`,
    submit: `Envoyer à ${first}`,
    note: `Sans engagement. Votre espace Céleste est créé à l'envoi, pour recevoir la réponse de ${first}.`,
  };
  switch (v.category) {
    case "lieux":
      return {
        primary: {
          kind: "visit",
          label: "Demander une visite",
          title: "Visiter le domaine",
          submit: "Envoyer la demande de visite",
          note: `${first} confirme le créneau ou vous en propose un autre. Le rappel arrive tout seul.`,
        },
        secondary: { kind: "message", label: `Écrire à ${first}` },
      };
    case "traiteurs":
    case "patisserie":
      return {
        primary: {
          kind: "tasting",
          label: "Réserver une dégustation",
          title: "Goûter avant de décider",
          submit: "Demander la dégustation",
          note: `${first} vous propose une date de dégustation. Sans engagement.`,
        },
        secondary: { kind: "message", label: `Écrire à ${first}` },
      };
    case "beaute":
      return {
        primary: {
          kind: "trial",
          label: "Réserver un essai",
          title: "Votre essai maquillage et coiffure",
          submit: "Demander l'essai",
          note: `${first} confirme la date de l'essai, à domicile.`,
        },
        secondary: { kind: "message", label: `Écrire à ${first}` },
      };
    default:
      return { primary: message, secondary: { kind: "meeting", label: "Proposer un rendez-vous" } };
  }
}

// Thème de chaque photo, pour la visite photo de la galerie (prototype basé sur le nom du fichier).
const photoThemes: Record<string, string> = {
  aisle: "Cérémonie",
  confetti: "Cérémonie",
  hero: "Cérémonie",
  field: "Le couple",
  beach: "Le couple",
  rain: "Le couple",
  kente: "Le couple",
  bride: "Préparatifs",
  bridesmaids: "Préparatifs",
  groom: "Préparatifs",
  photog: "En coulisses",
  florist: "En coulisses",
  chef: "En coulisses",
  dance: "La soirée",
  dj: "La soirée",
  chateau: "Réception",
  deco: "Réception",
  cake: "Détails",
  rings: "Détails",
};

export function themeOf(src: string) {
  const key = src.split("/").pop()?.replace(/\.\w+$/, "") ?? "";
  return photoThemes[key] ?? "Autres";
}

// Position de l'épingle sur la carte des résultats : la zone d'activité, légèrement décalée
// pour que deux prestataires du même secteur ne se superposent pas (prototype).
export function pinFor(v: Vendor): [number, number] {
  const [lat, lng] = coordsFor(v);
  const h = hash(v.slug);
  return [lat + (((h % 100) - 50) / 50) * 0.006, lng + ((((h >> 7) % 100) - 50) / 50) * 0.009];
}
