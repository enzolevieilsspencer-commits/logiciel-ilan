---
baseline_commit: 1c882d01bbf7e28ed8f50f05c23b4b164312d06d
---

# Story 1.1: Initialiser le projet PWA installable

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a développeur (Exzodev),
I want un projet Vite 8 + React 19 + TypeScript + Tailwind 4 + vite-plugin-pwa qui démarre et s'installe,
so that j'ai un socle installable, propre et prêt à recevoir les fonctionnalités de l'app d'Ilan.

## Acceptance Criteria

1. **Le projet démarre et build.** `npm run dev` sert l'app en local et `npm run build` compile sans erreur TypeScript ni build.
2. **PWA installable.** Un manifeste PWA + les icônes (192, 512, maskable) sont présents ; l'app est installable sur l'écran d'accueil (mobile) et sur Mac, et se lance en plein écran (`display: standalone`). (UX-DR11, NFR1)
3. **Tailwind 4 configuré avec les tokens de marque.** Tailwind 4 fonctionne via `@tailwindcss/vite` (aucun `tailwind.config.js`) ; les tokens de couleur « Vinted-friendly » sont définis en CSS-first (`@theme`) et utilisables comme utilitaires. Une page d'accueil vide s'affiche plein écran avec le fond de l'app. (UX-DR1)
4. **Structure feature-sliced en place.** L'arborescence `src/{app,features/{auth,pieces,dashboard},lib,components/ui}` existe ; le bootstrap (main/App) vit dans `src/app`. La direction de dépendance `ui → features → lib` est respectée (rien ne remonte). (AD paradigme)
5. **Coexiste avec le repo existant.** Le scaffold s'installe dans la racine du projet sans écraser le repo git, `.gitignore`, `_bmad/`, `_bmad-output/` ; le `.gitignore` généré est fusionné avec l'existant.

## Tasks / Subtasks

