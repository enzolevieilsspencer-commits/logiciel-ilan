---
title: "EXPERIENCE — App stock & marge Vinted"
status: final
created: 2026-07-24
updated: 2026-07-24
sources:
  - ../../prds/prd-logiciel-ilan-2026-07-24/prd.md
---

# Ilan — Stock & Marge · Spine d'expérience

> Comportement et architecture de l'information (le « comment ça marche »). L'identité visuelle (le « comment ça se voit ») vit dans `DESIGN.md`. Maquette de référence : `mockups/key-screens.html`. **En cas de conflit, ce spine et `DESIGN.md` l'emportent sur la maquette.**

## Foundation

**PWA installable, mobile-first** (téléphone, usage principal — y compris sur le terrain en brocante) et **confortable sur Mac** (desktop). **Mono-utilisateur** en v1 : une seule personne, Ilan, derrière un accès protégé. Pas de webfont, police système (voir `DESIGN.md`). Colonne unique partout. Accès caméra pour la photo des Pièces. Le mode hors-ligne est un *COULD*, pas une base de la v1.

## Information Architecture

Surfaces dérivées des FR du PRD.

| Surface | Atteinte depuis | Rôle | FR |
|---|---|---|---|
| Auth / Connexion | Ouverture à froid (si session expirée) | Protège l'accès aux données | FR-1 |
| Accueil / Tableau de bord | Ouverture (défaut), onglet Accueil | Bénéfices + Marge moyenne, Argent dormant, aperçu Stock | FR-6, FR-7 |
| Stock (liste) | Onglet Stock | Toutes les Pièces *en stock*, recherche/filtre | FR-2, FR-8 |
| Ajouter une pièce | FAB « + » | Saisie rapide d'une Pièce | FR-2 |
| Fiche pièce | Tap sur une ligne de Pièce | Consulter / modifier / vendre / supprimer, Marge | FR-3, FR-4, FR-5 |
| Filtres | Bouton « Filtrer » (Stock / Historique) | Filtrer par catégorie, couleur, taille, marque | FR-8 |
| Historique / Stats | Onglet Stats | Pièces *vendues*, Bénéfices par période | FR-4, FR-7 |
| Réglages | Onglet Réglages | Auth / déconnexion, préférences | FR-1 |

Tabbar basse à 4 onglets (**Accueil / Stock / Stats / Réglages**). FAB « + » flottant pour l'ajout. Pas de menu drawer.

→ Composition : `mockups/key-screens.html`. Le spine l'emporte en cas de conflit.

## Voice and Tone

Microcopy — **tutoiement, chaleureux, direct**. Ilan est nommé. Ton de compagnon, jamais de tableur froid. Vocabulaire du Glossaire (Pièce, Marge, Statut, Argent dormant, Bénéfices, Marge moyenne, Stock, Historique) utilisé verbatim dans l'UI.

| À faire | À éviter |
|---|---|
| « Salut Ilan » | « Bonjour, utilisateur » |
| « Argent qui dort » | « Capital immobilisé » |
| « Ajouter au stock » | « Soumettre le formulaire » |
| « Prends une photo » | « Veuillez sélectionner un fichier » |
| « plus tard » (placeholder prix de vente) | « champ obligatoire manquant » |
| Phrases courtes, humaines | Jargon comptable, majuscules criardes |

## Component Patterns

Comportemental. Les specs visuelles vivent dans `DESIGN.md.Components`.

| Composant | Usage | Règles comportementales |
|---|---|---|
| Carte chiffre | Accueil | Lecture seule. Bénéfices → Marge moyenne accolée. Se met à jour après tout ajout / vente / modif. |
| Sélecteur chips | Ajout / Filtres | Tap = sélectionne (un seul par groupe pour catégorie/couleur). Liste fermée « style Vinted », pas de saisie libre. |
| FAB « + » | Accueil, Stock | Ouvre toujours « Ajouter une pièce ». Toujours accessible d'un pouce. |
| Tabbar | Global | Bascule de surface, conserve l'état de chaque onglet. |
| Ligne de pièce | Stock, Historique | Tap → Fiche pièce. Affiche méta + tag Statut ; Marge € à droite si *vendu*. |
| Bascule de statut | Fiche pièce | *en stock* ⇄ *vendue*. Passage en *vendue* exige un Prix de vente (confirmé/ajusté). Réversible. |

## State Patterns

