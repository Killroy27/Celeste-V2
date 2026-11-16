// Coordonnées et réseaux de Céleste.
// À COMPLÉTER : les adresses des comptes officiels. Tant qu'un lien vaut null, l'icône n'est pas affichée.

export type Social = { name: string; href: string | null };

export const socials: Social[] = [
  { name: "Instagram", href: null },
  { name: "TikTok", href: null },
  { name: "Pinterest", href: null },
  { name: "Facebook", href: null },
  { name: "YouTube", href: null },
  { name: "LinkedIn", href: null },
];

// Afficher les icônes même sans adresse définie (maquette). Passer à false en production.
export const SHOW_SOCIAL_PLACEHOLDERS = true;
