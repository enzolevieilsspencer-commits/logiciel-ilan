---
title: "PRD — App de gestion de stock & marge Vinted (logiciel-ilan)"
status: final
created: 2026-07-24
updated: 2026-07-24
---

# PRD : App de gestion de stock & marge Vinted
*Titre de travail — à confirmer.*

## 0. Objet du document

Ce PRD s'adresse au développeur (Exzodev) et aux étapes BMAD suivantes (UX, architecture, epics & stories). Il détaille les fonctionnalités et leurs exigences fonctionnelles (FR) à partir du [brief validé](../../briefs/brief-logiciel-ilan-2026-07-24/brief.md). Structure : vocabulaire ancré par un glossaire, features regroupées avec FR numérotées globalement, hypothèses taguées `[HYPOTHÈSE]` et indexées en fin de document. Projet perso, calibrage léger.

## 1. Vision

Ilan revend des vêtements sur Vinted et n'a aujourd'hui aucune vision claire de sa rentabilité : prix d'achat dans sa tête, ventes dans Vinted, marge nulle part. Cette PWA centralise tout au même endroit. Il ajoute chaque pièce avec son prix d'achat, renseigne son prix de vente, et l'app calcule sa marge automatiquement.

Un tableau de bord donne en trois secondes les seuls chiffres qui comptent : ce qu'il a **gagné**, l'**argent qui dort** dans son stock invendu, et sa **marge moyenne**. La force du produit est sa simplicité assumée : on ne suit que le prix d'achat et le prix de vente — pas de frais, pas de commissions. C'est ce qui rend l'outil utilisable au quotidien et réellement livrable.

## 2. Utilisateur cible

### 2.1 Jobs To Be Done
- **Fonctionnel** : savoir en un coup d'œil combien je gagne, combien d'argent dort dans mon invendu, quelle est ma marge.
- **Fonctionnel** : ajouter une pièce sans friction, même sur le terrain (brocante), depuis mon téléphone.
- **Contextuel** : retrouver et piloter une pièce précise quand mon stock grossit.
- **Émotionnel** : arrêter de piloter à l'aveugle ; me sentir maître de mon activité.

### 2.2 Non-utilisateurs (v1)
- D'autres revendeurs Vinted : l'app est mono-utilisateur en v1 (ouverture publique envisagée plus tard, hors périmètre).

### 2.3 Parcours utilisateurs clés

- **UJ-1. Ilan achète un pull en friperie et l'enregistre sur le pouce.**
  Ilan, revendeur en pleine session d'achat, déjà connecté sur son téléphone. Il ouvre l'app, tape « + », prend la photo du pull, choisit catégorie/couleur/taille, saisit le prix d'achat (6 €), et valide. En moins de 15 secondes la pièce est dans son stock, statut *en stock*. Il range son téléphone et continue ses achats.

- **UJ-2. Ilan vend une pièce et voit sa marge.**
  Une pièce part sur Vinted. Ilan ouvre sa fiche, passe le statut à *vendue* et confirme/ajuste le prix de vente (25 €). L'app affiche immédiatement la marge : **+19 €, 76 %**. La pièce bascule dans l'historique des ventes et alimente ses bénéfices.

- **UJ-3. Ilan fait le point le matin.**
  Ilan ouvre l'app au réveil. Le tableau de bord lui montre d'emblée, dans l'ordre : ses **bénéfices**, l'**argent dormant** dans son stock, et sa **marge moyenne**. En trois secondes il sait où il en est et décide quoi brader ou racheter.

## 3. Glossaire

- **Pièce** — un article de vêtement suivi dans l'app. Possède une photo, une catégorie, une couleur, une taille, une marque (optionnelle), un prix d'achat, un prix de vente (optionnel tant que non vendue) et un statut. Unité de base du stock.
- **Prix d'achat** — montant payé par Ilan pour acquérir une Pièce.
- **Prix de vente** — montant auquel une Pièce est vendue. Modifiable a posteriori.
- **Marge** — Prix de vente − Prix d'achat, pour une Pièce. Exprimée en € et en %.
- **Statut** — état d'une Pièce : *en stock* ou *vendue*.
- **Stock** — l'ensemble des Pièces au statut *en stock*.
- **Historique** — l'ensemble des Pièces au statut *vendue*, conservées durablement.
- **Bénéfices** — somme des Marges des Pièces *vendues* sur une période donnée.
- **Argent dormant** — somme des Prix d'achat des Pièces *en stock* (capital immobilisé dans l'invendu).
- **Marge moyenne** — rentabilité globale **pondérée** des Pièces *vendues* : (somme des Marges € ÷ somme des Prix d'achat) × 100. Reflète la vraie marge par euro investi (une Pièce à fort Prix d'achat pèse plus qu'une petite). Distincte de la marge propre à une Pièce, qui reste un simple (Prix de vente − Prix d'achat) ÷ Prix d'achat.

