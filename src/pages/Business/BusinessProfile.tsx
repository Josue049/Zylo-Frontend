import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderUser from "../../components/user/HeaderUser";
import { businesses } from "../../data/businesses";
import { getSession, getOrCreateConversation } from "../../data/messages";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FavoriteBusiness {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  address: string;
}

interface StoredBusinessProfile {
  email: string;
  businessName: string;
  category: string;
  about: string;
  gallery: string[];
  logo?: string;
  services: {
    id: string;
    icon: string;
    name: string;
    duration: string;
    price: string;
    bgColor: string;
    textColor: string;
  }[];
  team: {
    id: string;
    name: string;
    role: string;
    roleColor: string;
    avatar: string;
  }[];
  days: {
    name: string;
    enabled: boolean;
    start: string;
    end: string;
  }[];
  updatedAt: string;
}

/** Shape normalizado que usa el render */
interface DisplayBusiness {
  id: string;
  email: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  address: string;
  image: string;
  logo?: string;
  gallery: string[];
  services: {
    id: string;
    icon: string;
    title: string;
    description: string;
    price: string;
    featured: boolean;
  }[];
  team: {
    id: string;
    name: string;
    role: string;
    image: string;
  }[];
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = "zylo_session";
const BUSINESS_KEY = "zylo_business_profiles";

// ─── Storage helpers ──────────────────────────────────────────────────────────

function getFavoritesKey(): string {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    return `zylo_favorites_${s?.email ?? "guest"}`;
  } catch {
    return "zylo_favorites_guest";
  }
}

function getFavorites(): FavoriteBusiness[] {
  try {
    return JSON.parse(localStorage.getItem(getFavoritesKey()) || "[]");
  } catch {
    return [];
  }
}

function saveFavorites(favs: FavoriteBusiness[]) {
  localStorage.setItem(getFavoritesKey(), JSON.stringify(favs));
}

function getAllStoredProfiles(): StoredBusinessProfile[] {
  try {
    return JSON.parse(localStorage.getItem(BUSINESS_KEY) || "[]");
  } catch {
    return [];
  }
}

// ─── Converters ───────────────────────────────────────────────────────────────

function fmtRange(d?: {
  start: string;
  end: string;
  enabled: boolean;
}): string {
  return d?.enabled ? `${d.start} – ${d.end}` : "Cerrado";
}

function storedToDisplay(p: StoredBusinessProfile): DisplayBusiness {
  const weekday = p.days.find(
    (d) =>
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(
        d.name,
      ) && d.enabled,
  );
  const saturday = p.days.find((d) => d.name === "Saturday");
  const sunday = p.days.find((d) => d.name === "Sunday");

  const gallery =
    p.gallery.length >= 4
      ? p.gallery.slice(0, 4)
      : [
          ...p.gallery,
          ...Array(Math.max(0, 4 - p.gallery.length)).fill(p.gallery[0] ?? ""),
        ];

  return {
    id: p.email,
    email: p.email,
    name: p.businessName,
    category: p.category,
    description: p.about,
    rating: 5.0,
    address: "",
    image: p.gallery[0] ?? p.logo ?? "",
    logo: p.logo,
    gallery,
    services: p.services.map((s) => ({
      id: s.id,
      icon: s.icon,
      title: s.name,
      description: s.duration,
      price: s.price,
      featured: false,
    })),
    team: p.team.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      image: m.avatar,
    })),
    hours: {
      weekdays: fmtRange(weekday),
      saturday: fmtRange(saturday),
      sunday: fmtRange(sunday),
    },
  };
}

