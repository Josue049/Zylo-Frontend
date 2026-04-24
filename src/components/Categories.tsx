import { useEffect, useRef } from 'react'

interface Category {
  icon: string
  title: string
  subtitle: string
  delay: string
}

const categories: Category[] = [
  { icon: 'face', title: 'Beauty', subtitle: 'Salones, uñas & más', delay: '.05s' },
  { icon: 'fitness_center', title: 'Fitness', subtitle: 'Gimnasios & Crossfit', delay: '.12s' },
  { icon: 'spa', title: 'Health', subtitle: 'Spas & Masajes', delay: '.19s' },
  { icon: 'pets', title: 'Pets', subtitle: 'Grooming & Vets', delay: '.26s' },
]

export default function Categories() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    const els = sectionRef.current?.querySelectorAll('.scroll-reveal')
    els?.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section id="categorias" className="py-24 px-6 bg-[#f3f0ef]" ref={sectionRef}>
      <div className="CategoriesLanding">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 scroll-reveal">
          <div>
            <span className="text-primary font-bold tracking-widest text-xs uppercase font-label">Explorar</span>
            <h2 className="font-headline text-4xl font-extrabold tracking-tight mt-2">Categorías Populares</h2>
          </div>
          <button className="text-[#2f2f2e] font-headline font-bold flex items-center gap-2 group">
            Ver todas{' '}
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="cat-card group relative aspect-square bg-[#ffffff] rounded-xl p-8 flex flex-col justify-between hover:bg-primary transition-colors duration-300 cursor-pointer overflow-hidden scroll-reveal"
              style={{ transitionDelay: cat.delay }}
            >
              <span className="material-symbols-outlined text-4xl text-primary group-hover:text-white transition-colors">
                {cat.icon}
              </span>
              <div>
                <h3 className="font-headline font-bold text-xl group-hover:text-white transition-colors">{cat.title}</h3>
                <p className="text-sm text-[#5c5b5b] group-hover:text-white/80 transition-colors">{cat.subtitle}</p>
              </div>
              {/* ghost icon */}
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[#2f2f2e] group-hover:text-white" style={{ fontSize: 96 }}>
                  {cat.icon}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
