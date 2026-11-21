import { useEffect, useState } from 'react'

const slides = [
  { src: '/images/banner-victorias-secret.jpg', title: 'Novos perfumes da Victoria’s Secret disponíveis' },
  { src: '/images/banner-novidades-futuras.jpg', title: 'Novidades futuras aparecerão aqui' },
]

export default function CampaignCarousel() {
  const [current, setCurrent] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(motion.matches)
    updatePreference()
    motion.addEventListener('change', updatePreference)
    return () => motion.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    const timer = window.setInterval(() => setCurrent(index => (index + 1) % slides.length), 7000)
    return () => window.clearInterval(timer)
  }, [reducedMotion])

  return <header id="campanha" className="campaign-hero" aria-label="Novidades da loja" aria-roledescription="carrossel">
    <div className="campaign-slides" aria-live={reducedMotion ? 'polite' : 'off'}>
      {slides.map(({ src, title }, index) => <div key={src} className="campaign-slide" aria-hidden={index !== current}>
        <img src={src} alt="" width="1536" height="1024" fetchPriority={index === 0 ? 'high' : 'low'}/>
        <h1>{title}</h1>
      </div>)}
    </div>
    <div className="campaign-controls" role="group" aria-label="Controles dos anúncios">
      {slides.map(({ title }, index) => <button key={title} type="button" aria-label={title} aria-pressed={current === index}
        onClick={() => setCurrent(index)}><span aria-hidden="true"/></button>)}
    </div>
  </header>
}
