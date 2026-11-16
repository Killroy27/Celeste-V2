# Recherche et catalogue : principes (référence Airbnb)

## 1. Rangées du catalogue

- Titre au format **« Métier · Lieu »** (ex. « Photographes · Paris »), suivi d'une petite flèche ronde.
- Le titre et la flèche forment un lien vers la page de résultats de ce métier dans ce lieu.
- Deux chevrons (précédent / suivant) en haut à droite de la rangée, alignés sur le titre, pour faire défiler. Grisés quand on est au bout. Pas de flèches posées sur les photos.

## 2. Page de résultats (cible de la flèche et de la barre de recherche)

- Deux colonnes : à gauche la grille des prestataires trouvés, à droite une carte.
- Chaque prestataire qui a renseigné son lieu d'activité est épinglé sur la carte (pastille avec le prix, comme Airbnb). Survoler une carte de la liste met en avant son épingle, et inversement.
- **Règle d'affichage :**
  - au moins un résultat localisé → liste + carte ;
  - aucun résultat localisé → liste seule, en pleine largeur.
- Mobile : liste par défaut, bouton « Carte » flottant pour basculer.

## À prévoir côté données

- Champ optionnel de localisation sur le prestataire (adresse ou zone d'activité, avec latitude / longitude).
- Pour la page de résultats : filtres en haut (comme Airbnb), titre « Photographes à Paris : 48 prestataires ».

## 3. Les quatre rangées de l'accueil

- **Lignes 1, 2 et 3 :** les trois meilleures catégories de prestations de la plateforme, dans l'ordre de leur classement (ligne 1 = la meilleure).
- **Ligne 4 :** un mélange des autres catégories. On pioche à tour de rôle dans chaque catégorie restante, pour que toute l'offre de Céleste soit représentée.
- Le classement des catégories est calculé par un algorithme Céleste (à concevoir). Prototype actuel : volume d'avis × note moyenne de la catégorie, voir `rankCategories()` dans `src/lib/content.ts`.
- Exemple : 20 catégories, A, B et C sont les meilleures → A, B, C en lignes 1 à 3 ; la ligne 4 alterne des prestataires des 17 autres.

## 4. Défilement et « Tout afficher »

- Chaque clic sur un chevron fait avancer la rangée d'**une seule carte**.
- En fin de rangée apparaît une carte **« Tout afficher »**, de la même taille que les autres, avec un petit éventail de trois photos de la rangée. Son apparition est animée. Elle mène à la page de résultats de la rangée.
