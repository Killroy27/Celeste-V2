# Revue UI/UX du prototype face au cahier des charges

**Date :** 18/11/2026. **Référence :** « Cahier des charges Céleste final consolidé » (33 sections). **Périmètre :** le prototype front (`celeste-web`), lots 1 à 6 : parcours couple, espace prestataire, back-office.

Le cahier sert de grille. Pour chaque exigence, on regarde si un écran la traduit, et si l'expérience respecte l'intention décrite dans le « pourquoi ».

Légende des statuts :

- **Couvert** : l'exigence est traduite dans l'interface.
- **Partiel** : une partie manque, ou la donnée n'est pas reliée de bout en bout.
- **Manquant** : aucun écran ne la traduit.
- **Hors front** : elle relève du backend, ou elle est prévue en V2.

---

## Mise à jour du 18/11/2026 : écarts traités

Tous les manques et écarts partiels relevés plus bas ont été traités, testés dans le navigateur et revus.

**Les 4 manques indispensables :**

- **Inscription prestataire ouverte (§16.2).** Le compte est créé immédiatement depuis « Devenir prestataire ». Un accueil en étapes guide ensuite le professionnel, avec l'échelle Inscrit → Profil publié → Vérifié → Select. La publication n'est possible qu'une fois la présentation, les photos, une formule et les disponibilités renseignées.
- **Avis vérifiés (§24).** Le couple note sur 5 critères après une prestation réservée et payée. Le prestataire peut répondre ou signaler un avis. L'admin modère, et la décision revient au prestataire.
- **Litiges (§23).** Le couple ou le prestataire ouvre un dossier depuis une réservation, avec motif, montant et preuves. Un accusé de réception est envoyé, et chaque partie suit les 7 étapes, échange avec Céleste et reçoit la décision. Les trois espaces lisent le même stockage.
- **Notifications (§25).** Une cloche avec compteur est présente côté couple et côté prestataire. Les 13 événements du cahier sont calculés à partir des données. Ouvrir une notification ne marque qu'elle comme lue. Des préférences e-mail sont disponibles par type.

**Les écarts partiels :**

- **Annulation, report, force majeure (§14.3, §14.4).** Aucun montant n'est calculé, c'est le contrat qui fait foi. La force majeure ouvre un dossier de médiation qui privilégie le report.
- **Recherche (§9).**
  - Filtres ajoutés : date, zone, services, Céleste Select. Le badge Select figure sur les cartes et suit les seuils administrables.
  - Feed Best Match : les 5 rangées du §9.3, sans doublon.
- **Accès (§8, §5.1).** Action Best Match dans Découvrir. Coups de cœur dans Mon mariage.
- **Wedding DNA (§6).**
  - Import d'images personnelles, avec une analyse simulée qui propose des tags.
  - Tags ajoutables et renommables.
  - Images de la page Inspirations reprises dans le Wedding DNA, gardées en brouillon s'il n'existe pas encore.
- **Saisie unique côté prestataire (§10.3).** L'espace pro édite les informations métier, et la fiche publique reprend la présentation et ces informations. Ce lien n'existe que pour le prestataire de démonstration.
- **Catégories (§4).** Activation et désactivation dans l'admin, avec effet sur le choix du métier dans le Best Match.
- **Visites (§12).** Le prestataire propose jusqu'à 3 créneaux, et le couple choisit le sien dans la conversation ou dans le planning.
- **Paiement (§14.1).** Les textes d'acompte et d'échéances des fiches suivent les réglages de l'admin.

**Ce qui reste :**

- les données réelles de migration (§31) ;
- l'édition, dans l'admin, des schémas de champs et des mini-tests ;
- l'envoi réel des e-mails ;
- le calendrier de la fiche publique, fixé au moment de la génération du site.

Les trois derniers relèvent du backend ou de l'hébergement.

Le reste de ce document décrit l'état **avant** ces corrections.

---

## 1. Synthèse

Les 46 écrans maîtres du §30 existent : 17 côté couple, 14 côté prestataire, 15 côté administration. Les principes du §3 sont respectés partout :

- une donnée saisie une seule fois ;
- une action qui met à jour tout le reste ;
- pas de pay-to-win dans le Best Match ;
- Céleste guide, l'utilisateur décide.

Il reste **4 manques sur des fonctions classées indispensables** au §28.1 :

1. **Inscription prestataire ouverte (§16.2).** La page « Devenir prestataire » propose « laissez vos coordonnées, on vous recontacte ». Le cahier demande qu'un professionnel puisse créer son compte immédiatement, puis progresser vers Vérifié et Select.
2. **Avis vérifiés côté couple (§24).** Aucun écran ne permet au couple de laisser un avis après la prestation. Le prestataire peut répondre à un avis mais ne peut pas le signaler.
3. **Ouverture d'un litige (§23).** Le couple et le prestataire ne peuvent pas ouvrir de dossier depuis une réservation. Seul l'admin voit des litiges, et ce sont des données d'exemple.
4. **Notifications (§25).** Il n'existe ni centre de notifications ni préférences e-mail. Les pastilles de non-lus et les priorités du Cockpit n'en tiennent lieu qu'en partie.

