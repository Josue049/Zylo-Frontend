import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderBusiness from "../../components/business/HeaderBusiness";
import { apiFetch } from "../../utils/api";
const SESSION_KEY = "zylo_session";

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

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Business self-management profile.
 * Loaded instead of UserProfile when the logged-in account is a business
 * (accountType === "business"). Lets the business owner view/edit their
 * own profile, manage their gallery, and review incoming reviews.
 *
 * Wires up:
 *   GET   /businesses/me
 *   PATCH /businesses/me
 *   POST  /businesses/me/photo
 *   GET   /businesses/me/gallery
 *   PATCH /businesses/me/gallery
 *   POST  /businesses/me/gallery/upload
 *   GET   /businesses/me/reviews
 */
export default function BusinessProfileSelf() {
  const navigate = useNavigate();

  const [business, setBusiness] = useState<Business | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [gallery, setGallery] = useState<
    [string | null, string | null, string | null, string | null]
  >([null, null, null, null]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<"saved" | "error" | null>(null);

  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [selectedGallerySlot, setSelectedGallerySlot] = useState<number | null>(
    null,
  );
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!getSession()) {
      navigate("/login");
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setLoadError(null);

        const [businessData, galleryData, reviewsData] = await Promise.all([
          apiFetch("/businesses/me"),
          apiFetch("/businesses/me/gallery"),
          apiFetch("/businesses/me/reviews"),
        ]);

        setBusiness(businessData.business);
        const galleryItems = galleryData.items ?? [];
        // Convert to fixed array of 4 slots
        const galleryArray: [
          string | null,
          string | null,
          string | null,
          string | null,
        ] = [
          galleryItems[0] ?? null,
          galleryItems[1] ?? null,
          galleryItems[2] ?? null,
          galleryItems[3] ?? null,
        ];
        setGallery(galleryArray);
        setReviews(reviewsData.items ?? []);
        setProfilePhoto(businessData.business?.image_url ?? null);

        setForm({
          name: businessData.business?.name ?? "",
          description: businessData.business?.description ?? "",
          phone: businessData.business?.phone ?? "",
          email: businessData.business?.email ?? "",
          address: businessData.business?.address ?? "",
          city: businessData.business?.city ?? "",
        });
      } catch (err: any) {
        console.error(err);
        setLoadError(err.message || "Error al cargar tu negocio");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMsg(null);

    try {
      const data = await apiFetch("/businesses/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
        }),
      });

      setBusiness(data.business);
      setSaveMsg("saved");
      setEditing(false);
    } catch (err) {
      console.error(err);
      setSaveMsg("error");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  const handleUploadGalleryImages = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || selectedGallerySlot === null) return;

    setUploadingGallery(true);

    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("index", String(selectedGallerySlot)); // 👈 nuevo

      const data = await apiFetch("/businesses/me/gallery/upload", {
        method: "POST",
        body: formData,
      });

      const galleryItems = data.items ?? [];
      const galleryArray: [
        string | null,
        string | null,
        string | null,
        string | null,
      ] = [
        galleryItems[0] ?? null,
        galleryItems[1] ?? null,
        galleryItems[2] ?? null,
        galleryItems[3] ?? null,
      ];
      setGallery(galleryArray);
      setSelectedGallerySlot(null);
      setLoadError(null);
    } catch (err) {
      console.error(err);
      setLoadError("No se pudo subir la imagen");
    } finally {
      setUploadingGallery(false);
      event.target.value = "";
    }
  };

  const handleUploadProfilePhoto = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingProfilePhoto(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const data = await apiFetch("/businesses/me/photo", {
        method: "POST",
        body: formData,
      });

      setProfilePhoto(data.image_url ?? data.business?.image_url ?? null);
      setBusiness(data.business ?? null);
    } catch (err) {
      console.error(err);
      setLoadError("No se pudo subir la foto de perfil");
    } finally {
      setUploadingProfilePhoto(false);
      event.target.value = "";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando tu negocio...
      </div>
    );
  }

  if (loadError || !business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[#5c5b5b]">
          {loadError || "No se encontró tu negocio."}
        </p>
        <button
          onClick={handleLogout}
          className="px-6 py-3 rounded-full font-bold border-2 border-[#afadac]/30"
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] font-['Inter'] min-h-screen pb-32">
      <HeaderBusiness />

      {saveMsg && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-xl text-sm font-bold ${
            saveMsg === "saved"
              ? "bg-[#22c55e] text-white"
              : "bg-[#ef4444] text-white"
          }`}
        >
          {saveMsg === "saved" ? "Cambios guardados" : "No se pudo guardar"}
        </div>
      )}

      <main className="pt-24 pb-36 px-6 max-w-7xl mx-auto">
        {/* ---------------- PERFIL DEL NEGOCIO ---------------- */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#f3f0ef] border-4 border-white shadow-md">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#5c5b5b]">
                      {business.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => profilePhotoInputRef.current?.click()}
                  disabled={uploadingProfilePhoto}
                  className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full border-2 border-[#f3f0ef] shadow-md hover:bg-[#f3f0ef] transition-colors disabled:opacity-60"
                  title="Cambiar foto de perfil"
                >
                  <span
                    className="material-symbols-outlined text-primary text-base"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    photo_camera
                  </span>
                </button>
                <input
                  ref={profilePhotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadProfilePhoto}
                />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-[#ff7851]/20 text-[#ab2d00] font-bold text-xs uppercase tracking-wider">
                  {business.category_name}
                </span>
                <h1 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold mt-2">
                  {business.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-[#5c5b5b] mt-1">
                  <span
                    className="material-symbols-outlined text-base text-[#ab2d00]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  {business.rating.toFixed(1)} ({business.reviews_count}{" "}
                  reseñas)
                </div>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-6 py-3 rounded-full font-bold"
              >
                Editar perfil
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4 max-w-xl">
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Nombre del negocio"
                className="w-full bg-[#f3f0ef] rounded-xl px-4 py-3 outline-none"
              />
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Descripción"
                rows={4}
                className="w-full bg-[#f3f0ef] rounded-xl px-4 py-3 outline-none"
              />
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="Teléfono"
                className="w-full bg-[#f3f0ef] rounded-xl px-4 py-3 outline-none"
              />
              <input
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="Correo de contacto"
                className="w-full bg-[#f3f0ef] rounded-xl px-4 py-3 outline-none"
              />
              <input
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="Dirección"
                className="w-full bg-[#f3f0ef] rounded-xl px-4 py-3 outline-none"
              />
              <input
                value={form.city}
                onChange={(e) =>
                  setForm((p) => ({ ...p, city: e.target.value }))
                }
                placeholder="Ciudad"
                className="w-full bg-[#f3f0ef] rounded-xl px-4 py-3 outline-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 rounded-full font-bold border-2 border-[#afadac]/30"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-6 py-3 rounded-full font-bold disabled:opacity-50"
                >
                  {isSaving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-[#5c5b5b]">
              <p>{business.description}</p>
              <p>📞 {business.phone}</p>
              <p>✉ {business.email}</p>
              <p>
                📍 {business.address}, {business.city}
              </p>
            </div>
          )}
        </section>

        {/* ---------------- GALERÍA ---------------- */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-4">
            Galería (4 imágenes)
          </h2>

          <p className="text-sm text-[#5c5b5b] mb-6">
            Agrega hasta 4 imágenes a tu galería. Haz clic en cada espacio para
            subir una imagen.
          </p>

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleUploadGalleryImages}
            className="hidden"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedGallerySlot(index);
                  galleryInputRef.current?.click();
                }}
                disabled={uploadingGallery}
                className="relative rounded-xl overflow-hidden aspect-square bg-[#f3f0ef] border-2 border-dashed border-[#afadac]/30 hover:border-[#ab2d00] hover:bg-[#f9f6f5] transition-all disabled:opacity-50 group"
              >
                {gallery[index] ? (
                  <>
                    <img
                      src={gallery[index]!}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-all">
                        photo_camera
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#5c5b5b] group-hover:text-[#ab2d00] transition-colors">
                    <span className="material-symbols-outlined text-3xl mb-1">
                      image_not_supported
                    </span>
                    <span className="text-xs font-medium">
                      Imagen {index + 1}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ---------------- RESEÑAS RECIBIDAS ---------------- */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-4">
            Reseñas recibidas
          </h2>

          {reviews.length === 0 ? (
            <p className="text-[#5c5b5b]">Todavía no has recibido reseñas.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-[#f3f0ef] pb-4 last:border-0"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-[#f3f0ef] shrink-0">
                        {review.user_photo ? (
                          <img
                            src={review.user_photo}
                            alt={review.user_name ?? "Cliente"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#5c5b5b]">
                            {review.user_name?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#2f2f2e] truncate">
                          {review.user_name ?? "Cliente"}
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

                    <span className="text-xs text-[#5c5b5b] shrink-0">
                      {new Date(review.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-[#5c5b5b]">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <button
          onClick={handleLogout}
          className="mt-[20px] w-full py-4 rounded-xl font-bold border-2 border-[#afadac]/30 text-on-surface-variant hover:bg-[#dfdcdc] transition-colors flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined">logout</span>
          Cerrar sesión
        </button>
      </main>
    </div>
  );
}