## 4. Fonctionnalités

### 4.1 Authentification
**Description :** Ilan se connecte pour accéder à ses données. Ce sont des informations de business, et l'app pourra s'ouvrir à d'autres plus tard : l'accès est protégé dès la v1. Mono-utilisateur, pas de gestion de comptes multiples. Réalise le prérequis de sécurité de tous les autres parcours.

**Functional Requirements :**

#### FR-1 : Connexion sécurisée
Ilan peut se connecter à l'app avec un identifiant et un secret ; ses données ne sont accessibles qu'une fois authentifié.

**Consequences (testable) :**
- Un accès non authentifié aux données (stock, historique, dashboard) est refusé.
- Une session authentifiée persiste raisonnablement (pas de reconnexion à chaque ouverture). `[HYPOTHÈSE : session persistante souhaitée pour le confort mobile.]`

### 4.2 Gestion des pièces
**Description :** Ilan crée, consulte et modifie ses Pièces. La fiche est « style Vinted » : rapide à saisir, assez riche pour filtrer plus tard. Réalise UJ-1.

**Functional Requirements :**

#### FR-2 : Ajouter une pièce
Ilan peut ajouter une Pièce en renseignant une photo, une catégorie, une couleur, une taille, une marque (optionnelle) et un Prix d'achat. Réalise UJ-1.

**Consequences (testable) :**
- Une Pièce créée apparaît immédiatement dans le Stock au statut *en stock*.
- Le Prix de vente n'est pas requis à la création.
- La photo peut être prise directement depuis l'appareil (mobile).
- Catégorie et couleur sont choisies dans une **liste fermée « style Vinted »** (pas de valeurs libres en v1).

#### FR-3 : Consulter et modifier une pièce
Ilan peut ouvrir la fiche d'une Pièce et modifier n'importe lequel de ses champs, y compris le Prix d'achat et le Prix de vente.

**Consequences (testable) :**
- Modifier le Prix d'achat ou le Prix de vente recalcule la Marge (voir FR-5).
- Ilan peut supprimer une Pièce.

### 4.3 Statut & calcul de marge
**Description :** Le Statut d'une Pièce (*en stock → vendue*) est le pivot du système : il répartit l'argent entre Argent dormant et Bénéfices, et déclenche le calcul de la Marge. Réalise UJ-2.

**Functional Requirements :**

#### FR-4 : Passer une pièce en « vendue »
Ilan peut passer une Pièce du statut *en stock* au statut *vendue* en confirmant ou ajustant son Prix de vente. Réalise UJ-2.

