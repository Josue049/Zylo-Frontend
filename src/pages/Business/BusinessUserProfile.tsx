import { useState, useRef } from "react";
import HeaderBusiness from "../../components/business/HeaderBusiness";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StoredUser {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  accountType: "user" | "business";
  createdAt: string;
  photo?: string;
  location?: string;
}

interface BusinessProfile {
  email: string;
  businessName: string;
  category: string;
  about: string;
  gallery: string[];
  logo?: string;
  services: Service[];
  team: TeamMember[];
  days: DayConfig[];
  updatedAt: string;
}

interface Service {
  id: string;
  icon: string;
  name: string;
  duration: string;
  price: string;
  bgColor: string;
  textColor: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  roleColor: string;
  avatar: string;
}

interface DayConfig {
  name: string;
  enabled: boolean;
  start: string;
  end: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_GALLERY  = 4;
const SESSION_KEY  = "zylo_session";
const USERS_KEY    = "zylo_users";
const BUSINESS_KEY = "zylo_business_profiles";

const ROLE_COLORS = [
  { label: "Purple",  value: "text-[#833e9a]" },
  { label: "Red",     value: "text-[#a03739]" },
  { label: "Blue",    value: "text-[#1d6fa4]" },
  { label: "Green",   value: "text-[#2e7d5a]" },
  { label: "Orange",  value: "text-[#b85c00]" },
  { label: "Gray",    value: "text-[#5c5b5b]"  },
];

// ─── Storage helpers ──────────────────────────────────────────────────────────

function getSession(): { email: string; name: string } | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
}

function getAllUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as StoredUser[]; }
  catch { return []; }
}

function getCurrentUser(): StoredUser | null {
  const session = getSession();
  if (!session) return null;
  return getAllUsers().find(
    (u) => u.email.toLowerCase() === session.email.toLowerCase()
  ) ?? null;
}

function getAllBusinessProfiles(): BusinessProfile[] {
  try { return JSON.parse(localStorage.getItem(BUSINESS_KEY) || "[]") as BusinessProfile[]; }
  catch { return []; }
}

function getBusinessProfile(email: string): BusinessProfile | null {
  return getAllBusinessProfiles().find(
    (b) => b.email.toLowerCase() === email.toLowerCase()
  ) ?? null;
}

function saveBusinessProfile(profile: BusinessProfile): void {
  const all = getAllBusinessProfiles();
  const idx = all.findIndex(
    (b) => b.email.toLowerCase() === profile.email.toLowerCase()
  );
  if (idx !== -1) { all[idx] = profile; } else { all.push(profile); }
  localStorage.setItem(BUSINESS_KEY, JSON.stringify(all));
}

function syncUserName(email: string, newName: string): void {
  const users = getAllUsers();
  const idx = users.findIndex(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (idx !== -1) {
    users[idx] = { ...users[idx], name: newName };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const session = getSession();
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, name: newName }));
    }
  }
}

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_SERVICES: Service[] = [
  { id: "s1", icon: "cleaning_services", name: "Premium Deep Clean",       duration: "120 min", price: "$150.00", bgColor: "bg-[#ff7851]", textColor: "text-[#470e00]" },
  { id: "s2", icon: "handyman",          name: "General Maintenance Hour", duration: "60 min",  price: "$85.00",  bgColor: "bg-[#ffc3c0]", textColor: "text-[#852327]" },
  { id: "s3", icon: "verified",          name: "Safety Inspection",        duration: "45 min",  price: "$60.00",  bgColor: "bg-[#e699fd]", textColor: "text-[#570e6f]" },
];

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "t1", name: "Marcus Chen", role: "Senior Tech", roleColor: "text-[#833e9a]",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFnhXVho9RYrUmCEfsdeWaKNPY-pWVZJWyFxpTojlVyS2f7pcBXp1iHSs3VVSxj8XLIEwkGj8EBGpfD4JCnk1h0r2EBEFftJE_sIWVcwU8LfB5H50758ZpAQ3W6B09Rty122glBgNGXQTwpOKIRSupwniQ6u_VngVmlbOPc2bExMfqOYI-qpE28b0RbNVzC2ELM_karOHvReJBie4nhBuPdBjMXxRnbWI7AxI361ZS4ACDDGfLxp28nlOaWmA6UzX5vFXpxIGXrNNh",
  },
  {
    id: "t2", name: "Sarah Miller", role: "Operations", roleColor: "text-[#a03739]",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjy4K4RvDocQa4eMS-YwuopOIUNUfZy0L8cKRl9l71Xm33juDPuEdSbMDe3u1d77UE2sOa1eYuG2ajypYfia1YD3CLNJiEcEzwDReObS95vE6jJLjGb8KlvaurWfJtnpZskJ0iAxS-1M0x4ezbDNLpZ2aDnjOM2dKjb-noDSZwDLfr2pM0s53gfKWZjKAZsYEw35WuVWwkrWigZDmW87xCYo9WuwvHoGg3UnjhrahpZBEw8ELAI5JATkfVoAlBRNS97zpOF3mYw6AK",
  },
];

