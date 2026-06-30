import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import HeaderBusiness from '../../components/business/HeaderBusiness'
import {
  getSession,
  getBusinessConversationsAsync,
  getConversationMessagesAsync,
  sendMessageAsync,
  markConversationAsReadAsync,
  formatMessageTime,
  type Conversation,
  type Message,
} from '../../data/messages'
import { notifyNewMessage } from '../../data/notifications'

export default function BusinessMessagesPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const session = getSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(searchParams.get('conv'))
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isMobileChat, setIsMobileChat] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!session || session.accountType !== 'business') navigate('/login')
  }, [])

  const loadConversations = useCallback(async () => {
    if (!session) return
    try {
      const convs = await getBusinessConversationsAsync()
      convs.sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime())
      setConversations(convs)
    } catch (e) {
      console.error('Error cargando conversaciones', e)
    }
  }, [])

  useEffect(() => {
    loadConversations().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const convId = searchParams.get('conv')
    if (convId) { setActiveConvId(convId); setIsMobileChat(true) }
  }, [searchParams])

  const loadMessages = useCallback(async (convId: string) => {
    if (!session) return
    try {
      await markConversationAsReadAsync(convId)
      const msgs = await getConversationMessagesAsync(convId)
      setMessages(msgs)
      loadConversations()
    } catch (e) {
      console.error('Error cargando mensajes', e)
    }
  }, [])

  useEffect(() => {
    if (!activeConvId) return
    loadMessages(activeConvId)
  }, [activeConvId])

  // Polling para detectar mensajes nuevos del cliente
  useEffect(() => {
    const interval = setInterval(async () => {
      if (activeConvId) {
        try {
          const fresh = await getConversationMessagesAsync(activeConvId)
          if (fresh.length !== messages.length) {
            setMessages(fresh)
            loadConversations()
          }
        } catch {}
      } else {
        loadConversations()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [activeConvId, messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const activeConv = conversations.find(c => c.id === activeConvId) ?? null

  const handleSend = async () => {
    if (!input.trim() || !activeConvId || !session || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    setError(null)
    try {
      const newMsg = await sendMessageAsync(activeConvId, text)
      setMessages(prev => [...prev, newMsg])
      loadConversations()
      // Notificar al cliente que recibió un nuevo mensaje
      if (activeConv) {
        notifyNewMessage(activeConv.userId, session.name, text).catch(e =>
          console.error('No se pudo crear la notificación', e)
        )
      }
    } catch {
      setError('No se pudo enviar el mensaje. Intenta de nuevo.')
      setInput(text)
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const openConversation = (id: string) => { setActiveConvId(id); setIsMobileChat(true) }
  const goBackToList = () => { setIsMobileChat(false); setActiveConvId(null) }

  const totalUnread = conversations.reduce((sum, c) => sum + c.businessUnreadCount, 0)

  if (!session) return null

  return (
    <div className="bg-[#f9f6f5] min-h-screen font-body flex flex-col">
      <HeaderBusiness />

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 pt-24 pb-6 flex flex-col">
        {/* Title */}
        <div className="mb-6 flex items-center gap-3">
          {isMobileChat && (
            <button onClick={goBackToList} className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#e4e2e1] transition-colors">
              <span className="material-symbols-outlined text-[#2f2f2e]">arrow_back</span>
            </button>
          )}
          <div className="flex items-center gap-3">
            <h1 className="font-headline text-3xl font-extrabold text-[#2f2f2e] tracking-tight">
              {isMobileChat && activeConv ? activeConv.userName : 'Mensajes de Clientes'}
            </h1>
            {!isMobileChat && totalUnread > 0 && (
              <span className="bg-[#ab2d00] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {totalUnread} nuevo{totalUnread > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Split Panel */}
        <div className="flex-1 flex gap-4 min-h-0 h-[calc(100vh-280px)]">
          {/* Conversation List */}
          <aside className={`flex flex-col gap-2 overflow-y-auto w-full md:w-80 md:min-w-[280px] md:flex shrink-0 ${isMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <span className="material-symbols-outlined animate-spin text-[#ab2d00] text-3xl">progress_activity</span>
              </div>
            ) : conversations.length === 0 ? (
              <EmptyState />
            ) : (
              conversations.map(conv => (
                <ClientConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === activeConvId}
                  onClick={() => openConversation(conv.id)}
                />
              ))
            )}
          </aside>

          {/* Chat Panel */}
          <section className={`flex-1 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden border border-[#e4e2e1] ${isMobileChat ? 'flex' : 'hidden md:flex'}`}>
            {!activeConv ? <NoChatSelected /> : (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-[#e4e2e1] bg-white shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-[#ab2d00] to-[#ff7851] flex items-center justify-center text-white font-headline font-bold text-lg">
                    {activeConv.userPhoto
                      ? <img src={activeConv.userPhoto} alt={activeConv.userName} className="w-full h-full object-cover" />
                      : activeConv.userName.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-headline font-bold text-lg text-[#2f2f2e] truncate">{activeConv.userName}</h2>
                    <p className="text-xs text-[#5c5b5b]">Cliente</p>
                  </div>
                  {activeConv.businessUnreadCount > 0 && (
                    <span className="bg-[#ab2d00] text-white text-xs font-bold px-3 py-1 rounded-full">
                      {activeConv.businessUnreadCount} sin leer
                    </span>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3 bg-[#f9f6f5]">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-[#5c5b5b]">
                      <div className="w-16 h-16 rounded-full bg-[#ff7851]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#ab2d00] text-3xl">chat_bubble</span>
                      </div>
                      <p className="font-semibold text-[#2f2f2e]">Conversación vacía</p>
                      <p className="text-sm max-w-xs">El cliente aún no ha enviado mensajes. Puedes escribirle primero.</p>
                    </div>
                  ) : (
                    <>
                      <DateDivider />
                      {messages.map((msg, i) => {
                        const isOwn = msg.senderId === session.user?.id
                        const prevMsg = messages[i - 1]
                        const showSender = !isOwn && (!prevMsg || prevMsg.senderId !== msg.senderId)
                        return <MessageBubble key={msg.id} msg={msg} isOwn={isOwn} showSender={showSender} />
                      })}
                      <div ref={bottomRef} />
                    </>
                  )}
                </div>

                {/* Error banner */}
                {error && (
                  <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-xs text-red-600 text-center">
                    {error}
                  </div>
                )}

                {/* Input */}
                <div className="px-4 py-4 bg-white border-t border-[#e4e2e1] shrink-0">
                  <div className="flex items-center gap-3 bg-[#f3f0ef] rounded-2xl px-4 py-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Responder a ${activeConv.userName}...`}
                      className="flex-1 bg-transparent text-[#2f2f2e] text-sm outline-none placeholder:text-[#787676]"
                      disabled={sending}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || sending}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 shrink-0 ${input.trim() && !sending ? 'bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white shadow-md shadow-[#ab2d00]/20' : 'bg-[#dfdcdc] text-[#787676]'}`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        {sending ? 'hourglass_empty' : 'send'}
                      </span>
                    </button>
                  </div>
                  <p className="text-[10px] text-[#787676] text-center mt-2">
                    Respondiendo como <span className="font-semibold text-[#ab2d00]">{session.name}</span>
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ClientConversationItem({ conv, isActive, onClick }: {
  conv: Conversation; isActive: boolean; onClick: () => void
}) {
  const unread = conv.businessUnreadCount
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all active:scale-[0.98] ${isActive ? 'bg-white shadow-md border border-[#ff785133]' : 'bg-white hover:bg-[#f3f0ef] border border-transparent'}`}>
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ab2d00] to-[#ff7851] flex items-center justify-center text-white font-headline font-bold text-lg overflow-hidden">
          {conv.userPhoto
            ? <img src={conv.userPhoto} alt={conv.userName} className="w-full h-full object-cover" />
            : conv.userName.charAt(0).toUpperCase()
          }
        </div>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#ab2d00] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className={`font-headline text-sm truncate ${unread > 0 ? 'font-extrabold text-[#2f2f2e]' : 'font-bold text-[#2f2f2e]'}`}>
            {conv.userName}
          </span>
          <span className="text-[10px] text-[#787676] shrink-0 ml-2">
            {conv.lastTimestamp ? formatMessageTime(conv.lastTimestamp) : ''}
          </span>
        </div>
        <span className={`text-xs truncate block ${unread > 0 ? 'text-[#2f2f2e] font-medium' : 'text-[#5c5b5b]'}`}>
          {conv.lastMessage || 'Sin mensajes aún'}
        </span>
      </div>
    </button>
  )
}

function MessageBubble({ msg, isOwn, showSender }: { msg: Message; isOwn: boolean; showSender: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {showSender && <span className="text-[10px] text-[#5c5b5b] font-semibold mb-1 ml-1">{msg.senderName}</span>}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn ? 'bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white rounded-br-sm' : 'bg-white text-[#2f2f2e] shadow-sm border border-[#e4e2e1] rounded-bl-sm'}`}>
          {msg.text}
        </div>
        <span className="text-[10px] text-[#787676] mt-1 px-1">{formatMessageTime(msg.timestamp)}</span>
      </div>
    </div>
  )
}

function DateDivider() {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-[#e4e2e1]" />
      <span className="text-[10px] text-[#787676] font-semibold uppercase tracking-wider">Hoy</span>
      <div className="flex-1 h-px bg-[#e4e2e1]" />
    </div>
  )
}

function NoChatSelected() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
      <div className="w-20 h-20 rounded-full bg-[#ff7851]/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-[#ab2d00] text-4xl">forum</span>
      </div>
      <div>
        <h3 className="font-headline font-bold text-xl text-[#2f2f2e] mb-2">Bandeja de entrada</h3>
        <p className="text-sm text-[#5c5b5b] max-w-xs">Selecciona una conversación para ver los mensajes de tus clientes y responderles.</p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-[#ff7851]/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-[#ab2d00] text-3xl">inbox</span>
      </div>
      <div>
        <h3 className="font-headline font-bold text-lg text-[#2f2f2e] mb-1">Sin mensajes aún</h3>
        <p className="text-sm text-[#5c5b5b]">Cuando un cliente te escriba desde tu perfil, aparecerá aquí.</p>
      </div>
    </div>
  )
}
