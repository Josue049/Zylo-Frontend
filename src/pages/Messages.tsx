import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeaderUser from "../components/user/HeaderUser";
import {
  getSession,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
  simulateBusinessReply,
  formatMessageTime,
  type Conversation,
  type Message,
} from "../data/messages";

// ── Main Page ────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const session = getSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(
    searchParams.get("conv")
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isMobileChat, setIsMobileChat] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Redirigir si no hay sesión
  useEffect(() => {
    if (!session) {
      navigate("/login");
    }
  }, []);

  // Cargar conversaciones
  const loadConversations = () => {
    if (!session) return;
    const convs = getUserConversations(session.email);
    // Ordenar por más reciente
    convs.sort(
      (a, b) =>
        new Date(b.lastTimestamp).getTime() -
        new Date(a.lastTimestamp).getTime()
    );
    setConversations(convs);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-abrir conversación si viene por queryParam
  useEffect(() => {
    const convId = searchParams.get("conv");
    if (convId) {
      setActiveConvId(convId);
      setIsMobileChat(true);
    }
  }, [searchParams]);

  // Cargar mensajes cuando cambia la conversación activa
  useEffect(() => {
    if (!activeConvId || !session) return;
    markConversationAsRead(activeConvId, session.email);
    setMessages(getConversationMessages(activeConvId));
    loadConversations();
  }, [activeConvId]);

  // Polling ligero para detectar nuevos mensajes (simula tiempo real)
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeConvId) {
        const fresh = getConversationMessages(activeConvId);
        if (fresh.length !== messages.length) {
          setMessages(fresh);
          loadConversations();
        }
      } else {
        loadConversations();
      }
    }, 800);
    return () => clearInterval(interval);
  }, [activeConvId, messages.length]);

  // Scroll al fondo cuando llegan mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  const handleSend = () => {
    if (!input.trim() || !activeConvId || !session) return;

    sendMessage(activeConvId, session.email, session.name, input.trim());
    setInput("");
    setMessages(getConversationMessages(activeConvId));
    loadConversations();

    // Simular respuesta del negocio
    if (activeConv) {
      simulateBusinessReply(
        activeConvId,
        activeConv.businessId,
        activeConv.businessName
      );
    }

    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openConversation = (id: string) => {
    setActiveConvId(id);
    setIsMobileChat(true);
  };

  const goBackToList = () => {
    setIsMobileChat(false);
    setActiveConvId(null);
  };

  if (!session) return null;

  return (
    <div className="bg-[#f9f6f5] min-h-screen font-body flex flex-col">
      <HeaderUser />

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col">
        {/* ── Page Title ── */}
        <div className="mb-6 flex items-center gap-3">
          {isMobileChat && (
            <button
              onClick={goBackToList}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#e4e2e1] transition-colors"
            >
              <span className="material-symbols-outlined text-[#2f2f2e]">
                arrow_back
              </span>
            </button>
          )}
          <h1 className="font-headline text-3xl font-extrabold text-[#2f2f2e] tracking-tight">
            {isMobileChat && activeConv
              ? activeConv.businessName
              : "Mensajes"}
          </h1>
          {!isMobileChat && conversations.length > 0 && (
            <span className="bg-[#ff7851]/20 text-[#ab2d00] text-xs font-bold px-2.5 py-1 rounded-full">
              {conversations.length}
            </span>
          )}
        </div>

        {/* ── Split Panel ── */}
        <div className="flex-1 flex gap-4 min-h-0 h-[calc(100vh-220px)]">
          {/* ── Conversation List ── */}
          <aside
            className={`
              flex flex-col gap-2 overflow-y-auto
              w-full md:w-80 md:min-w-[280px] md:flex shrink-0
              ${isMobileChat ? "hidden md:flex" : "flex"}
            `}
          >
            {conversations.length === 0 ? (
              <EmptyState />
            ) : (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === activeConvId}
                  currentUserEmail={session.email}
                  onClick={() => openConversation(conv.id)}
                />
              ))
            )}
          </aside>

          {/* ── Chat Panel ── */}
          <section
            className={`
              flex-1 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden border border-[#e4e2e1]
              ${isMobileChat ? "flex" : "hidden md:flex"}
            `}
          >
            {!activeConv ? (
              <NoChatSelected />
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-[#e4e2e1] bg-white shrink-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#f3f0ef]">
                    <img
                      src={activeConv.businessPhoto}
                      alt={activeConv.businessName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-headline font-bold text-lg text-[#2f2f2e] truncate">
                      {activeConv.businessName}
                    </h2>
                    <p className="text-xs text-[#5c5b5b] truncate">
                      {activeConv.businessCategory}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-[#ff7851]/10 text-[#ab2d00] px-3 py-1 rounded-full text-xs font-bold">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 12 }}
                    >
                      fiber_manual_record
                    </span>
                    En línea
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3 bg-[#f9f6f5]">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-[#5c5b5b]">
                      <div className="w-16 h-16 rounded-full bg-[#ff7851]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#ab2d00] text-3xl">
                          chat_bubble
                        </span>
                      </div>
                      <p className="font-semibold text-[#2f2f2e]">
                        Inicia la conversación
                      </p>
                      <p className="text-sm max-w-xs">
                        Envía tu primera consulta a{" "}
                        <span className="font-semibold text-[#ab2d00]">
                          {activeConv.businessName}
                        </span>{" "}
                        y recibirás respuesta en breve.
                      </p>
                    </div>
                  ) : (
                    <>
                      <DateDivider />
                      {messages.map((msg, i) => {
                        const isOwn =
                          msg.senderId.toLowerCase() ===
                          session.email.toLowerCase();
                        const prevMsg = messages[i - 1];
                        const showSender =
                          !isOwn &&
                          (!prevMsg ||
                            prevMsg.senderId !== msg.senderId);
                        return (
                          <MessageBubble
                            key={msg.id}
                            msg={msg}
                            isOwn={isOwn}
                            showSender={showSender}
                          />
                        );
                      })}
                      {/* Typing indicator placeholder */}
                      <div ref={bottomRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <div className="px-4 py-4 bg-white border-t border-[#e4e2e1] shrink-0">
                  <div className="flex items-center gap-3 bg-[#f3f0ef] rounded-2xl px-4 py-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Mensaje a ${activeConv.businessName}...`}
                      className="flex-1 bg-transparent text-[#2f2f2e] text-sm outline-none placeholder:text-[#787676]"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 shrink-0 ${
                        input.trim()
                          ? "bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white shadow-md shadow-[#ab2d00]/20"
                          : "bg-[#dfdcdc] text-[#787676]"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 18 }}
                      >
                        send
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ConversationItem({
  conv,
  isActive,
  onClick,
}: {
  conv: Conversation;
  isActive: boolean;
  currentUserEmail: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all active:scale-[0.98] ${
        isActive
          ? "bg-white shadow-md border border-[#ff785133]"
          : "bg-white hover:bg-[#f3f0ef] border border-transparent"
      }`}
    >
      {/* Business photo */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#f3f0ef]">
          <img
            src={conv.businessPhoto}
            alt={conv.businessName}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Online dot */}
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#ab2d00] border-2 border-white rounded-full" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className="font-headline font-bold text-sm text-[#2f2f2e] truncate">
            {conv.businessName}
          </span>
          <span className="text-[10px] text-[#787676] shrink-0 ml-2">
            {conv.lastTimestamp
              ? formatMessageTime(conv.lastTimestamp)
              : ""}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#5c5b5b] truncate">
            {conv.lastMessage || "Inicia la conversación"}
          </span>
          {conv.unreadCount > 0 && (
            <span className="ml-2 shrink-0 bg-[#ab2d00] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {conv.unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px] text-[#ab2d00] font-semibold">
          {conv.businessCategory}
        </span>
      </div>
    </button>
  );
}

function MessageBubble({
  msg,
  isOwn,
  showSender,
}: {
  msg: Message;
  isOwn: boolean;
  showSender: boolean;
}) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}
      >
        {showSender && (
          <span className="text-[10px] text-[#5c5b5b] font-semibold mb-1 ml-1">
            {msg.senderName}
          </span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? "bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white rounded-br-sm"
              : "bg-white text-[#2f2f2e] shadow-sm border border-[#e4e2e1] rounded-bl-sm"
          }`}
        >
          {msg.text}
        </div>
        <span className="text-[10px] text-[#787676] mt-1 px-1">
          {formatMessageTime(msg.timestamp)}
        </span>
      </div>
    </div>
  );
}

function DateDivider() {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-[#e4e2e1]" />
      <span className="text-[10px] text-[#787676] font-semibold uppercase tracking-wider">
        Hoy
      </span>
      <div className="flex-1 h-px bg-[#e4e2e1]" />
    </div>
  );
}

function NoChatSelected() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
      <div className="w-20 h-20 rounded-full bg-[#ff7851]/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-[#ab2d00] text-4xl">
          forum
        </span>
      </div>
      <div>
        <h3 className="font-headline font-bold text-xl text-[#2f2f2e] mb-2">
          Tus mensajes
        </h3>
        <p className="text-sm text-[#5c5b5b] max-w-xs">
          Selecciona una conversación para ver el historial o inicia una nueva
          desde el perfil de un negocio.
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-[#ff7851]/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-[#ab2d00] text-3xl">
          mark_chat_unread
        </span>
      </div>
      <div>
        <h3 className="font-headline font-bold text-lg text-[#2f2f2e] mb-1">
          Sin conversaciones aún
        </h3>
        <p className="text-sm text-[#5c5b5b]">
          Visita el perfil de un negocio y presiona{" "}
          <span className="font-semibold text-[#ab2d00]">Message</span> para
          empezar.
        </p>
      </div>
      <a
        href="/home"
        className="mt-2 bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md shadow-[#ab2d00]/20 active:scale-95 transition-transform"
      >
        Explorar negocios
      </a>
    </div>
  );
}
