import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderUser from "../../components/user/HeaderUser";
import { getSession, getOrCreateConversation } from "../../data/messages";

const API_BASE = "https://backend-zylo.vercel.app";

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
  weekly_hours: Record<string, string[]>;
  created_at: string;
  updated_at: string;
}

interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  active: boolean;
  professionals?: { id: string }[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: string;
}

function getToken() {
  const session = localStorage.getItem("zylo_session");

  if (!session) return null;

  try {
    return JSON.parse(session).token;
  } catch {
    return null;
  }
}

async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export default function BusinessProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  const [loading, setLoading] = useState(true);

  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  // =========================
  // LOAD BUSINESS
  // =========================
  useEffect(() => {
    async function loadBusiness() {
      try {
        setLoading(true);

        const [
          businessResponse,
          servicesResponse,
          galleryResponse,
          teamResponse,
        ] = await Promise.all([
          fetch(`${API_BASE}/businesses/${id}`),
          fetch(`${API_BASE}/businesses/${id}/services`),
          fetch(`${API_BASE}/businesses/${id}/gallery`),
          fetch(`${API_BASE}/businesses/${id}/team`),
        ]);

        if (!businessResponse.ok) throw new Error("Business not found");

        const businessData = await businessResponse.json();
        const servicesData = await servicesResponse.json();
        const galleryData = await galleryResponse.json();
        const teamData = await teamResponse.json();

        setBusiness(businessData.business);
        setServices(servicesData.items ?? []);
        setGallery(galleryData.items ?? []);
        setTeam(teamData.items ?? []);
      } catch (err) {
        console.error(err);
        setBusiness(null);
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, [id]);

  // =========================
  // FAVORITES
  // =========================
  useEffect(() => {
    if (!business?.id) return;

    const businessId = String(business.id);

    async function loadFavorite() {
      const token = getToken();
      if (!token) return;

      try {
        setLoadingFavorite(true);

        const response = await authFetch(`${API_BASE}/users/me/favorites`);
        if (!response.ok) return;

        const data = await response.json();
        const favorites = Array.isArray(data.items) ? data.items : [];

        setIsFavorite(
          favorites.some((fav: any) => String(fav.id) === businessId),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFavorite(false);
      }
    }

    loadFavorite();
  }, [business]);

  // =========================
  // TOGGLE FAVORITE
  // =========================
  async function toggleFavorite() {
    if (!business) return;

    const nextState = !isFavorite;
    setIsFavorite(nextState);

    try {
      const res = await authFetch(`${API_BASE}/users/me/favorites/${business.id}`, {
        method: nextState ? "POST" : "DELETE",
      });
      if (!res.ok) {
        throw new Error("No se pudo actualizar favoritos");
      }
    } catch (err) {
      console.error(err);
      setIsFavorite(!nextState);
    }
  }

  const handleMessage = () => {
    if (!business) return;

    const session = getSession();

    if (!session) {
      navigate("/login");
      return;
    }

    const conversation = getOrCreateConversation(
      session.email,
      session.name,
      undefined,
      business.email,
      business.name,
      business.category_name,
      business.image_url,
    );

    navigate(`/messages?conv=${conversation.id}`);
  };

  const handleBooking = () => {
    if (!business) return;

    if (!getToken()) {
      navigate("/login");
      return;
    }

    if (services.length === 0) {
      return;
    }

    // Pass the full business, services and team so Booking can let the
    // user choose service -> professional -> time without refetching
    // (and without relying on hardcoded fallback data).
    navigate(`/booking/${business.id}`, {
      state: {
        business,
        services,
        team,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando negocio...
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Negocio no encontrado.
      </div>
    );
  }

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] font-['Inter'] min-h-screen pb-32">
      <HeaderUser />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {/* Galería */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px]">
          <div className="md:col-span-2 md:row-span-2 rounded-xl overflow-hidden relative group">
            <img
              src={gallery[0] || business.image_url}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt={business.name}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>

          <div className="hidden md:block md:col-span-2 rounded-xl overflow-hidden group">
            <img
              src={gallery[1] || business.image_url}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt={business.name}
            />
          </div>

          <div className="hidden md:block rounded-xl overflow-hidden group">
            <img
              src={gallery[2] || business.image_url}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt={business.name}
            />
          </div>

          <div className="hidden md:block rounded-xl overflow-hidden group">
            <img
              src={gallery[3] || business.image_url}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt={business.name}
            />
          </div>
        </section>

        {/* Información principal */}
        <section className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#ff7851]/20 text-[#ab2d00] font-bold text-xs uppercase tracking-wider">
                {business.category_name}
              </span>

              <div className="flex items-center text-[#ab2d00]">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  star
                </span>

                <span className="text-sm font-bold ml-1">
                  {business.rating.toFixed(1)}
                </span>

                <span className="text-sm text-[#5c5b5b] ml-2">
                  ({business.reviews_count} reseñas)
                </span>
              </div>
            </div>

            <h1 className="font-['Plus_Jakarta_Sans'] text-4xl md:text-5xl font-extrabold tracking-tight">
              {business.name}
            </h1>

            <div className="flex items-center gap-2 text-[#5c5b5b]">
              <span className="material-symbols-outlined">location_on</span>

              <span className="font-medium">{business.address}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={toggleFavorite}
              disabled={loadingFavorite}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 border-2 disabled:opacity-60 ${
                isFavorite
                  ? "bg-[#ff7851]/10 border-[#ab2d00] text-[#ab2d00]"
                  : "bg-[#dfdcdc] border-transparent text-[#2f2f2e]"
              }`}
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
              className="bg-[#dfdcdc] text-[#2f2f2e] px-8 py-4 rounded-full font-bold"
            >
              Mensaje
            </button>

            <button
              onClick={handleBooking}
              disabled={services.length === 0}
              className="bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-8 py-4 rounded-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              title={services.length === 0 ? "Este negocio aún no tiene servicios" : undefined}
            >
              Reservar
            </button>
          </div>
        </section>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-4">
                Acerca de
              </h2>

              <p className="text-[#5c5b5b] leading-relaxed text-lg">
                {business.description}
              </p>
            </section>

            {/* ---------------- SERVICIOS ---------------- */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold">
                  Nuestros Servicios
                </h2>

                <span className="text-sm text-[#5c5b5b]">
                  {services.length} servicio(s)
                </span>
              </div>

              {services.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-[#5c5b5b]">
                  Este negocio todavía no tiene servicios registrados.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => {
                        if (!business) return;
                        if (!getToken()) {
                          navigate("/login");
                          return;
                        }
                        navigate(`/booking/${business.id}`, {
                          state: {
                            business,
                            services,
                            team,
                            preselectedServiceId: service.id,
                          },
                        });
                      }}
                      className="text-left bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-[#ff7851]/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#ab2d00]">
                            content_cut
                          </span>
                        </div>

                        <span className="font-bold text-xl text-[#ab2d00]">
                          S/. {service.price}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg mb-2">{service.name}</h3>

                      <p className="text-sm text-[#5c5b5b] mb-4">
                        {service.description}
                      </p>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#5c5b5b]">
                          ⏱ {service.duration_minutes} min
                        </span>

                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            service.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {service.active ? "Disponible" : "Inactivo"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* ---------------- EQUIPO ---------------- */}
            <section>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-6">
                Conoce al Equipo
              </h2>

              {team.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-[#5c5b5b]">
                  Este negocio aún no ha registrado profesionales.
                </div>
              ) : (
                <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                  {team.map((member) => (
                    <div key={member.id} className="flex-shrink-0 w-32 group">
                      <div className="w-32 h-32 rounded-xl overflow-hidden mb-3 bg-gray-200">
                        <img
                          src={
                            member.image ||
                            "https://placehold.co/300x300?text=Profesional"
                          }
                          alt={member.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                        />
                      </div>

                      <p className="text-sm font-bold text-center">
                        {member.name}
                      </p>

                      <p className="text-xs text-center text-[#5c5b5b]">
                        {member.role}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ---------------- SIDEBAR ---------------- */}
          <aside className="space-y-8">
            <div className="bg-[#f3f0ef] p-8 rounded-xl space-y-8">
              {/* Horarios */}
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab2d00]">
                    schedule
                  </span>
                  Horario de Atención
                </h3>

                <div className="space-y-3 text-sm">
                  {[
                    ["monday", "Lunes"],
                    ["tuesday", "Martes"],
                    ["wednesday", "Miércoles"],
                    ["thursday", "Jueves"],
                    ["friday", "Viernes"],
                    ["saturday", "Sábado"],
                    ["sunday", "Domingo"],
                  ].map(([key, label]) => {
                    const value = business.weekly_hours?.[key];

                    return (
                      <div
                        key={key}
                        className="flex justify-between items-center"
                      >
                        <span>{label}</span>

                        <span className="font-semibold">
                          {value && value.length > 0
                            ? value.join(" - ")
                            : "Cerrado"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contacto */}
              <div className="border-t border-[#dfdcdc] pt-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab2d00]">
                    call
                  </span>
                  Contacto
                </h3>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-[#ab2d00]">
                      call
                    </span>

                    <span>{business.phone}</span>
                  </div>

                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-[#ab2d00]">
                      mail
                    </span>

                    <span>{business.email}</span>
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div className="border-t border-[#dfdcdc] pt-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab2d00]">
                    location_on
                  </span>
                  Ubicación
                </h3>

                <div className="flex gap-3">
                  <span
                    className="material-symbols-outlined text-[#ab2d00]"
                    style={{
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    location_on
                  </span>

                  <div>
                    <p className="font-semibold">{business.address}</p>

                    <p className="text-sm text-[#5c5b5b]">{business.city}</p>
                  </div>
                </div>
              </div>

              {/* Información */}
              <div className="border-t border-[#dfdcdc] pt-6">
                <div className="flex justify-between mb-3">
                  <span>Servicios</span>

                  <span className="font-bold">{services.length}</span>
                </div>

                <div className="flex justify-between mb-3">
                  <span>Profesionales</span>

                  <span className="font-bold">{team.length}</span>
                </div>

                <div className="flex justify-between">
                  <span>Reseñas</span>

                  <span className="font-bold">{business.reviews_count}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}