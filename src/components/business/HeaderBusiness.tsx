import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import NotificationBell from "../NotificationBell";
import { apiFetch } from "../../utils/api";

function getSessionEmail(): string {
  try {
    const s = JSON.parse(localStorage.getItem("zylo_session") || "null");
    return s?.email ?? "";
  } catch {
    return "";
  }
}

export default function HeaderBusiness() {
  const navigate = useNavigate();
  const [sessionEmail] = useState<string>(() => getSessionEmail());
  const [displayPhoto, setDisplayPhoto] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const data = await apiFetch("/businesses/me");
        if (active) {
          setDisplayPhoto(data.business?.image_url ?? null);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const navItems = [
    { label: "Dashboard", to: "/businessHome" },
    { label: "Mensajes", to: "/business-messages" },
  ];

  return (
    <header className="bg-[#f9f6f5] flex justify-between items-center px-6 py-4 w-full fixed top-0 z-50 shadow-[0_1px_0_rgba(47,47,46,0.06)]">
      <button
        onClick={() => navigate("/businessHome")}
        className="flex items-center gap-4"
      >
        <span className="font-headline font-extrabold text-2xl text-primary italic tracking-tight">
          Zylo
        </span>
      </button>
      <div className="flex items-center gap-4">
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

        {sessionEmail && <NotificationBell userId={sessionEmail} />}

        <button
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full bg-[#e4e2e1] overflow-hidden"
        >
          {displayPhoto ? (
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src={displayPhoto}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
              ?
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