Viennent ensuite **10 écarts partiels**, de moindre gravité. Ils sont détaillés plus bas.

---

## 2. Revue section par section

### §1 à §3 : vision, rôles, principes

| Exigence | Statut | Constat |
| --- | --- | --- |
| Tout faire au même endroit : découvrir, être recommandé, échanger, adapter, réserver, signer, payer (§1) | Couvert | Le parcours va sans rupture de la fiche jusqu'à la réservation payée |
| Un seul compte couple, avec les deux prénoms (§2) | Couvert | Profil à deux prénoms. Le premier contact depuis une fiche crée l'espace avec le prénom saisi |
| Rôles prestataire, propriétaire de lieu et administrateur (§2) | Partiel | L'espace pro n'est démontré que pour un photographe. Les champs propres aux lieux (capacité, couchages, traiteur imposé) n'apparaissent pas côté pro |
| Simple avant tout (§3) | Couvert | Les nouveautés se logent dans les écrans existants : Deal Room dans Messages, réservation à la suite de l'offre |
| Céleste guide, l'utilisateur décide (§3) | Couvert | Les suggestions sont explicables. Aucune action n'est prise à la place de l'utilisateur |
| Pas de pay-to-win (§3) | Couvert | Les pondérations ne dépendent d'aucun abonnement, et Select ne s'achète pas |
| Une donnée saisie une seule fois (§3) | Couvert | Le Wedding DNA alimente le projet et inversement ; le budget prévu sert à l'adaptation d'offre |
| Une action met à jour tout le reste (§3) | Couvert | Accepter, signer ou payer met à jour le statut, le budget, l'échéancier, les documents, le planning et la conversation |

### §4 : catégories

| Exigence | Statut | Constat |
| --- | --- | --- |
| Les 15 métiers présents dès le lancement | Couvert | Les 15 métiers du cahier sont là, plus la pâtisserie |
| Catégories activables depuis le back-office | Partiel | Le modèle le prévoit, mais l'admin n'a pas d'interrupteur. Les parts de budget, elles, sont éditables |

### §5 : parcours couple

| Exigence | Statut | Constat |
| --- | --- | --- |
| Navigation à 5 entrées (§5.1) | Couvert | Barre latérale sur ordinateur, onglets en bas sur mobile |
| Favoris regroupés dans un espace logique (§5.1) | Partiel | Les coups de cœur ne sont accessibles que par `/favoris`, depuis le menu du site, pas depuis l'espace couple |
| Cockpit (§5.2) : compte à rebours, 3 priorités au maximum, progression, budget, prochaines échéances, recommandation | Couvert | La question « Que faire maintenant ? » est au centre |
| Mon mariage (§5.3) : Planning, Budget, Mes prestataires, Wedding DNA, Documents | Couvert | |
| Mes prestataires (§5.4) : classement par statut et une seule vue synthétique | Couvert | Tiroir unique : offre, rendez-vous, paiements, documents, conversation |

### §6 : Wedding DNA

| Exigence | Statut | Constat |
| --- | --- | --- |
| Date, zone, invités, budget, style, gamme, priorités, contraintes, inspirations (§6.1) | Couvert | Les critères indispensables traduisent les contraintes |
| Réutiliser les réponses du moodboard existant (§6.1) | Partiel | Les coups de cœur de `/inspirations` n'alimentent pas les inspirations du Wedding DNA |
| Images proposées par Céleste (§6.2) | Couvert | |
| Import d'images personnelles et analyse IA (§6.2) | Manquant | Aucun envoi d'image. L'analyse IA relève du backend, mais l'écran d'import et l'état « analyse en cours » sont de l'UX |
| Tags visibles et corrigibles (§6.2) | Partiel | On peut retirer un tag, mais pas en ajouter ni en renommer |
| Profil vivant qui recalcule (§6.3) | Couvert | Modifier le profil met le Best Match à jour |

### §7 et §8 : Best Match et accès

