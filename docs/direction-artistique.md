# Direction artistique Céleste : « Éditorial chaleureux »

**Statut : stable** (17/11/2026). Appliquée à tout le site, desktop et mobile vérifiés. Toute évolution passe d'abord par ce document et par `src/app/globals.css`, seule source des tokens. Référence visuelle vivante : la page [`/charte`](../src/app/charte/page.tsx).

> La structure d'Airbnb, la clarté de Fresha, l'émotion d'un magazine de mariage. Lumineux et festif, jamais vintage.

Ce document fixe les règles visuelles avant le développement des lots du cahier des charges. En cas de doute entre deux choix, on suit l'ordre : **lisibilité, puis simplicité, puis beauté**.

---

## 1. Références

| Référence | Ce qu'on lui prend | Où chez Céleste |
| --- | --- | --- |
| Airbnb | Pilule de recherche, cartes photo, carte avec prix, fiche en mosaïque, carte de réservation collante | Découvrir, résultats, fiche |
| Fresha | Fond franc, boutons noirs, parcours de réservation en étapes, statuts très lisibles | Réservation, paiement, espace pro |
| Aman, Mr & Mrs Smith | Grandes photos, beaucoup de vide, serif fin, peu de texte | Accueil, pages éditoriales, Best Match |
| Joy, Zola | Un budget et une checklist élégants, jamais administratifs | Mon mariage |
| Linear, Mercury | Interface dense mais calme, chiffres bien composés, statuts nets | Cockpit, Deal Room, back-office |
| Stripe Checkout | Prix, frais et total lisibles avant de payer (CDC §21.2) | Paiement |

## 2. Deux registres, un seul système

- **Éditorial** (site public) : photos en grand, grands titres Roobert, sections aérées (96 à 128 px), une idée par section.
- **Produit** (espaces connectés couple, prestataire et admin) : densité plus forte, statuts colorés, mobile d'abord pour les actions fréquentes (CDC §27).

Les deux registres partagent exactement les mêmes tokens et la même police. Seules la densité et la taille des titres changent.

## 3. Couleurs

### 3.1 Palette

| Rôle | Valeur | Usage |
| --- | --- | --- |
| Blanc | `#ffffff` | **Couleur dominante** : fond général, cartes, panneaux, en-tête |
| Blanc cassé | `#fbf7f2` | Surface secondaire légère : sections alternées, états vides, fonds de photo en chargement |
| Noir | `#000000` | Texte, icônes, **boutons d'action principaux**, contours actifs |
| Jaune | `#eeb048` | **Signature Céleste** : Best Match, score de compatibilité, badge Select |

La crème `#fbf0e0` de la charte d'origine n'est **plus utilisée** : elle donnait un rendu trop vintage et pas assez festif.

### 3.2 Dérivés (tirés du noir, jamais de brun)

| Token | Valeur | Contraste sur `#ffffff` | Usage |
| --- | --- | --- | --- |
| `--ink` | `#000000` | 21:1 | Texte principal |
| `--ink-2` | `#4d4d4d` | 8,5:1 | Texte secondaire |
| `--ink-3` | `#6e6e6e` | 5,1:1 | Métadonnées (14 px minimum) |
| `--line` | `#ebebeb` | n/a | Séparateurs, contours au repos |
| `--line-strong` | `rgba(0,0,0,.18)` | n/a | Contours de champs |
| `--hover` | `rgba(0,0,0,.04)` | n/a | Survol des surfaces |
| `--brand-hover` | `#e5a43a` | n/a | Survol du jaune |

### 3.3 Règles du jaune

1. **Jamais de texte jaune** : sur fond clair, le contraste est de 1,9:1, donc illisible. Le jaune est toujours un **fond sous du texte noir** (10,3:1) ou une petite touche graphique (✦, soulignement, point de statut).
   **Seule exception (19/11/2026, validée)** : le mot qui défile dans le titre de l'accueil (« photographe », « fleuriste »…), en « soleil étincelant » : jaune vif et lumineux (`#f6a700` → `#ffd75e`, éclat `#fff6d6`), un éclat blanc qui le traverse, un halo chaud et deux étoiles ✦ qui scintillent autour, en Regular et à très grande taille. Aucun autre texte ne passe en jaune.
