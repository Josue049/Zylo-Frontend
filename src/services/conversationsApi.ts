// ── Conversations API service ────────────────────────────────────────────────
// Endpoints reales del backend (ver /docs):
//   GET    /conversations
//   POST   /conversations
//   GET    /conversations/{conversation_id}/messages
//   POST   /conversations/{conversation_id}/messages
//   PATCH  /conversations/{conversation_id}/read

import { apiFetch } from './api'

export interface ApiMessage {
  id: string
  conversation_id: string
  sender_user_id: string
  content: string
  created_at: string
}

export interface ApiConversation {
  id: string
  user_id: string
  business_id: string
  subject: string | null
  last_read_at_client: string
  last_read_at_business: string
  created_at: string
  updated_at: string
  messages_count: number
  unread_count: number
  last_message: ApiMessage | null
}

/** GET /conversations */
export async function listConversations(): Promise<ApiConversation[]> {
  const data = await apiFetch<{ items: ApiConversation[] }>('/conversations')
  return data.items
}

/** POST /conversations */
export async function createOrOpenConversation(
  businessId: string,
  subject?: string
): Promise<ApiConversation> {
  const data = await apiFetch<{ conversation: ApiConversation }>('/conversations', {
    method: 'POST',
    body: JSON.stringify({ business_id: businessId, subject }),
  })
  return data.conversation
}

/** GET /conversations/{id}/messages */
export async function listMessages(conversationId: string): Promise<ApiMessage[]> {
  const data = await apiFetch<{ items: ApiMessage[] }>(
    `/conversations/${conversationId}/messages`
  )
  return data.items
}

/** POST /conversations/{id}/messages */
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<ApiMessage> {
  const data = await apiFetch<{ message: ApiMessage }>(
    `/conversations/${conversationId}/messages`,
    { method: 'POST', body: JSON.stringify({ content }) }
  )
  return data.message
}

/** PATCH /conversations/{id}/read */
export async function markConversationRead(conversationId: string): Promise<void> {
  await apiFetch(`/conversations/${conversationId}/read`, { method: 'PATCH' })
}
