// ── notifications.ts ────────────────────────────────────────────────────────
// Capa de datos para notificaciones, conectada al backend real
// (ver src/services/notificationsApi.ts).

import {
  listNotifications as apiListNotifications,
  createNotificationFromBusiness as apiCreateNotification,
  getUnreadCount as apiGetUnreadCount,
  markNotificationRead as apiMarkRead,
  type ApiNotification,
} from '../services/notificationsApi'

// ── Types ─────────────────────────────────────────────────────────────────────

export type NotificationType = 'new_message' | 'status_change' | 'appointment_reminder' | string

export interface ZyloNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  timestamp: string
  read: boolean
  userId: string   // recipient_user_id
  route?: string
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapApiNotification(api: ApiNotification): ZyloNotification {
  return {
    id: api.id,
    type: api.type,
    title: api.title,
    body: api.message,
    timestamp: api.created_at,
    read: api.read,
    userId: api.recipient_user_id,
    route: routeForType(api.type),
  }
}

function routeForType(type: string): string | undefined {
  if (type === 'new_message') return '/messages'
  if (type === 'status_change') return '/reservas'
  return undefined
}

// ── Public API ───────────────────────────────────────────────────────────────

/** GET /notifications — todas las notificaciones del usuario logueado */
export async function getNotificationsAsync(): Promise<ZyloNotification[]> {
  const items = await apiListNotifications()
  return items
    .map(mapApiNotification)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

/** GET /notifications/unread-count */
export async function getUnreadCountAsync(): Promise<number> {
  return apiGetUnreadCount()
}

/** PATCH /notifications/{id}/read */
export async function markAsReadAsync(id: string): Promise<void> {
  await apiMarkRead(id)
}

/**
 * POST /notifications — solo lo puede ejecutar una cuenta de negocio
 * (el backend valida el rol con get_current_business).
 */
export async function createNotificationAsync(
  recipientUserId: string,
  type: NotificationType,
  title: string,
  message: string
): Promise<ZyloNotification> {
  const created = await apiCreateNotification(recipientUserId, type, title, message)
  return mapApiNotification(created)
}

/** Llamar cuando el negocio responde un mensaje al usuario (crea notificación real en backend). */
export async function notifyNewMessage(
  recipientUserId: string,
  businessName: string,
  preview: string
): Promise<void> {
  const body = preview.length > 60 ? `${preview.slice(0, 57)}...` : preview
  await createNotificationAsync(
    recipientUserId,
    'new_message',
    `Nuevo mensaje de ${businessName}`,
    body
  )
}

/** Llamar cuando el negocio cambia el estado de una reserva (crea notificación real en backend). */
export async function notifyStatusChange(
  recipientUserId: string,
  service: string,
  businessName: string,
  newStatus: 'aceptado' | 'rechazado'
): Promise<void> {
  const accepted = newStatus === 'aceptado'
  await createNotificationAsync(
    recipientUserId,
    'status_change',
    accepted ? '¡Reserva confirmada!' : 'Reserva rechazada',
    accepted
      ? `Tu cita de ${service} en ${businessName} ha sido confirmada.`
      : `Tu cita de ${service} en ${businessName} fue rechazada.`
  )
}