const DEFAULT_DAYS: DayConfig[] = [
  { name: "Monday",    enabled: true,  start: "09:00", end: "18:00" },
  { name: "Tuesday",   enabled: true,  start: "09:00", end: "18:00" },
  { name: "Wednesday", enabled: true,  start: "09:00", end: "18:00" },
  { name: "Thursday",  enabled: true,  start: "09:00", end: "18:00" },
  { name: "Friday",    enabled: true,  start: "09:00", end: "18:00" },
  { name: "Saturday",  enabled: false, start: "10:00", end: "16:00" },
  { name: "Sunday",    enabled: false, start: "10:00", end: "16:00" },
];

const STATIC_GALLERY = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB9ROnVtf7sSAwm4H6HunMSmrzLbREaxwzLpWWO82Uf7F5DKL91Jp0vICxKj6ltXwN5LrxfgKxDPRqQeqTjriPapPKCQBLeMS9KxUfZQa8nzgJ_c8xlXO94ftEMgc-aN-MqLgM9O1oDnZFfbw_FdYD59Ppmb4enjIKagZbO21k0FVIkkOF1BHAtZqwJfzAuHLI4-fCCI6mruuFXNmeeN3xKez81cOhj4vBXQbftIQ0bkpRH4HnfbieczKZFKrthvTA_OeMjtpMTV46O",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDYqC__6BRJH8NcQIaayZizeJqTB7jp4wGOeqcWchgv9TEaEUg15ab2UzOP6pUKXOeq03oqBf5OGic-7rtM2GqmlCMkgx0mhbnyL7CTV8kNAR9CqO2UNK44WPwa6UQ0wWYoh41HRV_Ey8WmffR-TNNyCtp9XiwiSolZBZcVoiwdMTBpDO5ythfWd8BoF-r_SqK9mUpmATQRTQ-vxmHAPQLHjqiKNRs7tm_5tRVAVwsVv1_QH0Jzxvdrbz-yH_Gt4i16e9IDHWMtYYS9",
];

function buildDefaultProfile(email: string, user: StoredUser): BusinessProfile {
  return {
    email,
    businessName: user.name + " Services",
    category: "Home Wellness & Maintenance",
    about: "High-velocity marketplace efficiency meet human-centric warmth. We specialize in rapid response home services with a focus on trust and premium delivery.",
    gallery: STATIC_GALLERY,
    logo: undefined,
    services: DEFAULT_SERVICES,
    team: DEFAULT_TEAM,
    days: DEFAULT_DAYS,
    updatedAt: new Date().toISOString(),
  };
}

// ─── Team Member Modal ────────────────────────────────────────────────────────

interface TeamModalProps {
  member: Partial<TeamMember> | null;
  onClose: () => void;
  onSave: (m: TeamMember) => void;
}

