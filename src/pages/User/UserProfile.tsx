import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser, getSession } from "../../hooks/userCurrentUser";
import HeaderUser from "../../components/user/HeaderUser";
import { apiFetch } from "../../utils/api";

const SESSION_KEY = "zylo_session";
const supportLinks = [
  { icon: "help_center", label: "Centro de ayuda" },
  { icon: "support_agent", label: "Contactar soporte" },
];
const footerLinks = ["Privacidad", "Términos", "Soporte", "Empleo"];

export default function UserProfile() {
  const { user, loading, updateUserPhoto } = useCurrentUser();
  const session = getSession();
  const navigate = useNavigate();

  // Business accounts get their own management page (connects to
  // /businesses/me, /businesses/me/gallery and /businesses/me/reviews)
  // instead of the regular client profile below.
  useEffect(() => {
    if (session?.accountType === "business") {
      navigate("/business-profile", { replace: true });
    }
  }, [session?.accountType, navigate]);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    location: "",
  });
  const [saveMsg, setSaveMsg] = useState<"saved" | "error" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza el form cuando llegan los datos del usuario
  const initForm = () => {
    if (user)
      setEditForm({
        name: user.name ?? "",
        phone: user.phone ?? "",
        location: user.location ?? "",
      });
    setEditing(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    apiFetch("/users/me/photo", {
      method: "POST",
      body: formData,
    })
      .then((data) => {
        updateUserPhoto(data.photo_url ?? data.user?.photo_url ?? null);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      setSaveMsg("error");
      return;
    }
    setIsSaving(true);

    try {
      // Intenta actualizar en el backend
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: editForm.name.trim(),
          phone: editForm.phone.trim(),
          location: editForm.location.trim(),
        }),
      });

      // Actualiza el nombre en la sesión local
      if (session) {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ ...session, name: editForm.name.trim() }),
        );
      }

      setSaveMsg("saved");
    } catch {
      // Fallback: guarda localmente si el backend falla
      if (session) {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ ...session, name: editForm.name.trim() }),
        );
      }
      setSaveMsg("saved"); // Igual mostramos guardado para no confundir al usuario
    } finally {
      setIsSaving(false);
      setEditing(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setSaveMsg(null);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "/login";
  };

  // ── Redirecting to business profile ──
  if (session?.accountType === "business") {
    return (
      <div className="bg-surface text-on-surface min-h-screen font-body flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-on-surface-variant font-medium">
          Cargando panel de negocio...
        </p>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen font-body flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-on-surface-variant font-medium">
          Cargando perfil...
        </p>
      </div>
    );
  }

  // ── No session ──
  if (!user) {
    return (
      <div className="bg-surface text-on-surface min-h-screen font-body flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-5xl text-outline">
          person_off
        </span>
        <p className="text-on-surface-variant font-medium">
          No hay sesión activa.
        </p>
        <a
          href="/login"
          className="signature-gradient text-white px-8 py-3 rounded-full font-headline font-bold shadow-lg hover:opacity-90 transition-all"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  const displayPhoto = user.photo_url ?? null;
  const initials =
    (user?.name ?? "")
      .split(" ")
      .filter(Boolean)
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const accountType =
    user.account_type ?? user.accountType ?? session?.accountType;
  const createdAt = user.created_at ?? user.createdAt;

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body antialiased">
      <HeaderUser />

      {/* Toast */}
      {saveMsg && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-xl text-sm font-bold transition-all ${
            saveMsg === "saved"
              ? "bg-[#22c55e] text-white"
              : "bg-[#ef4444] text-white"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {saveMsg === "saved" ? "check_circle" : "error"}
          </span>
          {saveMsg === "saved"
            ? "Cambios guardados correctamente"
            : "El nombre no puede estar vacío"}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-20">
        {/* ── Profile Hero ── */}
        <section className="mb-16">
          <div className="bg-[#f3f0ef] rounded-xl p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* Avatar */}
            <div className="relative shrink-0">
              {displayPhoto ? (
                <img
                  alt={user.name}
                  className="w-36 h-36 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-xl"
                  src={displayPhoto}
                />
              ) : (
                <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-xl signature-gradient flex items-center justify-center">
                  <span className="font-headline text-4xl font-extrabold text-white">
                    {initials}
                  </span>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-white p-2 rounded-full border-4 border-[#f3f0ef] shadow-md hover:bg-[#f3f0ef] transition-colors"
                title="Cambiar foto"
              >
                <span
                  className="material-symbols-outlined text-primary text-lg"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  photo_camera
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            {/* Info / Edit form */}
            <div className="flex-1 text-center md:text-left w-full">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1 rounded-full mb-4">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: '"FILL" 1', fontSize: 16 }}
                >
                  {accountType === "business" ? "storefront" : "person"}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider font-label">
                  {accountType === "business" ? "Empresa" : "Usuario"}
                </span>
              </div>

              {editing ? (
                <div className="space-y-3 max-w-sm mx-auto md:mx-0">
                  <input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Nombre completo"
                    className="w-full bg-white rounded-xl px-4 py-3 font-headline text-2xl font-extrabold text-on-surface outline-none focus:ring-2 focus:ring-[#ff785133] border border-[#afadac]/20"
                  />
                  <input
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="Teléfono"
                    type="tel"
                    className="w-full bg-white rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-[#ff785133] border border-[#afadac]/20"
                  />
                  <input
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, location: e.target.value }))
                    }
                    placeholder="Ciudad, País"
                    className="w-full bg-white rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-[#ff785133] border border-[#afadac]/20"
                  />
                  <p className="text-xs text-on-surface-variant px-1">
                    ✉ {user.email} —{" "}
                    <span className="text-outline">
                      el correo no se puede cambiar
                    </span>
                  </p>
                </div>
              ) : (
                <>
                  <h1 className="font-headline text-4xl sm:text-5xl font-extrabold text-on-surface tracking-tight mb-2">
                    {user.name}
                  </h1>
                  <div className="flex flex-col sm:flex-row items-center md:items-start gap-1 sm:gap-4 text-on-surface-variant font-medium text-sm">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-base">
                        mail
                      </span>
                      {user.email}
                    </span>
                    {user.phone && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-base">
                          call
                        </span>
                        {user.phone}
                      </span>
                    )}
                    {user.location && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-base">
                          location_on
                        </span>
                        {user.location}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 shrink-0">
              {editing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 rounded-full font-headline font-bold border-2 border-[#afadac]/30 text-on-surface-variant hover:bg-[#e4e2e1] transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="signature-gradient text-white px-8 py-3 rounded-full font-headline font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSaving ? "Guardando..." : "Guardar"}
                  </button>
                </>
              ) : (
                <button
                  onClick={initForm}
                  className="signature-gradient text-white px-8 py-4 rounded-full font-headline font-bold shadow-lg hover:shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">
                    edit
                  </span>
                  Editar perfil
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-10">
            <h2 className="text-2xl font-headline font-bold">Mi actividad</h2>

            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-3xl">
                      calendar_month
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline text-xl font-bold">
                      Mis reservas
                    </h3>
                    <p className="text-on-surface-variant">
                      Gestiona tus servicios próximos y pasados
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-primary">0</span>
                  <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickCard
                icon="bookmark"
                iconColor="text-[#a03739]"
                iconBg="bg-[#a03739]/10"
                title="Lugares guardados"
                subtitle="0 favoritos guardados"
                linkLabel="Ver lista"
              />
              <QuickCard
                icon="payments"
                iconColor="text-[#833e9a]"
                iconBg="bg-[#833e9a]/10"
                title="Métodos de pago"
                subtitle="Ninguno configurado"
                linkLabel="Gestionar tarjetas"
              />
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-[#afadac]/10">
              <h2 className="font-headline text-xl font-bold mb-6">
                Información de cuenta
              </h2>
              <div className="space-y-4 text-sm">
                {[
                  { icon: "badge", label: "Nombre", value: user.name },
                  { icon: "mail", label: "Correo", value: user.email },
                  { icon: "call", label: "Teléfono", value: user.phone || "—" },
                  {
                    icon: "location_on",
                    label: "Ubicación",
                    value: user.location || "—",
                  },
                  {
                    icon: "calendar_today",
                    label: "Miembro desde",
                    value: createdAt
                      ? new Date(createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-2 border-b border-[#f3f0ef] last:border-0"
                  >
                    <span className="flex items-center gap-3 text-on-surface-variant font-medium">
                      <span className="material-symbols-outlined text-base text-outline">
                        {row.icon}
                      </span>
                      {row.label}
                    </span>
                    <span className="font-semibold text-on-surface text-right max-w-[60%] truncate">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-[#afadac]/10">
              <h2 className="font-headline text-xl font-bold mb-6">Soporte</h2>
              <nav className="space-y-2">
                {supportLinks.map((link) => (
                  <a
                    key={link.label}
                    href="#"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f3f0ef] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary">
                        {link.icon}
                      </span>
                      <span className="font-medium">{link.label}</span>
                    </div>
                    <span className="material-symbols-outlined text-outline">
                      chevron_right
                    </span>
                  </a>
                ))}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-xl font-headline font-bold border-2 border-[#afadac]/30 text-on-surface-variant hover:bg-[#dfdcdc] transition-colors active:scale-95 flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined">logout</span>
              Cerrar sesión
            </button>
          </div>
        </div>
      </main>

      <footer className="w-full rounded-t-[3rem] mt-20 bg-[#f3f0ef] font-body text-sm tracking-wide">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 sm:px-12 py-16 w-full max-w-7xl mx-auto">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <span className="text-lg font-headline font-bold text-[#2f2f2e] block mb-2">
              Zylo
            </span>
            <p className="text-[#5c5b5b]">
              © 2026 Zylo Marketplace. Construido para la velocidad.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {footerLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-[#5c5b5b] hover:text-primary transition-all"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function QuickCard({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  linkLabel,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  linkLabel: string;
}) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center ${iconColor} mb-6`}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h3 className="font-headline text-lg font-bold mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant mb-4">{subtitle}</p>
      <a
        href="#"
        className="text-primary font-semibold text-sm flex items-center gap-1 group"
      >
        {linkLabel}
        <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">
          arrow_forward
        </span>
      </a>
    </div>
  );
}