function staticToDisplay(b: (typeof businesses)[number]): DisplayBusiness {
  return {
    id: String(b.id),
    email: (b as any).email ?? "",
    name: b.name,
    category: b.category,
    description: (b as any).description ?? "",
    rating: b.rating,
    address: (b as any).address ?? "",
    image: b.image,
    logo: (b as any).logo,
    gallery: (b as any).gallery ?? [b.image, b.image, b.image, b.image],
    services: ((b as any).services ?? []).map((s: any) => ({
      id: s.id,
      icon: s.icon,
      title: s.title,
      description: s.description,
      price: s.price,
      featured: s.featured ?? false,
    })),
    team: ((b as any).team ?? []).map((m: any) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      image: m.image,
    })),
    hours: (b as any).hours ?? {
      weekdays: "—",
      saturday: "—",
      sunday: "Cerrado",
    },
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BusinessProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<DisplayBusiness | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    if (!id) return;

    // 1. Buscar en localStorage por email (el id de negocios locales ES el email)
    const stored = getAllStoredProfiles();
    const byEmail = stored.find((p) => p.email === decodeURIComponent(id));
    if (byEmail) {
      const display = storedToDisplay(byEmail);
      setBusiness(display);
      setIsLocal(true);
      setIsFavorite(getFavorites().some((f) => f.id === display.id));
      return;
    }

    // 2. Si no, buscar en el array estático por id numérico
    const numeric = Number(id);
    if (!isNaN(numeric)) {
      const found = businesses.find((b) => b.id === numeric);
      if (found) {
        const display = staticToDisplay(found);
        setBusiness(display);
        setIsLocal(false);
        setIsFavorite(getFavorites().some((f) => f.id === display.id));
        return;
      }
    }

    setBusiness(null);
  }, [id]);

  const handleMessage = () => {
    if (!business) return;
    const session = getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    const conv = getOrCreateConversation(
      session.email,
      session.name,
      undefined,
      business.email || business.id,
      business.name,
      business.category,
      business.image,
    );
    navigate(`/messages?conv=${conv.id}`);
  };

  const toggleFavorite = () => {
    if (!business) return;
    const favs = getFavorites();
    if (isFavorite) {
      saveFavorites(favs.filter((f) => f.id !== business.id));
      setIsFavorite(false);
    } else {
      saveFavorites([
        ...favs,
        {
          id: business.id,
          name: business.name,
          category: business.category,
          rating: business.rating,
          image: business.image,
          address: business.address,
        },
      ]);
      setIsFavorite(true);
    }
  };

  // ── Not found ─────────────────────────────────────────────────────────────

  if (!business) {
    return (
      <div className="bg-[#f9f6f5] min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-5xl text-[#787676]">
          store_off
        </span>
        <p className="text-xl font-bold text-[#2f2f2e]">
          Negocio no encontrado.
        </p>
        <button
          onClick={() => navigate("/home")}
          className="bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-8 py-3 rounded-full font-bold"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] font-['Inter'] min-h-screen pb-32">
      <HeaderUser />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {/* ── Galería Bento ── */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px]">
          <div className="md:col-span-2 md:row-span-2 rounded-xl overflow-hidden relative group">
            {business.gallery[0] ? (
              <img
                src={business.gallery[0]}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Principal"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#ab2d00] to-[#ff7851] flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-7xl">
                  storefront
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="hidden md:block rounded-xl overflow-hidden group"
            >
              {business.gallery[i] ? (
                <img
                  src={business.gallery[i]}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={`Foto ${i + 1}`}
                />
              ) : (
                <div className="w-full h-full bg-[#e4e2e1] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#afadac] text-4xl">
                    image
                  </span>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* ── Info principal ── */}
        <section className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Logo */}
          {business.logo ? (
            <img
              src={business.logo}
              className="w-[120px] h-[120px] rounded-full object-cover ring-4 ring-white shadow-md flex-shrink-0"
              alt="Logo"
            />
          ) : (
            <div className="w-[120px] h-[120px] rounded-full ring-4 ring-white shadow-md bg-gradient-to-br from-[#ab2d00] to-[#ff7851] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-5xl">
                storefront
              </span>
            </div>
          )}

          {/* Nombre y meta */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#ff7851]/20 text-[#ab2d00] font-bold text-xs uppercase tracking-wider">
                {business.category}
              </span>
              {isLocal && (
                <span className="px-3 py-1 rounded-full bg-[#2f2f2e] text-white font-bold text-xs uppercase tracking-wider">
                  Negocio registrado
                </span>
              )}
              <div className="flex items-center text-[#ab2d00]">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="text-sm font-bold ml-1">
                  {business.rating.toFixed(1)} (
                  {Math.floor(business.rating * 25)} Reseñas)
                </span>
              </div>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-4xl md:text-5xl font-extrabold tracking-tight">
              {business.name}
            </h1>
            {business.address && (
              <div className="flex items-center gap-2 text-[#5c5b5b]">
                <span className="material-symbols-outlined text-lg">
                  location_on
                </span>
                <span className="font-medium">{business.address}</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={toggleFavorite}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 border-2 ${
                isFavorite
                  ? "bg-[#ff7851]/10 border-[#ab2d00] text-[#ab2d00]"
                  : "bg-[#dfdcdc] border-transparent text-[#2f2f2e] hover:border-[#ab2d00] hover:text-[#ab2d00]"
              }`}
              title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{
                  fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                favorite
              </span>
            </button>
            <button
              onClick={handleMessage}
              className="bg-[#dfdcdc] text-[#2f2f2e] px-8 py-4 rounded-full font-bold active:scale-95 transition-all"
            >
              Mensaje
            </button>
            <button
              onClick={() =>
                navigate(
                  isLocal
                    ? `/booking/local/${encodeURIComponent(business.email)}`
                    : `/booking/${id}`,
                  {
                    state: {
                      business: {
                        id: Number(business.id) || 0,
                        name: business.name,
                        image: business.image,
                        imageAlt: business.name,
                        category: business.category,
                        distance: business.address || "Lima, Perú",
                        rating: business.rating,
                        availability: "",
                        available: true,
                        // Toma el primer servicio como título/duración/precio; si no hay, defaults
                        bookingTitle:
                          business.services[0]?.title ?? "Servicio general",
                        duration: business.services[0]?.description ?? "60 min",
                        price:
                          parseFloat(
                            (business.services[0]?.price ?? "0").replace(
                              /[^0-9.]/g,
                              "",
                            ),
                          ) || 0,
                      },
                    },
                  },
                )
              }
              className="bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-[#ab2d00]/20 active:scale-95 transition-all"
            >
              Reservar
            </button>
          </div>
        </section>

        {/* ── Contenido principal ── */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Acerca de */}
            <section>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-4">
                Acerca de
              </h2>
              <p className="text-[#5c5b5b] leading-relaxed text-lg">
                {business.description}
              </p>
            </section>

            {/* Servicios */}
            {business.services.length > 0 && (
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold">
                    Nuestros Servicios
                  </h2>
                  <button className="text-[#ab2d00] font-bold text-sm hover:underline">
                    Ver todos
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {business.services.map((service) => (
                    <div
                      key={service.id}
                      className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                        service.featured ? "border-l-4 border-[#ab2d00]" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-[#ff7851]/10 rounded-full flex items-center justify-center text-[#ab2d00]">
                          <span className="material-symbols-outlined">
                            {service.icon}
                          </span>
                        </div>
                        <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-[#ab2d00]">
                          {service.price}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-1 group-hover:text-[#ab2d00] transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-[#5c5b5b] text-sm line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Equipo */}
            {business.team.length > 0 && (
              <section>
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-6">
                  Conoce al Equipo
                </h2>
                <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                  {business.team.map((member) => (
                    <div key={member.id} className="flex-shrink-0 w-32 group">
                      <div className="w-32 h-32 rounded-xl overflow-hidden mb-3 grayscale group-hover:grayscale-0 transition-all duration-300">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#e4e2e1] to-[#afadac] flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-4xl">
                              person
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-bold text-center">
                        {member.name}
                      </p>
                      <p className="text-xs text-[#5c5b5b] text-center">
                        {member.role}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-8">
            <div className="bg-[#f3f0ef] p-8 rounded-xl space-y-6">
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab2d00]">
                    schedule
                  </span>
                  Horario de Atención
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Lun — Vie</span>
                    <span className="font-semibold">
                      {business.hours.weekdays}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sáb</span>
                    <span className="font-semibold">
                      {business.hours.saturday}
                    </span>
                  </li>
                  <li
                    className={`flex justify-between font-medium ${business.hours.sunday === "Cerrado" ? "text-red-600" : ""}`}
                  >
                    <span>Dom</span>
                    <span>{business.hours.sunday}</span>
                  </li>
                </ul>
              </div>

              {business.address && (
                <div className="pt-6 border-t border-[#dfdcdc]">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ab2d00]">
                      location_on
                    </span>
                    Ubicación
                  </h3>
                  <div className="flex items-start gap-3">
                    <span
                      className="material-symbols-outlined text-[#ab2d00] mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      location_on
                    </span>
                    <div>
                      <p className="text-sm text-[#2f2f2e] font-semibold">
                        {business.address}
                      </p>
                      <p className="text-xs text-[#5c5b5b] mt-1">Lima, Perú</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
