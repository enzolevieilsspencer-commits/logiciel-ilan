/**
 * Écran affiché quand la configuration Supabase est absente
 * (variables d'environnement manquantes au moment du build).
 * Évite la page blanche et explique quoi faire.
 */
export function ConfigErrorScreen() {
  return (
    <main className="min-h-screen bg-app flex items-center justify-center p-6">
      <div className="bg-surface w-full max-w-md rounded-[22px] p-6 shadow-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber/15 text-2xl">
          ⚠️
        </div>
        <h1 className="text-ink text-lg font-semibold">Configuration manquante</h1>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          L'application ne peut pas se connecter à sa base de données. Les variables d'environnement
          Supabase ne sont pas définies dans l'environnement de déploiement.
        </p>
        <div className="bg-app mt-4 rounded-[14px] p-3 text-left">
          <p className="text-muted text-xs font-medium">À définir puis redéployer :</p>
          <ul className="text-ink mt-1 space-y-1 font-mono text-xs">
            <li>VITE_SUPABASE_URL</li>
            <li>VITE_SUPABASE_PUBLISHABLE_KEY</li>
          </ul>
        </div>
        <p className="text-muted mt-3 text-xs">
          Ces valeurs doivent être présentes au <strong>build</strong> (elles sont intégrées au code
          compilé), puis relancer un déploiement complet.
        </p>
      </div>
    </main>
  )
}
