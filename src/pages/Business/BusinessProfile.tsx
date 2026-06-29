import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderBusiness from "../../components/user/HeaderUser";
import { businesses } from "../../data/businesses";
import { getSession, getOrCreateConversation } from "../../data/messages";

const API_BASE = "https://backend-zylo.vercel.app";

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
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  const business = businesses.find((b) => b.id === Number(id));

  useEffect(() => {
    if (!business) return;

    const loadFavorite = async () => {
      const token = getToken();
      if (!token) {
        console.log("No token found, skipping favorites load");
        setLoadingFavorite(false);
        return;
      }

      try {
        setLoadingFavorite(true);
        console.log("Loading favorites for business:", business.id);

        const response = await authFetch(`${API_BASE}/users/me/favorites`);

        if (response.status === 401) {
          localStorage.removeItem("zylo_session");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log("Favorites response:", data);

        const favorites = Array.isArray(data?.items) ? data.items : [];
        console.log("Favorites list:", favorites);
        console.log(
          "Business ID to match:",
          business.id,
          "Type:",
          typeof business.id,
        );

        const isFav = favorites.some((fav: any) => {
          console.log(
            "Comparing:",
            fav.id,
            "with",
            business.id,
            "Match:",
            String(fav.id) === String(business.id),
          );
          return String(fav.id) === String(business.id);
        });

        console.log("Is favorite:", isFav);
        setIsFavorite(isFav);
      } catch (err) {
        console.error("Error loading favorites:", err);
        setIsFavorite(false);
      } finally {
        setLoadingFavorite(false);
      }
    };

    loadFavorite();
  }, [business, navigate]);

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
      business.email,
      business.name,
      business.category,
      business.image,
    );
    navigate(`/messages?conv=${conv.id}`);
  };

  if (!business) {
    return (
      <div className="bg-[#f9f6f5] min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-[#2f2f2e]">
          Negocio no encontrado.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-8 py-3 rounded-full font-bold"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  async function toggleFavorite() {
    if (!business) return;

    try {
      setLoadingFavorite(true);

      if (isFavorite) {
        const response = await authFetch(
          `${API_BASE}/users/me/favorites/${business.id}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          throw new Error("No se pudo eliminar");
        }

        setIsFavorite(false);
      } else {
        const response = await authFetch(
          `${API_BASE}/users/me/favorites/${business.id}`,
          {
            method: "POST",
          },
        );

        if (!response.ok) {
          throw new Error("No se pudo agregar");
        }

        setIsFavorite(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFavorite(false);
    }
  }

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] font-['Inter'] min-h-screen pb-32">
      <HeaderBusiness />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {/* --- Galería Bento --- */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px]">
          <div className="md:col-span-2 md:row-span-2 rounded-xl overflow-hidden relative group">
            <img
              src={business.gallery[0]}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Principal"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
          <div className="hidden md:block md:col-span-2 rounded-xl overflow-hidden group">
            <img
              src={business.gallery[1]}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Interior"
            />
          </div>
          <div className="hidden md:block rounded-xl overflow-hidden group">
            <img
              src={business.gallery[2]}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Detalle"
            />
          </div>
          <div className="hidden md:block rounded-xl overflow-hidden group">
            <img
              src={business.gallery[3]}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Extra"
            />
          </div>
        </section>

        {/* --- Info principal --- */}
        <section className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#ff7851]/20 text-[#ab2d00] font-bold text-xs uppercase tracking-wider">
                {business.category}
              </span>
              <div className="flex items-center text-[#ab2d00]">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="text-sm font-bold ml-1">
                  {business.rating} ({Math.floor(business.rating * 25)} Reseñas)
                </span>
              </div>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-4xl md:text-5xl font-extrabold tracking-tight">
              {business.name}
            </h1>
            <div className="flex items-center gap-2 text-[#5c5b5b]">
              <span className="material-symbols-outlined text-lg">
                location_on
              </span>
              <span className="font-medium">{business.address}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={toggleFavorite}
              disabled={loadingFavorite}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 border-2 disabled:opacity-60 disabled:cursor-not-allowed ${
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
                navigate(`/booking/${business.id}`, {
                  state: {
                    business: {
                      id: business.id,
                      name: business.name,
                      image: business.image,
                      imageAlt: business.name,
                      category: business.category,
                      distance: "Lima, Perú",
                      rating: business.rating,
                      availability: "",
                      available: true,
                      bookingTitle: business.services[0]?.title ?? "Servicio",
                      duration: "60 min",
                      price: parseFloat(
                        business.services[0]?.price?.replace(/[^0-9.]/g, "") ??
                          "0",
                      ),
                    },
                  },
                })
              }
              className="bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-[#ab2d00]/20 active:scale-95 transition-all"
            >
              Reservar
            </button>
          </div>
        </section>

        {/* --- Contenido principal --- */}
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
                    className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group ${service.featured ? "border-l-4 border-[#ab2d00]" : ""}`}
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

            <section>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-6">
                Conoce al Equipo
              </h2>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                {business.team.map((member) => (
                  <div key={member.id} className="flex-shrink-0 w-32 group">
                    <div className="w-32 h-32 rounded-xl overflow-hidden mb-3 grayscale group-hover:grayscale-0 transition-all duration-300">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
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
          </div>

          <aside className="space-y-8">
            <div className="bg-[#f3f0ef] p-8 rounded-xl space-y-6">
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab2d00]">
                    schedule
                  </span>{" "}
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
              <div className="pt-6 border-t border-[#dfdcdc]">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab2d00]">
                    location_on
                  </span>{" "}
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
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
