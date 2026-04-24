import { useState } from 'react'
import HeaderUser from '../../components/user/HeaderUser'

/* ── Types ── */
interface Category {
  icon: string
  label: string
}

interface Business {
  id: number
  name: string
  image: string
  imageAlt: string
  category: string
  distance: string
  rating: number
  availability: string
  available: boolean
}

/* ── Data ── */
const categories: Category[] = [
  { icon: 'content_cut', label: 'Beauty' },
  { icon: 'medical_services', label: 'Health' },
  { icon: 'fitness_center', label: 'Fitness' },
  { icon: 'pets', label: 'Pets' },
  { icon: 'spa', label: 'Wellness' },
  { icon: 'more_horiz', label: 'More' },
]

const businesses: Business[] = [
  {
    id: 1,
    name: 'The Serene Sanctuary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp1LOOTi8ivMkLiI_svhIzR5CQ4mkK43VkZcn6m-EUPKfanibK_8vkqsftaFOOT7Lb5LCvwHzXs9AXZuB9cfAk-oorrB_D2KR3SiNebXGXphBXvNOzlcKi_wgLUA5hXF1kbOdUWpvX3uquTYXHkOTRig2LPlQgizCeqs_6gU0r33OCvJstvDuafSjDHKBTmfnoRFFRPQdM5tChWiWGhRoOEgwUOUiMBXZ6mDsB3RjjKIL2MzPXEuJqU_Tv5d0ufFq0PNDZv8E-mRZ2',
    imageAlt: 'Modern minimalist spa interior',
    category: 'Wellness & Spa',
    distance: '0.8km away',
    rating: 4.9,
    availability: 'Today at 2:30 PM',
    available: true,
  },
  {
    id: 2,
    name: 'Iron & Soul Gym',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnal5KhG5uW8bgPl3px5lenuneSs7RE65B3kRlHXFHdbpHYwpuXzwkR6TTWSGHw3dr-gNumPOAyZnFrIAw1_T8T_eOTNf-Ci-qX0Ix-FgOeHeZLcbJ_xWVloet50N1DBOGkzNVBNXzRXUFvP5r-fIYP2wHUViz8gmD7tUaJ7MbYtGjrDd9uYN9bHDPt_Ibls0l20wZW73awTnvh9MoUB2U-9Cdzj85jq09kvMhQpRgnnWJMZa24x2cC0UnglMr2JvIoCnHzzc0HMEG',
    imageAlt: 'Sleek modern fitness studio',
    category: 'Fitness & Personal Training',
    distance: '1.2km away',
    rating: 4.7,
    availability: 'Next: Tomorrow 9:00 AM',
    available: false,
  },
  {
    id: 3,
    name: 'Paws & Polish Salon',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh7Nbfg5aBnqlErvhl-MGv8YBZCXgavBp5MSpOPrJism_dEkch8yrIgyfsfpuWNlmX82Dz_d0x_ko63qg73m2Kv4CSypq3s14kUJU4r5RKq1xAD8hrjF1KzmbBMpzKfNbqvOCsJtgUYlv48KDES8ORxabD8ZgT5WQcPegq-XCOiVAi24PEu44h9Y3bSJplcANQzePZEzgL2BN2nTM312laYLN8Eq87gqzblSpw1yYdrIzDXT6Cprrm9cRAWwc3jZOjxeibrWGWBgwF',
    imageAlt: 'Cozy upscale pet grooming salon',
    category: 'Pet Grooming & Spa',
    distance: '2.5km away',
    rating: 4.9,
    availability: 'Today at 5:00 PM',
    available: true,
  },
]

const navItems = [
  { icon: 'search', label: 'Explore', active: true },
  { icon: 'calendar_today', label: 'Bookings', active: false },
  { icon: 'favorite', label: 'Saved', active: false },
  { icon: 'chat_bubble', label: 'Messages', active: false },
  { icon: 'person_outline', label: 'Profile', active: false },
]

