import { useState } from "react";
import HeaderClose from "../components/HeaderClose";

type AccountType = "user" | "business";

interface StoredUser {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  accountType: AccountType;
  createdAt: string;
}

// Mismo hash que en Register.tsx
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16);
}

const STORAGE_KEY = "zylo_users";

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function findUser(email: string, password: string): StoredUser | null {
  const hash = simpleHash(password);
  return (
    getStoredUsers().find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.passwordHash === hash
    ) ?? null
  );
}

function getUserByEmail(email: string): StoredUser | null {
  return (
    getStoredUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    ) ?? null
  );
}

type LoginError = "wrong_password" | "wrong_mode" | "not_found" | null;

export default function Login() {
  const [mode, setMode] = useState<AccountType>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<LoginError>(null);

  const clearError = () => setLoginError(null);

  const handleLogin = () => {
    setLoginError(null);

    if (!email.trim() || !password) {
      setLoginError("not_found");
      return;
    }

    const existingUser = getUserByEmail(email);

    // Correo no existe
    if (!existingUser) {
      setLoginError("not_found");
      return;
    }

    // Correo existe pero con distinto tipo de cuenta
    if (existingUser.accountType !== mode) {
      setLoginError("wrong_mode");
      return;
    }

    // Correo existe, modo correcto, pero contraseña incorrecta
    const matched = findUser(email, password);
    if (!matched) {
      setLoginError("wrong_password");
      return;
    }

    // Éxito
    localStorage.setItem(
      "zylo_session",
      JSON.stringify({
        email: matched.email,
        name: matched.name,
        accountType: matched.accountType,
      })
    );
    window.location.href = matched.accountType === "business" ? "/BusinessHome" : "/home";
  };

  // ── Formulario ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <HeaderClose />

      <main className="flex-grow flex items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Lado editorial izquierdo */}
          <div className="hidden md:block relative">
            <div className="space-y-6 relative z-10">
              <h1 className="font-headline text-7xl font-extrabold tracking-tight text-on-surface leading-none">
                Bienvenido <br />
                <span className="text-primary">a Casa.</span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
                Experimenta el núcleo de la eficiencia en el mercado de
                servicios. Rápido, centrado en el humano y construido para ti.
              </p>
              <div className="flex gap-4 mt-8">
                <div className="flex -space-x-3">
                  {[
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuCmjTTOqJ3BRX7IIWEkvXUvM71ZEOMADMqI_nj68b8bEvcfUBSjmem45kT-o6kMNf-13qWdqgWxm8v4vFbS_hq9r-QvtmOJVlNMM9AbwdySqbbHOmjJHz4FyOZKpbgS2ARm8tFxBAv5zgorAnBwM9anGwe3JgmJtyi9evGoo-7EwX-WSYr0haFXm1h6Vdl2hKzH68eUhHQKCH5k1nuJMForQfvdLYLuE-O4HLu6fp1vac33o2vRTm8zy35wdq2BmiEdRcyjqNFpJpUc",
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuC6FKR2JCMzxaiJpSOqIjuTneteVnA-I6suvlFS-VYMeJRKCrxmt5N0UkzCBbYf1lLXNsbEK3z8_eAlOWwoB2G4wWXJKcYjhgLEs-nKsnGGUFuweSneBS18qxkKa0js6AcSJ1hRqq1_oFqsVQ_rTLPqqPkTsvOpJX7MU8QIvepowaEzsEsUfiqWvamCrZZbQwG15PrslrZw8e7osmenOeglYBi8cg-Bs1wyfTsiujiYp7fbSykaTjUD8LLHVNFhfKJci7149PP5baDt",
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDTCTlCX4qOQsjaBYzJst5dk2SvUkQX564QHIp-9U7Zq4RmgC2XO1PCpeGw6HTin-HmgKQKOXqY8cA455Gv7ZBs6yv3famTUQISgcxZgfFAp4vTcFUjuWvFuTB3STBUXo9bYrgWTXTtCYOT14eTTXrTsufPks1-rGvDhVZpAPJAI_wUdVSSl5qA7XE3Ewz4rnxihhbBMbawxbcof4pE3ISqqBSRkzpg8JICUllanfOJlOCl7Kerb-_jH-TDJN6sgUOPxdU34IndiO8a",
                  ].map((src, i) => (
                    <img
                      key={i}
                      className="w-12 h-12 rounded-full border-4 border-surface object-cover"
                      src={src}
                      alt={`usuario-${i}`}
                    />
                  ))}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Más de 2.4k activos hoy
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 right-0 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Formulario de inicio de sesión */}
          <div className="bg-[#ffffff] rounded-xl shadow-[0_20px_40px_rgba(47,47,46,0.06)] p-8 md:p-12 border border-[#afadac]/10">

            {/* Encabezado móvil */}
            <div className="md:hidden text-center mb-6">
              <h2 className="font-headline text-3xl font-extrabold text-on-surface leading-tight">
                Bienvenido <span className="text-primary">a Casa.</span>
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Rápido, centrado en el humano y construido para ti.
              </p>
            </div>

            <div className="space-y-8">

              {/* Selector de modo */}
              <div className="flex flex-col gap-3">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">
                  Iniciar sesión como
                </label>
                <div className="grid grid-cols-2 p-1.5 bg-[#f3f0ef] rounded-2xl">
                  <button
                    onClick={() => { setMode("user"); clearError(); }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-headline font-bold text-sm transition-all w-full ${
                      mode === "user"
                        ? "signature-gradient text-white shadow-md"
                        : "text-on-surface-variant hover:bg-[#e4e2e1]"
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
                    <span className="whitespace-nowrap">Modo Usuario</span>
                  </button>
                  <button
                    onClick={() => { setMode("business"); clearError(); }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-headline font-bold text-sm transition-all w-full ${
                      mode === "business"
                        ? "signature-gradient text-white shadow-md"
                        : "text-on-surface-variant hover:bg-[#e4e2e1]"
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>storefront</span>
                    <span className="whitespace-nowrap">Modo Empresa</span>
                  </button>
                </div>
              </div>

              {/* Entradas de datos */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label text-sm font-semibold text-on-surface px-1">
                    Correo Electrónico
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      placeholder="hola@zylo.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearError(); }}
                      inputMode="email"
                      autoComplete="email"
                      className={`w-full bg-[#f3f0ef] border-none rounded-full px-6 py-4 text-on-surface placeholder:text-outline focus:ring-2 transition-all outline-none text-base ${
                        loginError === "not_found" || loginError === "wrong_mode"
                          ? "ring-2 ring-red-300 focus:ring-red-300"
                          : "focus:ring-[#ff785133]"
                      }`}
                    />
                    <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      alternate_email
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="font-label text-sm font-semibold text-on-surface">
                      Contraseña
                    </label>
                    <a href="#" className="text-right text-xs font-bold text-primary hover:opacity-70 transition-opacity">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearError(); }}
                      autoComplete="current-password"
                      className={`w-full bg-[#f3f0ef] border-none rounded-full px-6 py-4 text-on-surface placeholder:text-outline focus:ring-2 transition-all outline-none text-base ${
                        loginError === "wrong_password"
                          ? "ring-2 ring-red-300 focus:ring-red-300"
                          : "focus:ring-[#ff785133]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "lock"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Banner de error */}
              {loginError && <LoginErrorBanner error={loginError} mode={mode} email={email} />}

              {/* Botón de acción */}
              <button
                onClick={handleLogin}
                className="w-full signature-gradient text-white font-headline font-bold py-5 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all duration-200"
              >
                Entrar en Zylo
              </button>

              {/* Divisor */}
              <div className="relative flex items-center justify-center py-2">
                <div className="w-full h-px bg-[#e4e2e1]" />
                <span className="absolute bg-[#ffffff] px-4 text-xs font-bold text-[#afadac] uppercase tracking-widest">
                  o continuar con
                </span>
              </div>

              {/* Redes sociales */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-3 bg-[#f3f0ef] hover:bg-[#e4e2e1] transition-all py-4 rounded-full font-label font-semibold text-on-surface">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
                <button className="flex items-center justify-center gap-3 bg-[#f3f0ef] hover:bg-[#e4e2e1] transition-all py-4 rounded-full font-label font-semibold text-on-surface">
                  <img src="imgs/apple-logo.svg" alt="Apple" className="w-5 h-5 object-contain" />
                  Apple
                </button>
              </div>

              {/* Enlace de registro */}
              <div className="text-center">
                <p className="text-sm font-label text-on-surface-variant">
                  ¿No tienes una cuenta?{" "}
                  <a href="/register" className="text-primary font-bold hover:underline transition-all">
                    Regístrate
                  </a>
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 text-center text-xs font-label text-outline uppercase tracking-[0.2em]">
        © 2026 Zylo. Todos los derechos reservados.
      </footer>
    </div>
  );
}

/* ── Banner de error ── */
function LoginErrorBanner({
  error,
  mode,
  email,
}: {
  error: NonNullable<LoginError>;
  mode: AccountType;
  email: string;
}) {
  const existingUser =
    error === "wrong_mode"
      ? (() => {
          try {
            const users: StoredUser[] = JSON.parse(
              localStorage.getItem("zylo_users") || "[]"
            );
            return users.find(
              (u) => u.email.toLowerCase() === email.toLowerCase()
            ) ?? null;
          } catch {
            return null;
          }
        })()
      : null;

  const config: Record<
    NonNullable<LoginError>,
    { icon: string; title: string; body: React.ReactNode }
  > = {
    not_found: {
      icon: "person_off",
      title: "Cuenta no encontrada",
      body: (
        <>
          No existe ninguna cuenta registrada con este correo.{" "}
          <a href="/register" className="font-bold text-primary hover:underline">
            Créala aquí
          </a>
          .
        </>
      ),
    },
    wrong_password: {
      icon: "lock_reset",
      title: "Contraseña incorrecta",
      body: (
        <>
          La contraseña no coincide con la registrada.{" "}
          <a href="#" className="font-bold text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </>
      ),
    },
    wrong_mode: {
      icon: "swap_horiz",
      title: "Modo de sesión incorrecto",
      body: (() => {
        const registeredAs = existingUser?.accountType === "business" ? "empresa" : "usuario";
        const registeredIcon = existingUser?.accountType === "business" ? "storefront" : "person";
        const tryingAs = mode === "business" ? "empresa" : "usuario";
        const correctMode = existingUser?.accountType ?? (mode === "business" ? "user" : "business");
        const correctLabel = correctMode === "business" ? "Modo Empresa" : "Modo Usuario";
        return (
          <>
            Este correo está registrado como{" "}
            <span className="inline-flex items-center gap-1 font-bold text-on-surface">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                {registeredIcon}
              </span>
              {registeredAs}
            </span>
            , no como <span className="font-bold text-on-surface">{tryingAs}</span>.
            Cambia a{" "}
            <span className="font-bold text-primary">{correctLabel}</span> para entrar.
          </>
        );
      })(),
    },
  };

  const { icon, title, body } = config[error];

  return (
    <div className="rounded-2xl border border-[#ff785133] bg-[#fff5f2] p-4 flex gap-3">
      <span
        className="material-symbols-outlined text-primary mt-0.5 flex-shrink-0"
        style={{ fontSize: 20 }}
      >
        {icon}
      </span>
      <div className="space-y-1">
        <p className="text-sm font-bold text-on-surface">{title}</p>
        <p className="text-xs text-on-surface-variant leading-relaxed">{body}</p>
      </div>
    </div>
  );
}