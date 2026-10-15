import { useEffect, useState } from 'react'

// La maquette est dessinée pour une tablette paysage 1280×800.
// Ce cadre calcule un zoom pour qu'elle remplisse l'écran sans se déformer.
export default function Cadre({ children }) {
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const ajuster = () => setZoom(Math.min(window.innerWidth / 1280, window.innerHeight / 800))
    ajuster()
    window.addEventListener('resize', ajuster)
    return () => window.removeEventListener('resize', ajuster)
  }, [])

  return (
    <div className="cadre-ext">
      <div className="cadre" style={{ zoom }}>
        {children}
      </div>
    </div>
  )
}
