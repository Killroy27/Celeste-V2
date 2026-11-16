// Contenu de démonstration de Céleste. À remplacer par l'API quand elle existera.
// Les formes de données (Category, Vendor, Review…) sont celles que l'API devra renvoyer.

export type Category = {
  slug: string;
  label: string; // libellé court des onglets
  plural: string; // « Photographes »
  singular: string; // « photographe »
  icon: string;
  cover: string;
  intro: string;
};

export const categories: Category[] = [
  { slug: "photographes", label: "Photo", plural: "Photographes", singular: "photographe", icon: "/icons/camera.png", cover: "/photos/photog.jpg", intro: "Reportage, argentique, éditorial : des regards qui racontent votre journée sans la mettre en scène." },
  { slug: "lieux", label: "Lieux", plural: "Lieux de réception", singular: "lieu", icon: "/icons/chateau.png", cover: "/photos/chateau.jpg", intro: "Châteaux, domaines, rooftops et granges : des lieux disponibles à vos dates, capacité et tarifs affichés." },
  { slug: "traiteurs", label: "Traiteurs", plural: "Traiteurs", singular: "traiteur", icon: "/icons/cloche.png", cover: "/photos/chef.jpg", intro: "Du cocktail au dîner assis, des chefs qui composent un menu à votre image, dégustation comprise." },
  { slug: "videastes", label: "Vidéo", plural: "Vidéastes", singular: "vidéaste", icon: "/icons/video.png", cover: "/photos/dance.jpg", intro: "Films courts, teasers et documentaires de mariage, filmés avec discrétion." },
  { slug: "dj", label: "DJ", plural: "DJ & musiciens", singular: "DJ", icon: "/icons/dj.png", cover: "/photos/dj.jpg", intro: "Des DJ et des groupes qui lisent la piste et gardent vos invités debout jusqu'au bout de la nuit." },
  { slug: "fleuristes", label: "Fleurs", plural: "Fleuristes", singular: "fleuriste", icon: "/icons/bouquet.png", cover: "/photos/florist.jpg", intro: "Bouquets, arches et centres de table de saison, imaginés avec vous." },
  { slug: "decoration", label: "Décor", plural: "Décorateurs", singular: "décorateur", icon: "/icons/arch.png", cover: "/photos/deco.jpg", intro: "Scénographie, location de mobilier et mise en place le jour J." },
  { slug: "patisserie", label: "Pâtisserie", plural: "Pâtissiers", singular: "pâtissier", icon: "/icons/wedding-cake.png", cover: "/photos/cake.jpg", intro: "Pièces montées, wedding cakes et buffets sucrés, faits maison." },
  { slug: "beaute", label: "Beauté", plural: "Coiffure & maquillage", singular: "maquilleuse", icon: "/icons/makeup.png", cover: "/photos/bride.jpg", intro: "Maquillage et coiffure à domicile pour la mariée et ses proches, essai inclus." },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

export const heroWords = ["photographe", "traiteur", "lieu de rêve", "fleuriste", "DJ"];

/* ---------- Mur d'inspiration du hero ---------- */

export type Tile = { label: string; src: string; h: number; pos?: string; saved?: boolean };
export type WallColumn = { offset: number; duration: number; reverse: boolean; tiles: Tile[] };

export const wallColumns: WallColumn[] = [
  { offset: 0, duration: 70, reverse: false, tiles: [
    { label: "Cérémonie", src: "/photos/aisle.jpg", h: 330, pos: "50% 60%" },
    { label: "Traiteur", src: "/photos/chef.jpg", h: 250 },
    { label: "Alliances", src: "/photos/rings.jpg", h: 300, saved: true },
  ] },
  { offset: 34, duration: 56, reverse: true, tiles: [
    { label: "Photographe", src: "/photos/photog.jpg", h: 310, pos: "50% 40%", saved: true },
    { label: "Soirée & DJ", src: "/photos/dj.jpg", h: 230 },
    { label: "Pièce montée", src: "/photos/cake.jpg", h: 300 },
  ] },
  { offset: 0, duration: 64, reverse: false, tiles: [
    { label: "Fleuriste", src: "/photos/florist.jpg", h: 300, pos: "50% 30%" },
    { label: "Mariée", src: "/photos/bride.jpg", h: 330, saved: true },
    { label: "Lieu", src: "/photos/chateau.jpg", h: 230 },
  ] },
  { offset: 50, duration: 76, reverse: true, tiles: [
    { label: "Décoration", src: "/photos/deco.jpg", h: 320 },
    { label: "Les mariés", src: "/photos/hero.jpg", h: 230, pos: "62% 50%" },
    { label: "Témoins", src: "/photos/bridesmaids.jpg", h: 300 },
  ] },
  { offset: 14, duration: 60, reverse: false, tiles: [
    { label: "Le marié", src: "/photos/groom.jpg", h: 300 },
    { label: "Fleurs", src: "/photos/florist.jpg", h: 320, pos: "50% 60%", saved: true },
    { label: "Traiteur", src: "/photos/chef.jpg", h: 240 },
  ] },
];

/* ---------- Avis ---------- */

export type Review = { author: string; date: string; rating: number; text: string };

export const reviewPool: Review[] = [
  { author: "Inès & Malik", date: "septembre 2026", rating: 5, text: "Réponse en moins d'une journée, devis clair, aucune mauvaise surprise. Le jour J, tout était exactement comme prévu." },
  { author: "Claire & Thomas", date: "juin 2026", rating: 5, text: "On a comparé trois prestataires en une soirée grâce aux devis côte à côte. On a choisi sereinement, sans dizaines d'e-mails." },
  { author: "Aïcha & Kwame", date: "août 2026", rating: 5, text: "Une équipe qui a compris nos deux cultures et su les mêler. Nos familles en parlent encore." },
  { author: "Léa & Julien", date: "mai 2026", rating: 4, text: "Très professionnel et à l'écoute. Un petit retard à l'installation, vite rattrapé. On recommande sans hésiter." },
  { author: "Sarah & Nathan", date: "juillet 2026", rating: 5, text: "Discret, chaleureux, efficace. Les invités ont adoré et nous aussi." },
  { author: "Mariam & Yanis", date: "octobre 2026", rating: 5, text: "Le paiement en plusieurs fois via Céleste nous a beaucoup simplifié la vie. Prestation impeccable." },
  { author: "Camille & Hugo", date: "avril 2026", rating: 5, text: "Nous avions un budget serré : on nous a proposé une formule sur mesure sans rogner sur la qualité." },
  { author: "Fatou & Olivier", date: "septembre 2026", rating: 5, text: "Un vrai coup de cœur dès le premier échange. Merci pour tout !" },
];

/* ---------- Prestataires ---------- */

export type Package = { name: string; price: number; includes: string[] };

export type Vendor = {
  slug: string;
  name: string;
  category: string;
  city: string;
  area: string;
  style: string;
  rating: string;
  reviewsCount: number;
  price: number; // prix d'appel en euros
  photo: string;
  pos?: string;
  gallery: string[];
  verified: boolean;
  responseTime: string;
  description: string;
  packages: Package[];
  reviews: Review[];
};

type Seed = [slug: string, name: string, area: string, style: string, rating: string, reviews: number, price: number, photo: string, pos?: string];

const seeds: Record<string, Seed[]> = {
  photographes: [
    ["studio-aube", "Studio Aube", "Paris 11e", "Reportage", "4,9", 132, 650, "confetti"],
    ["atelier-kofi-ama", "Atelier Kofi & Ama", "Paris 18e", "Traditionnel", "5,0", 87, 780, "kente", "50% 30%"],
    ["maison-lumen", "Maison Lumen", "Paris 5e", "Champêtre", "4,8", 64, 590, "field"],
    ["nuit-blanche", "Nuit Blanche", "Paris 3e", "Urbain", "4,9", 51, 720, "rain"],
    ["horizon", "Horizon", "Paris 16e", "Destination", "4,8", 43, 900, "beach", "50% 50%"],
    ["valse-eternelle", "Valse Éternelle", "Paris 9e", "Soirée", "4,7", 38, 540, "dance"],
  ],
  lieux: [
    ["chateau-des-lys", "Château des Lys", "Yvelines", "Château", "4,9", 118, 6500, "chateau"],
    ["domaine-les-tilleuls", "Domaine les Tilleuls", "Seine-et-Marne", "Champêtre", "4,8", 76, 4200, "aisle", "50% 60%"],
    ["orangerie-saint-clair", "Orangerie Saint-Clair", "Val-d'Oise", "Intemporel", "4,9", 59, 5100, "deco"],
    ["le-jardin-suspendu", "Le Jardin Suspendu", "Paris 19e", "Moderne", "4,7", 41, 3800, "hero", "62% 50%"],
  ],
  traiteurs: [
    ["maison-saveurs", "Maison Saveurs", "Paris 15e", "Gastronomique", "4,9", 96, 85, "chef"],
    ["table-de-yaa", "La Table de Yaa", "Montreuil", "Afro-fusion", "5,0", 54, 62, "kente", "50% 30%"],
    ["les-toques-vertes", "Les Toques Vertes", "Versailles", "Bistronomie", "4,8", 47, 74, "deco"],
    ["cocktail-et-cie", "Cocktail & Cie", "Paris 10e", "Cocktail dînatoire", "4,7", 33, 55, "cake"],
  ],
  videastes: [
    ["films-de-juin", "Les Films de Juin", "Paris 20e", "Documentaire", "4,9", 61, 1200, "dance"],
    ["reel-amour", "Reel Amour", "Boulogne", "Cinématique", "4,8", 39, 1450, "hero", "62% 50%"],
    ["plan-sequence", "Plan Séquence", "Paris 12e", "Teaser", "4,8", 28, 950, "confetti"],
  ],
  dj: [
    ["dj-solal", "DJ Solal", "Paris 13e", "Open format", "4,9", 103, 890, "dj"],
    ["groove-maison", "Groove Maison", "Saint-Denis", "Afro & Amapiano", "5,0", 72, 990, "dance"],
    ["quatuor-opaline", "Quatuor Opaline", "Paris 6e", "Cérémonie classique", "4,9", 36, 750, "aisle", "50% 60%"],
  ],
  fleuristes: [
    ["atelier-pivoine", "Atelier Pivoine", "Paris 17e", "Romantique", "4,9", 88, 450, "florist", "50% 30%"],
    ["fleurs-de-saison", "Fleurs de Saison", "Vincennes", "Champêtre", "4,8", 57, 380, "rings"],
    ["botanica", "Botanica", "Paris 2e", "Moderne", "4,7", 31, 520, "deco"],
  ],
  decoration: [
    ["scene-et-sens", "Scène & Sens", "Paris 11e", "Bohème", "4,9", 49, 1300, "deco"],
    ["les-petits-details", "Les Petits Détails", "Neuilly", "Intemporel", "4,8", 37, 900, "aisle", "50% 60%"],
    ["wax-et-dentelle", "Wax & Dentelle", "Paris 18e", "Wax chic", "5,0", 26, 1100, "kente", "50% 30%"],
  ],
  patisserie: [
    ["sucre-dore", "Sucre Doré", "Paris 7e", "Pièce montée", "4,9", 71, 6, "cake"],
    ["maison-macaron", "Maison Macaron", "Paris 4e", "Wedding cake", "4,8", 44, 7, "rings"],
  ],
  beaute: [
    ["eclat-mariee", "Éclat Mariée", "Paris 8e", "Naturel", "4,9", 92, 280, "bride"],
    ["studio-boucles", "Studio Boucles", "Paris 19e", "Cheveux texturés", "5,0", 58, 320, "bridesmaids"],
  ],
};

const priceUnit: Record<string, string> = { traiteurs: "/ invité", patisserie: "/ part" };
export const priceLabel = (v: Vendor) => `${v.price.toLocaleString("fr-FR")} €${priceUnit[v.category] ? ` ${priceUnit[v.category]}` : ""}`;

const packageTemplates: Record<string, [string, number, string[]][]> = {
  photographes: [["Essentiel", 1, ["Cérémonie et cocktail", "200 photos retouchées", "Galerie en ligne"]], ["Journée", 2.1, ["Des préparatifs à la première danse", "500 photos retouchées", "Séance couple offerte"]], ["Signature", 3.2, ["Deux photographes", "Album 30×30 cm", "Livraison sous 3 semaines"]]],
  lieux: [["Semaine", 0.7, ["Location du lundi au jeudi", "Jusqu'à 120 invités", "Mobilier inclus"]], ["Week-end", 1, ["Samedi et dimanche", "Jusqu'à 180 invités", "Hébergement 20 personnes"]], ["Exclusivité", 1.6, ["Du vendredi au dimanche", "Domaine privatisé", "Coordinateur sur place"]]],
  traiteurs: [["Cocktail", 0.7, ["12 pièces par invité", "Service inclus", "Vaisselle fournie"]], ["Dîner", 1, ["Cocktail, entrée, plat, dessert", "Dégustation pour 2", "Service jusqu'à 2 h"]], ["Prestige", 1.5, ["Ateliers culinaires", "Accord mets et vins", "Brunch du lendemain"]]],
  default: [["Essentiel", 1, ["Rendez-vous de préparation", "Prestation le jour J", "Déplacement en Île-de-France"]], ["Complet", 1.7, ["Deux rendez-vous", "Prestation étendue", "Options personnalisées"]], ["Sur mesure", 2.5, ["Accompagnement de A à Z", "Équipe renforcée", "Priorité de réservation"]]],
};

const responseTimes = ["moins de 2 h", "moins de 6 h", "moins de 12 h", "moins de 24 h"];

function describe(name: string, cat: Category, style: string, area: string) {
  return `${name} accompagne les couples ${area.startsWith("Paris") ? "à Paris et en Île-de-France" : `dans le secteur ${area} et partout en Île-de-France`}. Style ${style.toLowerCase()}, écoute attentive et offres détaillées : ${cat.intro.charAt(0).toLowerCase()}${cat.intro.slice(1)}`;
}

const photosByCategory: Record<string, string[]> = {
  photographes: ["confetti", "kente", "field", "rain", "beach", "dance", "photog", "bride", "groom"],
  lieux: ["chateau", "aisle", "deco", "hero", "field"],
  traiteurs: ["chef", "cake", "deco", "dance"],
  videastes: ["dance", "hero", "confetti", "beach", "rain"],
  dj: ["dj", "dance", "confetti"],
  fleuristes: ["florist", "rings", "deco", "aisle"],
  decoration: ["deco", "aisle", "chateau", "kente"],
  patisserie: ["cake", "rings", "deco"],
  beaute: ["bride", "bridesmaids", "groom", "kente"],
};

export const vendors: Vendor[] = Object.entries(seeds).flatMap(([catSlug, list]) => {
  const cat = getCategory(catSlug)!;
  const tpl = packageTemplates[catSlug] ?? packageTemplates.default;
  return list.map(([slug, name, area, style, rating, reviewsCount, price, photo, pos], i) => {
    const pool = photosByCategory[catSlug].filter((p) => p !== photo);
    const gallery = [photo, ...pool, ...pool].slice(0, 5).map((p) => `/photos/${p}.jpg`);
    return {
      slug,
      name,
      category: catSlug,
      city: area.startsWith("Paris") ? "Paris" : area,
      area,
      style,
      rating,
      reviewsCount,
      price,
      photo: `/photos/${photo}.jpg`,
      pos,
      gallery,
      verified: i % 4 !== 3,
      responseTime: responseTimes[i % responseTimes.length],
      description: describe(name, cat, style, area),
      packages: tpl.map(([n, mult, includes]) => ({ name: n, price: Math.round((price * mult) / 10) * 10 || price, includes })),
      reviews: [0, 1, 2].map((k) => reviewPool[(i * 3 + k + catSlug.length) % reviewPool.length]),
    };
  });
});

export const getVendor = (slug: string) => vendors.find((v) => v.slug === slug);
export const vendorsIn = (cat: string) => vendors.filter((v) => v.category === cat);
export const featuredVendors = vendorsIn("photographes");

const rate = (v: Vendor) => parseFloat(v.rating.replace(",", "."));

/**
 * Classement des catégories pour l'accueil. Prototype : volume d'avis × note moyenne.
 * L'algorithme définitif sera conçu par Céleste (réservations, conversion, saisonnalité…).
 */
export function rankCategories() {
  return categories
    .map((c) => {
      const list = vendorsIn(c.slug);
      const reviews = list.reduce((t, v) => t + v.reviewsCount, 0);
      const avg = list.reduce((t, v) => t + rate(v), 0) / (list.length || 1);
      return { category: c, score: reviews * avg };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.category);
}

/** Pioche à tour de rôle dans chaque catégorie restante, meilleurs prestataires d'abord. */
export function mixCategories(slugs: string[], max = 10) {
  const queues = slugs.map((s) => [...vendorsIn(s)].sort((a, b) => rate(b) - rate(a) || b.reviewsCount - a.reviewsCount));
  const out: Vendor[] = [];
  while (out.length < max && queues.some((q) => q.length)) {
    for (const q of queues) {
      const v = q.shift();
      if (v && out.length < max) out.push(v);
    }
  }
  return out;
}

/** Les quatre rangées de l'accueil : trois meilleures catégories, puis un mélange des autres. */
export function homeRows() {
  const ranked = rankCategories();
  const top = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  return [
    ...top.map((c) => {
      const list = [...vendorsIn(c.slug)].sort((a, b) => rate(b) - rate(a) || b.reviewsCount - a.reviewsCount);
      // Le lieu affiché suit la réalité de l'offre : Paris si la majorité y est, sinon l'Île-de-France.
      const place = list.filter((v) => v.city === "Paris").length * 2 > list.length ? "Paris" : "Île-de-France";
      return {
        title: `${c.plural} · ${place}`,
        href: `/recherche?quoi=${encodeURIComponent(c.singular)}&ou=${encodeURIComponent(place)}`,
        list,
      };
    }),
    {
      title: "Pour compléter votre mariage · Île-de-France",
      href: "/decouvrir",
      list: mixCategories(rest.map((c) => c.slug)),
    },
  ];
}

export function searchVendors({ quoi = "", ou = "" }: { quoi?: string; ou?: string }) {
  const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
  const q = norm(quoi);
  const w = norm(ou);
  return vendors.filter((v) => {
    const cat = getCategory(v.category)!;
    const hay = norm([v.name, v.style, cat.plural, cat.singular, cat.label].join(" "));
    const place = norm([v.city, v.area].join(" "));
    const okQ = !q || q.split(/\s+/).every((t) => hay.includes(t) || hay.includes(t.replace(/s$/, "")));
    const okW = !w || place.includes(w) || (w.includes("ile") && w.includes("france"));
    return okQ && okW;
  });
}

/* ---------- Contenus éditoriaux ---------- */

export const steps = [
  { icon: "/icons/favorite-heart.png", title: "Inspirez-vous", text: "Parcourez des milliers de mariages réels et enregistrez vos coups de cœur en un clic." },
  { icon: "/icons/chat-bubbles.png", title: "Comparez les devis", text: "Une seule demande, des offres détaillées présentées côte à côte." },
  { icon: "/icons/shield-lock.png", title: "Réservez sereinement", text: "Contrat signé en ligne, 30 % d'acompte puis le solde en une à trois fois." },
];

// Faits issus du cahier des charges (aucun chiffre d'activité inventé).
export const stats = [
  { value: "30 %", label: "d'acompte, puis le solde en 1 à 3 fois" },
  { value: "24 mois", label: "de disponibilités visibles par prestataire" },
  { value: "100 %", label: "des avis laissés par des couples qui ont réservé" },
  { value: "1", label: "seul espace pour tout organiser" },
]

export const testimonials = [
  { couple: "Aïcha & Kwame", place: "Château des Lys, juin 2026", photo: "/photos/kente.jpg", text: "Nous cherchions des prestataires capables de mêler nos deux cultures. En une semaine, tout était réservé, et nos familles ont adoré." },
  { couple: "Claire & Thomas", place: "Domaine les Tilleuls, mai 2026", photo: "/photos/field.jpg", text: "Les devis côte à côte nous ont fait gagner des soirées entières. On a enfin pu profiter des préparatifs." },
  { couple: "Inès & Malik", place: "Paris 11e, septembre 2026", photo: "/photos/confetti.jpg", text: "Réponses rapides, prix clairs, et un paiement sécurisé qui nous a rassurés du début à la fin." },
];

export type Article = { slug: string; title: string; theme: string; read: string; photo: string; excerpt: string };

export const articles: Article[] = [
  { slug: "budget-mariage-2027", title: "Budget mariage 2027 : combien prévoir, poste par poste", theme: "Organisation", read: "6 min", photo: "/photos/rings.jpg", excerpt: "Lieu, traiteur, photo… la répartition réelle des dépenses des couples Céleste." },
  { slug: "retroplanning-12-mois", title: "Le rétroplanning idéal, de 12 mois au jour J", theme: "Organisation", read: "8 min", photo: "/photos/aisle.jpg", excerpt: "Que réserver en premier, et ce qui peut attendre les trois derniers mois." },
  { slug: "mariage-mixte-traditions", title: "Mariage mixte : marier deux traditions avec élégance", theme: "Inspiration", read: "5 min", photo: "/photos/kente.jpg", excerpt: "Tenues, musiques et repas : les idées de couples qui ont réussi le mélange." },
  { slug: "fleurs-de-saison", title: "Quelles fleurs de saison pour votre date ?", theme: "Fleurs", read: "4 min", photo: "/photos/florist.jpg", excerpt: "Le calendrier des fleurs pour un bouquet plus beau, plus durable et moins cher." },
  { slug: "choisir-son-photographe", title: "Choisir son photographe : les 7 questions à poser", theme: "Prestataires", read: "5 min", photo: "/photos/photog.jpg", excerpt: "Style, livraison, droits d'image : la checklist avant de signer." },
  { slug: "soiree-inoubliable", title: "Une soirée inoubliable : playlist, timing et piste", theme: "Fête", read: "4 min", photo: "/photos/dance.jpg", excerpt: "Les conseils des DJ Céleste pour garder la piste pleine jusqu'au bout." },
];

export const inspirationThemes = ["Tout", "Cérémonie", "Réception", "Tenues", "Fleurs", "Fête", "Détails"];

export const inspirations: { src: string; label: string; theme: string; h: number; pos?: string }[] = [
  { src: "/photos/aisle.jpg", label: "Allée champêtre", theme: "Cérémonie", h: 420, pos: "50% 60%" },
  { src: "/photos/deco.jpg", label: "Table longue aux bougies", theme: "Réception", h: 320 },
  { src: "/photos/bride.jpg", label: "Voile en dentelle", theme: "Tenues", h: 380 },
  { src: "/photos/florist.jpg", label: "Bouquet pivoines", theme: "Fleurs", h: 300, pos: "50% 30%" },
  { src: "/photos/dance.jpg", label: "Première danse", theme: "Fête", h: 400 },
  { src: "/photos/rings.jpg", label: "Alliances et roses", theme: "Détails", h: 280 },
  { src: "/photos/chateau.jpg", label: "Dîner au château", theme: "Réception", h: 260 },
  { src: "/photos/kente.jpg", label: "Kente et dentelle", theme: "Tenues", h: 420, pos: "50% 30%" },
  { src: "/photos/cake.jpg", label: "Pièce montée florale", theme: "Détails", h: 340 },
  { src: "/photos/confetti.jpg", label: "Sortie sous les confettis", theme: "Cérémonie", h: 380 },
  { src: "/photos/dj.jpg", label: "Soirée guinguette", theme: "Fête", h: 260 },
  { src: "/photos/field.jpg", label: "Couple dans les blés", theme: "Cérémonie", h: 400 },
  { src: "/photos/groom.jpg", label: "Costume bleu nuit", theme: "Tenues", h: 360 },
  { src: "/photos/bridesmaids.jpg", label: "Témoins assorties", theme: "Tenues", h: 320 },
  { src: "/photos/beach.jpg", label: "Coucher de soleil", theme: "Cérémonie", h: 380 },
  { src: "/photos/rain.jpg", label: "Pluie à Paris", theme: "Cérémonie", h: 360 },
  { src: "/photos/chef.jpg", label: "Dressage gastronomique", theme: "Réception", h: 300 },
  { src: "/photos/hero.jpg", label: "Arche fleurie", theme: "Fleurs", h: 260, pos: "62% 50%" },
];

export const faq = [
  { q: "Combien coûte Céleste pour les mariés ?", a: "Rechercher, enregistrer vos coups de cœur, faire votre Best Match et échanger avec les prestataires ne coûte rien. Si des frais s'appliquent à une réservation, ils sont affichés clairement avant le paiement, jamais au dernier moment." },
  { q: "Comment fonctionne le Best Match ?", a: "Quelques questions sur votre date, votre zone, votre budget et votre style. Céleste calcule un pourcentage de compatibilité et vous explique pourquoi. Aucun prestataire ne peut payer pour améliorer son score." },
  { q: "Que veut dire le badge « Vérifié » ?", a: "Le prestataire a fourni son SIRET ou un justificatif professionnel, l'identité de son représentant légal et, lorsque c'est pertinent, son assurance. Le badge Céleste Select, lui, récompense les meilleurs résultats et ne s'achète pas." },
  { q: "Puis-je négocier une offre ?", a: "Oui. Indiquez votre budget ou demandez une adaptation : le prestataire peut ajuster sa formule, la durée ou les options, et vous envoyer une nouvelle version de son offre." },
  { q: "Comment se passe le paiement ?", a: "Après la signature du contrat en ligne, vous réglez sur Céleste : en une fois, ou 30 % d'acompte à la réservation puis le solde en une à trois échéances." },
  { q: "Et en cas d'annulation ?", a: "Les conditions d'annulation sont affichées avant la réservation. En cas de force majeure justifiée, Céleste ouvre un dossier et cherche d'abord une solution de report avec le prestataire." },
]

// Modèle économique du cahier des charges : profil gratuit, commission sur les réservations signées.
export const proPricing = [
  { value: "0 €", title: "Pour créer votre profil", text: "Inscription ouverte à tous les professionnels. Vous publiez vos formules, vos options et vos disponibilités." },
  { value: "0 €", title: "Pour recevoir des demandes", text: "Les opportunités compatibles avec votre profil arrivent dans votre espace, sans achat de contacts." },
  { value: "%", title: "Seulement quand vous signez", text: "Céleste prélève une commission sur les réservations signées et encaissées via la plateforme. Le taux vous est communiqué à l'inscription." },
]
