// ── Base API client ──────────────────────────────────────────────────────────

export const API_URL = import.meta.env.VITE_API_URL as string

/** Lee el token guardado en zylo_session.token al hacer login/registro */
export function getAuthToken(): string | null {
  try {
    const session = JSON.parse(localStorage.getItem('zylo_session') || 'null')
    return session?.token ?? null
  } catch {
    return null
  }
}

/** Fetch autenticado contra el backend de Zylo */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error('VITE_API_URL no está configurada. Revisa tu archivo .env.')
  }

  const token = getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(
      errorBody?.detail ?? `Error ${response.status}: ${response.statusText}`
    )
  }

  // Algunos endpoints (204) no devuelven body
  const text = await response.text()
  return (text ? JSON.parse(text) : null) as T
}