| État | Surface | Traitement |
|---|---|---|
| Stock vide | Stock / Accueil | « Ton stock est vide — ajoute ta première pièce. » + FAB mis en avant. |
| Historique vide | Stats | « Pas encore de vente. Ta première marge s'affichera ici. » |
| Chargement | Toute surface | Skeleton discret, pas de spinner plein écran. Chiffres en dernier connu si dispo. |
| Pièce *en stock* | Stock, ligne | Tag *en stock* (menthe). Compte dans l'Argent dormant. |
| Pièce *vendue* | Historique, ligne | Tag *vendu* (vert) + Marge € en vert. Sort du Stock, entre dans l'Historique. |
| Pièce qui stagne (>60 j) | Stock | Mise en évidence de la Pièce *en stock* depuis > 60 jours (nudge « à brader »). *(COULD, FR-9)* |
| Erreur d'action | Contextuel | Message bienveillant, jamais bloquant ni rouge agressif (voir Voice). |

## Interaction Primitives

- **Tap pour agir.** Ajout d'une Pièce = suite de taps courts : FAB → photo (caméra) → chips catégorie → chips couleur → taille → prix d'achat → « Ajouter au stock ». Cible ~15 s (SM-C1). Le Prix de vente n'est **pas** requis à l'ajout.
- **Vente** = bascule *en stock* → *vendue* sur la Fiche, qui **exige/confirme le Prix de vente**. La Pièce quitte le Stock, alimente Bénéfices et Historique. Réversible (correction).
- **Édition de prix** = modifier Prix d'achat ou Prix de vente **recalcule immédiatement la Marge** (€ et %) affichée (FR-5).
- **Bannis :** carrousels, animations d'ouverture tape-à-l'œil, saisie libre pour catégorie/couleur, tout champ qui rallonge la saisie sans gagner sa place.

## Accessibility Floor

Comportemental. Le contraste et les couleurs vivent dans `DESIGN.md`.

- Cibles tactiles ≥ 44pt (iOS) / 48dp (Android) — FAB, chips, onglets, boutons.
- Chaque élément interactif porte un label + rôle + état (le tag Statut annonce « en stock » / « vendu »).
- Les chiffres ne s'appuient jamais sur la seule couleur : le libellé (« Bénéfices », « Argent dormant », « marge ») accompagne toujours la valeur.
- Ordre de lecture = ordre visuel (Bénéfices → Argent dormant → Stock).
- Type dynamique honoré via les tokens `DESIGN.md.typography` ; l'UI reste lisible au plus grand réglage, sans troncature de contrôle.

## Key Flows

### Flow 1 — UJ-1 · Achat rapide (Ilan, en friperie, téléphone en main)

1. Ilan est déjà connecté ; il ouvre l'app et tape le FAB « + ».
2. « Ajouter une pièce » s'ouvre ; il prend la photo du pull (caméra).
3. Il tape les chips catégorie / couleur, saisit taille et Prix d'achat (6 €).
4. Il laisse le Prix de vente sur « plus tard ».
5. Il valide « Ajouter au stock ».
6. **Climax :** en moins de 15 s la Pièce apparaît dans le Stock, statut *en stock* — il range le téléphone et continue ses achats.

Échec : photo ratée / pas prise → la Pièce se crée quand même, photo ajoutable plus tard depuis la Fiche.

### Flow 2 — UJ-2 · Vente & marge (Ilan, une pièce part sur Vinted)

1. Ilan ouvre la Fiche de la Pièce depuis le Stock.
2. Il bascule le Statut *en stock* → *vendue*.
3. L'app demande / confirme le Prix de vente (25 €).
4. Il valide.
5. **Climax :** la Marge s'affiche en grand et fier — **+19 €, 76 %**. La Pièce bascule dans l'Historique et alimente ses Bénéfices.

Échec : bascule par erreur → réversible, il repasse la Pièce en *en stock*.

### Flow 3 — UJ-3 · Point du matin (Ilan, au réveil)

1. Ilan ouvre l'app ; l'Accueil s'affiche directement.
2. Il voit dans l'ordre : ses **Bénéfices** (carte héro) avec la **Marge moyenne** accolée.
3. Juste en dessous, l'**Argent dormant** dans son Stock.
4. Puis l'aperçu du Stock, avec d'éventuelles Pièces qui stagnent mises en évidence.
5. **Climax :** en trois secondes il sait où il en est et décide quoi brader ou racheter — sans piloter à l'aveugle.

Échec : aucune donnée encore → états vides invitant à ajouter la première Pièce.

## Responsive & Platform

- **PWA installable** sur l'écran d'accueil (mobile) et sur Mac. Manifeste + icône ; l'app se lance en plein écran, sans chrome de navigateur.
- **Caméra** : accès direct pour la photo des Pièces sur mobile (FR-2). Sur Mac, sélection de fichier en repli.
- **Mobile-first** : colonne unique, tabbar basse, FAB au pouce. **Mac** : même colonne centrée et confortable, pas de refonte multi-colonnes — les cartes chiffres restent les héros.
- **Hors-ligne** : *COULD* (confort brocante sans réseau). Non garanti en v1 ; à traiter en architecture (voir Questions ouvertes du PRD sur le lieu des données/photos).
