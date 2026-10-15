// Apparence d'un mot selon son statut (écran E8 « Correction » du design) :
//   c  = couleur du texte, bg = surlignage, ds = style du soulignement, dc = couleur du soulignement
export const STYLE_STATUT = {
  bien: { c: '#146C36', bg: '#DDF2E4', ds: 'solid', dc: '#22A35A', libelle: 'Bien lu' },
  presque: { c: '#8A5A00', bg: '#FFEFC2', ds: 'wavy', dc: '#E0A100', libelle: 'Presque' },
  reessayer: { c: '#B23A1E', bg: '#FFE0D8', ds: 'dashed', dc: '#E0573A', libelle: 'À réessayer' },
}

// Style CSS d'un mot (sans statut : texte normal, non souligné).
export function styleMot(statut, decalage = 9) {
  const s = STYLE_STATUT[statut]
  if (!s) return { color: '#23305E' }
  return {
    color: s.c,
    background: s.bg,
    textDecorationLine: 'underline',
    textDecorationStyle: s.ds,
    textDecorationColor: s.dc,
    textDecorationThickness: 3,
    textUnderlineOffset: decalage,
  }
}
