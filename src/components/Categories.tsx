import { useEffect, useRef } from 'react'

interface Category {
  icon: string
  title: string
  subtitle: string
  delay: string
  image: string
}

const categories: Category[] = [
  {
    icon: 'face',
    title: 'Beauty',
    subtitle: 'Salones, uñas & más',
    delay: '.05s',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800',
  },
  {
    icon: 'fitness_center',
    title: 'Fitness',
    subtitle: 'Gimnasios & Crossfit',
    delay: '.12s',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
  },
  {
    icon: 'spa',
    title: 'Health',
    subtitle: 'Spas & Masajes',
    delay: '.19s',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800',
  },
  {
    icon: 'pets',
    title: 'Pets',
    subtitle: 'Grooming & Vets',
    delay: '.26s',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800',
  },
]

const categoryMap: Record<string, string> = {
  'Beauty': 'Belleza',
  'Fitness': 'Fitness',
  'Health': 'Salud',
  'Pets': 'Mascotas',
}

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
          <a href="/home" className="text-[#2f2f2e] font-headline font-bold flex items-center gap-2 group">
            Ver todas{' '}
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <a
              key={cat.title}
              href={`/home?category=${categoryMap[cat.title]}`}
              className="cat-card group relative aspect-square rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer scroll-reveal"
              style={{ transitionDelay: cat.delay }}
            >
              {/* Imagen de fondo */}
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-primary/70 transition-colors duration-300" />

              {/* Icono arriba */}
              <div className="relative z-10 p-6">
                <span className="material-symbols-outlined text-4xl text-white">
                  {cat.icon}
                </span>
              </div>

              {/* Texto abajo */}
              <div className="relative z-10 p-6">
                <h3 className="font-headline font-bold text-xl text-white">{cat.title}</h3>
                <p className="text-sm text-white/80">{cat.subtitle}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}