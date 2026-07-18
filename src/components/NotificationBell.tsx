import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getVisibleNotifications,
  getVisibleUnreadCount,
  markAsRead,
  markAllAsRead,
  activateDueReminders,
  type ZyloNotification,
} from '../data/notifications'

const POLL_INTERVAL = 5000 // 5 segundos

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'ahora mismo'
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
}

function iconForType(type: ZyloNotification['type']) {
  if (type === 'new_message') return 'chat_bubble'
  if (type === 'status_change') return 'event_available'
  return 'notifications_active'
}

function colorForType(type: ZyloNotification['type']) {
  if (type === 'new_message') return 'bg-blue-100 text-blue-600'
  if (type === 'status_change') return 'bg-green-100 text-green-600'
  return 'bg-orange-100 text-orange-500'
}

interface Props {
  userId: string
}

export default function NotificationBell({ userId }: Props) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<ZyloNotification[]>([])
  const [unread, setUnread] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const refresh = useCallback(() => {
    if (!userId) return
    activateDueReminders(userId)
    setNotifications(getVisibleNotifications(userId))
    setUnread(getVisibleUnreadCount(userId))
  }, [userId])

  // Polling
  useEffect(() => {
    refresh()
    const id = setInterval(refresh, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [refresh])

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleNotificationClick(n: ZyloNotification) {
    markAsRead(n.id)
    refresh()
    setOpen(false)
    if (n.route) navigate(n.route)
  }

  function handleMarkAllRead() {
    markAllAsRead(userId)
    refresh()
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Campana */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f3f0ef] transition-colors active:scale-95"
        aria-label="Notificaciones"
      >
        <span className="material-symbols-outlined text-[#2f2f2e] text-[22px]">
          notifications
        </span>
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#d5521b] text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Panel dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-[0_8px_40px_rgba(47,47,46,0.15)] border border-[#e4e2e1] z-50 overflow-hidden">
          {/* Header del panel */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f3f0ef]">
            <h3 className="font-bold text-sm text-[#2f2f2e]">Notificaciones</h3>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#d5521b] font-semibold hover:underline"
              >
                Marcar todo como leído
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-[#f3f0ef]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                <span className="material-symbols-outlined text-[#d7d2cf] text-4xl mb-2">
                  notifications_none
                </span>
                <p className="text-sm text-[#7a7877]">No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#f9f6f5] ${
                    !n.read ? 'bg-[#fff8f6]' : ''
                  }`}
                >
                  {/* Ícono */}
                  <span
                    className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorForType(n.type)}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {iconForType(n.type)}
                    </span>
                  </span>

                  {/* Texto */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-[#2f2f2e]' : 'text-[#2f2f2e]'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-[#7a7877] mt-0.5 leading-snug">{n.body}</p>
                    <p className="text-[11px] text-[#b0aaa8] mt-1">{timeAgo(n.timestamp)}</p>
                  </div>

                  {/* Punto de no leído */}
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#d5521b] mt-1.5 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
