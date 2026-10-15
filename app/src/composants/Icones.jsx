// Icônes du design (SVG), regroupées ici pour alléger les écrans.

const trait = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' }

// Haut-parleur avec deux ondes (aide, écouter)
export function IconeHautParleur({ taille = 30, epaisseur = 2.4, ondes = 2 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" {...trait} strokeWidth={epaisseur}>
      <path d="M11 5L6 9H3v6h3l5 4V5z" fill="currentColor" />
      <path d="M15.5 8.5a5 5 0 010 7" />
      {ondes > 1 && <path d="M18.5 5.5a9 9 0 010 13" />}
    </svg>
  )
}

// Flèche « retour » (chevron gauche)
export function IconeRetour({ taille = 30 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" {...trait} strokeWidth={2.8}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

// Flèche vers la droite
export function IconeSuivant({ taille = 32 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" {...trait} strokeWidth={2.8}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

// Micro
export function IconeMicro({ taille = 58 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" {...trait} strokeWidth={2.2}>
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path d="M5 11a7 7 0 0014 0M12 18v3" />
    </svg>
  )
}

// Carré « stop »
export function IconeStop({ taille = 44 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24">
      <rect x="5" y="5" width="14" height="14" rx="3" fill="#fff" />
    </svg>
  )
}

// Livre ouvert
export function IconeLivre({ taille = 52 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="#23305E" strokeWidth="2" strokeLinejoin="round">
      <path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5z" />
      <path d="M12 6v14" />
    </svg>
  )
}

// Wi-Fi barré (hors ligne)
export function IconeHorsLigne({ taille = 22 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" {...trait} strokeWidth={2.2}>
      <path d="M2 8.5a15 15 0 0120 0M5.5 12a10 10 0 0113 0M9 15.5a5 5 0 016 0" />
      <path d="M3 3l18 18" />
    </svg>
  )
}

// Flèche circulaire « réessayer »
export function IconeReessayer({ taille = 30 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" {...trait} strokeWidth={2.6}>
      <path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

// Petites formes pleines utilisées comme symboles (étoile, cœur, lune, rond, feuille, triangle)
export const SYMBOLES = [
  'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z',
  'M12 21s-7.5-4.6-9.5-9.2C1.2 8.4 3.4 5 6.8 5c2 0 3.4 1.1 5.2 3 1.8-1.9 3.2-3 5.2-3 3.4 0 5.6 3.4 4.3 6.8C19.5 16.4 12 21 12 21z',
  'M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z',
  'M12 5a7 7 0 110 14 7 7 0 010-14z',
  'M5 19C5 10 10 4 20 4c0 10-6 15-15 15z',
  'M12 3l9 17H3z',
]

// Couleurs vives des avatars / pastilles
export const COULEURS = ['#F2664A', '#E8A317', '#2FA36B', '#3A7BD5', '#8E5BD8', '#E8578E', '#1B9A9A', '#8A5A3B']

// Teintes pastel des illustrations
export const TEINTES = ['#FFD9A8', '#CDE7D8', '#CFE0F7', '#F9D1D1', '#E6DAF5', '#FFE7A3', '#D4EDC9', '#D6EEF2']
