/**
 * seedBusinessUsers.ts
 * Se llama una sola vez al iniciar la app (desde main.tsx).
 * Por cada negocio en businesses[], crea un usuario de tipo "business"
 * en zylo_users si aún no existe — usando el mismo hash que Login/Register.
 */
import { businesses } from './businesses'

const USERS_KEY = 'zylo_users'
const SEED_KEY  = 'zylo_businesses_seeded_v1' // cambiar versión si se actualiza la lista

interface StoredUser {
  name: string
  email: string
  phone: string
  passwordHash: string
  accountType: 'user' | 'business'
  createdAt: string
  businessId?: number   // referencia al id en businesses[]
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return hash.toString(16)
}

function getStoredUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') }
  catch { return [] }
}

export function seedBusinessUsers(): void {
  // Si ya sembramos esta versión, no repetir
  if (localStorage.getItem(SEED_KEY) === 'true') return

  const existing = getStoredUsers()
  const toAdd: StoredUser[] = []

  for (const biz of businesses) {
    const alreadyExists = existing.some(
      u => u.email.toLowerCase() === biz.email.toLowerCase()
    )
    if (!alreadyExists) {
      toAdd.push({
        name: biz.name,
        email: biz.email,
        phone: '',
        passwordHash: simpleHash(biz.password),
        accountType: 'business',
        createdAt: new Date().toISOString(),
        businessId: biz.id,
      })
    }
  }

  if (toAdd.length > 0) {
    localStorage.setItem(USERS_KEY, JSON.stringify([...existing, ...toAdd]))
  }

  localStorage.setItem(SEED_KEY, 'true')
}