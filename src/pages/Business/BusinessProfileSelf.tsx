import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderUser from "../../components/user/HeaderUser";

const API_BASE = "https://backend-zylo.vercel.app";
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

function getToken() {
  return getSession()?.token ?? null;
}

async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
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
 *   GET   /businesses/me/gallery
 *   PATCH /businesses/me/gallery
 *   GET   /businesses/me/reviews
 */
export default function BusinessProfileSelf() {
  const navigate = useNavigate();

  const [business, setBusiness] = useState<Business | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
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

  const [galleryDraft, setGalleryDraft] = useState("");
  const [savingGallery, setSavingGallery] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setLoadError(null);

        const [businessRes, galleryRes, reviewsRes] = await Promise.all([
          authFetch(`${API_BASE}/businesses/me`),
          authFetch(`${API_BASE}/businesses/me/gallery`),
          authFetch(`${API_BASE}/businesses/me/reviews`),
        ]);

        if (!businessRes.ok) throw new Error("No se pudo cargar tu negocio");

        const businessData = await businessRes.json();
        const galleryData = galleryRes.ok
          ? await galleryRes.json()
          : { items: [] };
        const reviewsData = reviewsRes.ok
          ? await reviewsRes.json()
          : { items: [] };

        setBusiness(businessData.business);
        setGallery(galleryData.items ?? []);
        setGalleryDraft((galleryData.items ?? []).join("\n"));
        setReviews(reviewsData.items ?? []);

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
      const res = await authFetch(`${API_BASE}/businesses/me`, {
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

      if (!res.ok) throw new Error("No se pudo guardar");

      const data = await res.json();
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

  const handleSaveGallery = async () => {
    setSavingGallery(true);

    try {
      const items = galleryDraft
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const res = await authFetch(`${API_BASE}/businesses/me/gallery`, {
        method: "PATCH",
        body: JSON.stringify({ items }),
      });

      if (!res.ok) throw new Error("No se pudo guardar la galería");

      const data = await res.json();
      setGallery(data.items ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingGallery(false);
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
      <HeaderUser />

      {saveMsg && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-xl text-sm font-bold ${
            saveMsg === "saved" ? "bg-[#22c55e] text-white" : "bg-[#ef4444] text-white"
          }`}
        >
          {saveMsg === "saved" ? "Cambios guardados" : "No se pudo guardar"}
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
        {/* ---------------- PERFIL DEL NEGOCIO ---------------- */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-[#ff7851]/20 text-[#ab2d00] font-bold text-xs uppercase tracking-wider">
                {business.category_name}
              </span>
              <h1 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold mt-2">
                {business.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-[#5c5b5b] mt-1">
                <span className="material-symbols-outlined text-base text-[#ab2d00]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                {business.rating.toFixed(1)} ({business.reviews_count} reseñas)
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
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nombre del negocio"
                className="w-full bg-[#f3f0ef] rounded-xl px-4 py-3 outline-none"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descripción"
                rows={4}
                className="w-full bg-[#f3f0ef] rounded-xl px-4 py-3 outline-none"
              />
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Teléfono"
                className="w-full bg-[#f3f0ef] rounded-xl px-4 py-3 outline-none"
              />
              <input
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="Correo de contacto"
                className="w-full bg-[#f3f0ef] rounded-xl px-4 py-3 outline-none"
              />
              <input
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="Dirección"
                className="w-full bg-[#f3f0ef] rounded-xl px-4 py-3 outline-none"
              />
              <input
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
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
              <p>📍 {business.address}, {business.city}</p>
            </div>
          )}
        </section>

        {/* ---------------- GALERÍA ---------------- */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-4">
            Galería
          </h2>

          <p className="text-sm text-[#5c5b5b] mb-3">
            Una URL de imagen por línea.
          </p>

          <textarea
            value={galleryDraft}
            onChange={(e) => setGalleryDraft(e.target.value)}
            rows={5}
            placeholder="https://..."
            className="w-full bg-[#f3f0ef] rounded-xl px-4 py-3 outline-none font-mono text-xs"
          />

          <button
            onClick={handleSaveGallery}
            disabled={savingGallery}
            className="mt-4 bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-6 py-3 rounded-full font-bold disabled:opacity-50"
          >
            {savingGallery ? "Guardando..." : "Guardar galería"}
          </button>

          {gallery.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {gallery.map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden aspect-square bg-gray-100">
                  <img src={url} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
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
                <div key={review.id} className="border-b border-[#f3f0ef] pb-4 last:border-0">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className="material-symbols-outlined text-base text-[#ab2d00]"
                        style={{
                          fontVariationSettings: star <= review.rating ? "'FILL' 1" : "'FILL' 0",
                        }}
                      >
                        star
                      </span>
                    ))}
                    <span className="text-xs text-[#5c5b5b] ml-2">
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
          className="w-full py-4 rounded-xl font-bold border-2 border-[#afadac]/30 text-on-surface-variant hover:bg-[#dfdcdc] transition-colors flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined">logout</span>
          Cerrar sesión
        </button>
      </main>
    </div>
  );
}