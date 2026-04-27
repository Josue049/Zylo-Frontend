import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import NotificationBell from "../NotificationBell";

// ─── Storage helpers (mirrors BusinessUserProfile) ────────────────────────────

function getSessionEmail(): string {
  try {
    const s = JSON.parse(localStorage.getItem("zylo_session") || "null");
    return s?.email ?? "";
  } catch {
    return "";
  }
}

function getBusinessLogo(email: string): string | null {
  if (!email) return null;
  try {
    const profiles = JSON.parse(
      localStorage.getItem("zylo_business_profiles") || "[]"
    ) as Array<{ email: string; logo?: string; businessName?: string }>;
    const profile = profiles.find(
      (p) => p.email.toLowerCase() === email.toLowerCase()
    );
    return profile?.logo ?? null;
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeaderBusiness() {
  const navigate = useNavigate();
  const [sessionEmail] = useState<string>(() => getSessionEmail());

  // Re-read logo on every render so it reflects changes made in BusinessUserProfile
  // without needing a global state manager. useState with a function arg only runs once,
  // so we read it directly on each render instead.
  const logo = getBusinessLogo(sessionEmail);

  const navItems = [
    { label: "Dashboard", to: "/businessHome" },
    { label: "Mensajes", to: "/business-messages" },
  ];

  return (
    <header className="bg-[#f9f6f5] flex justify-between items-center px-6 py-4 w-full fixed top-0 z-50 shadow-[0_1px_0_rgba(47,47,46,0.06)]">
      {/* Logo / brand */}
      <button
        onClick={() => navigate("/businessHome")}
        className="flex items-center gap-4"
      >
        <span className="font-headline font-extrabold text-2xl text-primary italic tracking-tight">
          Zylo
        </span>
      </button>

      <div className="flex items-center gap-4">
        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8 mr-8">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `font-semibold transition-opacity hover:opacity-80 ${
                  isActive ? "text-primary" : "text-[#2f2f2e]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Notifications */}
        {sessionEmail && <NotificationBell userId={sessionEmail} />}

        {/* Business avatar — shows logo if available, fallback icon otherwise */}
        <button
          onClick={() => navigate("/businessUserProfile")}
          className="w-10 h-10 rounded-full bg-[#e4e2e1] overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-transparent hover:ring-[#ab2d00]/30 transition-all"
          title="Perfil del negocio"
        >
          {logo ? (
            <img
              alt="Business logo"
              className="w-full h-full object-cover"
              src={logo}
            />
          ) : (
            <span
              className="material-symbols-outlined text-[#5c5b5b]"
              style={{ fontSize: 20 }}
            >
              storefront
            </span>
          )}
        </button>
      </div>
    </header>
  );
}