| Exigence | Statut | Constat |
| --- | --- | --- |
| 1 à 2 questions par métier, cartes visuelles, un tap (§7.1) | Couvert | |
| Plus de critères en arrière-plan que de questions visibles (§7.2) | Couvert | 7 critères pondérés |
| « Affiner mes résultats » facultatif (§7.3) | Couvert | |
| Critères bloquants seulement s'ils sont marqués indispensables (§7.4) | Couvert | Date, budget, zone… avec un message clair quand tout est écarté |
| Pourcentage, raisons, points forts, écart, disponibilité, confiance (§7.5) | Couvert | |
| Tolérance budget administrable (§7.6) | Couvert | Réglable dans l'admin, avec la mention « à auditer avec l'agent existant » |
| Rôle de l'IA (§7.7) | Hors front | Le score est déterministe, comme demandé. Résumé et aide à la rédaction viendront plus tard |
| Points d'entrée : accueil, navigation, catalogue métier, fiche, Cockpit (§8) | Couvert | |
| Action Best Match dans Découvrir (§8) | Manquant | La page `/decouvrir` n'a ni bandeau ni action Best Match |
| Une seule porte d'entrée, socle commun puis métier (§8.1) | Couvert | |

### §9 : marketplace et découverte

| Exigence | Statut | Constat |
| --- | --- | --- |
| Filtres classiques (§9.1) : catégorie, localisation, date, budget, style, services, disponibilité, avis, badges | Partiel | Présents : catégorie, budget, style, note, Vérifié. Absents : date ou disponibilité, services, zone, filtre Select |
| Recherche Best Match (§9.2) | Couvert | |
| Feed : meilleurs matchs, très proches, disponibles à votre date, compatibles budget, à découvrir (§9.3) | Partiel | Les rangées « Disponibles à votre date » et « À découvrir » manquent |

### §10 : fiche prestataire

| Exigence | Statut | Constat |
| --- | --- | --- |
| Socle commun (§10.1) : galerie, description, zone, équipe, formules, options, prix, calendrier, avis, FAQ, conditions | Couvert | |
| Champs spécifiques par métier (§10.2) | Couvert | Les fiches traiteur, photographe et lieu n'ont pas le même schéma |
| Une seule saisie côté prestataire (§10.3) | Partiel | L'espace pro édite la présentation et le catalogue, mais pas les champs métier. Ses modifications n'atteignent ni la fiche publique ni le Best Match |
| Schémas administrables (§10.4) | Partiel | Lecture seule dans l'admin |

### §11 et §12 : messagerie, Deal Room, visites

| Exigence | Statut | Constat |
| --- | --- | --- |
| Temps réel, non-lus, recherche, réponse citée, fichiers, cartes de fiches, proposition de rendez-vous (§11.1) | Couvert | Le temps réel est simulé, et partagé entre onglets |
| États canoniques des offres (§11.2) | Couvert | Liste technique unique ; libellés adaptés au couple ou au prestataire |
| Négociation par adaptation du contenu (§11.3) | Couvert | Des deux côtés : le couple fait sa demande, le prestataire révise |
| Historique des versions, version acceptée figée (§11.4) | Couvert | |
| Visites validées par le prestataire, créneau alternatif, confirmation par le couple (§12) | Couvert | |
| « Un ou plusieurs » créneaux alternatifs (§12) | Partiel | Le prestataire ne peut en proposer qu'un à la fois |
| Rappels de rendez-vous (§12) | Manquant | Ils dépendent des notifications (§25) |

### §13 et §14 : réservation, paiement, annulation

| Exigence | Statut | Constat |
| --- | --- | --- |
| Parcours en 8 étapes, de l'offre acceptée aux documents disponibles (§13.1) | Couvert | Signature et paiement simulés |
| Contrat électronique (§13.2) | Couvert | Les clauses non validées sont marquées « à valider » |
| Assurance (§13.3) | Couvert | Aucune promesse affichée, conformément au cahier |
| Paiement en une fois, ou 30 % puis 1 à 3 échéances (§14.1) | Couvert | Réglable dans l'admin. Le paiement refusé est géré |
| Reversement J+72 h (§14.2) | Couvert | Affiché « en cours de validation », sans chiffre |
| Parcours d'annulation et de report (§14.3, §14.4) | Manquant | Aucun bouton « Demander une annulation ou un report ». Le parcours peut exister sans afficher le barème, qui reste à valider |
| Blocage de date 48 h (§14.5) | Couvert | |

### §15 : budget, checklist, timeline

Couvert : budget central avec dépenses externes, checklist générée et modifiable, source unique pour la timeline.

### §16 à §19 : prestataire

| Exigence | Statut | Constat |
| --- | --- | --- |
| Navigation à 6 entrées (§16.1) | Couvert | |
| Inscription ouverte (§16.2) | Manquant | Un formulaire de rappel remplace la création de compte. Il n'y a pas non plus d'accueil en étapes ni de statut « Inscrit, non vérifié » |
| Dashboard orienté actions (§16.3) | Couvert | |
| Catalogue (§16.4) : formules, options, « à partir de », sur devis | Couvert | |
| Calendrier sur 24 mois, 5 états, capacité (§17) | Couvert | |
| Vérifié et Select (§18) | Couvert | Le message « ne garantit pas la qualité » est bien présent |
| Opportunités limitées et réponse structurée (§19) | Couvert | |

