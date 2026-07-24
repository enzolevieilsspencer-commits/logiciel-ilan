---
baseline_commit: c2ef7e3a1372455d97e7a4c7f5c9a31e243810bc
---

# Story 2.2: Parcourir son stock

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Ilan,
I want voir toutes mes pièces *en stock* dans une liste avec leur photo,
so that j'ai une vue d'ensemble et j'accède vite à n'importe quelle pièce.

## Acceptance Criteria

1. **Onglet Stock.** Une tabbar basse à 4 onglets (**Accueil / Stock / Stats / Réglages**) est présente ; l'onglet **Stock** liste les pièces *en stock*. (UX-DR5)
2. **Ligne de pièce.** Chaque pièce s'affiche en ligne : **vignette photo** (via URL **signée**, bucket privé) + méta (catégorie · couleur · taille) + **tag statut** *en stock*. Pièce sans photo → vignette placeholder. (UX-DR6, AD-5)
3. **FAB « + ».** Un bouton flottant « + » (sur Accueil et Stock) ouvre « Ajouter une pièce » ; il **remplace** le bouton d'ajout temporaire de 2.1. (UX-DR4)
4. **État vide.** Stock vide → message chaleureux invitant à ajouter la première pièce (pas une liste vide sèche). (UX-DR8)
5. **Chargement.** Skeleton discret pendant le chargement (pas de spinner plein écran). (UX-DR8)
6. **Tap → fiche (préparé).** Taper une ligne déclenche l'ouverture de la fiche de la pièce ; l'écran de fiche lui-même est la Story 2.3 → ici on câble le handler de sélection (placeholder minimal acceptable). 
7. **Ajout reflété.** Après ajout d'une pièce via le FAB, la liste du Stock se met à jour.
8. **Réglages.** Le bouton « Se déconnecter » (temporaire sur l'accueil en 2.1) migre dans l'onglet **Réglages**. (EXPERIENCE)
9. **Qualité.** `npm run build` + `npm run lint` OK ; aucune régression de l'auth/ajout.

## Tasks / Subtasks

- [x] **Task 1 — Coquille d'app + navigation par onglets** (AC: #1, #8)
  - [x] Décision de routing : **navigation par état** (pas de react-router) — voir Dev Notes pour la justification. Créer `src/app/AppShell.tsx` : état `tab` (`accueil|stock|stats|reglages`) + état overlay `add`. Rend le contenu de l'onglet actif + la `TabBar` + le `Fab`.
  - [x] `src/components/ui/TabBar.tsx` : 4 onglets (icônes + libellés), onglet actif en teal.
  - [x] `src/app/App.tsx` : après la garde d'auth, rendre `<AppShell />` (remplacer l'`AuthenticatedApp` temporaire de 2.1).

