# Céleste — site web

Landing page de Céleste, la marketplace mariage et événementiel (Next.js 15, React 19, TypeScript, CSS Modules).

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.

## Pages

| Route | Contenu |
| --- | --- |
| `/` | Landing : hero, sélection par métier, étapes, métiers, quiz, avis, conseils, espace pro, FAQ |
| `/decouvrir` | Une rangée par métier |
| `/prestataires/[metier]` | Liste filtrable (style, budget, vérifiés) et triable |
| `/prestataire/[slug]` | Fiche : galerie, formules, avis, zone, demande de devis |
| `/recherche` | Résultats de la barre de recherche (`?quoi=&ou=&quand=`) |
| `/matchs` | Quiz en 4 questions et prestataires recommandés |
| `/inspirations` | Mur d'inspiration filtrable et carnet de conseils |
| `/comment-ca-marche` | Parcours couple, garanties, FAQ complète |
| `/devenir-prestataire` | Avantages, tarifs, inscription |
| `/favoris` | Coups de cœur (enregistrés dans le navigateur) |
| `/a-propos`, `/contact`, `/mentions-legales`, `/confidentialite`, `/cgu` | Pages institutionnelles (textes légaux provisoires) |

## Structure

- `src/app/` : layout (en-tête et pied de page communs, polices Bodoni Moda + DM Sans), tokens de la charte, pages
- `src/components/` : en-tête collant et recherche, hero, onglets métiers, cartes, liste filtrable, devis
- `src/lib/content.ts` : contenu de démonstration (métiers, prestataires, avis…), à remplacer par l'API
- `src/lib/favorites.ts` : coups de cœur stockés localement en attendant les comptes
- `public/` : photos, icônes 3D et logo

## À brancher

- Les formulaires (devis, contact, inscription pro) affichent une confirmation mais n'envoient rien : à relier à l'API.
- Les textes légaux sont des versions provisoires à faire valider.

## Charte

Jaune `#EEB048` en couleur principale et d'accent, brun `#39210C` uniquement pour le texte, fond crème `#FBF7F2`.
