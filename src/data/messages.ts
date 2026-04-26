// ── Types ──────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;   // email del remitente
  senderName: string;
  text: string;
  timestamp: string;  // ISO string
  read: boolean;
}

export interface Conversation {
  id: string;
  /** email del usuario */
  userId: string;
  userName: string;
  userPhoto?: string;
  /** id del negocio (usamos nombre como id por ahora) */
  businessId: string;
  businessName: string;
  businessCategory: string;
  businessPhoto: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

// ── Storage keys ────────────────────────────────────────────────────────────

const CONVERSATIONS_KEY = "zylo_conversations";
const MESSAGES_KEY = "zylo_messages";
const SESSION_KEY = "zylo_session";

// ── Session helpers ─────────────────────────────────────────────────────────

export function getSession(): { email: string; name: string } | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

// ── Conversation CRUD ────────────────────────────────────────────────────────

export function getAllConversations(): Conversation[] {
  try {
    return JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveAllConversations(conversations: Conversation[]): void {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

/** Devuelve las conversaciones del usuario en sesión */
export function getUserConversations(userEmail: string): Conversation[] {
  return getAllConversations().filter(
    (c) => c.userId.toLowerCase() === userEmail.toLowerCase()
  );
}

/** Busca o crea una conversación entre usuario y negocio */
export function getOrCreateConversation(
  userId: string,
  userName: string,
  userPhoto: string | undefined,
  businessId: string,
  businessName: string,
  businessCategory: string,
  businessPhoto: string
): Conversation {
  const all = getAllConversations();
  const existing = all.find(
    (c) =>
      c.userId.toLowerCase() === userId.toLowerCase() &&
      c.businessId === businessId
  );
  if (existing) return existing;

  const newConv: Conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    userId,
    userName,
    userPhoto,
    businessId,
    businessName,
    businessCategory,
    businessPhoto,
    lastMessage: "",
    lastTimestamp: new Date().toISOString(),
    unreadCount: 0,
  };

  saveAllConversations([...all, newConv]);
  return newConv;
}

// ── Messages CRUD ────────────────────────────────────────────────────────────

export function getAllMessages(): Message[] {
  try {
    return JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getConversationMessages(conversationId: string): Message[] {
  return getAllMessages()
    .filter((m) => m.conversationId === conversationId)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
}

export function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string
): Message {
  const msg: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    conversationId,
    senderId,
    senderName,
    text: text.trim(),
    timestamp: new Date().toISOString(),
    read: false,
  };

  const all = getAllMessages();
  localStorage.setItem(MESSAGES_KEY, JSON.stringify([...all, msg]));

  // Actualizar lastMessage en la conversación
  const convs = getAllConversations();
  const updated = convs.map((c) =>
    c.id === conversationId
      ? { ...c, lastMessage: text.trim(), lastTimestamp: msg.timestamp }
      : c
  );
  saveAllConversations(updated);

  return msg;
}

export function markConversationAsRead(
  conversationId: string,
  readerEmail: string
): void {
  // Marcar mensajes como leídos (los que NO envió el reader)
  const all = getAllMessages();
  const updated = all.map((m) =>
    m.conversationId === conversationId && m.senderId !== readerEmail
      ? { ...m, read: true }
      : m
  );
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));

  // Resetear unreadCount
  const convs = getAllConversations().map((c) =>
    c.id === conversationId ? { ...c, unreadCount: 0 } : c
  );
  saveAllConversations(convs);
}

// ── Time formatting ──────────────────────────────────────────────────────────

export function formatMessageTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Ayer";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { day: "2-digit", month: "short" });
  }
}

// ── Seed con auto-respuestas del negocio ──────────────────────────────────────

const autoReplies = [
  "¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte?",
  "Claro, con gusto te ayudamos. ¿Tienes alguna preferencia de horario?",
  "Entendido. Revisaré la disponibilidad y te confirmo pronto.",
  "¡Perfecto! Quedamos a tu disposición para cualquier consulta.",
  "Gracias por tu mensaje. Nuestro equipo te responderá en breve.",
];

export function simulateBusinessReply(
  conversationId: string,
  businessId: string,
  businessName: string
): void {
  const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
  setTimeout(() => {
    sendMessage(conversationId, businessId, businessName, reply);
  }, 1500 + Math.random() * 1000);
}