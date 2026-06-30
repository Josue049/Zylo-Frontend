// ── messages.ts ──────────────────────────────────────────────────────────────
// Capa de datos para conversaciones y mensajes, conectada al backend real
// (ver src/services/conversationsApi.ts). Mantiene nombres compatibles con
// el resto de la app para minimizar cambios en las páginas.

import {
  listConversations as apiListConversations,
  createOrOpenConversation as apiCreateOrOpen,
  listMessages as apiListMessages,
  sendMessage as apiSendMessage,
  markConversationRead as apiMarkRead,
  type ApiConversation,
  type ApiMessage,
} from '../services/conversationsApi'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Message {
  id: string
  conversationId: string
  senderId: string    // id del usuario remitente (backend)
  senderName: string
  text: string
  timestamp: string   // ISO string
  read: boolean
}

export interface Conversation {
  id: string
  userId: string
  userName: string
  userPhoto?: string
  businessId: string
  businessName: string
  businessCategory: string
  businessPhoto: string
  lastMessage: string
  lastTimestamp: string
  unreadCount: number          // no leídos para quien consulta (calculado por backend)
  businessUnreadCount: number  // alias del mismo valor (compat con UI existente)
}

// ── Session helper ───────────────────────────────────────────────────────────

export interface ZyloSession {
  token: string
  email: string
  name: string
  accountType?: 'user' | 'business'
  user?: {
    id: string
    name: string
    email: string
    role: string
    business_id?: string | null
  }
}

export function getSession(): ZyloSession | null {
  try {
    return JSON.parse(localStorage.getItem('zylo_session') || 'null')
  } catch {
    return null
  }
}

// ── Mappers backend → frontend ───────────────────────────────────────────────

function mapApiConversation(api: ApiConversation): Conversation {
  return {
    id: api.id,
    userId: api.user_id,
    userName: 'Cliente',
    userPhoto: undefined,
    businessId: api.business_id,
    businessName: api.subject ?? 'Negocio',
    businessCategory: '',
    businessPhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(api.business_id)}&background=ab2d00&color=fff`,
    lastMessage: api.last_message?.content ?? '',
    lastTimestamp: api.updated_at ?? api.created_at,
    unreadCount: api.unread_count,
    businessUnreadCount: api.unread_count,
  }
}

function mapApiMessage(api: ApiMessage): Message {
  return {
    id: api.id,
    conversationId: api.conversation_id,
    senderId: api.sender_user_id,
    senderName: api.sender_user_id,
    text: api.content,
    timestamp: api.created_at,
    read: true,
  }
}

// ── Conversations ─────────────────────────────────────────────────────────────

/** Lista las conversaciones del usuario logueado (cliente o negocio, según el rol) */
export async function getConversations(): Promise<Conversation[]> {
  const items = await apiListConversations()
  return items.map(mapApiConversation)
}

// Alias para mantener compatibilidad con páginas existentes
export const getUserConversationsAsync = getConversations
export const getBusinessConversationsAsync = getConversations

/** Crea o abre una conversación con un negocio (solo cuentas de cliente) */
export async function getOrCreateConversationAsync(
  businessId: string,
  subject?: string
): Promise<Conversation> {
  const conv = await apiCreateOrOpen(businessId, subject)
  return mapApiConversation(conv)
}

// ── Mensajes ─────────────────────────────────────────────────────────────────

export async function getConversationMessagesAsync(conversationId: string): Promise<Message[]> {
  const items = await apiListMessages(conversationId)
  return items.map(mapApiMessage)
}

export async function sendMessageAsync(conversationId: string, content: string): Promise<Message> {
  const msg = await apiSendMessage(conversationId, content)
  return mapApiMessage(msg)
}

export async function markConversationAsReadAsync(conversationId: string): Promise<void> {
  await apiMarkRead(conversationId)
}

// ── Time formatting ──────────────────────────────────────────────────────────

export function formatMessageTime(isoString: string): string {
  const date = new Date(isoString)
  const now  = new Date()
  const diffMs   = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0)  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1)  return 'Ayer'
  if (diffDays < 7)    return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString([], { day: '2-digit', month: 'short' })
}