/* ── Main Component ── */
export default function Explore() {
  const [activeNav, setActiveNav] = useState(0)
  const [search, setSearch] = useState('')

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body">

      {/* ── Header ── */}
      < HeaderUser />

      <main className="pb-28">

        {/* ── Search & Hero ── */}
        <section className="px-6 pt-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-8 leading-tight">
              Find your next <span className="text-primary">ritual.</span>
            </h2>
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">search</span>
              </div>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for beauty, fitness, wellness..."
                className="w-full bg-[#f3f0ef] border-none rounded-xl py-5 pl-14 pr-32 text-on-surface focus:ring-2 focus:ring-[#ff785133] transition-all placeholder:text-outline/70 outline-none"
              />
              <button className="absolute right-3 top-2 bottom-2 bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-6 rounded-lg font-semibold text-sm active:scale-95 transition-transform">
                Find
              </button>
            </div>
          </div>
        </section>

        {/* ── Category Scroll ── */}
        <section className="px-6 mb-10 overflow-x-auto hide-scrollbar">
          <div className="flex gap-4 min-w-max">
            {categories.map((cat) => (
              <div key={cat.label} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-[#ffffff] shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                </div>
                <span className="text-xs font-semibold font-headline uppercase tracking-wider text-on-surface-variant">
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Map + Listings ── */}
        <section className="px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Map */}
          <div className="lg:col-span-4 h-[300px] lg:h-auto min-h-[400px] relative rounded-xl overflow-hidden shadow-sm bg-[#f3f0ef]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-90"
              style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCcNgxKXxEbEIcT5QyDtnZDmQthMuEvFp2QLPjRyogcLB7EoOwNzqQTq2FCinGudYtlZwJcFmXNz3ot2fME3xYYzaCtixW4uELrpQKiPiAuoF7eItm5_6hdECTUqH_JYome-SKUDWO91TylNlqTqxQ1JagWICcunhMi2IG1UT_YzRZJhLLQuRVu_3P7z4-uwZspQp-iDOV90Rc4yXBG70cz0NNLfoiRuoQuOd2uFRHXvVLgnY5UU0Ec3jxFMl4PQJ90H-v7QIrWZUSz")` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f3f0ef]/40 pointer-events-none" />

            {/* Map pins */}
            <MapPin top="33%" left="25%" color="bg-primary" icon="spa" size="large" />
            <MapPin top="50%" left="66%" color="bg-[#833e9a]" icon="fitness_center" size="small" />
            <MapPin top="75%" left="50%" color="bg-[#a03739]" icon="pets" size="small" />

            {/* Info bar */}
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20">
              <p className="text-xs font-bold text-primary font-headline uppercase mb-1">Nearby businesses</p>
              <p className="text-sm text-on-surface font-medium">8 venues found within 2km</p>
            </div>
          </div>

          {/* Listings */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-headline text-2xl font-bold">Featured Venues</h3>
              <button className="text-primary font-semibold text-sm flex items-center gap-1 hover:opacity-80 transition-opacity">
                View all
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {businesses.map(biz => (
              <BusinessCard key={biz.id} business={biz} />
            ))}
          </div>
        </section>
      </main>

      {/* ── Bottom Nav (mobile) ── */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-white/80 backdrop-blur-xl rounded-t-[3rem] shadow-[0_-4px_40px_rgba(47,47,46,0.06)] md:hidden">
        {navItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setActiveNav(i)}
            className={`flex flex-col items-center justify-center p-2 active:scale-[0.98] transition-all duration-200 ${
              activeNav === i
                ? 'bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white rounded-full p-3 mb-1'
                : 'text-[#2f2f2e] hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] font-semibold font-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

/* ── Sub-components ── */

function MapPin({
  top, left, color, icon, size,
}: {
  top: string
  left: string
  color: string
  icon: string
  size: 'large' | 'small'
}) {
  const sz = size === 'large' ? 'w-10 h-10' : 'w-8 h-8'
  return (
    <div
      className={`absolute ${sz} ${color} rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white`}
      style={{ top, left }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: size === 'large' ? 16 : 13, fontVariationSettings: '"FILL" 1' }}
      >
        {icon}
      </span>
    </div>
  )
}

function BusinessCard({ business }: { business: Business }) {
  return (
    <a
      href="/business-profile"
      className="bg-[#ffffff] rounded-xl p-4 flex flex-col md:flex-row gap-5 hover:shadow-xl transition-all duration-500 group cursor-pointer border border-transparent hover:border-[#ff785133]"
    >
      <div className="w-full md:w-48 h-40 rounded-lg overflow-hidden shrink-0">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          src={business.image}
          alt={business.imageAlt}
        />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-headline text-xl font-bold text-on-surface">{business.name}</h4>
            <div className="flex items-center gap-1 bg-[#f3f0ef] px-2 py-1 rounded-full shrink-0 ml-2">
              <span
                className="material-symbols-outlined text-primary text-sm"
                style={{ fontSize: 14, fontVariationSettings: '"FILL" 1' }}
              >
                star
              </span>
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
            {business.available && (
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                business.available
                  ? 'bg-[#ff785133] text-primary'
                  : 'bg-[#e4e2e1] text-on-surface-variant'
              }`}
            >
              {business.availability}
            </span>
          </div>
          <button className="bg-[#2f2f2e] text-[#f9f6f5] px-5 py-2 rounded-full text-sm font-bold group-hover:bg-primary transition-colors">
            Book Now
          </button>
        </div>
      </div>
    </a>
  )
}