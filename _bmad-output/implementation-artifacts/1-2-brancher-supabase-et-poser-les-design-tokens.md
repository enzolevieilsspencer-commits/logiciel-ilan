---
baseline_commit: 6bbbf596385486065642c53bcc8d51666705a0fd
---

# Story 1.2: Brancher Supabase et poser les design tokens

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a développeur (Exzodev),
I want un client Supabase unique et typé, alimenté par des variables d'environnement,
so that toute la suite de l'app lit/écrit via une seule source de vérité, en sécurité, sans clé secrète exposée.

## Acceptance Criteria

1. **Client Supabase unique.** `src/lib/supabase.ts` exporte un client `supabase` créé via `createClient(url, publishableKey)`, lisant `import.meta.env.VITE_SUPABASE_URL` et `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`. C'est le **seul** endroit qui instancie le client. (AD-1, AD-3)
2. **Aucune clé secrète côté client.** Seule la clé **publishable** est utilisée ; la clé `service_role`/`secret` n'apparaît nulle part dans le code client. (NFR2, NFR5)
3. **Env typées + exemple.** `.env.example` documente `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` ; `src/vite-env.d.ts` type `import.meta.env` ; `.env.local` (vraies clés) reste ignoré par git.
4. **Garde-fou env manquant.** Si les variables d'env sont absentes, l'app lève une **erreur claire** au démarrage (pas un crash cryptique).
5. **Test de connexion.** Avec un `.env.local` valide, un indicateur de santé (via `supabase.auth.getSession()`, sans aucune table) confirme que Supabase est joignable ; visible et retirable proprement plus tard.
6. **Design tokens : déjà en place (hérité de 1.1).** Vérifier que `src/index.css` contient bien les tokens `@theme` de la marque — **ne pas les refaire**. (UX-DR1 — déjà satisfait)
7. **Qualité.** `npm run build` et `npm run lint` passent ; aucune clé réelle versionnée.

## Tasks / Subtasks

