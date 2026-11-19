# Céleste — site web

Landing page de Céleste, la marketplace mariage et événementiel (Next.js 15, React 19, TypeScript, CSS Modules).

Direction artistique : [docs/direction-artistique.md](docs/direction-artistique.md), visible sur la page `/charte`.

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
| `/espace` | Espace couple (CDC §5, §15) : Cockpit, puis Mon mariage (`/espace/mariage/planning`, `budget`, `prestataires`, `wedding-dna`, `documents`), Messages et Deal Room (`/espace/messages?c=prestataire`, CDC §11), réservation (`/espace/reservation/prestataire` : contrat, signature, paiement, CDC §13), Profil. Données d'exemple enregistrées dans le navigateur |
| `/espace-pro` | Espace prestataire de démonstration (Studio Aube, CDC §16 à §19) : Accueil (actions à traiter), Opportunités, Messages et dossiers (création et révision d'offres), Mon activité (pipeline, visites, réservations, calendrier et capacité), Mon profil (fiche, formules et options, Vérifié et Select, avis), Paiements. La conversation avec le couple de démonstration est partagée avec `/espace` |
| `/admin` | Back-office de démonstration (CDC §20) : Dashboard, Utilisateurs, Prestataires (dossier, vérification, Select, signaux anti-contournement), Marketplace (pondérations Best Match, tolérances, seuils Select, parts de budget), Réservations, Finance, Support (litiges et médiation §23, avis signalés, tickets), Paramètres (paiement, règles à valider §32, rôles, journal d'audit). Volontairement absent des menus du site |
| `/a-propos`, `/contact`, `/mentions-legales`, `/confidentialite`, `/cgu` | Pages institutionnelles (textes légaux provisoires) |

## Structure

- `src/app/` : layout (en-tête et pied de page communs, polices Bodoni Moda + DM Sans), tokens de la charte, pages
- `src/components/` : en-tête collant et recherche, hero, onglets métiers, cartes, liste filtrable, devis
- `src/lib/content.ts` : contenu de démonstration (métiers, prestataires, avis…), à remplacer par l'API
- `src/lib/settings.ts` : paramètres de la marketplace (tolérance budgétaire et pondérations du Best Match, acompte, blocage de date, seuils Select), à brancher sur le back-office
- `src/lib/deal.ts` : messagerie et Deal Room (§11) : conversations, offres versionnées aux états canoniques, négociation par adaptation du contenu, rendez-vous (§12), alerte coordonnées (§22). Les réponses des prestataires sont simulées en attendant l'espace prestataire
- `src/lib/booking.ts` : parcours de réservation (§13.1) : contrat généré depuis la version acceptée, signature et paiement simulés, échéancier en une fois ou 30 % + 1 à 3 échéances (§14.1). Les clauses non validées (§32) restent marquées « à valider »
- `src/lib/pro.ts` : espace prestataire : profil, catalogue, calendrier et capacité (§17), vérification et critères Select (§18), opportunités (§19), clients d'exemple au même format qu'un projet de couple
- `src/lib/admin.ts` : back-office : rôles et permissions (§20.6), journal d'audit (§20.5), dossiers prestataires, litiges, avis signalés, tickets, paiements échoués
- `src/lib/settings.ts` : règles de la marketplace ; valeurs du cahier par défaut, ajustables depuis `/admin` (`saveOverrides`) sans déploiement
- `src/lib/format.ts` : dates (heure locale) et montants partagés
- `src/lib/wedding.ts` : projet de mariage du couple, source unique du budget, du planning, de la checklist, de la timeline et des priorités du Cockpit
- `src/lib/favorites.ts` : coups de cœur stockés localement en attendant les comptes
- `public/` : photos, icônes 3D et logo

## À brancher

- Les formulaires (devis, contact, inscription pro) affichent une confirmation mais n'envoient rien : à relier à l'API.
- Les textes légaux sont des versions provisoires à faire valider.

## Charte

Jaune `#EEB048` en couleur principale et d'accent, brun `#39210C` uniquement pour le texte, fond crème `#FBF7F2`.
