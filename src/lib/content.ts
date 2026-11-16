// Contenu de la landing. À remplacer par les données de l'API quand elle existera.

export type Category = { slug: string; label: string; icon: string };

export const categories: Category[] = [
  { slug: "photographes", label: "Photo", icon: "/icons/camera.png" },
  { slug: "lieux", label: "Lieux", icon: "/icons/chateau.png" },
  { slug: "traiteurs", label: "Traiteurs", icon: "/icons/cloche.png" },
  { slug: "videastes", label: "Vidéo", icon: "/icons/video.png" },
  { slug: "dj", label: "DJ", icon: "/icons/dj.png" },
  { slug: "fleuristes", label: "Fleurs", icon: "/icons/bouquet.png" },
  { slug: "decoration", label: "Décor", icon: "/icons/arch.png" },
];

export const heroWords = ["photographe", "traiteur", "lieu de rêve", "fleuriste", "DJ"];

export type Tile = { label: string; src: string; h: number; pos?: string; saved?: boolean };
export type WallColumn = { offset: number; duration: number; reverse: boolean; tiles: Tile[] };

export const wallColumns: WallColumn[] = [
  {
    offset: 0,
    duration: 70,
    reverse: false,
    tiles: [
      { label: "Cérémonie", src: "/photos/aisle.jpg", h: 330, pos: "50% 60%" },
      { label: "Traiteur", src: "/photos/chef.jpg", h: 250 },
      { label: "Alliances", src: "/photos/rings.jpg", h: 300, saved: true },
    ],
  },
  {
    offset: 34,
    duration: 56,
    reverse: true,
    tiles: [
      { label: "Photographe", src: "/photos/photog.jpg", h: 310, pos: "50% 40%", saved: true },
      { label: "Soirée & DJ", src: "/photos/dj.jpg", h: 230 },
      { label: "Pièce montée", src: "/photos/cake.jpg", h: 300 },
    ],
  },
  {
    offset: 0,
    duration: 64,
    reverse: false,
    tiles: [
      { label: "Fleuriste", src: "/photos/florist.jpg", h: 300, pos: "50% 30%" },
      { label: "Mariée", src: "/photos/bride.jpg", h: 330, saved: true },
      { label: "Lieu", src: "/photos/chateau.jpg", h: 230 },
    ],
  },
  {
    offset: 50,
    duration: 76,
    reverse: true,
    tiles: [
      { label: "Décoration", src: "/photos/deco.jpg", h: 320 },
      { label: "Les mariés", src: "/photos/hero.jpg", h: 230, pos: "62% 50%" },
      { label: "Mariée", src: "/photos/bride.jpg", h: 300, pos: "50% 20%" },
    ],
  },
  {
    offset: 14,
    duration: 60,
    reverse: false,
    tiles: [
      { label: "Alliances", src: "/photos/rings.jpg", h: 300, pos: "50% 60%" },
      { label: "Fleurs", src: "/photos/florist.jpg", h: 320, pos: "50% 60%", saved: true },
      { label: "Traiteur", src: "/photos/chef.jpg", h: 240 },
    ],
  },
];

export type Vendor = {
  slug: string;
  name: string;
  meta: string;
  rating: string;
  price: string;
  photo: string;
  pos?: string;
};

export const featuredVendors: Vendor[] = [
  { slug: "studio-aube", name: "Studio Aube", meta: "Paris 11e · Reportage", rating: "4,9", price: "650 €", photo: "/photos/confetti.jpg" },
  { slug: "atelier-kofi-ama", name: "Atelier Kofi & Ama", meta: "Paris 18e · Traditionnel", rating: "5,0", price: "780 €", photo: "/photos/kente.jpg", pos: "50% 30%" },
  { slug: "maison-lumen", name: "Maison Lumen", meta: "Paris 5e · Champêtre", rating: "4,8", price: "590 €", photo: "/photos/field.jpg" },
  { slug: "nuit-blanche", name: "Nuit Blanche", meta: "Paris 3e · Urbain", rating: "4,9", price: "720 €", photo: "/photos/rain.jpg" },
  { slug: "horizon", name: "Horizon", meta: "Paris 16e · Destination", rating: "4,8", price: "900 €", photo: "/photos/beach.jpg", pos: "50% 50%" },
  { slug: "valse-eternelle", name: "Valse Éternelle", meta: "Paris 9e · Soirée", rating: "4,7", price: "540 €", photo: "/photos/dance.jpg" },
];
