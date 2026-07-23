---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-logiciel-ilan-2026-07-24/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-logiciel-ilan-2026-07-24/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-logiciel-ilan-2026-07-24/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-logiciel-ilan-2026-07-24/EXPERIENCE.md
---

# logiciel-ilan — Epic Breakdown

## Overview

Ce document décompose les exigences du PRD, des specs UX (DESIGN/EXPERIENCE) et de l'architecture en stories implémentables pour la PWA de gestion de stock & marge Vinted d'Ilan.

## Requirements Inventory

### Functional Requirements

FR1: Connexion sécurisée — Ilan se connecte (identifiant + secret) ; les données ne sont accessibles qu'authentifié ; session persistante. *(MUST)*
FR2: Ajouter une pièce — photo + catégorie + couleur + taille + marque (optionnelle) + prix d'achat ; catégorie/couleur en liste fermée « style Vinted » ; prix de vente non requis à la création ; apparaît immédiatement dans le Stock au statut *en stock*. *(MUST)*
FR3: Consulter et modifier une pièce — ouvrir la fiche, modifier tout champ (dont prix d'achat/vente), supprimer. *(MUST)*
FR4: Passer une pièce en « vendue » — bascule *en stock* → *vendue* avec prix de vente confirmé/ajusté ; entre dans l'Historique (conservé) ; réversible. *(MUST)*
FR5: Calcul automatique de la marge — Marge € et % calculées dès prix d'achat + prix de vente présents ; recalcul immédiat à chaque modification. *(MUST)*
FR6: Indicateurs clés du tableau de bord — Bénéfices avec Marge moyenne pondérée accolée, et Argent dormant ; mise à jour après tout ajout/vente/modif ; chaque pièce vendue affiche sa propre marge simple. *(MUST)*
FR7: Sélecteur de période sur les bénéfices — bascule ce mois / cette année / depuis le début. *(SHOULD)*
FR8: Filtrer le stock — par catégorie, couleur, taille, marque ; filtres combinables ; applicable Stock et/ou Historique. *(SHOULD)*
FR9: Signaler les pièces qui stagnent — mise en évidence des pièces *en stock* depuis > 60 jours (seuil par défaut). *(COULD)*

### NonFunctional Requirements

NFR1: PWA installable, mobile-first (téléphone) et confortable sur Mac (desktop), colonne unique, plein écran.
NFR2: Sécurité — accès protégé par authentification ; données isolées par utilisateur (Row-Level Security) dès la v1.
NFR3: Rapidité de saisie — ajouter une pièce en ~15 s (contre-métrique SM-C1 : ne pas allonger la saisie).
NFR4: Durabilité — l'historique des pièces vendues est conservé durablement (alimente les stats par période).
NFR5: RGPD — données personnelles hébergées en région EU.
NFR6: Hors-ligne — *COULD*, non garanti en v1 ; l'architecture ne doit pas coupler le MVP à l'offline.

### Additional Requirements

*(Extraits de l'ARCHITECTURE-SPINE — impactent l'implémentation)*

- **Starter / greenfield** : projet Vite 8 + React 19 + TypeScript 5 + `vite-plugin-pwa` 1.3 + Tailwind CSS 4 → **initialisation = Epic 1, Story 1**.
- **Backend Supabase** : Auth (email/mot de passe) + Postgres + Storage, via un **client `supabase-js` unique** (`lib/supabase.ts`).
- **AD-1** : Supabase = source de vérité unique ; le client React n'est qu'une vue.
- **AD-2** : métriques (Marge, Bénéfices, Argent dormant, Marge moyenne) **dérivées, jamais stockées** ; on ne persiste que prix_achat/prix_vente/statut/sold_at. Marge moyenne = pondérée `Σ(marge €) ÷ Σ(prix_achat)`.
- **AD-3** : toutes les écritures via supabase-js (chemin unique).
- **AD-4** : policies RLS sur chaque table (`user_id` = `auth.uid()`).
- **AD-5** : photos dans un bucket Storage ; la pièce stocke `photo_path`.
- **AD-6** : `statut ∈ {'en_stock','vendue'}` ; vendue ⇒ prix_vente non nul + sold_at.
- **Conventions** : argent en **centimes entiers** ; ids `uuid` ; dates `timestamptz` ; colonnes `snake_case`.
- **Modèle de données** : table `piece` (id, user_id, photo_path, categorie, couleur, taille, marque, prix_achat_cents, prix_vente_cents, statut, created_at, sold_at).
- **Structure** : feature-sliced `src/{app,features/{auth,pieces,dashboard},lib,components/ui}` ; dépendances `ui → features → lib → Supabase`.
- **Déploiement** : front statique sur Cloudflare Pages / Vercel ; Supabase managé région EU.

### UX Design Requirements

UX-DR1: **Design tokens** — implémenter la palette « Vinted-friendly » (teal `#09B1BA`, teal-dark `#007782`, vert marge `#22A45D`, ambre argent dormant `#E8A13A`, fond `#F4FBFB`, cartes blanches), l'échelle d'arrondis (sm 14 / md 18 / card 22 px) et la typographie police-système, en tokens Tailwind depuis `DESIGN.md`.
UX-DR2: **Composant Carte chiffre** — lecture seule ; carte héro Bénéfices avec Marge moyenne accolée ; carte Argent dormant ; se met à jour après tout ajout/vente/modif.
UX-DR3: **Composant Sélecteur chips** — sélection au tap, un seul choix par groupe (catégorie/couleur), liste fermée sans saisie libre.
UX-DR4: **FAB « + »** flottant, toujours accessible au pouce, ouvre « Ajouter une pièce ».
UX-DR5: **Tabbar 4 onglets** (Accueil / Stock / Stats / Réglages) conservant l'état de chaque onglet ; pas de drawer.
UX-DR6: **Composant Ligne de pièce** — vignette + méta + tag Statut ; Marge € à droite si vendue ; tap → Fiche.
UX-DR7: **Bascule de statut** — *en stock* ⇄ *vendue* sur la fiche ; passage en vendue exige le prix de vente ; réversible.
UX-DR8: **États vides & chargement** — stock vide, historique vide (messages chaleureux), skeleton discret (pas de spinner plein écran).
UX-DR9: **Microcopy / voice** — tutoiement chaleureux, Ilan nommé, vocabulaire du Glossaire verbatim (« Argent qui dort », « Ajouter au stock »…).
UX-DR10: **Accessibility floor** — cibles tactiles ≥ 44pt/48dp ; label + rôle + état sur chaque interactif ; jamais la couleur seule (libellé + valeur) ; ordre de lecture = ordre visuel.
UX-DR11: **PWA & caméra** — manifeste + icône, lancement plein écran ; accès caméra pour la photo (mobile) avec repli sélection de fichier (Mac).
UX-DR12: **Mise en évidence pièce stagnante** (> 60 j) dans le Stock. *(COULD, lié FR9)*

### FR Coverage Map

FR1: Epic 1 — Connexion sécurisée (auth + RLS)
FR2: Epic 2 — Ajouter une pièce
FR3: Epic 2 — Consulter / modifier / supprimer une pièce
FR4: Epic 3 — Passer une pièce en vendue (statut)
FR5: Epic 3 — Calcul automatique de la marge
FR6: Epic 4 — Indicateurs clés du tableau de bord
FR7: Epic 4 — Sélecteur de période sur les bénéfices (SHOULD)
FR8: Epic 2 — Filtrer le stock (SHOULD)
FR9: Epic 4 — Signaler les pièces qui stagnent (COULD)

## Epic List

### Epic 1: Fondations & Connexion
Ilan peut installer l'app (PWA) et se connecter en sécurité ; le socle technique tourne (projet Vite+React+TS+Tailwind+PWA, Supabase branché, design tokens, auth + Row-Level Security).
**FRs covered:** FR1 · (NFR1, NFR2, NFR5, UX-DR1, UX-DR11)

### Epic 2: Gérer son stock
Ilan peut ajouter une pièce (photo + infos) en moins de 15 s, la consulter, la modifier, la supprimer, et parcourir son stock ; filtres en story SHOULD.
**FRs covered:** FR2, FR3, FR8 (SHOULD)

### Epic 3: Vendre & connaître sa marge
Ilan peut passer une pièce en *vendue*, confirmer le prix de vente, voir la marge de la pièce et alimenter son historique.
**FRs covered:** FR4, FR5

### Epic 4: Piloter (tableau de bord)
Ilan voit d'un coup d'œil ses bénéfices + marge moyenne pondérée + argent dormant, filtrable par période, et repère les pièces qui stagnent.
**FRs covered:** FR6, FR7 (SHOULD), FR9 (COULD)

## Epic 1: Fondations & Connexion

Ilan peut installer l'app (PWA) et se connecter en sécurité ; le socle technique tourne.

### Story 1.1: Initialiser le projet PWA installable

As a développeur (Exzodev),
I want un projet Vite 8 + React 19 + TypeScript + Tailwind 4 + vite-plugin-pwa qui démarre et s'installe,
So that j'ai un socle installable et prêt à recevoir les fonctionnalités.

**Acceptance Criteria:**

**Given** un poste de dev sans projet
**When** j'initialise et lance le projet
**Then** l'app démarre en local (Vite) et build sans erreur
**And** un manifeste PWA + icône sont présents et l'app est installable sur l'écran d'accueil (mobile) et sur Mac (UX-DR11, NFR1)
**And** Tailwind CSS 4 est configuré et une page d'accueil vide s'affiche plein écran
**And** la structure `src/{app,features,lib,components/ui}` est en place (dépendances ui → features → lib)

### Story 1.2: Brancher Supabase et poser les design tokens

As a développeur,
I want un client Supabase unique et les tokens de design « Vinted-friendly »,
So that toute la suite lit/écrit via une seule source et respecte l'identité visuelle.

**Acceptance Criteria:**

**Given** un projet Supabase (région EU) et le projet initialisé
**When** je configure l'accès et les tokens
**Then** un client `supabase-js` unique existe dans `lib/supabase.ts`, alimenté par des variables `VITE_*` (jamais la clé service-role) (AD-3, NFR5)
**And** les tokens Tailwind reprennent la palette (teal #09B1BA, teal-dark #007782, vert #22A45D, ambre #E8A13A, fond #F4FBFB), l'échelle d'arrondis (14/18/22) et la typo système depuis DESIGN.md (UX-DR1)
**And** une page de test confirme la connexion à Supabase

### Story 1.3: Connexion sécurisée d'Ilan

As a Ilan,
I want me connecter avec un identifiant et un mot de passe,
So that moi seul accède à mes données de business.

**Acceptance Criteria:**

**Given** une session absente ou expirée
**When** j'ouvre l'app
**Then** je suis redirigé vers l'écran de connexion et aucune donnée n'est accessible sans authentification (FR1, NFR2)
**When** je saisis des identifiants valides
**Then** je suis connecté via Supabase Auth et ma session persiste entre les ouvertures
**And** je peux me déconnecter depuis l'onglet Réglages
**And** la convention RLS (`user_id = auth.uid()`) sera appliquée à chaque table de données créée par la suite (AD-4)

## Epic 2: Gérer son stock

Ilan peut ajouter, consulter, modifier, supprimer ses pièces et parcourir son stock.

### Story 2.1: Ajouter une pièce

As a Ilan,
I want ajouter une pièce avec sa photo et ses infos en moins de 15 s,
So that mon stock est enregistré dès l'achat, même en brocante.

**Acceptance Criteria:**

**Given** je suis connecté et sur « Ajouter une pièce » (via le FAB « + »)
**When** je prends une photo, choisis catégorie et couleur (chips, liste fermée), saisis taille, marque (optionnelle) et prix d'achat, puis valide « Ajouter au stock »
**Then** la table `piece` est créée si besoin (avec `user_id`, policies RLS, argent en centimes) et une ligne est insérée via supabase-js (FR2, AD-1, AD-3, AD-4, AD-6)
**And** la photo est envoyée dans un bucket Storage et la pièce stocke son `photo_path` (AD-5)
**And** le prix de vente n'est pas requis et la pièce apparaît immédiatement au statut *en stock*
**And** si la photo échoue/est ignorée, la pièce se crée quand même (photo ajoutable plus tard)

### Story 2.2: Parcourir son stock

As a Ilan,
I want voir toutes mes pièces *en stock* dans une liste,
So that j'ai une vue d'ensemble et j'accède vite à une pièce.

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'ouvre l'onglet Stock
**Then** je vois mes pièces *en stock* en lignes (vignette + méta + tag Statut) triées, avec le FAB « + » accessible (UX-DR4, UX-DR5, UX-DR6)
**And** la tabbar 4 onglets (Accueil/Stock/Stats/Réglages) conserve l'état de chaque onglet
**And** si le stock est vide, un état vide chaleureux invite à ajouter la première pièce (UX-DR8)
**And** un tap sur une ligne ouvre la Fiche pièce

### Story 2.3: Consulter, modifier et supprimer une pièce

As a Ilan,
I want ouvrir la fiche d'une pièce pour la modifier ou la supprimer,
So that je corrige mes infos et nettoie mon stock.

**Acceptance Criteria:**

**Given** une pièce existante
**When** j'ouvre sa fiche
**Then** je vois tous ses champs et je peux en modifier n'importe lequel (dont prix d'achat/vente) via supabase-js (FR3, AD-3)
**And** je peux supprimer la pièce (avec confirmation bienveillante)
**And** toute modification est persistée et reflétée dans la liste

### Story 2.4: Filtrer le stock *(SHOULD)*

As a Ilan,
I want filtrer mes pièces par catégorie, couleur, taille et marque,
So that je retrouve une pièce précise quand mon stock grossit.

**Acceptance Criteria:**

**Given** un stock de plusieurs pièces
**When** j'ouvre les filtres et j'en active plusieurs
**Then** la liste n'affiche que les pièces correspondant à la combinaison de filtres (FR8)
**And** les filtres sont combinables et applicables au Stock et/ou à l'Historique
**And** effacer les filtres restaure la liste complète

## Epic 3: Vendre & connaître sa marge

Ilan peut passer une pièce en vendue et voir sa marge.

### Story 3.1: Passer une pièce en vendue

As a Ilan,
I want basculer une pièce de *en stock* à *vendue* en confirmant son prix de vente,
So that ma vente est enregistrée et alimente mon historique.

**Acceptance Criteria:**

**Given** une pièce *en stock* ouverte sur sa fiche
**When** je bascule le statut vers *vendue*
**Then** l'app exige/confirme un prix de vente et enregistre `statut='vendue'` + `sold_at` (FR4, AD-6)
**And** la pièce quitte le Stock et entre dans l'Historique (conservé durablement, NFR4)
**And** je peux repasser la pièce en *en stock* (réversible) — ce qui efface `sold_at`

### Story 3.2: Voir la marge d'une pièce

As a Ilan,
I want voir la marge (€ et %) de ma pièce se calculer automatiquement,
So that je sais immédiatement combien elle m'a rapporté.

**Acceptance Criteria:**

**Given** une pièce avec un prix d'achat et un prix de vente
**When** j'affiche sa fiche
**Then** la marge € (= prix de vente − prix d'achat) et la marge % (= marge € ÷ prix d'achat) s'affichent en grand, calculées et non stockées (FR5, AD-2)
**When** je modifie le prix d'achat ou de vente
**Then** la marge affichée se recalcule immédiatement

## Epic 4: Piloter (tableau de bord)

Ilan voit sa situation d'un coup d'œil et repère ce qui traîne.

### Story 4.1: Tableau de bord — bénéfices, marge moyenne, argent dormant

As a Ilan,
I want voir sur l'accueil mes bénéfices avec ma marge moyenne pondérée accolée, et mon argent dormant,
So that je connais ma situation en trois secondes.

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'ouvre l'accueil
**Then** je vois une carte héro Bénéfices avec la Marge moyenne **pondérée** (`Σ marge € ÷ Σ prix d'achat`) accolée, puis une carte Argent dormant (`Σ prix d'achat des pièces en stock`) (FR6, AD-2, UX-DR2)
**And** tous les chiffres sont calculés à la lecture (jamais stockés) et se mettent à jour après tout ajout/vente/modif
**And** chaque valeur est accompagnée de son libellé (jamais la couleur seule, UX-DR10)
**And** sans données, des états vides invitent à ajouter une première pièce (UX-DR8)

### Story 4.2: Historique des ventes

As a Ilan,
I want consulter mes pièces vendues dans l'onglet Stats,
So that je garde une trace de mes ventes et de leurs marges.

**Acceptance Criteria:**

**Given** au moins une pièce vendue
**When** j'ouvre l'onglet Stats
**Then** je vois la liste des pièces *vendues* avec leur marge € (FR4)
**And** si aucune vente, un état vide chaleureux s'affiche (« Ta première marge s'affichera ici »)

### Story 4.3: Bénéfices par période *(SHOULD)*

As a Ilan,
I want basculer mes bénéfices entre ce mois, cette année et depuis le début,
So that je mesure ma performance sur la fenêtre qui m'intéresse.

**Acceptance Criteria:**

**Given** des ventes réparties dans le temps
**When** je change de période sur les bénéfices
**Then** le total des bénéfices est recalculé sur la fenêtre choisie, à partir de `sold_at` (FR7)

### Story 4.4: Alerte pièces qui stagnent *(COULD)*

As a Ilan,
I want que l'app mette en évidence les pièces *en stock* depuis plus de 60 jours,
So that je pense à les baisser ou les brader.

**Acceptance Criteria:**

**Given** des pièces *en stock* d'âges variés
**When** je consulte mon stock
**Then** les pièces *en stock* depuis plus de 60 jours (seuil par défaut) sont mises en évidence comme argent dormant à activer (FR9, UX-DR12)