### §20 : back-office

| Exigence | Statut | Constat |
| --- | --- | --- |
| Navigation à 8 entrées, dashboard (§20.1, §20.2) | Couvert | |
| Marketplace (§20.3) | Partiel | Couverts : pondérations, tolérances, seuils Select, budget, modération des avis. Pas encore éditables : catégories (activation), schémas de champs, mini-tests, règles des opportunités |
| Finance (§20.4), journal d'audit (§20.5), rôles (§20.6) | Couvert | |

### §21 à §26 : modèle économique, confiance, conformité

| Exigence | Statut | Constat |
| --- | --- | --- |
| 7 % et 5 % non promis (§21) | Couvert | Ils n'apparaissent qu'en interne, dans l'admin, marqués « à valider » |
| Détection automatique, avertissement, accès humain journalisé (§22) | Couvert | Le masquage avant réservation attend la règle retenue |
| Médiation (§23) | Partiel | Le côté admin est complet. L'ouverture par le couple ou le prestataire et le suivi de leur dossier manquent |
| Avis vérifiés sur 5 critères, réponse, signalement (§24) | Partiel | Affichage et réponse du prestataire présents. Le dépôt par le couple et le signalement par le prestataire manquent |
| Notifications in-app et e-mail (§25) | Partiel | Pastilles et priorités présentes. Centre de notifications, préférences e-mail et rappels absents |
| Export et suppression des données, information sur l'analyse automatique (§26) | Couvert | |

### §27 : règles UX

| Règle | Statut | Constat |
| --- | --- | --- |
| Premium mais simple | Couvert | La direction artistique est appliquée partout |
| Une action principale par écran | Couvert | |
| Mobile prioritaire pour messages, paiement, disponibilités, visites, offres | Couvert | Conversation plein écran, fenêtres en bas d'écran, saisie à portée de pouce |
| États clairs | Couvert | Point et libellé, jamais la couleur seule |
| Tests courts | Couvert | |
| États vides utiles | Couvert | Chaque écran vide propose l'action suivante |

### §28 à §33

- **Priorisation (§28) :** tout le §28.1 est traité, sauf les 4 manques de la synthèse. Les éléments du §28.2 et du §28.3 sont prévus en V2 et V3, ce qui est conforme au cahier.
- **Critères d'acceptation (§29) :** tous sont vérifiables dans le prototype, sauf la reprise du moodboard existant, qui reste partielle.
- **Migration (§31) :** les 13 lieux et 20 prestataires du pipeline ne sont pas intégrés, faute de données fournies.
- **Décisions à valider (§32) :** elles sont listées dans l'admin, non paramétrables et jamais affichées aux utilisateurs.

---

## 3. Petites incohérences relevées

- **Textes figés malgré les réglages.** La carte de contact des fiches affiche en dur « 30 % d'acompte » et « le solde en une à trois fois ». Elle ne suit pas les réglages de l'admin.
- **Fiche publique non reliée.** Elle n'est pas connectée au profil édité dans l'espace pro. L'écran le signale, mais la promesse d'une saisie unique (§10.3) n'est donc pas tenue de bout en bout.

---

## 4. Plan proposé, par priorité

| Priorité | Chantier | Section | Ampleur |
| --- | --- | --- | --- |
| 1 | Inscription prestataire immédiate, accueil en étapes, statut Inscrit puis Vérifié | §16.2 | Moyenne |
| 1 | Avis après prestation, sur 5 critères, côté couple ; signalement côté prestataire | §24 | Moyenne |
| 1 | Ouvrir et suivre un litige depuis une réservation, côté couple et côté prestataire | §23 | Moyenne |
| 1 | Centre de notifications (couple et prestataire) et préférences e-mail | §25 | Moyenne |
| 2 | Demande d'annulation ou de report depuis une réservation, sans barème chiffré | §14.3, §14.4 | Faible |
| 2 | Filtres date, disponibilité, services, zone et Select ; rangées « Disponibles à votre date » et « À découvrir » | §9 | Moyenne |
| 2 | Action Best Match dans Découvrir ; favoris accessibles depuis l'espace couple | §8, §5.1 | Faible |
| 2 | Import d'images d'inspiration, ajout et renommage de tags ; coups de cœur reliés au Wedding DNA | §6 | Moyenne |
| 3 | Champs métier dans l'espace pro, reliés à la fiche publique ; activation des catégories dans l'admin | §10.3, §4 | Moyenne |
| 3 | Plusieurs créneaux alternatifs ; textes d'acompte reliés aux réglages | §12, §14.1 | Faible |
