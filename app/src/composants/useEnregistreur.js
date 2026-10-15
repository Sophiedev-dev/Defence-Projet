import { useEffect, useRef, useState } from 'react'

// Enregistrement au micro, partagé par l'écran Activité et la fenêtre « Mot ».
//   demarrer()  → ouvre le micro (lève une erreur s'il est indisponible)
//   arreter()   → renvoie une promesse avec l'enregistrement (Blob)
//   annuler()   → coupe le micro et jette l'enregistrement
export function useEnregistreur() {
  const [actif, setActif] = useState(false)
  const [secondes, setSecondes] = useState(0)
  const enregistreur = useRef(null)
  const minuteur = useRef(null)

  // Coupe le micro (et le voyant du navigateur).
  function couper() {
    clearInterval(minuteur.current)
    const rec = enregistreur.current
    enregistreur.current = null
    if (rec && rec.state !== 'inactive') rec.stop()
    rec?.stream.getTracks().forEach((piste) => piste.stop())
    setActif(false)
  }

  async function demarrer() {
    couper()
    const flux = await navigator.mediaDevices.getUserMedia({ audio: true })
    const rec = new MediaRecorder(flux)
    rec.morceaux = []
    rec.ondataavailable = (e) => rec.morceaux.push(e.data)
    rec.start()
    enregistreur.current = rec
    setSecondes(0)
    setActif(true)
    minuteur.current = setInterval(() => setSecondes((s) => s + 1), 1000)
  }

  function arreter() {
    const rec = enregistreur.current
    if (!rec) return Promise.resolve(null)
    return new Promise((resoudre) => {
      rec.onstop = () => resoudre(new Blob(rec.morceaux, { type: rec.mimeType }))
      couper()
    })
  }

  function annuler() {
    if (enregistreur.current) enregistreur.current.onstop = null
    couper()
  }

  // Micro coupé si l'écran se ferme pendant un enregistrement.
  useEffect(() => () => annuler(), [])

  return { actif, secondes, demarrer, arreter, annuler }
}
