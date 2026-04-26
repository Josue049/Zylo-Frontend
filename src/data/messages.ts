// ── Types ──────────────────────────────────────────────────────────────────

export interface Message {
  id: string
  conversationId: string
  senderId: string    // email del remitente
  senderName: string
  text: string
  timestamp: string   // ISO string
  read: boolean
}

export interface Conversation {
  id: string
  userId: string       // email del usuario cliente
  userName: string
  userPhoto?: string
  businessId: string   // email del negocio (ej: serene@zylo.com)
  businessName: string
  businessCategory: string
  businessPhoto: string
  lastMessage: string
  lastTimestamp: string
  unreadCount: number        // no leídos para el USUARIO
  businessUnreadCount: number // no leídos para el NEGOCIO
}

// ── Storage keys ────────────────────────────────────────────────────────────

const CONVERSATIONS_KEY = 'zylo_conversations'
const MESSAGES_KEY      = 'zylo_messages'
const SESSION_KEY       = 'zylo_session'

// ── Session helpers ─────────────────────────────────────────────────────────

export function getSession(): { email: string; name: string; accountType?: string } | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') }
  catch { return null }
}

// ── Conversation CRUD ────────────────────────────────────────────────────────

export function getAllConversations(): Conversation[] {
  try { return JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || '[]') }
  catch { return [] }
}

export function saveAllConversations(conversations: Conversation[]): void {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
}

/** Conversaciones donde el usuario es el cliente */
export function getUserConversations(userEmail: string): Conversation[] {
  return getAllConversations().filter(
    c => c.userId.toLowerCase() === userEmail.toLowerCase()
  )
}

/** Conversaciones donde el negocio es el receptor (vista del dueño) */
export function getBusinessConversations(businessEmail: string): Conversation[] {
  return getAllConversations().filter(
    c => c.businessId.toLowerCase() === businessEmail.toLowerCase()
  )
}

/** Busca o crea una conversación entre usuario y negocio */
export function getOrCreateConversation(
  userId: string,
  userName: string,
  userPhoto: string | undefined,
  businessId: string,      // email del negocio
  businessName: string,
  businessCategory: string,
  businessPhoto: string
): Conversation {
  const all = getAllConversations()
  const existing = all.find(
    c =>
      c.userId.toLowerCase() === userId.toLowerCase() &&
      c.businessId.toLowerCase() === businessId.toLowerCase()
  )
  if (existing) return existing

  const newConv: Conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    userId,
    userName,
    userPhoto,
    businessId,
    businessName,
    businessCategory,
    businessPhoto,
    lastMessage: '',
    lastTimestamp: new Date().toISOString(),
    unreadCount: 0,
    businessUnreadCount: 0,
  }

  saveAllConversations([...all, newConv])
  return newConv
}

// ── Messages CRUD ────────────────────────────────────────────────────────────

export function getAllMessages(): Message[] {
  try { return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]') }
  catch { return [] }
}

export function getConversationMessages(conversationId: string): Message[] {
  return getAllMessages()
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

export function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string,
  senderType: 'user' | 'business' = 'user'
): Message {
  const msg: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    conversationId,
    senderId,
    senderName,
    text: text.trim(),
    timestamp: new Date().toISOString(),
    read: false,
  }

  const allMsgs = getAllMessages()
  localStorage.setItem(MESSAGES_KEY, JSON.stringify([...allMsgs, msg]))

  // Actualizar lastMessage + incrementar unread del lado contrario
  const convs = getAllConversations()
  const updated = convs.map(c => {
    if (c.id !== conversationId) return c
    return {
      ...c,
      lastMessage: text.trim(),
      lastTimestamp: msg.timestamp,
      // Si envía el usuario → sube businessUnreadCount; si envía el negocio → sube unreadCount
      unreadCount: senderType === 'business' ? c.unreadCount + 1 : c.unreadCount,
      businessUnreadCount: senderType === 'user' ? c.businessUnreadCount + 1 : c.businessUnreadCount,
    }
  })
  saveAllConversations(updated)

  return msg
}

/** Marcar como leídos los mensajes que NO envió el lector */
export function markConversationAsRead(
  conversationId: string,
  readerEmail: string,
  readerType: 'user' | 'business'
): void {
  const all = getAllMessages()
  const updated = all.map(m =>
    m.conversationId === conversationId && m.senderId !== readerEmail
      ? { ...m, read: true }
      : m
  )
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated))

  // Resetear el contador correspondiente
  const convs = getAllConversations().map(c => {
    if (c.id !== conversationId) return c
    return {
      ...c,
      unreadCount: readerType === 'user' ? 0 : c.unreadCount,
      businessUnreadCount: readerType === 'business' ? 0 : c.businessUnreadCount,
    }
  })
  saveAllConversations(convs)
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