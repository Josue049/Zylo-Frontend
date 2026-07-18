// ── Types ──────────────────────────────────────────────────────────────────

export type NotificationType = 'new_message' | 'status_change' | 'appointment_reminder'

export interface ZyloNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  timestamp: string   // ISO string
  read: boolean
  userId: string      // email del destinatario
  route?: string      // ruta a la que navegar al hacer click
  metadata?: Record<string, string | number>
}

// ── Storage key ─────────────────────────────────────────────────────────────

const NOTIFICATIONS_KEY = 'zylo_notifications'

// ── Helpers ─────────────────────────────────────────────────────────────────

function loadAll(): ZyloNotification[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveAll(notifications: ZyloNotification[]) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
}

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Crea y guarda una nueva notificación. */
export function createNotification(
  payload: Omit<ZyloNotification, 'id' | 'timestamp' | 'read'>
): ZyloNotification {
  const notification: ZyloNotification = {
    ...payload,
    id: generateId(),
    timestamp: new Date().toISOString(),
    read: false,
  }
  const all = loadAll()
  saveAll([notification, ...all])
  return notification
}

/** Devuelve todas las notificaciones de un usuario, ordenadas por fecha desc. */
export function getNotifications(userId: string): ZyloNotification[] {
  return loadAll()
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

/** Cuenta las no leídas de un usuario. */
export function getUnreadCount(userId: string): number {
  return loadAll().filter(n => n.userId === userId && !n.read).length
}

/** Marca una notificación como leída. */
export function markAsRead(id: string) {
  const all = loadAll().map(n => n.id === id ? { ...n, read: true } : n)
  saveAll(all)
}

/** Marca todas las notificaciones de un usuario como leídas. */
export function markAllAsRead(userId: string) {
  const all = loadAll().map(n => n.userId === userId ? { ...n, read: true } : n)
  saveAll(all)
}

/** Elimina una notificación. */
export function deleteNotification(id: string) {
  saveAll(loadAll().filter(n => n.id !== id))
}

// ── Generadores de alertas específicas ──────────────────────────────────────

/** Llamar cuando el negocio responde un mensaje al usuario. */
export function notifyNewMessage(
  userId: string,
  businessName: string,
  preview: string,
  conversationId: string,
) {
  createNotification({
    type: 'new_message',
    title: `Nuevo mensaje de ${businessName}`,
    body: preview.length > 60 ? `${preview.slice(0, 57)}...` : preview,
    userId,
    route: `/messages?conv=${conversationId}`,
    metadata: { conversationId },
  })
}

/** Llamar cuando el negocio cambia el estado de una reserva. */
export function notifyStatusChange(
  userId: string,
  service: string,
  businessName: string,
  newStatus: 'aceptado' | 'rechazado',
) {
  const accepted = newStatus === 'aceptado'
  createNotification({
    type: 'status_change',
    title: accepted ? '¡Reserva confirmada!' : 'Reserva rechazada',
    body: accepted
      ? `Tu cita de ${service} en ${businessName} ha sido confirmada.`
      : `Tu cita de ${service} en ${businessName} fue rechazada.`,
    userId,
    route: '/reservas',
    metadata: { service, businessName, newStatus },
  })
}

/** Llamar al crear una reserva para programar un recordatorio 24h antes. */
export function scheduleAppointmentReminder(
  userId: string,
  service: string,
  businessName: string,
  appointmentDate: string,   // "YYYY-MM-DD"
  appointmentTime: string,   // "HH:MM"
  appointmentId: number,
) {
  // Guardamos meta para que el polling lo active en el momento correcto
  createNotification({
    type: 'appointment_reminder',
    title: '⏰ Recordatorio de cita',
    body: `Mañana tienes ${service} en ${businessName} a las ${appointmentTime}.`,
    userId,
    route: '/reservas',
    // timestamp se sobreescribirá al "activar" — guardamos la fecha real en metadata
    metadata: {
      appointmentId,
      appointmentDate,
      appointmentTime,
      service,
      businessName,
      reminderAt: buildReminderTimestamp(appointmentDate, appointmentTime),
    },
  })
}

/** Activa recordatorios pendientes cuyo tiempo ya llegó (llamar en polling). */
export function activateDueReminders(userId: string) {
  const now = Date.now()
  const all = loadAll()
  let changed = false

  const updated = all.map(n => {
    if (
      n.userId !== userId ||
      n.type !== 'appointment_reminder' ||
      n.read
    ) return n

    const reminderAt = Number(n.metadata?.reminderAt ?? 0)
    // Si el momento de recordatorio ya pasó y la notif fue creada "en el futuro" (timestamp > now al crearla)
    if (reminderAt > 0 && reminderAt <= now) {
      changed = true
      // La "activamos" poniéndole timestamp actual para que aparezca
      return { ...n, timestamp: new Date().toISOString(), metadata: { ...n.metadata, reminderAt: 0 } }
    }
    return n
  })

  if (changed) saveAll(updated)
}

/** Devuelve notificaciones visibles (reminders activos + las demás). */
export function getVisibleNotifications(userId: string): ZyloNotification[] {
  const now = Date.now()
  return loadAll()
    .filter(n => {
      if (n.userId !== userId) return false
      if (n.type === 'appointment_reminder') {
        const reminderAt = Number(n.metadata?.reminderAt ?? 0)
        return reminderAt === 0 || reminderAt <= now
      }
      return true
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function getVisibleUnreadCount(userId: string): number {
  return getVisibleNotifications(userId).filter(n => !n.read).length
}

// ── Helpers internos ─────────────────────────────────────────────────────────

function buildReminderTimestamp(date: string, time: string): number {
  try {
    const [year, month, day] = date.split('-').map(Number)
    const [hour, minute] = time.replace(/[ap]m/i, '').split(':').map(Number)
    const appointmentMs = new Date(year, month - 1, day, hour, minute).getTime()
    return appointmentMs - 24 * 60 * 60 * 1000 // 24h antes
  } catch {
    return 0
  }
}