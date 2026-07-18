import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCurrentUser, getSession } from "../../hooks/userCurrentUser";
import HeaderUser from "../../components/user/HeaderUser";
import { apiFetch } from "../../utils/api";

const SESSION_KEY = "zylo_session";
const footerLinks = ["Privacidad", "Términos", "Soporte", "Empleo"];

export default function UserProfile() {
  const { user, loading, updateUserPhoto } = useCurrentUser();
  const session = getSession();
  const navigate = useNavigate();

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
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: editForm.name.trim(),
          phone: editForm.phone.trim(),
          location: editForm.location.trim(),
        }),
      });

      if (session) {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ ...session, name: editForm.name.trim() }),
        );
      }
      setSaveMsg("saved");
    } catch {
      if (session) {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ ...session, name: editForm.name.trim() }),
        );
      }
      setSaveMsg("saved");
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
    <div className="bg-[#faf9f8] text-on-surface min-h-screen font-body antialiased flex flex-col">
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Profile Hero ── */}
        <section className="mb-10">
          <div className="bg-white rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm border border-black/[0.03] relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
              {/* Avatar */}
              <div className="relative shrink-0">
                {displayPhoto ? (
                  <img
                    alt={user.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#f3f0ef] shadow-md"
                    src={displayPhoto}
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#f3f0ef] shadow-md signature-gradient flex items-center justify-center">
                    <span className="font-headline text-3xl font-extrabold text-white">
                      {initials}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-white p-2 rounded-full border border-black/[0.05] shadow-sm hover:bg-[#f3f0ef] transition-colors"
                  title="Cambiar foto"
                >
                  <span
                    className="material-symbols-outlined text-primary text-base flex items-center justify-center"
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
              <div className="text-center md:text-left w-full max-w-md">
                <div className="inline-flex items-center gap-1.5 bg-primary/5 text-primary px-3 py-1 rounded-full mb-3">
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: '"FILL" 1', fontSize: 14 }}
                  >
                    {accountType === "business" ? "storefront" : "person"}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider font-label">
                    {accountType === "business" ? "Empresa" : "Usuario"}
                  </span>
                </div>

                {editing ? (
                  <div className="space-y-2.5">
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Nombre completo"
                      className="w-full bg-[#f3f0ef]/50 rounded-xl px-4 py-2 text-xl font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-black/[0.05]"
                    />
                    <input
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="Teléfono"
                      type="tel"
                      className="w-full bg-[#f3f0ef]/50 rounded-xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-black/[0.05]"
                    />
                    <input
                      value={editForm.location}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, location: e.target.value }))
                      }
                      placeholder="Ciudad, País"
                      className="w-full bg-[#f3f0ef]/50 rounded-xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-black/[0.05]"
                    />
                    <p className="text-[11px] text-on-surface-variant px-1">
                      ✉ {user.email} —{" "}
                      <span className="text-outline">
                        el correo no se puede cambiar
                      </span>
                    </p>
                  </div>
                ) : (
                  <>
                    <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mb-2">
                      {user.name}
                    </h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-on-surface-variant text-sm">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-outline text-base">
                          mail
                        </span>
                        {user.email}
                      </span>
                      {user.phone && (
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-outline text-base">
                            call
                          </span>
                          {user.phone}
                        </span>
                      )}
                      {user.location && (
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-outline text-base">
                            location_on
                          </span>
                          {user.location}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 w-full md:w-auto justify-center md:justify-end shrink-0">
              {editing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-full text-sm font-bold border border-black/[0.1] text-on-surface-variant hover:bg-[#f3f0ef] transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="signature-gradient text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isSaving ? "Guardando..." : "Guardar"}
                  </button>
                </>
              ) : (
                <button
                  onClick={initForm}
                  className="bg-white border border-black/[0.08] text-on-surface px-6 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-[#f3f0ef] transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    edit
                  </span>
                  Editar perfil
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Activity */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.03]">
              <h2 className="text-lg font-headline font-bold mb-4">Mi actividad</h2>
              
              <div className="space-y-4">
                {/* Mis reservas */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#faf9f8] hover:bg-[#f3f0ef] transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-2xl">
                        calendar_month
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-sm sm:text-base">
                        Mis reservas
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        Gestiona tus servicios próximos y pasados
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-primary">0</span>
                    <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform text-lg">
                      chevron_right
                    </span>
                  </div>
                </div>

                {/* Grid secundario de accesos directos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <QuickCard
                    icon="bookmark"
                    iconColor="text-[#a03739]"
                    iconBg="bg-[#a03739]/5"
                    title="Lugares guardados"
                    subtitle="Tus establecimientos favoritos"
                    linkLabel="Ver lista"
                    to="/favorites"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Account Details & Session */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.03]">
              <h2 className="font-headline font-bold mb-4">
                Información de cuenta
              </h2>
              <div className="space-y-3 text-xs sm:text-sm">
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
                    className="flex items-center justify-between py-2.5 border-b border-[#faf9f8] last:border-0"
                  >
                    <span className="flex items-center gap-2.5 text-on-surface-variant font-medium">
                      <span className="material-symbols-outlined text-base text-outline">
                        {row.icon}
                      </span>
                      {row.label}
                    </span>
                    <span className="font-semibold text-on-surface text-right max-w-[55%] truncate">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl text-sm font-headline font-bold bg-white border border-black/[0.08] text-[#ef4444] hover:bg-[#ef4444]/5 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Cerrar sesión
            </button>
          </div>
        </div>
      </main>

      <footer className="w-full bg-white border-t border-black/[0.03] text-xs sm:text-sm text-on-surface-variant mt-16">
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-8 w-full max-w-7xl mx-auto gap-4">
          <div className="text-center sm:text-left">
            <span className="font-headline font-bold text-[#2f2f2e] block sm:inline mr-2">
              Zylo
            </span>
            <span>© 2026 Zylo Marketplace.</span>
          </div>
          <div className="flex gap-6">
            {footerLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="hover:text-primary transition-all"
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
  to,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  linkLabel: string;
  to: string;
}) {
  return (
    <Link 
      to={to}
      className="bg-[#faf9f8] rounded-xl p-5 hover:bg-[#f3f0ef] transition-colors flex flex-col justify-between group cursor-pointer border border-transparent"
    >
      <div>
        <div
          className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center ${iconColor} mb-4`}
        >
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <h3 className="font-headline font-bold text-sm sm:text-base mb-1">{title}</h3>
        <p className="text-xs text-on-surface-variant mb-4">{subtitle}</p>
      </div>
      <span
        className="text-primary font-bold text-xs flex items-center gap-1 mt-auto"
      >
        {linkLabel}
        <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">
          arrow_forward
        </span>
      </span>
    </Link>
  );
}