function TeamMemberModal({ member, onClose, onSave }: TeamModalProps) {
  const isNew = !member?.id;
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name:      member?.name      ?? "",
    role:      member?.role      ?? "",
    roleColor: member?.roleColor ?? ROLE_COLORS[0].value,
    avatar:    member?.avatar    ?? "",
  });

  const [nameErr, setNameErr] = useState(false);
  const [roleErr, setRoleErr] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, avatar: reader.result as string }));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = () => {
    const n = !form.name.trim();
    const r = !form.role.trim();
    setNameErr(n);
    setRoleErr(r);
    if (n || r) return;

    onSave({
      id:        member?.id ?? `t${Date.now()}`,
      name:      form.name.trim(),
      role:      form.role.trim(),
      roleColor: form.roleColor,
      avatar:    form.avatar,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-[fadeInUp_0.2s_ease]">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-[#2f2f2e]">
            {isNew ? "Add Team Member" : "Edit Team Member"}
          </h2>
          <button
            onClick={onClose}
            className="material-symbols-outlined text-[#787676] hover:text-[#2f2f2e] transition-colors"
          >
            close
          </button>
        </div>

        {/* Avatar picker */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="relative group cursor-pointer"
            onClick={() => avatarInputRef.current?.click()}
          >
            {form.avatar ? (
              <img
                src={form.avatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-[#f3f0ef] group-hover:opacity-75 transition-opacity"
              />
            ) : (
              <div className="w-24 h-24 rounded-full ring-4 ring-[#f3f0ef] bg-gradient-to-br from-[#e4e2e1] to-[#afadac] flex items-center justify-center group-hover:opacity-75 transition-opacity">
                <span className="material-symbols-outlined text-white text-4xl">person</span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-2xl drop-shadow">add_a_photo</span>
            </div>
          </div>
          <p className="text-xs text-[#787676] mt-2">Click para subir foto</p>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-[#5c5b5b] mb-1">
              Nombre <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Ana García"
              value={form.name}
              onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setNameErr(false); }}
              className={`w-full bg-[#f3f0ef] rounded-full px-5 py-3 text-[#2f2f2e] font-medium focus:outline-none focus:ring-2 ${
                nameErr ? "ring-2 ring-red-400" : "focus:ring-[#ff7851]/30"
              }`}
            />
            {nameErr && <p className="text-xs text-red-400 mt-1 pl-2">El nombre es obligatorio.</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-[#5c5b5b] mb-1">
              Cargo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Senior Tech, Operations..."
              value={form.role}
              onChange={(e) => { setForm((p) => ({ ...p, role: e.target.value })); setRoleErr(false); }}
              className={`w-full bg-[#f3f0ef] rounded-full px-5 py-3 text-[#2f2f2e] font-medium focus:outline-none focus:ring-2 ${
                roleErr ? "ring-2 ring-red-400" : "focus:ring-[#ff7851]/30"
              }`}
            />
            {roleErr && <p className="text-xs text-red-400 mt-1 pl-2">El cargo es obligatorio.</p>}
          </div>

          {/* Role color */}
          <div>
            <label className="block text-sm font-semibold text-[#5c5b5b] mb-2">Color del cargo</label>
            <div className="flex gap-2 flex-wrap">
              {ROLE_COLORS.map((rc) => {
                const dot: Record<string, string> = {
                  "text-[#833e9a]": "#833e9a",
                  "text-[#a03739]": "#a03739",
                  "text-[#1d6fa4]": "#1d6fa4",
                  "text-[#2e7d5a]": "#2e7d5a",
                  "text-[#b85c00]": "#b85c00",
                  "text-[#5c5b5b]": "#5c5b5b",
                };
                return (
                  <button
                    key={rc.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, roleColor: rc.value }))}
                    title={rc.label}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      form.roleColor === rc.value
                        ? "border-[#2f2f2e] scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: dot[rc.value] }}
                  />
                );
              })}
            </div>
            {/* Preview */}
            <p className={`text-sm font-semibold mt-2 ${form.roleColor}`}>
              {form.role || "Vista previa del cargo"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full font-bold border-2 border-[#afadac]/30 text-[#5c5b5b] hover:bg-[#f3f0ef] transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white py-3 rounded-full font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
          >
            {isNew ? "Agregar" : "Guardar"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({
  memberName,
  onCancel,
  onConfirm,
}: {
  memberName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-[fadeInUp_0.2s_ease]">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-red-400 text-3xl">person_remove</span>
        </div>
        <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#2f2f2e] mb-2">
          ¿Eliminar miembro?
        </h3>
        <p className="text-sm text-[#5c5b5b] mb-6">
          Se eliminará a <strong>{memberName}</strong> del equipo. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-full font-bold border-2 border-[#afadac]/30 text-[#5c5b5b] hover:bg-[#f3f0ef] transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white py-3 rounded-full font-bold shadow hover:opacity-90 active:scale-95 transition-all"
          >
            Eliminar
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BusinessUserProfile() {
  const user    = getCurrentUser();
  const session = getSession();

  const [profile, setProfile] = useState<BusinessProfile>(() => {
    if (!session || !user)
      return buildDefaultProfile("", user ?? ({ name: "Business" } as StoredUser));
    return getBusinessProfile(session.email) ?? buildDefaultProfile(session.email, user);
  });

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    businessName: profile.businessName,
    category:     profile.category,
    about:        profile.about,
  });
  const [saveMsg, setSaveMsg] = useState<"saved" | "error" | null>(null);

  // ── Team modal state ──────────────────────────────────────────────────────
  const [teamModal, setTeamModal] = useState<{
    open: boolean;
    member: Partial<TeamMember> | null;
  }>({ open: false, member: null });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    member: TeamMember | null;
  }>({ open: false, member: null });

  const logoInputRef    = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!session || !user) {
    return (
      <div className="bg-[#f9f6f5] text-[#2f2f2e] min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-5xl text-[#787676]">store_off</span>
        <p className="text-[#5c5b5b] font-medium">No hay sesión activa.</p>
        <a
          href="/login"
          className="bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition-all"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  // ── Core helpers ──────────────────────────────────────────────────────────

  const persist = (updated: BusinessProfile) => {
    const stamped = { ...updated, updatedAt: new Date().toISOString() };
    saveBusinessProfile(stamped);
    setProfile(stamped);
  };

  const showToast = (type: "saved" | "error") => {
    setSaveMsg(type);
    setTimeout(() => setSaveMsg(null), 3000);
  };

  // ── Identity ──────────────────────────────────────────────────────────────

  const handleSave = () => {
    if (!editForm.businessName.trim()) { showToast("error"); return; }
    persist({
      ...profile,
      businessName: editForm.businessName.trim(),
      category: editForm.category,
      about: editForm.about.trim(),
    });
    syncUserName(session.email, editForm.businessName.trim());
    setEditing(false);
    showToast("saved");
  };

  const handleCancel = () => {
    setEditForm({
      businessName: profile.businessName,
      category: profile.category,
      about: profile.about,
    });
    setEditing(false);
    setSaveMsg(null);
  };

  // ── Logo ──────────────────────────────────────────────────────────────────

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => persist({ ...profile, logo: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Gallery ───────────────────────────────────────────────────────────────

  const handleGalleryAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (profile.gallery.length >= MAX_GALLERY) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      persist({ ...profile, gallery: [...profile.gallery, reader.result as string] });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleGalleryRemove = (idx: number) =>
    persist({ ...profile, gallery: profile.gallery.filter((_, i) => i !== idx) });

  // ── Availability ──────────────────────────────────────────────────────────

  const toggleDay = (i: number) =>
    persist({
      ...profile,
      days: profile.days.map((d, idx) => idx === i ? { ...d, enabled: !d.enabled } : d),
    });

  const updateTime = (i: number, field: "start" | "end", value: string) =>
    persist({
      ...profile,
      days: profile.days.map((d, idx) => idx === i ? { ...d, [field]: value } : d),
    });

  // ── Services ──────────────────────────────────────────────────────────────

  const handleDeleteService = (id: string) =>
    persist({ ...profile, services: profile.services.filter((s) => s.id !== id) });

  // ── Team CRUD ─────────────────────────────────────────────────────────────

  const openAddTeam = () => setTeamModal({ open: true, member: null });

  const openEditTeam = (m: TeamMember) => setTeamModal({ open: true, member: m });

  const closeTeamModal = () => setTeamModal({ open: false, member: null });

  const handleTeamSave = (m: TeamMember) => {
    const exists = profile.team.find((t) => t.id === m.id);
    const updatedTeam = exists
      ? profile.team.map((t) => (t.id === m.id ? m : t))
      : [...profile.team, m];
    persist({ ...profile, team: updatedTeam });
    closeTeamModal();
    showToast("saved");
  };

  const openDeleteTeam = (m: TeamMember) => {
    setDeleteModal({ open: true, member: m });
  };

  const confirmDeleteTeam = () => {
    if (!deleteModal.member) return;
    persist({ ...profile, team: profile.team.filter((t) => t.id !== deleteModal.member!.id) });
    setDeleteModal({ open: false, member: null });
  };

  // ── Logout ────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "/login";
  };

  const galleryFull = profile.gallery.length >= MAX_GALLERY;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] min-h-screen">
      <HeaderBusiness />

      {/* Modals */}
      {teamModal.open && (
        <TeamMemberModal
          member={teamModal.member}
          onClose={closeTeamModal}
          onSave={handleTeamSave}
        />
      )}
      {deleteModal.open && deleteModal.member && (
        <ConfirmDeleteModal
          memberName={deleteModal.member.name}
          onCancel={() => setDeleteModal({ open: false, member: null })}
          onConfirm={confirmDeleteTeam}
        />
      )}

      {/* Toast */}
      {saveMsg && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-xl text-sm font-bold transition-all ${
            saveMsg === "saved" ? "bg-[#22c55e] text-white" : "bg-[#ef4444] text-white"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {saveMsg === "saved" ? "check_circle" : "error"}
          </span>
          {saveMsg === "saved"
            ? "Cambios guardados correctamente"
            : "El nombre del negocio no puede estar vacío"}
        </div>
      )}

      <main className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto">

        {/* Page header */}
        <header className="mb-12 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#2f2f2e] mb-2 font-['Plus_Jakarta_Sans']">
              Edit Business Profile
            </h1>
            <p className="text-[#5c5b5b] text-lg">
              Manage your identity, services, and operational flow.
            </p>
            {profile.updatedAt && (
              <p className="text-xs text-[#787676] mt-1">
                Última actualización: {new Date(profile.updatedAt).toLocaleString("es-ES")}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-semibold text-[#5c5b5b] hover:text-[#ab2d00] transition-colors mt-2"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Cerrar sesión
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── Left Column ── */}
          <div className="lg:col-span-5 space-y-8">

            {/* Business Identity */}
            <section className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex flex-col items-center mb-8">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {profile.logo ? (
                    <img
                      className="w-32 h-32 rounded-full object-cover ring-4 ring-[#f3f0ef] transition-all group-hover:opacity-80"
                      src={profile.logo}
                      alt="Business logo"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full ring-4 ring-[#f3f0ef] bg-gradient-to-br from-[#ab2d00] to-[#ff7851] flex items-center justify-center transition-all group-hover:opacity-80">
                      <span className="material-symbols-outlined text-white text-5xl">storefront</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
                  </div>
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <h3 className="mt-4 font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#2f2f2e]">
                  Update Brand Identity
                </h3>
              </div>

              <div className="space-y-6">
                {editing ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#5c5b5b] mb-2">Business Name</label>
                      <input
                        className="w-full bg-[#f3f0ef] border-none rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff7851]/30 text-[#2f2f2e] font-medium"
                        type="text"
                        value={editForm.businessName}
                        onChange={(e) => setEditForm((p) => ({ ...p, businessName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#5c5b5b] mb-2">Primary Category</label>
                      <select
                        className="w-full bg-[#f3f0ef] border-none rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff7851]/30 text-[#2f2f2e] font-medium appearance-none"
                        value={editForm.category}
                        onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                      >
                        <option>Home Wellness &amp; Maintenance</option>
                        <option>Personal Care</option>
                        <option>Pet Services</option>
                        <option>Cleaning</option>
                        <option>Repairs &amp; Handyman</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#5c5b5b] mb-2">About the Business</label>
                      <textarea
                        className="w-full bg-[#f3f0ef] border-none rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#ff7851]/30 text-[#2f2f2e] font-medium resize-none"
                        rows={4}
                        value={editForm.about}
                        onChange={(e) => setEditForm((p) => ({ ...p, about: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleCancel}
                        className="flex-1 py-3 rounded-full font-bold border-2 border-[#afadac]/30 text-[#5c5b5b] hover:bg-[#e4e2e1] transition-all active:scale-95"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white py-3 rounded-full font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
                      >
                        Guardar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#ab2d00] text-base">storefront</span>
                        <span className="font-semibold text-[#2f2f2e]">{profile.businessName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#ab2d00] text-base">category</span>
                        <span className="text-[#5c5b5b]">{profile.category}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#ab2d00] text-base mt-0.5">info</span>
                        <span className="text-[#5c5b5b] leading-relaxed">{profile.about}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#ab2d00] text-base">mail</span>
                        <span className="text-[#787676] text-xs">{session.email}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditing(true)}
                      className="w-full mt-4 bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white py-3 rounded-full font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      Editar perfil
                    </button>
                  </>
                )}
              </div>
            </section>

            {/* Photo Gallery */}
            <section className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ab2d00]">photo_library</span>
                Photo Gallery
                <span className="ml-auto text-xs font-normal text-[#787676]">
                  {profile.gallery.length}/{MAX_GALLERY}
                </span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {profile.gallery.map((src, i) => (
                  <div key={i} className="aspect-square relative rounded-lg overflow-hidden group cursor-pointer">
                    <img className="object-cover w-full h-full" src={src} alt={`Gallery ${i + 1}`} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <button
                        onClick={() => handleGalleryRemove(i)}
                        className="material-symbols-outlined text-white hover:text-red-400 transition-colors"
                      >
                        delete
                      </button>
                    </div>
                  </div>
                ))}
                {!galleryFull && (
                  <div
                    className="aspect-square border-2 border-dashed border-[#afadac]/30 rounded-lg flex flex-col items-center justify-center text-[#5c5b5b] hover:bg-[#f3f0ef] transition-all cursor-pointer"
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <span className="material-symbols-outlined text-3xl mb-1">add</span>
                    <span className="text-xs font-semibold">Upload</span>
                    <span className="text-[10px] text-[#787676] mt-0.5">
                      {MAX_GALLERY - profile.gallery.length} restante{MAX_GALLERY - profile.gallery.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
              {galleryFull && (
                <p className="text-xs text-[#787676] mt-3 text-center">
                  Galería completa. Elimina una foto para agregar otra.
                </p>
              )}
              <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryAdd} />
            </section>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-7 space-y-8">

            {/* Service Management */}
            <section className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab2d00]">bolt</span>
                  Service Management
                </h3>
                <button className="bg-[#e4e2e1] text-[#2f2f2e] px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 active:scale-95 transition-all hover:bg-[#dfdcdc]">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Service
                </button>
              </div>
              <div className="space-y-3">
                {profile.services.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-4 bg-[#f3f0ef] rounded-xl group transition-all hover:bg-[#e4e2e1]"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${s.bgColor} rounded-lg flex items-center justify-center ${s.textColor}`}>
                        <span className="material-symbols-outlined">{s.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-[#2f2f2e]">{s.name}</p>
                        <p className="text-sm text-[#5c5b5b]">{s.duration} • {s.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteService(s.id)}
                      className="material-symbols-outlined text-[#5c5b5b] opacity-0 group-hover:opacity-100 hover:text-[#b31b25] transition-all"
                    >
                      delete
                    </button>
                  </div>
                ))}
                {profile.services.length === 0 && (
                  <p className="text-[#5c5b5b] text-sm italic text-center py-6">
                    No hay servicios. Agrega uno con el botón de arriba.
                  </p>
                )}
              </div>
            </section>

            {/* Weekly Availability */}
            <section className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ab2d00]">schedule</span>
                Weekly Availability
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {profile.days.map((day, i) => (
                  <div
                    key={day.name}
                    className={`grid grid-cols-12 items-center gap-4 p-4 rounded-xl transition-all ${
                      day.enabled ? "hover:bg-[#f3f0ef]" : "bg-[#f3f0ef]/50"
                    }`}
                  >
                    <div className="col-span-3 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={day.enabled}
                        onChange={() => toggleDay(i)}
                        className="w-5 h-5 rounded accent-[#ab2d00] cursor-pointer"
                      />
                      <span className={`font-bold ${day.enabled ? "text-[#2f2f2e]" : "text-[#5c5b5b]"}`}>
                        {day.name}
                      </span>
                    </div>
                    {day.enabled ? (
                      <>
                        <div className="col-span-4">
                          <input
                            type="time"
                            value={day.start}
                            onChange={(e) => updateTime(i, "start", e.target.value)}
                            className="w-full bg-[#f9f6f5] border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7851]/30"
                          />
                        </div>
                        <div className="col-span-1 text-center font-bold text-[#5c5b5b]">to</div>
                        <div className="col-span-4">
                          <input
                            type="time"
                            value={day.end}
                            onChange={(e) => updateTime(i, "end", e.target.value)}
                            className="w-full bg-[#f9f6f5] border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7851]/30"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="col-span-9 text-[#5c5b5b] italic text-sm text-right px-4">
                        Currently marked as unavailable
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* ── Team Management ── */}
            <section className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab2d00]">groups</span>
                  Team Management
                  <span className="ml-1 text-xs font-normal text-[#787676] bg-[#f3f0ef] px-2 py-0.5 rounded-full">
                    {profile.team.length}
                  </span>
                </h3>
                <button
                  onClick={openAddTeam}
                  className="text-[#ab2d00] font-bold text-sm flex items-center gap-1 hover:underline underline-offset-4 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  Agregar miembro
                </button>
              </div>

              {profile.team.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                  <div className="w-16 h-16 bg-[#f3f0ef] rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-[#afadac]">group_add</span>
                  </div>
                  <p className="text-[#5c5b5b] text-sm font-medium">No hay miembros en el equipo.</p>
                  <button
                    onClick={openAddTeam}
                    className="bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-6 py-2 rounded-full font-bold text-sm shadow hover:opacity-90 active:scale-95 transition-all"
                  >
                    Agregar el primero
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.team.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-4 p-4 border border-[#afadac]/10 rounded-2xl hover:bg-[#f3f0ef] transition-all group"
                    >
                      {/* Avatar */}
                      {m.avatar ? (
                        <img className="w-12 h-12 rounded-full object-cover flex-shrink-0" src={m.avatar} alt={m.name} />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e4e2e1] to-[#afadac] flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-white text-xl">person</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#2f2f2e] truncate">{m.name}</p>
                        <p className={`text-xs font-semibold ${m.roleColor} truncate`}>{m.role}</p>
                      </div>

                      {/* Actions — visible on hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => openEditTeam(m)}
                          title="Editar"
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e4e2e1] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[#5c5b5b] text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => openDeleteTeam(m)}
                          title="Eliminar"
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[#5c5b5b] hover:text-red-400 text-[18px] transition-colors">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-100 w-full py-12 px-8 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full max-w-[1440px] mx-auto">
          <div className="flex flex-col gap-2">
            <span className="font-['Plus_Jakarta_Sans'] font-bold text-zinc-900">{profile.businessName}</span>
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} Zylo Marketplace. Built for high-velocity service.
            </p>
          </div>
          <div className="flex gap-8">
            {["Privacy Policy", "Terms of Service", "Help Center", "API Documentation"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-zinc-500 hover:text-orange-600 transition-all duration-300 underline-offset-4 hover:underline"
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