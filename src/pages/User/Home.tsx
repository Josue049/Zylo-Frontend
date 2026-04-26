import { useState } from 'react'
import HeaderUser from '../../components/user/HeaderUser'
import { businesses, type Business } from '../../data/businesses'

const categories: Category[] = [
  { icon: 'content_cut', label: 'Belleza' },
  { icon: 'medical_services', label: 'Salud' },
  { icon: 'fitness_center', label: 'Fitness' },
  { icon: 'pets', label: 'Mascotas' },
  { icon: 'spa', label: 'Bienestar' },
  { icon: 'more_horiz', label: 'Más' },
]

const navItems = [
  { icon: 'search', label: 'Explorar' },
  { icon: 'calendar_today', label: 'Reservas' },
  { icon: 'favorite', label: 'Guardados' },
  { icon: 'chat_bubble', label: 'Mensajes' },
  { icon: 'person_outline', label: 'Perfil' },
]

export default function Explore() {
  const [activeNav, setActiveNav] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const filteredBusinesses = businesses.filter((biz) => {
    const searchText = search.toLowerCase()
    const matchesSearch =
      biz.name.toLowerCase().includes(searchText) ||
      biz.category.toLowerCase().includes(searchText)
    const matchesCategory =
      selectedCategory === '' ||
      biz.category.toLowerCase().includes(selectedCategory.toLowerCase())
    return matchesSearch && matchesCategory
  })

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body">
      <HeaderUser />

      <main className="pb-28">
        {/* Búsqueda & Hero */}
        <section className="px-6 pt-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-8 leading-tight">
              Encuentra tu próximo <span className="text-primary">ritual.</span>
            </h2>

            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">
                  search
                </span>
              </div>

              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Busca belleza, fitness, bienestar..."
                className="w-full bg-[#f3f0ef] border-none rounded-xl py-5 pl-14 pr-32 text-on-surface focus:ring-2 focus:ring-[#ff785133] transition-all placeholder:text-outline/70 outline-none"
              />

              <button className="absolute right-3 top-2 bottom-2 bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-6 rounded-lg font-semibold text-sm active:scale-95 transition-transform">
                Buscar
              </button>
            </div>
          </div>
        </section>

        {/* Categorías */}
        <section className="px-6 mb-10 overflow-x-auto hide-scrollbar">
          <div className="flex justify-center gap-4 w-full min-w-max">
            {categories.map((cat) => (
              <div
                key={cat.label}
                onClick={() => setSelectedCategory(selectedCategory === cat.label ? '' : cat.label)}
                className="flex flex-col items-center justify-center text-center gap-2 group cursor-pointer w-20"
              >
                <div className={`w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center transition-all duration-300 ${
                  selectedCategory === cat.label
                    ? 'bg-primary text-white'
                    : 'bg-[#ffffff] text-primary group-hover:bg-primary group-hover:text-white'
                }`}>
                  <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                </div>
                <span className="text-xs font-semibold font-headline uppercase tracking-wider text-on-surface-variant text-center w-full">
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Catálogo */}
        <section className="px-6">
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-2xl font-bold">Locales Destacados</h3>
              <button
                onClick={() => { setSearch(''); setSelectedCategory('') }}
                className="text-primary font-semibold text-sm flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                Ver todos
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {filteredBusinesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBusinesses.map(biz => (
                  <BusinessCard key={biz.id} business={biz} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center text-on-surface-variant">
                No se encontraron negocios.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Navegación inferior */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-white/80 backdrop-blur-xl rounded-t-[3rem] shadow-[0_-4px_40px_rgba(47,47,46,0.06)] md:hidden">
        {navItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setActiveNav(i)}
            className={`flex flex-col items-center justify-center p-2 active:scale-[0.98] transition-all duration-200 ${
              activeNav === i
                ? "bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white rounded-full p-3 mb-1"
                : "text-[#2f2f2e] hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] font-semibold font-label">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function BusinessCard({ business }: { business: Business }) {
  return (
    <a
      href={`/businessProfile/${business.id}`}
      className="bg-[#ffffff] rounded-xl p-4 flex flex-col gap-5 hover:shadow-xl transition-all duration-500 group cursor-pointer border border-transparent hover:border-[#ff785133]"
    >
      <div className="w-full h-40 rounded-lg overflow-hidden shrink-0">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          src={business.image}
          alt={business.imageAlt}
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-headline text-xl font-bold text-on-surface">
              {business.name}
            </h4>
            <div className="flex items-center gap-1 bg-[#f3f0ef] px-2 py-1 rounded-full shrink-0 ml-2">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontSize: 14, fontVariationSettings: '"FILL" 1' }}>star</span>
              <span className="text-xs font-bold">{business.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-3">
            <span>{business.category}</span>
            <span>•</span>
            <span>{business.distance}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            {business.available && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              business.available ? 'bg-[#ff785133] text-primary' : 'bg-[#e4e2e1] text-on-surface-variant'
            }`}>
              {business.availability}
            </span>
          </div>
          <button className="bg-[#2f2f2e] text-[#f9f6f5] px-5 py-2 rounded-full text-sm font-bold group-hover:bg-primary transition-colors">
            Reservar
          </button>
        </div>
      </div>
    </a>
  );
}