- [x] **Task 1 — Installer le SDK Supabase** (AC: #1)
  - [x] `npm install @supabase/supabase-js` (version courante vérifiée : **2.110.8**, pas de v3).
  - [x] Ne **pas** installer `@supabase/ssr` ni `@supabase/auth-helpers-*` (réservés au SSR/Next — inutiles pour une SPA client).

- [x] **Task 2 — Créer le client unique** (AC: #1, #2, #4)
  - [x] Créer `src/lib/supabase.ts` (voir Dev Notes) : lit les deux `import.meta.env.VITE_*`, garde-fou si absentes, exporte `supabase` via `createClient`.
  - [x] Supprimer `src/lib/.gitkeep` (le dossier a désormais du contenu réel).

- [x] **Task 3 — Variables d'environnement typées** (AC: #2, #3)
  - [x] Créer `.env.example` (voir Dev Notes) — **valeurs factices**, jamais de vraies clés.
  - [x] Créer `src/vite-env.d.ts` avec l'interface `ImportMetaEnv` (voir Dev Notes).
  - [x] Vérifier que `.gitignore` ignore bien `.env.local` (déjà couvert par `.env.*`, avec l'exception `!.env.example`).

- [x] **Task 4 — Test de connexion (santé)** (AC: #5)
  - [x] Ajouter un check de santé minimal : au chargement, appeler `supabase.auth.getSession()` et refléter le résultat (ex. petit indicateur temporaire sur l'accueil : « Supabase : connecté ✓ / hors ligne »), **sans requête de table**.
  - [x] Marquer clairement cet indicateur comme temporaire (sera remplacé par la vraie UI d'auth en Story 1.3).

- [x] **Task 5 — Vérifs & tokens** (AC: #6, #7)
  - [x] Confirmer que `src/index.css` contient toujours les tokens `@theme` (posés en 1.1) ; ne rien refaire.
  - [x] `npm run build` OK, `npm run lint` OK, `git status` ne montre aucune vraie clé.

> ⚠️ **Pré-requis utilisateur (bloquant pour l'AC #5 uniquement) :** créer un **projet Supabase** (région **EU**) et fournir l'**URL du projet** + la **clé publishable** (`sb_publishable_...`), à mettre dans `.env.local`. Sans ces valeurs, le code (client + typage + `.env.example` + garde-fou) est livrable et testable via le garde-fou (#4) ; la connexion « verte » (#5) se vérifie une fois les clés fournies.

## Dev Notes

### Contexte hérité de la Story 1.1 (déjà en place)
- Projet **Vite 8.1.5 + React 19.2.8 + TypeScript** scaffoldé, structure feature-sliced : `src/{app,features/{auth,pieces,dashboard},lib,components/ui}`.
- **Tailwind 4** + tokens `@theme` déjà dans `src/index.css` (teal `#09b1ba`, teal-dark `#007782`, green `#22a45d`, amber `#e8a13a`, app `#f4fbfb`, ink, muted). **UX-DR1 déjà satisfait.**
- Bootstrap dans `src/app/{main,App}.tsx`. Linter = **oxlint** (`npm run lint`).
- `src/lib/` ne contient qu'un `.gitkeep` (à supprimer en Task 2).
- ⚠️ `src/vite-env.d.ts` **n'existe pas** (le template ne l'a pas créé) → à créer en Task 3.

### Versions & décisions (vérifié web 2026-07-24)
- **@supabase/supabase-js 2.110.8** (ligne v2, pas de v3).
- **Clés API Supabase (changement 2026)** : utiliser la **clé publishable** (`sb_publishable_...`, remplace `anon`). Les anciennes clés JWT `anon`/`service_role` fonctionnent encore mais sont en dépréciation (fin 2026). Pour une app neuve → publishable.
- **Sécurité** : la clé publishable est **conçue pour être livrée dans le client** ; le contrôle d'accès réel viendra des policies **RLS** (Epic 2, à la création des tables). La clé `secret`/`service_role` **ne doit JAMAIS** être côté client (elle bypass RLS) — Edge Functions/serveur uniquement.
- **SPA pure** → `@supabase/supabase-js` en direct, **pas** `@supabase/ssr`.
- Defaults navigateur (déjà corrects, inutile de les régler) : `persistSession: true`, `autoRefreshToken: true`, `detectSessionInUrl: true`, `storage: localStorage`.

### `src/lib/supabase.ts` (cible)
```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Config Supabase manquante : renseigne VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY dans .env.local (voir .env.example).",
  )
}

// Client unique de l'app (AD-1, AD-3). Defaults navigateur suffisants.
export const supabase = createClient(supabaseUrl, supabaseKey)
```

### `src/vite-env.d.ts` (à créer)
```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### `.env.example` (valeurs factices, à committer)
```
# Projet Supabase (région EU) — copier vers .env.local et remplir avec les vraies valeurs
VITE_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxx
```

### Test de connexion (santé)
```ts
// pattern — sans table, ne nécessite pas d'être connecté
const { data, error } = await supabase.auth.getSession()
// error == null && data.session == null (déconnecté) => Supabase joignable
```
Intégration suggérée : un petit hook/état dans `src/app/App.tsx` qui affiche l'état de santé sous forme d'indicateur **temporaire** (retiré en 1.3 quand l'écran d'auth arrive). Ne pas surinvestir : c'est un check, pas une feature.

### Testing standards
- Toujours pas de framework de test imposé (pas de logique métier durable ici). Vérification = `build` + `lint` + garde-fou env + indicateur de santé avec un `.env.local` valide.
- Vitest sera introduit avec `lib/derive` (Epic 3/4).

### Project Structure Notes
- Nouveau : `src/lib/supabase.ts`, `src/vite-env.d.ts`, `.env.example`. Modifié : `src/app/App.tsx` (indicateur de santé temporaire), suppression de `src/lib/.gitkeep`.
- `.env.local` ne doit jamais être committé (déjà ignoré). Le CI/build ne dispose pas des clés → le `build` ne doit pas exiger les env (il n'exécute pas le code) ; le garde-fou ne se déclenche qu'au runtime.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2] — user story + AC.
- [Source: ARCHITECTURE-SPINE.md#Invariants & Rules] — AD-1 (source de vérité unique), AD-3 (écritures via supabase-js), AD-4 (RLS à venir).
- [Source: ARCHITECTURE-SPINE.md#Consistency Conventions] — env `VITE_*`, jamais de service-role côté client.
- [Source: PRD#4.1 / NFR2, NFR5] — sécurité, RGPD (région EU).
- Story précédente : `1-1-initialiser-le-projet-pwa-installable.md` (structure, tokens déjà posés, lib/ vide).
- Vérifié web 2026-07-24 : @supabase/supabase-js 2.110.8 ; clés publishable/secret (migration 2026) ; pattern Vite `import.meta.env` + typage.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (dev agent Amelia)

### Debug Log References

- `npm install @supabase/supabase-js` → 2.110.8.
- `npm run build` → OK (precache 400 KiB incluant supabase-js). `npm run lint` (oxlint) → 0 erreur.
- Vérif connexion réelle (clés fournies) : `GET /auth/v1/settings` (avec clé publishable) → **HTTP 200** ✅ (projet vivant + clé valide). `GET /auth/v1/health` sans clé → 401 (attendu). `GET /rest/v1/` (racine schéma) → 401 « Only secret API keys can be used for this endpoint » → **normal** : la racine PostgREST exige la clé secrète ; l'accès aux tables avec la clé publishable + RLS fonctionnera en Epic 2.

### Completion Notes List

- Client Supabase unique dans `src/lib/supabase.ts` (createClient + garde-fou si env manquantes). Défauts navigateur conservés.
- Env typées : `src/vite-env.d.ts` (ImportMetaEnv) ; `.env.example` (valeurs factices, commité) ; `.env.local` (vraies valeurs, **ignoré par git** — vérifié via `git check-ignore`).
- **Clé 2026** : utilisée la clé **publishable** (`sb_publishable_…`), jamais de clé secrète côté client. Contrôle d'accès réel = RLS (Epic 2).
- Indicateur de santé **temporaire** dans `src/app/App.tsx` (via `supabase.auth.getSession()`) — affiche « Supabase : connecté ✓ ». À retirer en Story 1.3 (écran d'auth).
- Design tokens (UX-DR1) : confirmés déjà en place dans `src/index.css` (hérité de 1.1) — non refaits.
- Tous les AC satisfaits. Pas de tests unitaires (pas de logique métier durable — cf. Testing standards) ; vérif par build + lint + garde-fou + test de connexion réel.

### File List

**Nouveaux**
- `src/lib/supabase.ts` (client unique)
- `src/vite-env.d.ts` (typage `import.meta.env`)
- `.env.example` (modèle, valeurs factices)

**Modifiés**
- `src/app/App.tsx` (indicateur de santé temporaire)
- `package.json`, `package-lock.json` (dépendance `@supabase/supabase-js` 2.110.8)

**Supprimés**
- `src/lib/.gitkeep` (le dossier a désormais du contenu réel)

**Non versionné (local uniquement)**
- `.env.local` (vraies clés Supabase — ignoré par git)

## Change Log

- 2026-07-24 — Implémentation Story 1.2 : branchement Supabase (client unique `lib/supabase.ts`, typage `vite-env.d.ts`, `.env.example` + `.env.local`, garde-fou env), clé publishable, indicateur de santé temporaire. Connexion réelle vérifiée (auth settings HTTP 200). Build + lint OK. Statut → review.
