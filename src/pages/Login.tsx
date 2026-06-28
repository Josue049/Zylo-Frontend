import { useState } from "react";
import HeaderClose from "../components/HeaderClose";

const API_URL = import.meta.env.VITE_API_URL;

type AccountType = "user" | "business";
type LoginError = "wrong_password" | "wrong_mode" | "not_found" | "server_error" | null;

export default function Login() {
  const [mode, setMode] = useState<AccountType>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<LoginError>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = () => setLoginError(null);

  const handleLogin = async () => {
    clearError();

    if (!email.trim() || !password.trim()) {
      setLoginError("not_found");
      return;
    }

    if (!API_URL) {
      setLoginError("server_error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          setLoginError("wrong_password");
          return;
        }

        setLoginError("server_error");
        return;
      }

      if (!data?.token || !data?.user) {
        setLoginError("server_error");
        return;
      }

      const accountType: AccountType =
        data.user.role === "business_owner" ? "business" : "user";

      if (accountType !== mode) {
        setLoginError("wrong_mode");
        return;
      }

      localStorage.setItem(
        "zylo_session",
        JSON.stringify({
          token: data.token,
          email: data.user.email,
          name: data.user.name,
          accountType,
          user: data.user,
        })
      );

      window.location.href = accountType === "business" ? "/BusinessHome" : "/home";
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setLoginError("server_error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <HeaderClose />

      <main className="flex-grow flex items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
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

          <div className="bg-[#ffffff] rounded-xl shadow-[0_20px_40px_rgba(47,47,46,0.06)] p-8 md:p-12 border border-[#afadac]/10">
            <div className="md:hidden text-center mb-6">
              <h2 className="font-headline text-3xl font-extrabold text-on-surface leading-tight">
                Bienvenido <span className="text-primary">a Casa.</span>
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Rápido, centrado en el humano y construido para ti.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col gap-3">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">
                  Iniciar sesión como
                </label>
                <div className="grid grid-cols-2 p-1.5 bg-[#f3f0ef] rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("user");
                      clearError();
                    }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-headline font-bold text-sm transition-all w-full ${
                      mode === "user"
                        ? "signature-gradient text-white shadow-md"
                        : "text-on-surface-variant hover:bg-[#e4e2e1]"
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      person
                    </span>
                    <span className="whitespace-nowrap">Modo Usuario</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("business");
                      clearError();
                    }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-headline font-bold text-sm transition-all w-full ${
                      mode === "business"
                        ? "signature-gradient text-white shadow-md"
                        : "text-on-surface-variant hover:bg-[#e4e2e1]"
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      storefront
                    </span>
                    <span className="whitespace-nowrap">Modo Empresa</span>
                  </button>
                </div>
              </div>

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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError();
                      }}
                      inputMode="email"
                      autoComplete="email"
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
                    <a
                      href="#"
                      className="text-right text-xs font-bold text-primary hover:opacity-70 transition-opacity"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearError();
                      }}
                      autoComplete="current-password"
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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

              {loginError && <LoginErrorBanner error={loginError} mode={mode} />}

              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full signature-gradient text-white font-headline font-bold py-5 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Entrando..." : "Entrar en Zylo"}
              </button>

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

function LoginErrorBanner({
  error,
  mode,
}: {
  error: NonNullable<LoginError>;
  mode: AccountType;
}) {
  const correctLabel = mode === "business" ? "Modo Usuario" : "Modo Empresa";

  const config: Record<
    NonNullable<LoginError>,
    { icon: string; title: string; body: React.ReactNode }
  > = {
    not_found: {
      icon: "person_off",
      title: "Datos incompletos",
      body: (
        <>
          Ingresa tu correo y contraseña para continuar.
        </>
      ),
    },
    wrong_password: {
      icon: "lock_reset",
      title: "Correo o contraseña incorrectos",
      body: (
        <>
          Verifica tus credenciales e inténtalo nuevamente.
        </>
      ),
    },
    wrong_mode: {
      icon: "swap_horiz",
      title: "Modo de sesión incorrecto",
      body: (
        <>
          Esta cuenta pertenece al otro tipo de acceso. Cambia a{" "}
          <span className="font-bold text-primary">{correctLabel}</span> para entrar.
        </>
      ),
    },
    server_error: {
      icon: "wifi_off",
      title: "No se pudo iniciar sesión",
      body: (
        <>
          Revisa que tu backend esté corriendo, que <span className="font-bold">VITE_API_URL</span> esté bien configurada y que CORS esté habilitado.
        </>
      ),
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