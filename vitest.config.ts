import { defineConfig } from 'vitest/config'

// Config de test séparée : n'importe PAS les plugins de vite.config.ts
// (PWA / tailwind / react) pour des tests de fonctions pures rapides.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
