// ── Notifications API service ────────────────────────────────────────────────
// Endpoints reales del backend (ver /docs):
//   GET    /notifications
//   POST   /notifications                 (solo cuentas de negocio)
//   GET    /notifications/unread-count
//   PATCH  /notifications/{notification_id}/read

import { apiFetch } from './api'

export interface ApiNotification {
  id: string
  recipient_user_id: string
  type: string
  title: string
  message: string
  read: boolean
  read_at: string | null
  created_at: string
}

/** GET /notifications */
export async function listNotifications(): Promise<ApiNotification[]> {
  const data = await apiFetch<{ items: ApiNotification[] }>('/notifications')
  return data.items
}

/** POST /notifications — solo lo puede llamar una cuenta de negocio */
export async function createNotificationFromBusiness(
  recipientUserId: string,
  type: string,
  title: string,
  message: string
): Promise<ApiNotification> {
  const data = await apiFetch<{ notification: ApiNotification }>('/notifications', {
    method: 'POST',
    body: JSON.stringify({
      recipient_user_id: recipientUserId,
      type,
      title,
      message,
    }),
  })
  return data.notification
}

/** GET /notifications/unread-count */
export async function getUnreadCount(): Promise<number> {
  const data = await apiFetch<{ count: number }>('/notifications/unread-count')
  return data.count
}

/** PATCH /notifications/{id}/read */
export async function markNotificationRead(notificationId: string): Promise<ApiNotification> {
  const data = await apiFetch<{ notification: ApiNotification }>(
    `/notifications/${notificationId}/read`,
    { method: 'PATCH' }
  )
  return data.notification
}