- [x] **Task 1 — Scaffolder Vite + React + TS dans la racine existante** (AC: #1, #5)
  - [x] Depuis la racine du projet, lancer `npm create vite@latest . -- --template react-ts` et choisir **« Ignore files and continue »** (conserve git, `.gitignore`, `_bmad*`).
  - [x] Vérifier que `package.json` cible React 19 + `@vitejs/plugin-react@6` ; `npm install`.
  - [x] Fusionner le `.gitignore` généré par Vite dans le `.gitignore` existant (ne pas écraser — `node_modules`, `dist`, `.env*` sont déjà couverts).
  - [x] `npm run dev` démarre ; `npm run build` passe.

- [x] **Task 2 — Installer et câbler Tailwind 4** (AC: #3)
  - [x] `npm install tailwindcss @tailwindcss/vite`
  - [x] Ajouter le plugin `tailwindcss()` dans `vite.config.ts` (ordre : `react()`, `tailwindcss()`, puis PWA en Task 3).
  - [x] `src/index.css` = `@import "tailwindcss";` + bloc `@theme` avec les tokens (voir Dev Notes). Importer `index.css` une fois dans `src/app/main.tsx`.
  - [x] **NE PAS** créer `tailwind.config.js` ni `postcss.config.js` (pipeline Tailwind 4).

- [x] **Task 3 — Ajouter vite-plugin-pwa + icônes** (AC: #2)
  - [x] `npm install -D vite-plugin-pwa`
  - [x] Ajouter `VitePWA({...})` dans `vite.config.ts` (config manifeste complète — voir Dev Notes), `registerType: 'autoUpdate'`, `devOptions.enabled: true`.
  - [x] Créer une icône source SVG simple (aux couleurs de la marque) puis générer les PNG avec `npx @vite-pwa/assets-generator` → placer `pwa-192x192.png`, `pwa-512x512.png` (+ maskable) dans `public/`.
  - [x] Vérifier l'installabilité : en `npm run dev` (localhost) ou `npm run preview`, le prompt d'installation apparaît (DevTools → Application → Manifest sans erreur).

- [x] **Task 4 — Mettre en place la structure feature-sliced** (AC: #4)
  - [x] Créer `src/app/` (déplacer `main.tsx` + `App.tsx` ici, ajuster les imports et le point d'entrée `index.html`).
  - [x] Créer les dossiers vides avec `.gitkeep` : `src/features/{auth,pieces,dashboard}/`, `src/lib/`, `src/components/ui/`.
  - [x] `App.tsx` = une page d'accueil vide plein écran (`min-h-screen bg-app`) affichant un titre neutre (ex. « Ilan · Stock & Marge »).
  - [x] Nettoyer le boilerplate Vite (logos, CSS de démo, compteur).

- [x] **Task 5 — Vérification finale** (AC: #1, #2, #3)
  - [x] `npm run build` OK ; `npm run preview` sert la PWA installable ; le fond `bg-app` et un utilitaire de couleur de marque (ex. `text-teal-dark`) rendent correctement.

## Dev Notes

### Stack (versions vérifiées le 2026-07-24 — épingler)
- **Node 20+** requis. **Vite 8.1.5** (bundler Rolldown/Oxc par défaut, aucun flag). **create-vite 9.1.1**. **React 19** + **@vitejs/plugin-react 6.0.4** (template `react-ts`). **tailwindcss 4.3.3** + **@tailwindcss/vite 4.3.3**. **vite-plugin-pwa 1.3.0**.
- React 19 : utiliser `createRoot` (les tutos React 18 `ReactDOM.render` sont périmés).

### `vite.config.ts` cible (Tailwind + PWA combinés)
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Ilan · Stock & Marge',
        short_name: 'Stock&Marge',
        description: 'Gère ton stock Vinted et ta marge en un coup d’œil.',
        theme_color: '#09B1BA',
        background_color: '#F4FBFB',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
})
```

### `src/index.css` (Tailwind 4 CSS-first + tokens de marque)
Tokens issus de `DESIGN.md` (direction « Vinted-friendly »). Le namespace `--color-*` génère les utilitaires (`bg-app`, `text-teal-dark`, `bg-teal`, `text-green`, `bg-amber`).
```css
@import "tailwindcss";

@theme {
  --color-teal: #09B1BA;
  --color-teal-dark: #007782;
  --color-green: #22A45D;   /* marge / positif */
  --color-amber: #E8A13A;   /* argent dormant */
  --color-app: #F4FBFB;     /* fond de l'app */
  --color-ink: #1E2A2B;
  --color-muted: #6B7B7C;
}
```
> Échelle d'arrondis prévue (à introduire quand les composants arrivent) : sm 14 / md 18 / card 22 px. Pas besoin en 1.1.

### Structure cible (feature-sliced — AD paradigme)
```text
src/
  app/            # main.tsx, App.tsx, bootstrap (createRoot), import index.css
  features/
    auth/         # (vide — Story 1.3)
    pieces/       # (vide — Epic 2)
    dashboard/    # (vide — Epic 4)
  lib/            # (vide — supabase.ts en Story 1.2)
  components/ui/  # (vide — composants visuels à venir)
  index.css
```
Règle : `ui → features → lib → Supabase`. Rien ne dépend en sens inverse. Ne pas introduire Supabase/auth ici (Stories 1.2 / 1.3).

### Gotchas (2026)
- **Tailwind 4** : pas de `tailwind.config.js` ni `postcss.config.js` — les créer casserait le pipeline. `@import "tailwindcss"` remplace le triptyque `@tailwind base/components/utilities`. Tokens en `@theme` (CSS), pas en JS.
- **Ordre des plugins** : `react()`, `tailwindcss()`, `VitePWA()`.
- **Installabilité PWA** : nécessite la paire d'icônes 192 **et** 512 (+ maskable) réelles dans `public/`, HTTPS ou localhost, et un `start_url` atteignable. Icônes manquantes = pas de prompt d'installation. Workbox (stratégie `generateSW` par défaut) précache le CSS Tailwind → offline gratuit sur l'app-shell.
- **Rolldown (Vite 8)** : `@tailwindcss/vite` et `vite-plugin-pwa` sont compatibles. Échappatoire si un plugin legacy pose souci : re-scaffolder avec `--no-rolldown`.
- **Scaffold dans un dossier non vide** : choisir « Ignore files and continue » pour préserver `git`, `_bmad/`, `_bmad-output/`, `.gitignore`.

### Testing standards
- Pas de framework de test imposé à ce stade (aucune logique métier en 1.1). Vérification = manuelle : `dev`, `build`, `preview`, manifeste sans erreur en DevTools, installabilité, rendu des tokens.
- (Vitest pourra être ajouté quand la logique dérivée `lib/derive` arrivera — Epic 3/4.)

### Project Structure Notes
- Projet **greenfield** scaffolder **dans la racine existante** (`/Users/exzodev/dev/logiciel-ilan`), qui contient déjà le repo git, `.gitignore`, `_bmad/`, `_bmad-output/`. Ne rien écraser.
- `.env` déjà ignoré par le `.gitignore` existant (les clés Supabase viendront en Story 1.2).

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1] — user story + AC + FR/AD/UX-DR.
- [Source: _bmad-output/planning-artifacts/architecture/architecture-logiciel-ilan-2026-07-24/ARCHITECTURE-SPINE.md#Design Paradigm] — feature-sliced, direction de dépendance.
- [Source: …/ARCHITECTURE-SPINE.md#Stack] — versions épinglées Vite/React/TS/Tailwind/vite-plugin-pwa.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-logiciel-ilan-2026-07-24/DESIGN.md] — palette et tokens de marque.
- [Source: …/EXPERIENCE.md#Responsive & Platform] — PWA installable mobile + Mac, plein écran.
- Versions & config vérifiées web (2026-07-24) : create-vite 9.1.1, vite 8.1.5, @vitejs/plugin-react 6.0.4, tailwindcss 4.3.3, @tailwindcss/vite 4.3.3, vite-plugin-pwa 1.3.0.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (dev agent Amelia)

### Debug Log References

- `npm run build` → OK (tsc -b + vite build), PWA `generateSW`, precache 8 entrées.
- `npm run lint` (oxlint) → 0 erreur.
- Smoke test `npm run preview` (localhost:4173) : index (title + theme-color + manifest + registerSW), `manifest.webmanifest`, `sw.js` → 200, `pwa-512x512.png` → 200.

### Completion Notes List

- Scaffold **dans la racine existante** via dossier temporaire (create-vite ne permet pas le « ignore & continue » en non-interactif) : projet généré dans `_scaffold_tmp`, fichiers déplacés à la racine, `.gitignore` existant conservé. Package renommé `logiciel-ilan`.
- Versions installées conformes : Vite 8.1.5, React 19.2.8, TypeScript 6, @vitejs/plugin-react 6.0.4, tailwindcss + @tailwindcss/vite 4.3.3, vite-plugin-pwa 1.3.0. Linter = **oxlint** (fourni par le template).
- Tailwind 4 en CSS-first (`@import "tailwindcss"` + `@theme` tokens), **aucun** `tailwind.config.js`/`postcss.config.js`.
- Structure feature-sliced en place (`src/app` pour le bootstrap ; `features/{auth,pieces,dashboard}`, `lib`, `components/ui` avec `.gitkeep`). Boilerplate Vite supprimé.
- **Logo** : l'utilisateur a fourni son propre logo (déposé dans `public/`). Icônes PWA (192/512/maskable + apple-touch + favicon) générées via `@vite-pwa/assets-generator` (preset minimal-2023). Sur demande, les **coins blancs** du logo source ont été supprimés en le recomposant sur un fond teal plein (`#055966`) → icône full-bleed. Source conservée dans `brand/` (hors `public/` pour ne pas déployer 1 Mo).
- **Dépendance ajoutée hors spec initiale** : `sharp` (devDependency) pour la retouche d'icône demandée par l'utilisateur (outillage image, dev-only).
- Tous les AC satisfaits (1→5). Pas de tests unitaires à ce stade (aucune logique métier — cf. Testing standards de la story) ; vérification par build + lint + smoke test.

### File List

**Nouveaux (scaffold + config)**
- `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `.oxlintrc.json`, `README.md`

**Sources**
- `src/index.css` (Tailwind 4 + tokens `@theme`)
- `src/app/main.tsx`, `src/app/App.tsx`
- `src/features/auth/.gitkeep`, `src/features/pieces/.gitkeep`, `src/features/dashboard/.gitkeep`
- `src/lib/.gitkeep`, `src/components/ui/.gitkeep`

**Assets / logo**
- `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/pwa-64x64.png`
- `public/maskable-icon-512x512.png`, `public/apple-touch-icon-180x180.png`, `public/favicon.ico`
- `brand/logo.png` (source fournie), `brand/logo-fullbleed.png` (recomposée sans coins blancs)

**Conservés**
- `.gitignore` (existant, non écrasé)

## Change Log

- 2026-07-24 — Implémentation Story 1.1 : scaffold Vite 8 + React 19 + TS + Tailwind 4 + vite-plugin-pwa dans la racine existante, structure feature-sliced, PWA installable avec icônes du logo fourni (coins blancs retirés). Build + lint + smoke test OK. Statut → review.
