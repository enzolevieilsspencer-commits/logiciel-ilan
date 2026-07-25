import { Home, Package, BarChart3, Settings, type LucideIcon } from 'lucide-react'

export type TabKey = 'accueil' | 'stock' | 'stats' | 'reglages'

export const NAV_ITEMS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'accueil', label: 'Accueil', icon: Home },
  { key: 'stock', label: 'Stock', icon: Package },
  { key: 'stats', label: 'Stats', icon: BarChart3 },
  { key: 'reglages', label: 'Réglages', icon: Settings },
]
