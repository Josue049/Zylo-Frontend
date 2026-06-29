import { useState, useEffect } from 'react'

const BASE_URL = 'https://backend-zylo.vercel.app'
const SESSION_KEY = 'zylo_session'

export interface CurrentUser {
  name: string
  email: string
  phone?: string
  account_type?: string
  accountType?: string
  created_at?: string
  createdAt?: string
  location?: string
  photo?: string
}

export interface Session {
  token: string
  email: string
  name: string
  accountType: 'user' | 'business'
}

export function getSession(): Session | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') }
  catch { return null }
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const session = getSession()

    if (!session?.token) {
      window.location.href = '/login'
      return
    }

    fetch(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem(SESSION_KEY)
          window.location.href = '/login'
          throw new Error('Token expirado')
        }
        if (!res.ok) throw new Error('Error del servidor')
        return res.json()
      })
      .then(data => setUser(data))
      .catch(err => {
        // Si el endpoint /auth/me no existe aún, usa los datos de sesión como fallback
        const session = getSession()
        if (session) {
          setUser({ name: session.name, email: session.email, accountType: session.accountType })
        } else {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const updateUserPhoto = (photo: string) => {
    setUser(prev => prev ? { ...prev, photo } : prev)
  }

  return { user, loading, error, updateUserPhoto }
}