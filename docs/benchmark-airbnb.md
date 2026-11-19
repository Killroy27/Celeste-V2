# Benchmark UI/UX : Airbnb (compte de test)

**Date :** 18/11/2026. **Méthode :** parcours en lecture seule d'un compte de test Airbnb, sur ordinateur (1440 × 900) et sur mobile (390 × 844), en deux passages, avec 59 captures. Aucune réservation, aucun paiement, aucun message n'a été envoyé, et aucune annonce n'a été modifiée. Le compte était vierge : voyages, messages et notifications ne montrent que leurs états vides.

**Non couvert :**

- **Écrans qui exigent une réservation réelle** : une conversation avec un hôte, le détail d'un voyage, l'après-réservation, le dépôt d'un avis.
- **Écran qui exige une carte bancaire** : l'étape 3 du paiement.
- **Éditeur d'annonce** : laissé de côté pour ne pas modifier le brouillon.
- **Bas du panneau Filtres** : la page bloquait le défilement automatique.

**Objectif :** relever les modèles d'ergonomie transposables à Céleste, dans notre propre charte (docs/direction-artistique.md). Il ne s'agit pas de reproduire l'interface d'Airbnb.

---

## 1. Ce qu'on retient, écran par écran

| Écran | Modèles observés |
| --- | --- |
| **Accueil** | Barre de recherche en trois segments (destination, dates, voyageurs) avec un bouton rond. Onglets de catégories illustrés. Rangées « Logements · Ville → » avec flèches. Cartes promotionnelles. Une pastille « Prix indiqués taxes et frais inclus » reste visible en bas d'écran. |
| **Recherche** | L'en-tête résume la recherche dans une pilule (« Paris · 11–13 déc. · 2 voyageurs »). Les filtres sont en pastilles, avec un bouton « Filtres » qui affiche le nombre de filtres actifs. La liste occupe deux colonnes à gauche, la carte est à droite. Le titre « Plus de 1 000 logements » est accompagné d'un lien **« Classement des résultats ⓘ »** qui explique l'ordre. Les prix sont affichés « au total », avec le prix barré en cas de remise. |
| **Recherche, mobile** | La carte occupe le haut de l'écran. Les résultats sont dans une **feuille glissante** à poignée. Une barre d'onglets à 5 entrées : Explorer, Favoris, Voyages, Messages, Profil. |
| **Fiche** | Titre, avec « Partager » et « Enregistrer ». Mosaïque d'une grande photo et quatre petites, plus « Afficher toutes les photos ». Bloc hôte, équipements avec icônes et un bouton « Afficher les 44 équipements », calendrier intégré, avis sur deux colonnes avec « Lire la suite ». Lien « Fonctionnement des commentaires ». La **carte de réservation reste fixée** sur le côté et annonce **« Aucun montant ne vous sera débité à cette étape »**. Un lien « Signaler cette annonce » est présent. **Au défilement**, l'en-tête devient une barre d'ancres (Photos, Équipements, Commentaires, Emplacement), avec le prix et le bouton d'action. |
| **Fiche, mobile** | Photo pleine largeur avec un compteur « 1 / 30 ». Retour, partage et cœur posés sur la photo. Le contenu remonte en feuille par-dessus la photo. **Barre basse fixe** avec le prix total, les dates et « Réserver ». |
| **Paiement** | En-tête réduit au logo : aucune distraction. **Une seule page, en 3 étapes numérotées en accordéon** : 1. quand payer (maintenant, ou en 3 fois), 2. mode de paiement, 3. vérification. Une étape franchie se replie en une ligne avec « Modifier ». À droite, un récapitulatif : photo, note, **conditions d'annulation**, dates et voyageurs modifiables, détail du prix et total. |
| **Menu du compte** | Liste groupée en blocs : Favoris, Voyages, Messages, Profil / Notifications, Paramètres, Langues, Centre d'aide / une carte « Devenir hôte » / Parrainage, co-hôte, cartes cadeaux / Déconnexion. |
| **Paramètres** | Navigation par sections à gauche. À droite, des lignes « libellé, valeur actuelle, lien Modifier », sans formulaire ouvert par défaut. Un bouton « Terminé » en haut. |
| **États vides** | Illustration en 3D, un titre court, une phrase qui explique la suite, **un seul bouton** (« Commencer »). |
| **Mode hôte** | Une navigation distincte, réduite à 4 entrées (Aujourd'hui, Calendrier, Annonces, Messages). Un bouton « Passer en mode voyageur ». Les annonces sont des cartes avec une pastille d'état (« En cours »). Le calendrier s'affiche à la semaine, avec le jour courant marqué et un sélecteur de vue. |
| **Transparence des prix** | À la première recherche, une fenêtre annonce « Le prix final. Dès le départ. », puis une pastille persistante prend le relais. |

### Écrans complémentaires (second passage)

| Écran | Modèles observés |
| --- | --- |
| **Sélecteur de dates** | Bascule « Dates » / « Flexibles ». Deux mois côte à côte. Pastilles de flexibilité : dates exactes, ± 1, 2, 3, 7 ou 14 jours. |
| **Panneau Filtres** | « Nos recommandations » en tuiles illustrées. Type de logement en contrôle segmenté. **Histogramme des prix** avec un curseur à deux poignées, et une bascule entre total et prix par nuit. **Pied fixe** : « Tout effacer » et un bouton qui annonce le nombre de résultats (« Afficher plus de 1 000 logements »). |
| **Galerie complète** | Une « Visite photo » **classée par pièce** (cuisine, chambre, extérieur…), avec un sommaire en vignettes et un bouton « Réserver » flottant. |
| **Tous les équipements** | Une fenêtre avec un champ de recherche, et des équipements regroupés par catégorie, chacun avec son icône. |
| **Tous les avis** | Une grande note globale avec la répartition des étoiles. **Des sous-notes par critère** (propreté, précision, arrivée, communication, emplacement…) avec des icônes. **« Les voyageurs en parlent »** : des thèmes avec leur nombre de mentions. Un tri (« Les plus pertinents ») et une recherche dans les avis. |
| **Profil** | Navigation verticale (« À propos de moi », « Connexions »). Une carte d'identité avec avatar, et un encart **« Complétez votre profil »** avec un bouton « Commencer ». Un lien vers les commentaires rédigés. |
| **Notifications** | Une page dédiée, avec un état vide sobre. |
| **Préférences de notification** | Des onglets (« Offres et mises à jour », « Compte »), puis des groupes. Chaque ligne affiche son état (« Désactivé ») et un lien « Modifier ». |
| **Paramètres, mobile** | Une liste à chevrons qui ouvre chaque section en plein écran. |
| **Recherche Services** | Des métiers illustrés en tuiles (Photographie, Chefs privés, Maquillage, Coiffure, Service de traiteur…). Des filtres « Types » et « Moment de la journée ». Des rangées thématiques. Des cartes « À partir de X € par voyageur », avec la note et le nombre d'évaluations. |
| **Fiche Service** | **À gauche, une colonne fixe sur l'identité** : couverture, portrait rond qui la chevauche, titre « Prestation par Prénom », bio, note, métier, lieu de la prestation, conditions d'annulation, partage et favori, puis « À partir de… » et « Voir les dates ». **À droite, un contenu qui défile** : les formules en cartes (photo, description, prix par personne, durée), « Tout afficher (10) », la mention « Vous pouvez envoyer un message à Elie pour personnaliser votre réservation », les avis, « Ma galerie », « Je viendrai à votre rencontre » avec la zone de déplacement sur une carte, puis « À savoir » (critères, accessibilité, annulation, statut professionnel). |
| **Réserver un service** | Une fenêtre « Planifiez votre massage » : un compteur de personnes, une bande de jours de la semaine, puis chaque formule avec ses **créneaux horaires en pastilles**. |
| **Menu hôte** | Un panneau latéral avec la cloche de notifications. Une carte « Vous débutez sur Airbnb ? » avec un bouton « Commencer ». Puis les ressources pour les hôtes, l'aide, la recherche d'un co-hôte et « Créer une annonce ». |
| **Devenir hôte** | Un titre-estimation (« Votre logement pourrait vous rapporter 643 € »), un curseur, un champ de recherche du lieu, et une carte de la zone. |

### Esthétique : valeurs mesurées dans le navigateur

Ces valeurs ont été relevées le 19/11/2026 sur la recherche et sur une fiche, à 1440 px de large.

| Élément | Airbnb (mesuré) | Céleste aujourd'hui |
| --- | --- | --- |
| Police | Airbnb Cereal VF (sans-serif géométrique arrondie, propriétaire) | Roobert PRO |
| Texte principal | #222222 (gris très foncé, pas de noir pur) | #000000 |
| Texte secondaire | #6C6C6C | #4D4D4D et #6E6E6E |
| Contours, séparateurs | 0,8 px #DDDDDD | 1 px #EBEBEB |
| Titre de fiche | 26 px, graisse 500 | 30 à 44 px, graisse 500 |
| Titres de section | 22 px, graisse 500, interlettrage −0,44 px | 20 px, graisse 500 |
| Corps de texte | 14 à 16 px | 14 à 17 px |
| Carte d'annonce | titre 15 px graisse 500, sous-titre 15 px #6C6C6C | similaire |
| Bouton principal (réservation) | Pilule (999 px), 48 px de haut, **dégradé rose-rouge** (#E61E4D → #D70466), 16 px graisse 500 | Pilule noire, 52 px, 15 px graisse 500 ; jaune réservé au Best Match |
| Bouton secondaire | Fond gris plein #F2F2F2, **sans contour**, arrondi 12 px | Contour gris, pilule |
| Pastille de filtre | Contour 0,8 px #DDDDDD, arrondi 24 px, 12 px, environ 34 px de haut | Contour, pilule |
| Carte de réservation | Arrondi 12 px, ombre 0 6px 16px rgba(0,0,0,0.12), sans contour | Arrondi 20 px, contour fin |
| Photos | Arrondi 12 px | Arrondi 16 à 20 px |
| Liens | Noir, soulignés, graisse 500 | Identique |

**L'identité visuelle d'Airbnb en quatre traits :**

1. **Une seule couleur d'action.** Le dégradé rose-rouge sert aux actions de réservation et à la recherche. Tout le reste est en gris neutre, avec des actions secondaires en noir (« Suivant », « J'ai compris »).
2. **Une douceur générale.** Le texte est gris foncé plutôt que noir, les contours sont à peine visibles, les arrondis sont moyens (12 px), et les ombres sont diffuses mais présentes sur ce qui flotte (carte de réservation, barre de recherche, fenêtres).
3. **Des titres modestes.** 22 à 28 px en graisse 500 : c'est la photo qui porte l'émotion, pas la typographie.
4. **Des illustrations 3D colorées** pour les catégories, les états vides et les encarts. Les icônes fonctionnelles (équipements, paramètres) sont en traits fins.

**Ce que Céleste partage déjà :** fond blanc dominant, une seule couleur signature, pilules, photos mises en avant, illustrations 3D (public/icons) et icônes au trait.

**Ce qui la distingue, volontairement :** un noir pur et des titres plus grands, pour une image plus éditoriale et haut de gamme ; le jaune comme seul accent, réservé au Best Match.

**Pistes possibles**, à valider avant de toucher à la direction artistique (déclarée stable) :

- Adoucir le texte principal (#1A1A1A ou #222 au lieu du noir pur) et les arrondis des cartes (12 à 16 px au lieu de 20 px).
- Utiliser des boutons secondaires en fond gris plein sans contour, plus légers que les boutons à contour.
- Ajouter une ombre diffuse aux éléments flottants (carte de contact fixe, barre de recherche), comme Airbnb.

---

## 2. Ce que Céleste fait déjà dans le même esprit

- Filtres en pastilles, liste et carte côte à côte, cartes avec plusieurs photos et un cœur.
- Barre d'onglets mobile à 5 entrées côté couple (§5.1), et barre basse fixe avec le bouton d'action sur la fiche mobile.
- États vides avec illustration et une seule action (§27).
- Mention « Sans engagement » sur la carte de contact.
- Espace prestataire séparé, avec sa propre navigation (§16.1).

---

## 3. Recommandations pour Céleste, par priorité

| Priorité | Recommandation | Écran Céleste | Lien avec le cahier |
| --- | --- | --- | --- |
| 1 | **Réservation sur une seule page, en accordéon** : contrat, mode de paiement, carte. Une étape franchie se replie avec « Modifier ». Le récapitulatif de droite permet de modifier chaque élément. L'en-tête est réduit au logo pendant le paiement. | `/espace/reservation/[slug]` | §13.1, §27 (une action principale par écran) |
| 1 | **« Pourquoi cet ordre ? »** à côté du titre des résultats : une fenêtre explique le classement et rappelle qu'aucun prestataire ne paie pour monter. | Catalogue métier, résultats Best Match | §3 (pas de pay-to-win), §7.5 |
| 1 | **En-tête qui suit le défilement sur la fiche** : barre d'ancres (Photos, Formules, Avis, Zone), prix et bouton « Écrire à… » une fois la carte de contact hors de l'écran. | `/prestataire/[slug]` | §10.1 |
| 2 | **Feuille glissante sur mobile** pour les résultats avec carte : carte en haut, liste qui monte. | Catalogue, recherche | §27 (mobile prioritaire) |
| 2 | **Pilule récapitulative** de la recherche dans l'en-tête des résultats (métier, zone, date). Bouton « Filtres » avec le nombre de filtres actifs. | Catalogue | §9.1 |
| 2 | **Phrase de réassurance sous chaque bouton d'engagement** : « Aucun paiement à cette étape » sous « Accepter l'offre » et sous « Signer le contrat ». | Deal Room, réservation | §13 |
| 2 | **Lignes « valeur actuelle + Modifier »** dans les profils, plutôt que des formulaires ouverts en permanence. | Profil couple, Mon profil pro | §27 (premium mais simple) |
| 3 | **Menu du compte groupé** en blocs, avec une carte « Devenir prestataire ». | Menu du site | §8, §16.2 |
| 3 | **« Signaler cette fiche »** discret sous la carte de contact. | Fiche prestataire | §22, §24 |
| 3 | **Compteur de photos** (« 1 / 12 ») sur la galerie mobile. | Fiche prestataire | §10.1 |
| 1 | **Fiche prestataire en deux colonnes, sur le modèle de la fiche Service.** À gauche, une identité fixe : portrait, métier, note, zone et bouton d'action. À droite, les formules en cartes (prix, durée, ce qui est inclus), les avis, la galerie et la zone de déplacement sur une carte, puis « À savoir » (conditions, statut Vérifié). | `/prestataire/[slug]` | §10.1, §10.2 |
| 1 | **Créneaux en pastilles** pour les demandes de visite, de dégustation ou d'essai : une bande de jours, puis les heures disponibles à toucher, au lieu d'un champ date et d'une liste « matin, après-midi, soir ». | Carte de contact de la fiche, rendez-vous dans la messagerie | §12, §27 |
| 1 | **Fenêtre « Tous les avis »** : note globale, sous-notes sur nos 5 critères avec icônes, thèmes cités, tri et recherche. | Fiche prestataire | §24 |
| 2 | **Panneau Filtres complet** : histogramme des prix, pied fixe avec « Tout effacer » et un bouton qui annonce le nombre de résultats. | Catalogue | §9.1 |
| 2 | **Sélecteur de date flexible** (± jours, ou période) pour le filtre Date et le Wedding DNA. | Catalogue, Best Match | §6.1, §9.1 |
| 2 | **Galerie classée par thème** (cérémonie, cocktail, soirée… pour un photographe ; salles, jardin, chambres pour un lieu). | Fiche prestataire | §10.2 |
| 3 | **Encart « Complétez votre profil »** côté couple, et carte « Vous débutez ? » dans le menu prestataire. | Profil couple, espace pro | §6.3, §16.2 |
| 3 | **Estimation sur « Devenir prestataire »** : nombre de couples qui cherchent ce métier dans la zone, plutôt qu'un revenu, puisque la commission n'est pas validée. | `/devenir-prestataire` | §1.2, §21, §32 |

**Point de vigilance.** Airbnb affiche « Prix indiqués taxes et frais inclus ». Céleste ne peut pas encore faire cette promesse : les frais de service couple et la TVA ne sont pas validés (§21.2, §32). Il faudra attendre cette validation avant d'adopter cette formule.

## Mise en œuvre (19/11/2026)

Les six recommandations prioritaires sont appliquées, dans le cadre de la direction artistique existante (Roobert, blanc, boutons noirs, jaune réservé au Best Match).

| Recommandation | Où | Ce qui a changé |
|---|---|---|
| Formules en cartes et « À savoir » | Fiche prestataire | Trois cartes (photo, prix, inclusions) ; « Choisir cette formule » ouvre le message avec la formule reprise. Nouvelle section « À savoir » en trois colonnes (réserver, payer, échanger en confiance), avec les durées réglées dans le back-office. |
| En-tête de fiche au défilement | Fiche prestataire | Ancres vers les sections, section lue soulignée ; prix et action quand la carte de contact n'est plus visible (ordinateur). |
| Fenêtre « Tous les avis » | Fiche prestataire | Note, cinq critères avec icônes, thèmes cités cliquables, tri et recherche. Étoiles des avis passées en noir (charte). |
| Créneaux en pastilles | Carte de contact, proposition de rendez-vous en messagerie | Bande de 14 jours puis heures en pastilles ; « Autre date » et « Autre heure » pour les cas hors liste. |
| Réservation en accordéon | `/espace/reservation/[slug]` | Une seule page, une étape ouverte ; les étapes franchies se replient avec « Revoir » (une offre acceptée ou un contrat signé ne se modifient pas ici). En-tête réduit au logo, sans menu. |
| « Pourquoi cet ordre ? » | Catalogue métier, résultats Best Match | Explication selon le tri en cours, pondérations du back-office, rappel qu'aucun prestataire ne paie pour monter. |

Recommandations de priorité 2 et 3, même jour :

| Recommandation | Où | Ce qui a changé |
|---|---|---|
| Galerie classée par thème | Fiche prestataire, visite photo | Thèmes propres aux lieux (domaine, espace cérémonie, salle, jardins…), traiteurs, pâtissiers, décorateurs et loueurs ; pastilles de thèmes dans le portfolio qui ouvrent la visite photo sur le thème choisi. |
| « Complétez votre profil » | Accueil et profil de l'espace couple | Encart visible tant qu'il manque le prénom du partenaire, la date ou le nombre d'invités confirmés, le budget ou le Wedding DNA ; disparaît ensuite. |
| « Vous débutez ? » | Menu de l'espace prestataire | Carte visible tant que la fiche d'un nouveau prestataire n'est pas publiée, avec l'étape suivante. |
| Estimation sur « Devenir prestataire » | Non faite | Afficher un nombre de couples qui cherchent un métier demande des données réelles de recherche ; en inventer serait trompeur. À faire quand ces données existeront. |