**Consequences (testable) :**
- Une Pièce *vendue* quitte le Stock et entre dans l'Historique (conservée durablement).
- Le passage en *vendue* requiert un Prix de vente renseigné.
- Ilan peut repasser une Pièce *vendue* en *en stock* (correction d'erreur). `[HYPOTHÈSE : réversibilité du statut utile pour corriger une fausse manip.]`

#### FR-5 : Calcul automatique de la marge
Le système calcule automatiquement la Marge (€ et %) d'une Pièce dès qu'un Prix d'achat et un Prix de vente sont renseignés, et la recalcule à chaque modification de l'un des deux.

**Consequences (testable) :**
- Marge € = Prix de vente − Prix d'achat ; Marge % = Marge € ÷ Prix d'achat × 100.
- La Marge affichée reflète toujours les valeurs courantes (recalcul immédiat après édition).

### 4.4 Tableau de bord
**Description :** L'écran d'accueil montre l'essentiel d'un coup d'œil, dans un ordre de priorité fixe. Réalise UJ-3.

**Functional Requirements :**

#### FR-6 : Indicateurs clés du tableau de bord
Ilan voit sur l'écran d'accueil : (1) ses **Bénéfices**, avec la **Marge moyenne pondérée affichée juste à côté** ; (2) l'**Argent dormant** en Stock. Réalise UJ-3.

**Consequences (testable) :**
- Les Bénéfices agrègent les Marges € des Pièces *vendues*.
- La Marge moyenne (pondérée) est affichée accolée aux Bénéfices, pas comme un bloc distinct.
- L'Argent dormant somme les Prix d'achat des Pièces *en stock*.
- Chaque Pièce *vendue* affiche par ailleurs sa **propre** marge (simple) sur sa fiche / dans l'Historique (voir FR-5).
- Tous les chiffres se mettent à jour après tout ajout, vente ou modification.

#### FR-7 : Sélecteur de période sur les bénéfices *(SHOULD)*
Ilan peut basculer l'affichage des Bénéfices entre « ce mois », « cette année » et « depuis le début ».

**Consequences (testable) :**
- Changer de période recalcule les Bénéfices sur la fenêtre choisie, à partir de la date de vente des Pièces.

### 4.5 Filtres & recherche *(SHOULD)*
**Description :** Quand le Stock grossit, Ilan retrouve une Pièce précise. Réalise l'implicite de UJ-3 (piloter à grand volume).

**Functional Requirements :**

#### FR-8 : Filtrer le stock
Ilan peut filtrer ses Pièces par catégorie, couleur, taille et marque.

**Consequences (testable) :**
- Les filtres se combinent (ex. « vestes » + « noir »).
- La liste filtrée peut porter sur le Stock, l'Historique, ou les deux. `[HYPOTHÈSE : filtrer aussi l'Historique est utile pour les stats.]`

### 4.6 Alertes pièces stagnantes *(COULD)*
**Description :** L'app met sous le nez d'Ilan les Pièces qui dorment depuis trop longtemps — même idée que l'Argent dormant, vue pièce par pièce. Mode « nounou proactive » explicitement souhaité.

**Functional Requirements :**

#### FR-9 : Signaler les pièces qui stagnent *(COULD)*
Le système signale à Ilan les Pièces *en stock* depuis plus d'un seuil de temps (par défaut 60 jours) pour l'inciter à baisser le prix ou brader.

**Consequences (testable) :**
- Une Pièce *en stock* depuis > 60 jours est mise en évidence.
- Le seuil a une valeur par défaut de 60 jours. `[HYPOTHÈSE : seuil configurable non requis en v1.]`

## 5. Non-Goals (explicite)

- Ne suit **pas** les frais Vinted, la négociation ni les commissions (choix KISS assumé).
- N'est **pas** un outil multi-utilisateurs / multi-comptes en v1.
- Ne s'**intègre pas** à l'API Vinted (saisie manuelle des pièces).
- N'est **pas** un outil de comptabilité ni de déclaration fiscale.

## 6. Périmètre MVP

### 6.1 Dans le périmètre (MVP)
- Authentification (FR-1)
- Ajout / consultation / modification de pièces (FR-2, FR-3)
- Statut *en stock → vendue* + historique (FR-4)
- Calcul automatique de la marge (FR-5)
- Tableau de bord 3 indicateurs (FR-6)

### 6.2 Hors périmètre MVP
- Sélecteur de période sur les bénéfices (FR-7) — *SHOULD*, juste après le MVP.
- Filtres & recherche (FR-8) — *SHOULD*, devient nécessaire quand le stock grossit. `[NOTE FOR PM : à prioriser dès qu'Ilan dépasse ~50 pièces.]`
- Alertes pièces stagnantes (FR-9) — *COULD*, bonus.
- Mode hors-ligne (PWA sans réseau) — *COULD*, confort terrain (brocante).
- Multi-utilisateurs / version publique — v2+.

## 7. Critères de succès

**Primaire**
- **SM-1** : Adoption quotidienne — Ilan ouvre et utilise l'app **tous les jours** et ne l'abandonne pas après un mois. Valide l'ensemble du MVP (FR-2, FR-4, FR-6).

**Secondaire**
- **SM-2** : L'app devient la **source de vérité** — Ilan saisit ses nouvelles pièces dans l'app plutôt que sur papier/dans sa tête. Valide FR-2.
- **SM-3** : Pilotage guidé — Ilan prend des décisions à partir de l'app (brader une pièce qui stagne, savoir ce qui est rentable). Valide FR-6, FR-9.

**Contre-métriques (à ne pas optimiser)**
- **SM-C1** : Temps de saisie d'une pièce — ne doit **pas** augmenter à mesure qu'on enrichit la fiche. Contrebalance la tentation d'ajouter des champs (FR-2). Cible implicite : rester sous ~15 s.

## 8. Questions ouvertes

1. Méthode d'authentification concrète (mot de passe simple, e-mail, autre) — à trancher en architecture.
2. Où vivent les données et les photos (local, cloud) ? Impacte le mode hors-ligne et la sécurité — à trancher en architecture.

*Résolues :* la Marge moyenne est **pondérée** (décidé). Les catégories/couleurs sont une **liste fermée « style Vinted »** (décidé).

## 9. Index des hypothèses

- §4.1 FR-1 — Session authentifiée persistante souhaitée pour le confort mobile.
- §4.3 FR-4 — Réversibilité du statut (*vendue* → *en stock*) utile pour corriger une fausse manip.
- §4.5 FR-8 — Filtrer aussi l'Historique est utile pour les stats.
- §4.6 FR-9 — Seuil de stagnation (60 j) non configurable en v1.
- §7 SM-C1 — Cible de temps de saisie ~15 s.

## 10. Plateforme

- **PWA** (application web installable), **mobile-first** (téléphone) et confortable sur **Mac** (desktop).
- Installable sur l'écran d'accueil ; accès caméra pour la photo des pièces.
- Mode hors-ligne prévu en *COULD* (usage brocante sans réseau).
