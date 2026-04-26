import { useState, useEffect } from "react";

/* ── Types ── */
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

/* ── Storage helpers ── */
const USERS_KEY = "zylo_users";
const SESSION_KEY = "zylo_session";

function getSession(): { email: string; name: string } | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function getAllUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function getCurrentUser(): StoredUser | null {
  const session = getSession();
  if (!session) return null;
  return (
    getAllUsers().find(
      (u) => u.email.toLowerCase() === session.email.toLowerCase(),
    ) ?? null
  );
}

/* ── Component ── */
export default function HeaderBusiness() {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
  }, []);

  const displayPhoto = user?.photo ?? null;

  return (
    <header className="bg-[#f9f6f5] flex justify-between items-center px-6 py-4 w-full sticky top-0 z-50 shadow-[0_1px_0_rgba(47,47,46,0.06)]">
      <div className="flex items-center gap-3">
        <a href="/home">
          <h1 className="font-headline font-extrabold tracking-tight text-2xl text-primary italic">
            Zylo
          </h1>
        </a>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex gap-6 items-center mr-4">
          <span className="text-primary font-semibold cursor-pointer">
            Explorar
          </span>
          <span className="text-[#2f2f2e] hover:opacity-80 transition-opacity cursor-pointer">
            Reservas
          </span>
          <span className="text-[#2f2f2e] hover:opacity-80 transition-opacity cursor-pointer">
            Favoritos
          </span>
          <a href="/messages" className="text-[#2f2f2e] hover:opacity-80 transition-opacity cursor-pointer">
            Mensajes
          </a>
        </div>

        <div className="w-10 h-10 rounded-full bg-[#e4e2e1] overflow-hidden cursor-pointer active:scale-95 transition-transform">
          <a href="/profile">
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
          </a>
        </div>
      </div>
    </header>
  );
}
