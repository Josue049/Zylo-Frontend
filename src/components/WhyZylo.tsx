import { useEffect, useRef } from 'react'

const testimonials = [
  {
    quote: '"Desde que uso Zylo para mis citas de spa, he descubierto lugares increíbles que no conocía. La facilidad de reservar es otro nivel."',
    name: 'Mariana Torres',
    role: 'Usuario frecuente • CDMX',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDox_xoq-kZMDMy-zWauj8VSonMoi1axN4vzWao0JETFCawqgxPer81gDU_RAWbLmTINly-2nWeknc-ec9wOzFZRAoIfPRifyUxXpC_6wmjImr4gSYhI00-vnK2g_pmLMk5HJvJe9YNg0Ay5qAYOKrm8EfmFWkrRpzpf1wU2y8ZV9LAY5mgExLY9y6nl1h5V8_gGcraIm4uR2We8ROsxzyUEJhJr2CrdSOf_Lw8EWlI6JHttGOoSNfDnqzYGBQl2kktZzahkRIMgin4',
    border: 'border-primary',
    delay: '.1s',
  },
  {
    quote: '"Implementamos Zylo en nuestro gimnasio y el flujo de clientes nuevos aumentó un 25% el primer mes. Esencial para crecer."',
    name: 'Roberto G.',
    role: "Dueño de 'Iron Core' • Bogotá",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKinY54KnQorUBT1qMV1qG2DF92Q2S_Dw4YrOzut40lsYoOQf4ZqbT4CW61O_xkQjHZ7RjX3HYAnSjO8jer1IasFxSM6wkBd23L5bQJmOwITZNzoD8zamBclAM612c-SkmWXsnNQcWkue-exF9jtbN1TK15uLJMVH7AgE6hiiN_6ev-pdpHNTuhrIUs0RJ2i5VmXzLyBu6fQ3npRcTWlSekUDtu20z5Ums5Zfp1Beboie9Yin_F6T-JhxSCExR3RKABKXdrF9hEZ1F',
    border: 'border-[#833e9a]',
    delay: '.2s',
  },
]

export default function WhyZylo() {
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
    <section id="nosotros" className="ConfiarLanding py-24 px-6" ref={sectionRef}>
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-12 items-center">
          {/* Left */}
          <div className="lg:col-span-1 scroll-reveal">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-6">¿Por qué confiar en Zylo?</h2>
            <p className="text-[#5c5b5b] text-lg mb-8 leading-relaxed">
              Somos la comunidad de servicios más grande de la región, construida sobre la base de la confianza y el apoyo local.
            </p>
            <div className="space-y-4">
              {[
                { icon: 'verified_user', label: 'Reseñas 100% verificadas' },
                { icon: 'lock', label: 'Pagos seguros y encriptados' },
              ].map((item) => (
                <div key={item.icon} className="p-4 bg-[#f3f0ef] rounded-lg flex items-center gap-4 hover:bg-primary/8 transition-colors cursor-default">
                  <span className="material-symbols-outlined text-primary">{item.icon}</span>
                  <span className="font-headline font-bold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className={`bg-white p-8 rounded-xl shadow-sm border-l-4 ${t.border} scroll-reveal hover:-translate-y-1 transition-transform duration-300`}
                style={{ transitionDelay: t.delay }}
              >
                <p className="text-[#2f2f2e] italic mb-6">{t.quote}</p>
                <div className="flex items-center gap-4">
                  <img className="w-12 h-12 rounded-full object-cover" src={t.avatar} alt={t.name} />
                  <div>
                    <p className="font-headline font-bold">{t.name}</p>
                    <p className="text-xs text-[#5c5b5b]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
