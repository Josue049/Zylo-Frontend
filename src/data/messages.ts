import { apiFetch } from "../utils/api";

export interface Session {
  token: string;
  email: string;
  name: string;
  userId?: string;
  accountType?: "user" | "business";
  businessId?: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string | null;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  businessId: string;
  businessName: string;
  businessCategory: string;
  businessPhoto: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  businessUnreadCount: number;
}

const SESSION_KEY = "zylo_session";

export function getSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function mapMessage(raw: any): Message {
  return {
    id: raw.id,
    conversationId: raw.conversation_id ?? raw.conversationId,
    senderId: raw.sender_user_id ?? raw.senderId,
    senderName: raw.sender_name ?? raw.senderName ?? "Usuario",
    senderPhoto: raw.sender_photo ?? raw.senderPhoto ?? null,
    text: raw.text ?? raw.content ?? "",
    timestamp: raw.timestamp ?? raw.created_at,
    read: Boolean(raw.read ?? true),
  };
}

function mapConversation(raw: any): Conversation {
  const lastMessage = raw.last_message ? mapMessage(raw.last_message) : null;
  const businessCategory = raw.business_category_name ?? raw.business_category ?? raw.category_name ?? raw.subject ?? "";
  return {
    id: raw.id,
    userId: raw.user_id,
    userName: raw.user_name ?? "Cliente",
    userPhoto: raw.user_photo ?? null,
    businessId: raw.business_id,
    businessName: raw.business_name ?? "Negocio",
    businessCategory,
    businessPhoto: raw.business_photo ?? "https://placehold.co/96x96?text=Z",
    lastMessage: lastMessage?.text ?? raw.last_message?.content ?? raw.last_message?.text ?? "",
    lastTimestamp: lastMessage?.timestamp ?? raw.updated_at ?? raw.created_at,
    unreadCount: Number(raw.unread_count ?? 0),
    businessUnreadCount: Number(raw.unread_count ?? 0),
  };
}

export async function getUserConversations(): Promise<Conversation[]> {
  const data = await apiFetch("/conversations");
  return (data.items || []).map(mapConversation);
}

export async function getBusinessConversations(): Promise<Conversation[]> {
  const data = await apiFetch("/conversations");
  return (data.items || []).map(mapConversation);
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const data = await apiFetch(`/conversations/${conversationId}/messages`);
  return (data.items || []).map(mapMessage).sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export async function getOrCreateConversation(
  _userId: string,
  _userName: string,
  _userPhoto: string | undefined,
  businessId: string,
  _businessName: string,
  _businessCategory: string,
  _businessPhoto: string,
): Promise<Conversation> {
  const data = await apiFetch("/conversations", {
    method: "POST",
    body: JSON.stringify({ business_id: businessId }),
  });
  return mapConversation(data.conversation);
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string,
  senderType: "user" | "business" = "user",
): Promise<Message> {
  void senderId;
  void senderName;
  void senderType;
  const data = await apiFetch(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content: text.trim() }),
  });
  return mapMessage(data.message);
}

export async function markConversationAsRead(
  conversationId: string,
  readerEmail: string,
  readerType: "user" | "business",
): Promise<void> {
  void readerEmail;
  void readerType;
  await apiFetch(`/conversations/${conversationId}/read`, {
    method: "PATCH",
  });
}

export function formatMessageTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
}
