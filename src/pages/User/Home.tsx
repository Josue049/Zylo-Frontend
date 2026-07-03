import { useEffect, useState } from "react";
import HeaderUser from "../../components/user/HeaderUser";
import { apiFetch } from "../../utils/api";

interface Business {
  id: string;
  owner_user_id: string;
  name: string;
  category_id: string;
  category_name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  featured: boolean;
  availability_status: boolean;
  rating: number;
  reviews_count: number;
  image_url: string;
  team: any[];
  gallery: string[];
  weekly_hours: Record<string, any>;
  services_count: number;
  active_services_count: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  salon: "content_cut",
  spa: "spa",
  barber: "face",
  fitness: "fitness_center",
};

const DEFAULT_ICON = "storefront";

const navItems = [
  { icon: "search", label: "Explorar" },
  { icon: "calendar_today", label: "Reservas" },
  { icon: "favorite", label: "Guardados" },
  { icon: "chat_bubble", label: "Mensajes" },
  { icon: "person_outline", label: "Perfil" },
];

export default function Explore() {
  const [activeNav, setActiveNav] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setSelectedCategory(cat);
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await apiFetch("/businesses/categories");
        setCategories(data.items ?? []);
      } catch {
        console.error("No se pudieron cargar las categorías.");
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadBusinesses() {
      try {
        setLoading(true);
        const data = await apiFetch("/businesses");
        setBusinesses(data.items);
      } catch (err) {
        console.error(err);
        setError("Ocurrió un error al obtener los negocios.");
      } finally {
        setLoading(false);
      }
    }
    loadBusinesses();
  }, []);

  const filteredBusinesses = businesses.filter((biz) => {
    const text = search.toLowerCase();
    const matchesSearch =
      biz.name.toLowerCase().includes(text) ||
      (biz.category_name ?? "").toLowerCase().includes(text);
    const matchesCategory =
      selectedCategory === "" ||
      (biz.category_name ?? "")
        .toLowerCase()
        .includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-surface text-on-surface h-screen flex flex-col font-body overflow-hidden">
      {/* Contenedor Fijo: Header + Buscador + Categorías */}
      <div className="sticky top-0 z-40 bg-surface shrink-0 border-b border-black/[0.03]">
        <HeaderUser />
        
        {/* Hero / Buscador */}
        <section className="px-6 pt-6 pb-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-5 leading-tight">
              Encuentra tu próximo <span className="text-primary">ritual.</span>
            </h2>

            <div className="relative group max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">
                  search
                </span>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Busca belleza, fitness, bienestar..."
                className="w-full bg-[#f3f0ef] border-none rounded-xl py-4 pl-14 pr-32 text-on-surface focus:ring-2 focus:ring-[#ff785133] transition-all placeholder:text-outline/70 outline-none text-sm"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-5 rounded-lg font-semibold text-xs active:scale-95 transition-transform">
                Buscar
              </button>
            </div>
          </div>
        </section>

        {/* Categorías dinámicas */}
        <section className="px-6 pb-4 overflow-x-auto hide-scrollbar">
          <div className="flex justify-center gap-4 w-full min-w-max">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.name ? "" : cat.name,
                  )
                }
                className="flex flex-col items-center justify-center text-center gap-1.5 group cursor-pointer w-20"
              >
                <div
                  className={`w-14 h-14 rounded-xl shadow-sm flex items-center justify-center transition-all duration-300 ${
                    selectedCategory === cat.name
                      ? "bg-primary text-white"
                      : "bg-white text-primary group-hover:bg-primary group-hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {CATEGORY_ICONS[cat.id] ?? DEFAULT_ICON}
                  </span>
                </div>
                <span className="text-[10px] font-bold font-headline uppercase tracking-wider text-on-surface-variant text-center w-full truncate">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Contenedor con Scroll Independiente para el Catálogo */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-28 md:pb-10 max-w-7xl w-full mx-auto">
        <section>
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-xl md:text-2xl font-bold">
                Locales Destacados
              </h3>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("");
                }}
                className="text-primary font-semibold text-sm flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                {/* Ver todos */}
                {/* <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span> */}
              </button>
            </div>

            {loading ? (
              <div className="bg-white rounded-xl p-8 text-center text-sm shadow-sm">
                Cargando negocios...
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 rounded-xl p-8 text-center text-sm">
                {error}
              </div>
            ) : filteredBusinesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center text-sm text-on-surface-variant shadow-sm">
                No se encontraron negocios.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Navegación inferior (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-white/80 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-4px_40px_rgba(47,47,46,0.06)] md:hidden">
        {navItems.map((item, index) => (
          <button
            key={item.label}
            onClick={() => setActiveNav(index)}
            className={`flex flex-col items-center justify-center p-2 active:scale-[0.98] transition-all duration-200 ${
              activeNav === index
                ? "bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white rounded-full p-3 mb-1"
                : "text-[#2f2f2e] hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="text-[9px] font-semibold font-label">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function BusinessCard({ business }: { business: Business }) {
  const image =
    business.image_url && business.image_url.trim() !== ""
      ? business.image_url
      : (business.gallery?.find((item) => item && item.trim() !== "") ??
        "https://placehold.co/600x400?text=Sin+Imagen");

  return (
    <a
      href={`/businessProfile/${business.id}`}
      className="bg-[#ffffff] rounded-xl p-4 flex flex-col gap-5 hover:shadow-xl transition-all duration-500 group cursor-pointer border border-transparent hover:border-[#ff785133]"
    >
      <div className="w-full h-40 rounded-lg overflow-hidden shrink-0">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          src={image}
          alt={business.name}
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/600x400?text=Sin+Imagen";
          }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-headline text-lg sm:text-xl font-bold text-on-surface">
              {business.name}
            </h4>
            <div className="flex items-center gap-1 bg-[#f3f0ef] px-2 py-1 rounded-full shrink-0 ml-2">
              <span
                className="material-symbols-outlined text-primary text-sm"
                style={{ fontSize: 14, fontVariationSettings: '"FILL" 1' }}
              >
                star
              </span>
              <span className="text-xs font-bold">
                {business.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-on-surface-variant text-xs sm:text-sm mb-2">
            <span>{business.category_name}</span>
            {business.city && (
              <>
                <span>•</span>
                <span>{business.city}</span>
              </>
            )}
          </div>

          {business.address && (
            <p className="text-xs sm:text-sm text-on-surface-variant line-clamp-2 mb-3">
              {business.address}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            {business.availability_status && (
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                business.availability_status
                  ? "bg-[#ff785133] text-primary"
                  : "bg-[#e4e2e1] text-on-surface-variant"
              }`}
            >
              {business.availability_status ? "Disponible" : "No disponible"}
            </span>
          </div>
          <button
            className="bg-[#2f2f2e] text-[#f9f6f5] px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold group-hover:bg-primary transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            Reservar
          </button>
        </div>
      </div>
    </a>
  );
}