2. **Un seul bouton jaune dans le contenu visible**, en plus de celui de l'en-tête : celui du Best Match. Les pastilles de score jaunes sur les cartes sont autorisées, car elles portent la même signature.
3. Le jaune ne s'achète pas, comme le badge Select : aucun élément sponsorisé n'utilise le jaune (CDC §3, §18.2).

### 3.4 Statuts (seule exception à la charte, réservée au registre Produit)

| Statut | Fond | Texte | Point | Exemples (CDC) |
| --- | --- | --- | --- | --- |
| Positif | `#e7f1ea` | `#1d5c3a` | `#2f8a57` | Acceptée, Réservation confirmée, Payé, Disponible confirmé |
| En attente | `rgba(238,176,72,.16)` (jaune léger) | `#000` | `#eeb048` (jaune) | À confirmer, Vue, En discussion, Paiement à venir, Capacité limitée |
| Négatif | `#f9e6e3` | `#8e2a1c` | `#c6452f` | Refusée, Paiement échoué, Complet, Litige |
| Neutre | `rgba(0,0,0,.05)` | `#4d4d4d` | `#8a8a8a` | Brouillon, Expirée, Retirée, Terminé |
| Actif | `#ffffff` + contour | `#000` | `#000` | Envoyée, Révisée / nouvelle version |

Un statut s'affiche toujours avec **un point et un libellé**, jamais par la couleur seule (accessibilité).

## 4. Typographie

Une seule famille : **Roobert PRO** (`--font-roobert`), auto-hébergée dans `src/fonts/roobert/` (Light 300, Regular 400, Medium 500, Bold 700). Elle remplace Bodoni Moda et DM Sans.

- **Medium (500)** : titres, boutons, libellés, chiffres.
- **Regular (400)** : texte de lecture.
- **Light (300)** : chapôs en grande taille uniquement (20 px et plus).
- **Bold (700)** : mise en avant ponctuelle dans le texte (prix « dès **650 €** »). Jamais pour un titre.
- Roobert n'a **pas de graisse 600** : ne jamais écrire `font-weight: 600` (le navigateur prendrait le Bold).
- L'approche (letter-spacing) se resserre quand la taille augmente.

| Style | Taille / interligne (desktop → mobile) | Graisse | Approche |
| --- | --- | --- | --- |
| Display | 76/80 → 44/48 | 500 | -0,035em |
| Titre de page | 52/56 → 36/40 | 500 | -0,03em |
| Titre de section | 28/34 → 22/28 | 500 | -0,02em |
| Titre de carte | 18/24 | 500 | -0,01em |
| Chapô | 20/30 | 300 | 0 |
| Corps | 16/26 | 400 | 0 |
| Petit | 14/20 | 400 | 0 |
| Surtitre | 12/16 majuscules | 500 | 0,08em |
| Grand chiffre | 40/44 | 500 | -0,03em, chiffres tabulaires |

## 5. Formes, espaces, élévation

- **Espacements** : base 4, échelle `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`.
- **Rayons** : `8` champs et petits éléments · `12` photos de carte · `16` panneaux et cartes de contenu · `24` modales et grands visuels · `999` boutons, pastilles, badges.
- **Ombres** (noir pur, jamais teintées) :
  - `--shadow-1` : `0 1px 2px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04)` pour les cartes au repos.
  - `--shadow-2` : `0 2px 6px rgba(0,0,0,.06), 0 12px 32px rgba(0,0,0,.10)` pour le survol, les menus et la carte de réservation.
  - `--shadow-3` : `0 24px 64px rgba(0,0,0,.18)` pour les modales.
- **Largeurs** : éditorial 1280 px · résultats et catalogue 1760 px · fiche 1120 px · formulaires et paiement 560 px.

## 6. Composants clés

### Boutons

| Variante | Apparence | Usage | Limite |
| --- | --- | --- | --- |
| Principal | Fond noir, texte blanc cassé | L'action qui fait avancer : Envoyer, Réserver, Payer, Accepter l'offre | 1 par écran |
| Signature | Fond jaune, texte noir, ✦ | Best Match uniquement (Trouver mes matchs, Affiner, Voir mes matchs) | 1 par écran |
| Secondaire | Fond transparent, contour `--line-strong`, texte noir | Alternatives : Proposer un rendez-vous, Partager | Libre |
| Discret | Texte souligné | Navigation tertiaire, « Voir tout » | Libre |

