import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderUser from "../../components/user/HeaderUser";
import { getSession, getOrCreateConversation } from "../../data/messages";
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

interface Review {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_photo: string | null;
  business_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

function getAccountType(): string | null {
  const session = localStorage.getItem("zylo_session");

  if (!session) return null;

  try {
    return JSON.parse(session).accountType ?? null;
  } catch {
    return null;
  }
}

export default function BusinessProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [loading, setLoading] = useState(true);

  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // =========================
  // LOAD BUSINESS
  // =========================
  useEffect(() => {
    async function loadBusiness() {
      try {
        setLoading(true);

        const [businessData, servicesData, galleryData, teamData, reviewsData] =
          await Promise.all([
            apiFetch(`/businesses/${id}`),
            apiFetch(`/businesses/${id}/services`),
            apiFetch(`/businesses/${id}/gallery`),
            apiFetch(`/businesses/${id}/team`),
            apiFetch(`/businesses/${id}/reviews`),
          ]);

        setBusiness(businessData.business);
        setServices(servicesData.items ?? []);
        setGallery(galleryData.items ?? []);
        setTeam(teamData.items ?? []);
        setReviews(reviewsData.items ?? []);
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
      try {
        setLoadingFavorite(true);

        const data = await apiFetch("/users/me/favorites");
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
      await apiFetch(`/users/me/favorites/${business.id}`, {
        method: nextState ? "POST" : "DELETE",
      });
    } catch (err) {
      console.error(err);
      setIsFavorite(!nextState);
    }
  }

  // =========================
  // REVIEWS
  // =========================
  async function refreshReviews() {
    if (!business) return;
    try {
      const data = await apiFetch(`/businesses/${business.id}/reviews`);
      setReviews(data.items ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  async function submitReview() {
    if (!business) return;

    if (!getSession()) {
      navigate("/login");
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const data = await apiFetch(`/businesses/${business.id}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        }),
      });
      setBusiness(data.business);
      setReviewComment("");
      await refreshReviews();
    } catch (err: any) {
      console.error(err);
      setReviewError(err.message || "Error al enviar la reseña");
    } finally {
      setSubmittingReview(false);
    }
  }

  async function deleteReview(reviewId: string) {
    if (!business) return;

    const session = getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    if (!window.confirm("¿Eliminar esta reseña?")) {
      return;
    }

    try {
      const data = await apiFetch(
        `/businesses/${business.id}/reviews/${reviewId}`,
        {
          method: "DELETE",
        },
      );
      setBusiness(data.business);
      await refreshReviews();
    } catch (err: any) {
      console.error(err);
      setReviewError(err.message || "Error al eliminar la reseña");
    }
  }

  const handleMessage = async () => {
    if (!business) return;

    const session = getSession();

    if (!session) {
      navigate("/login");
      return;
    }

    const conversation = await getOrCreateConversation(
      session.email,
      session.name,
      undefined,
      business.id,
      business.name,
      business.category_name,
      business.image_url,
    );

    navigate(`/messages?conv=${conversation.id}`);
  };

  const handleBooking = () => {
    if (!business) return;

    if (!getSession()) {
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

  const accountType = getAccountType();
  const isOwnBusiness = accountType === "business" && !!getSession();
  const currentSession = getSession();

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] font-['Inter'] min-h-screen pb-32">
      <HeaderUser />      

      <main className="pt-24 pb-36 px-6 max-w-7xl mx-auto">
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
            {isOwnBusiness ? (
              <button
                onClick={() => navigate("/business-profile")}
                className="bg-[#dfdcdc] text-[#2f2f2e] px-8 py-4 rounded-full font-bold"
              >
                Editar mi negocio
              </button>
            ) : (
              <>
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
                      fontVariationSettings: isFavorite
                        ? "'FILL' 1"
                        : "'FILL' 0",
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
                  title={
                    services.length === 0
                      ? "Este negocio aún no tiene servicios"
                      : undefined
                  }
                >
                  Reservar
                </button>
              </>
            )}
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
                        if (!getSession()) {
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

            {/* ---------------- RESEÑAS ---------------- */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold">
                  Reseñas
                </h2>

                <span className="text-sm text-[#5c5b5b]">
                  {reviews.length} reseña(s)
                </span>
              </div>

              {!isOwnBusiness && (
                <div className="bg-white rounded-xl p-6 mb-6 space-y-4">
                  <h3 className="font-bold">Deja tu reseña</h3>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-0.5"
                      >
                        <span
                          className="material-symbols-outlined text-2xl text-[#ab2d00]"
                          style={{
                            fontVariationSettings:
                              star <= reviewRating ? "'FILL' 1" : "'FILL' 0",
                          }}
                        >
                          star
                        </span>
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Cuéntanos tu experiencia (opcional)"
                    className="w-full rounded-xl border border-[#dfdcdc] p-3 text-sm outline-none focus:ring-2 focus:ring-[#ff785133]"
                    rows={3}
                  />

                  {reviewError && (
                    <p className="text-sm text-red-600">{reviewError}</p>
                  )}

                  <button
                    onClick={submitReview}
                    disabled={submittingReview}
                    className="bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-6 py-3 rounded-full font-bold disabled:opacity-50"
                  >
                    {submittingReview ? "Enviando..." : "Enviar reseña"}
                  </button>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-[#5c5b5b]">
                  Este negocio todavía no tiene reseñas.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#f3f0ef] shrink-0">
                            {review.user_photo ? (
                              <img
                                src={review.user_photo}
                                alt={review.user_name ?? "Usuario"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#5c5b5b]">
                                {review.user_name?.charAt(0)?.toUpperCase() ??
                                  "?"}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-[#2f2f2e] truncate">
                              {review.user_name ?? "Usuario"}
                            </p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className="material-symbols-outlined text-base text-[#ab2d00]"
                                  style={{
                                    fontVariationSettings:
                                      star <= review.rating
                                        ? "'FILL' 1"
                                        : "'FILL' 0",
                                  }}
                                >
                                  star
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-[#5c5b5b]">
                            {new Date(review.created_at).toLocaleDateString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </span>

                          {currentSession?.email &&
                            review.user_email === currentSession.email && (
                              <button
                                type="button"
                                onClick={() => deleteReview(review.id)}
                                className="text-xs font-semibold text-red-600 hover:text-red-700"
                              >
                                Eliminar
                              </button>
                            )}
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-sm text-[#5c5b5b]">
                          {review.comment}
                        </p>
                      )}
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