- [x] **Task 2 — FAB « + » + intégration ajout** (AC: #3, #7)
  - [x] `src/components/ui/Fab.tsx` : bouton flottant en bas à droite (teal, ombre), visible sur Accueil et Stock.
  - [x] Le FAB ouvre `AddPieceScreen` (en overlay) ; à `onAdded`, fermer + rafraîchir la liste Stock. Supprimer le bouton « ＋ Ajouter » temporaire de l'accueil (2.1).

- [x] **Task 3 — Données du stock + URLs signées** (AC: #2, #5)
  - [x] `src/features/pieces/usePieces.ts` : hook qui récupère les pièces `statut='en_stock'` (tri `created_at` desc), génère les **URLs signées** en batch (`createSignedUrls(paths, 3600)`) pour les `photo_path` non nuls, expose `{ pieces, urls, loading, error, refresh }`.

- [x] **Task 4 — Écran Stock + ligne de pièce** (AC: #2, #4, #5, #6)
  - [x] `src/features/pieces/PieceRow.tsx` : vignette (URL signée ou placeholder) + méta + tag statut ; `onClick` → `onSelect(piece)`.
  - [x] `src/features/pieces/StockScreen.tsx` : utilise `usePieces` ; skeleton au chargement ; **état vide** chaleureux si aucune pièce ; sinon liste de `PieceRow`. Câble `onSelect` (placeholder pour 2.3, ex. `console` ou petit overlay « Fiche à venir »).

- [x] **Task 5 — Onglets Accueil / Stats / Réglages (minimal)** (AC: #1, #8)
  - [x] Accueil : placeholder léger (peut garder un « X pièces en stock ») — le vrai dashboard = Epic 4. Stats : placeholder « Bientôt ». Réglages : bouton **Se déconnecter** (`supabase.auth.signOut()`).

- [x] **Task 6 — Vérifications** (AC: #9)
  - [x] `npm run build` OK, `npm run lint` OK.
  - [x] Test manuel (connecté, ≥1 pièce) : onglet Stock affiche la/les pièce(s) avec photo ; FAB ajoute → liste à jour ; stock vide → état vide ; déconnexion depuis Réglages.

## Dev Notes

### Décision de routing (Task 1) — pas de react-router
Évalué react-router v7 vs navigation par état. **Choix : navigation par état local**, car :
- L'app a **4 onglets + overlays** (ajout, fiche) — pas de besoin de deep-linking/URLs partageables pour une app perso mono-utilisateur.
- L'EXPERIENCE demande que **chaque onglet conserve son état** — plus naturel en gardant une coquille montée qui bascule le contenu, sans le cycle unmount/remount des routes.
- Zéro dépendance de plus, cohérent avec la nav par état déjà amorcée en 2.1 (`App.tsx`).
- Réversible : si le deep-linking devient nécessaire, on introduira react-router à ce moment-là.
> Conserver l'état d'onglet : pour 2.2, un simple re-fetch du Stock à l'affichage est acceptable (peu de données) ; la préservation fine (scroll) est différée.

### Contexte hérité (déjà en place)
- **Story 2.1** : table `piece` + RLS, bucket privé `piece-photos`, `src/features/pieces/{types.ts,storage.ts,addPiece.ts,AddPieceScreen.tsx}`, `src/components/ui/Chips.tsx`. `types.ts` exporte `Piece`, `CATEGORIES`, `COULEURS`, `centsToEuros`.
- **`src/app/App.tsx`** (à modifier) : contient actuellement `AuthenticatedApp` (compteur + bouton ＋ Ajouter + navigation `home|add` + déconnexion). **Cet accueil temporaire est remplacé par `AppShell`** ; réutiliser la logique d'overlay d'ajout et le refresh. Préserver la garde d'auth (`useSession`, loading, LoginScreen).
- Client Supabase : `src/lib/supabase.ts`. Tokens DESIGN dans `src/index.css`. Linter oxlint. Pas de router.

### URLs signées (bucket privé) — Task 3
```ts
// pour une liste : batch
const paths = pieces.map((p) => p.photo_path).filter((x): x is string => !!x)
const { data } = await supabase.storage.from('piece-photos').createSignedUrls(paths, 3600)
// data: [{ path, signedUrl, error }] -> construire une Map path -> signedUrl
```
- Bucket **privé** ⇒ **jamais** `getPublicUrl`. Les URLs signées expirent (1 h) — régénérées à chaque chargement de liste, pas de stockage durable.
- Pièce sans `photo_path` → afficher un placeholder (ex. emoji 👕 sur fond `bg-app`/menthe), pas d'appel signé.

### Récupération des pièces — Task 3
```ts
const { data, error } = await supabase
  .from('piece')
  .select('*')
  .eq('statut', 'en_stock')
  .order('created_at', { ascending: false })
```
(RLS filtre déjà par utilisateur — pas de `.eq('user_id', …)` nécessaire.)

### Composants & UX
- **TabBar** : barre basse fixe, 4 onglets (Accueil 🏠 / Stock 📦 / Stats 📊 / Réglages ⚙️), actif en `text-teal`, inactif en gris ; cibles ≥ 44px ; libellé + icône (pas la couleur seule, a11y UX-DR10).
- **Fab** : rond teal, ombre, bas-droite, au-dessus de la tabbar ; visible Accueil + Stock.
- **PieceRow** : `rounded-[var(--radius-md)]` blanc, vignette `rounded-[var(--radius-sm)]`, méta en `text-muted`, tag statut *en stock* menthe (`bg-app`/teal). Marge € à droite **seulement si vendue** — ici toutes sont *en stock*, donc pas de marge (la vue Historique/vendues = Epic 4).
- **État vide** : « Ton stock est vide — ajoute ta première pièce. » + FAB mis en avant (ton chaleureux, tutoiement).
- **Skeleton** : quelques lignes grises arrondies, pas de spinner plein écran.

### Testing standards
- Pas de framework de test imposé (UI + intégration Supabase). Vérif = build + lint + test manuel (liste, photo signée, ajout reflété, état vide, déconnexion).
- Vitest viendra avec `lib/derive` (Epic 3/4).

### Project Structure Notes
- Nouveaux : `src/app/AppShell.tsx`, `src/components/ui/{TabBar,Fab}.tsx`, `src/features/pieces/{usePieces.ts,PieceRow.tsx,StockScreen.tsx}`.
- Modifié : `src/app/App.tsx` (rend `AppShell` après la garde d'auth ; retirer l'accueil temporaire de 2.1).
- Direction de dépendance `ui → features → lib`. Le `Fab`/`TabBar` sont des composants `ui` génériques (pas de logique métier).
- Tap sur une ligne : câbler `onSelect(piece)` ; la vraie fiche = Story 2.3 (placeholder minimal ici, ne pas la construire).

### References
- [Source: epics.md#Story 2.2] — user story + AC (FR2/FR3 vue, FR8 filtres = story 2.4 séparée).
- [Source: EXPERIENCE.md#Information Architecture / Component Patterns / State Patterns] — tabbar 4 onglets, ligne de pièce, FAB, états vides/chargement, déconnexion dans Réglages.
- [Source: DESIGN.md] — tokens, arrondis, tag statut menthe.
- [Source: ARCHITECTURE-SPINE.md] — AD-1 (lecture via supabase-js), AD-5 (photos Storage, URL signée), paradigme feature-sliced.
- Story précédente : `2-1-ajouter-une-piece.md` (table, bucket, AddPieceScreen, App.tsx à faire évoluer).
- Pattern URLs signées vérifié (recherche 2.1) : `createSignedUrl(s)`, bucket privé, jamais `getPublicUrl`.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (dev agent Amelia)

### Debug Log References

- `npm run build` → OK (precache 467 KiB). `npm run lint` (oxlint) → 0 erreur.
- Vérif lecture stock via API authentifiée : `GET /rest/v1/piece?statut=eq.en_stock&order=created_at.desc` → **HTTP 200** (liste vide actuellement → l'écran affiche l'état vide). Voie de lecture confirmée.

### Completion Notes List

- **Routing** : navigation par état (pas de react-router) — décision documentée en Dev Notes.
- **Coquille** `src/app/AppShell.tsx` : état `tab` (accueil/stock/stats/reglages) + overlays `adding` (FAB → AddPieceScreen) et `selected` (placeholder fiche, vraie fiche = 2.3). `App.tsx` rend `AppShell` après la garde d'auth (accueil temporaire de 2.1 retiré).
- **UI** : `TabBar` (4 onglets, actif teal, safe-area), `Fab` (flottant, visible Accueil+Stock).
- **Stock** : `usePieces` (fetch `statut=en_stock` + URLs signées `createSignedUrls` en batch, bucket privé), `PieceRow` (vignette signée ou placeholder 👕 + méta + tag statut), `StockScreen` (skeleton, état vide chaleureux, liste). Ajout via FAB → `refresh()`.
- **Réglages** : déconnexion déplacée ici (retirée de l'accueil temporaire).
- Photos : jamais `getPublicUrl` (bucket privé) ; URLs signées 1 h régénérées au chargement.
- **⚠️ Test visuel navigateur restant** : afficher une pièce **avec photo** (URL signée → vignette) se confirme en ajoutant une pièce via l'app. Le stock est vide côté DB pour l'instant.
- Pas de tests unitaires (UI + intégration ; Vitest plus tard). Vérif = build + lint + lecture API.

### File List

**Nouveaux**
- `src/app/AppShell.tsx`
- `src/components/ui/TabBar.tsx`
- `src/components/ui/Fab.tsx`
- `src/features/pieces/usePieces.ts`
- `src/features/pieces/PieceRow.tsx`
- `src/features/pieces/StockScreen.tsx`

**Modifiés**
- `src/app/App.tsx` (rend `AppShell` après la garde d'auth ; accueil temporaire de 2.1 remplacé)

## Change Log

- 2026-07-24 — Implémentation Story 2.2 : coquille à onglets (tabbar 4 onglets, FAB), écran Stock (liste des pièces + vignettes via URLs signées, état vide, skeleton), déconnexion dans Réglages, navigation par état (sans react-router). Build + lint OK ; lecture stock vérifiée (200). Statut → review.