Hauteurs : 36 (petit), 48 (standard), 56 (grand, hero et paiement). Forme pilule. Un bouton désactivé passe à 40 % d'opacité et indique pourquoi.

**En-tête** : logo, navigation, « Devenir prestataire » en lien texte, **un seul** bouton signature « Trouver mes matchs », menu du compte.

### Badges de confiance

- **Vérifié** : pastille blanche, coche noire, texte noir. C'est un constat d'identité, pas une promesse de qualité (CDC §18.1).
- **Céleste Select** : pastille noire, losange jaune, texte blanc cassé. C'est le seul badge qui porte du jaune, car il se mérite (CDC §18.2).
- **Score Best Match** : pastille jaune, ✦ et pourcentage en noir. Toujours accompagné de « Pourquoi ce match » (CDC §7.5).

### Cartes prestataire

Photo au format 4:3 (rayon 12, carrousel à points), cœur blanc en haut à droite, badge en haut à gauche, puis nom (Roobert Medium) et note sur la même ligne, métadonnées en `--ink-3`, prix d'appel en gras. En mode Best Match, la pastille de score remplace le badge.

### Carte

Tuiles neutres : en prototype, tuiles OpenStreetMap désaturées par la classe `celeste-map` (filtre CSS). En production, un fournisseur sous licence avec un style clair (MapTiler, Mapbox…) ; les tuiles CARTO exigent désormais une clé. Pastilles de prix blanches à texte noir, noires au survol ou à la sélection.

### Icônes

- Interface : pictogrammes au trait de 1,5 px, noirs, tracés arrondis.
- Icônes 3D (`public/icons`) : réservées aux moments éditoriaux, c'est-à-dire onglets métiers, étapes et états vides. Jamais dans un bouton.

### Avatars

Photo si disponible ; sinon des initiales noires sur fond blanc cassé. Plus de couleurs pastel aléatoires.

## 7. Photographie

- Lumière naturelle et dorée, tons chauds, peau rendue fidèlement quelle que soit la carnation.
- Des couples et des cultures variés, sur chaque rangée.
- Des instants vrais plutôt que des poses de catalogue, avec des détails (mains, fleurs, tables) pour respirer entre les portraits.
- Interdit : texte incrusté sur la photo, filtres froids, banques d'images génériques.

## 8. Mouvement

- Micro (survol, pression) : 150 ms. Interface (menus, onglets) : 250 ms. Éditorial (apparitions) : 450 ms. Courbe `cubic-bezier(.2,.7,.2,1)`.
- Un seul élément animé à la fois dans le champ de vision (le mot du hero se remplace, il ne se superpose pas).
- Chargement : squelettes aux dimensions finales, jamais de bloc vide.
- `prefers-reduced-motion` : tout passe en fondu court ou en statique.

## 9. États (CDC §27)

Chaque écran prévoit **chargement, vide, erreur, succès, indisponible**. Un état vide = un panneau blanc cassé, une illustration 3D, une phrase qui explique, **une** action (« Aucun coup de cœur pour l'instant. Parcourez les photographes et touchez ♡ pour les garder ici. »).

## 10. Écarts corrigés lors de la migration du 17/11/2026

| Écart | Aujourd'hui | Cible |
| --- | --- | --- |
| Encre | Brun `#39210c` et `#6b5744` | Noir `#000`, `#4d4d4d`, `#6e6e6e` |
| Fond et surfaces | Blanc cassé `#fbf7f2` en fond, beige `#f3ece2` | Blanc `#ffffff` dominant, blanc cassé en surface secondaire |
| Boutons principaux | Jaune partout | Noir ; jaune réservé au Best Match |
| Typographie | Bodoni Moda gras et DM Sans | Roobert PRO seul (Medium pour les titres, Regular pour la lecture) |
| En-tête | 3 actions qui se concurrencent | 1 bouton signature + lien texte |
| Hero | Mots superposés pendant la transition, tuile vide | Remplacement net, squelettes |
| Ombres | Teintées de brun | Noir pur |
| Carte | Tuiles OpenStreetMap colorées | Tuiles désaturées |
| Avatars | Pastels aléatoires | Initiales noires sur blanc cassé |
