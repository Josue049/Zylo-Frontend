// utils/api.ts
export async function apiFetch(path: string, options = {}) {
  const session = JSON.parse(localStorage.getItem("zylo_session") || "null");
  
  const res = await fetch(`https://backend-zylo.vercel.app${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.token}`,
      ...(options as any).headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("zylo_session");
    window.location.href = "/login";
    throw new Error("Sesión expirada");
  }

  return res.json();
}