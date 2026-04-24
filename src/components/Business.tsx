import { useEffect, useRef } from 'react'

export default function Business() {
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
    <section id="para-empresas" className="BusinessLanding py-24 px-6 overflow-hidden" ref={sectionRef}>
      <div className="max-w-screen-2xl mx-auto bg-[#2f2f2e] text-white rounded-xl overflow-hidden flex flex-col lg:flex-row scroll-reveal">
        <div className="p-12 lg:p-20 lg:w-1/2 flex flex-col justify-center">
          <span className="text-[#ff7851] font-bold tracking-widest text-xs uppercase font-label mb-4">Negocios</span>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Impulsa tu negocio local con Zylo
          </h2>
          <div className="space-y-6 mb-10">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[#ff7851]">trending_up</span>
              <div>
                <p className="font-headline font-bold text-lg">Aumenta tus ingresos</p>
                <p className="text-[#fff] text-sm">Llega a miles de nuevos clientes que buscan servicios cerca de ti.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[#ff7851]">calendar_month</span>
              <div>
                <p className="font-headline font-bold text-lg">Gestión inteligente</p>
                <p className="text-[#fff] text-sm">Agenda digital automatizada que reduce las ausencias en un 40%.</p>
              </div>
            </div>
          </div>
          <button className="btn-primary bg-primary text-white px-10 py-4 rounded-full font-headline font-bold text-lg hover:scale-[0.98] active:scale-95 transition-all w-fit">
            Registrar mi negocio
          </button>
        </div>
        <div className="lg:w-1/2 relative h-[400px] lg:h-auto">
          <img
            className="w-full h-full object-cover grayscale opacity-60"
            src="https://peruretail.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/1-Slider-scaled-1.jpg"
            alt="Business"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2f2f2e] via-transparent to-transparent" />
        </div>
      </div>
    </section>
  )
}
