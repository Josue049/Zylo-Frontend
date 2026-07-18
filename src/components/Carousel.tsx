import { useState, useEffect, useRef, useCallback } from 'react'

interface CarouselCard {
  image: string
  alt: string
  title: string
  subtitle: string
}

const cards: CarouselCard[] = [
  {
    image: 'https://www.plazatio.com/static/uploads/images/project/interior-1-jpg-50e4247ec84592.14263845_fixw_545_365.jpg',
    alt: 'Salón de belleza',
    title: 'Corte & Estilo Signature',
    subtitle: 'Desde $45.00 · Disponible hoy',
  },
  {
    image: 'https://static.hoteltreats.com/site/styles/hero/s3/2023-08/foto_spa_8.jpg?h=6aa87918&itok=IsNQFZea',
    alt: 'Spa',
    title: 'Masaje Deep Tissue Premium',
    subtitle: 'Desde $75.00 · 3 turnos libres',
  },
  {
    image: 'https://www.gimnasios.com.pe/im/media/YTo0OntzOjI6ImlkIjtpOjE0NTIyODtzOjE6InciO2k6MzAwO3M6MToiaCI7aTozMDA7czoxOiJ0IjtzOjIzOiJwcm9maWxlLWNhcm91c2VsLXNsaWRlciI7fQ==',
    alt: 'Fitness',
    title: 'CrossFit Iron Core · Sesión',
    subtitle: 'Desde $22.00 · Cupos disponibles',
  },
  {
    image: 'https://campograndeperu.com/wp-content/uploads/2023/12/emprender-pet-shop.jpg',
    alt: 'Pets',
    title: 'Grooming Canino Deluxe',
    subtitle: 'Desde $35.00 · Abierto ahora',
  },
]

function getCardState(i: number, total: number, active: number): string {
  if (i === active) return 'card-active'
  const prev = (active - 1 + total) % total
  if (i === prev) return 'card-prev'
  const next = (active + 1) % total
  if (i === next) return 'card-next'
  return 'card-hidden'
}

export default function Carousel() {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)

  const goTo = useCallback((idx: number) => {
    setCurrent(idx)
  }, [])

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % cards.length)
  }, [])

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(next, 3800)
  }, [next])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    startTimer()
  }, [startTimer])

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startTimer])

  const handleDotClick = (idx: number) => {
    goTo(idx)
    resetTimer()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) {
      if (dx < 0) goTo((current + 1) % cards.length)
      else goTo((current - 1 + cards.length) % cards.length)
      resetTimer()
    }
  }

  return (
    <div className="reveal reveal-3 relative">
      {/* Blob */}
      <div className="hero-blob absolute inset-0 -rotate-3 scale-105 rounded-xl" />

      {/* Float badge: rating */}
      <div className="float-a hidden lg:flex absolute -left-10 top-16 z-10 bg-white rounded-xl shadow-xl px-4 py-3 items-center gap-2.5">
        <div className="w-8 h-8 rounded-full signature-gradient flex items-center justify-center">
          <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>star</span>
        </div>
        <div>
          <p className="text-xs text-[#5c5b5b] font-label">Calificación</p>
          <p className="font-headline font-bold text-sm text-[#2f2f2e]">4.9 ★ promedio</p>
        </div>
      </div>

      {/* Float badge: confirmed */}
      <div className="float-b hidden lg:flex absolute -right-6 bottom-24 z-10 bg-white rounded-xl shadow-xl px-4 py-3 items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-green-600" style={{ fontSize: 16 }}>check_circle</span>
        </div>
        <div>
          <p className="text-xs text-[#5c5b5b] font-label">Confirmado</p>
          <p className="font-headline font-bold text-sm text-[#2f2f2e]">Listo en 30 seg</p>
        </div>
      </div>

      {/* Card stack */}
      <div
        className="card-stack mx-auto max-w-lg"
        ref={stackRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {cards.map((card, i) => (
          <div key={i} className={`carousel-card ${getCardState(i, cards.length, current)}`}>
            <img src={card.image} alt={card.alt} />
            <div className="card-bar">
              <div>
                <p className="font-headline font-bold text-[#2f2f2e] text-sm">{card.title}</p>
                <p className="text-xs text-[#5c5b5b] mt-0.5">{card.subtitle}</p>
              </div>
              <div className="live-dot" />
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-5 relative z-10">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`dot ${i === current ? 'active' : ''}`}
            onClick={() => handleDotClick(i)}
          />
        ))}
      </div>
    </div>
  )
}
