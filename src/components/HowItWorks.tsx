import { useEffect, useRef } from 'react'

const steps = [
  { icon: 'search', number: '1', title: 'Buscar', description: 'Explora cientos de establecimientos locales verificados con reseñas reales.', delay: '.05s' },
  { icon: 'event_available', number: '2', title: 'Reservar', description: 'Selecciona el horario que mejor te convenga y reserva al instante sin llamadas.', delay: '.15s' },
  { icon: 'task_alt', number: '3', title: 'Asistir', description: 'Presentate a tu cita, disfruta el servicio y paga de forma segura.', delay: '.25s' },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    sectionRef.current?.querySelectorAll('.scroll-reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section id="como-funciona" className="py-24 px-6 bg-[#f9f6f5]" ref={sectionRef}>
      <div className="max-w-screen-2xl mx-auto text-center">
        <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4 scroll-reveal">
          ¿Cómo funciona Zylo?
        </h2>
        <p className="text-[#5c5b5b] max-w-2xl mx-auto mb-16 text-lg scroll-reveal">
          Encuentra y reserva tu próximo servicio en menos de un minuto.
        </p>
        <div className="HowLanding grid md:grid-cols-3 gap-12 relative">
          {steps.map((step) => (
            <div key={step.title} className="flex flex-col items-center scroll-reveal" style={{ transitionDelay: step.delay }}>
              <div className="w-24 h-24 rounded-full bg-[#ff785133] flex items-center justify-center mb-6 relative hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-4xl text-primary">{step.icon}</span>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white font-headline font-bold flex items-center justify-center text-sm">
                  {step.number}
                </div>
              </div>
              <h3 className="font-headline font-bold text-xl mb-3">{step.title}</h3>
              <p className="text-[#5c5b5b]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
