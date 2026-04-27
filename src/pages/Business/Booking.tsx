import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderUser from "../../components/user/HeaderUser";
import { scheduleAppointmentReminder } from "../../data/notifications";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Business {
  id: number;
  name: string;
  image: string;
  imageAlt: string;
  category: string;
  distance: string;
  rating: number;
  availability: string;
  available: boolean;
  bookingTitle: string;
  duration: string;
  price: number;
  team?: { id: string; name: string; role: string; image: string }[];
  services?: { id: string; icon: string; title: string; description: string; price: string; featured: boolean }[];
}

interface TimeSlot {
  id: string;
  label: string;
  period: "MORNING" | "AFTERNOON";
}

interface Professional {
  id: number;
  name: string;
  role: string;
  image: string;
}

interface Appointment {
  id: number;
  service: string;
  businessName: string;
  businessCategory: string;
  professionalName: string;
  professionalRole: string;
  date: string;
  time: string;
  price: number;
  businessImage: string;
  status: "upcoming" | "cancelled";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "zylo_appointments";

const morningSlots: TimeSlot[] = [
  { id: "09:00", label: "09:00 AM", period: "MORNING" },
  { id: "10:00", label: "10:00 AM", period: "MORNING" },
  { id: "11:30", label: "11:30 AM", period: "MORNING" },
  { id: "12:00", label: "12:00 PM", period: "MORNING" },
];

const afternoonSlots: TimeSlot[] = [
  { id: "14:00", label: "02:00 PM", period: "AFTERNOON" },
  { id: "15:30", label: "03:30 PM", period: "AFTERNOON" },
  { id: "16:00", label: "04:00 PM", period: "AFTERNOON" },
  { id: "17:00", label: "05:00 PM", period: "AFTERNOON" },
];

const fallbackProfessionals: Professional[] = [
  {
    id: 1,
    name: "Dra. Elena Rodríguez",
    role: "Especialista principal · 8 años exp.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHlpypTJLBDZGOsrcf59gDBZbAncEkdHrCED_WevgVyJ1rLsxPkhgtvKtdzbyAuXVU_lLuapDrUGGymov6y54nWkh7sF-aP1l3_DQz9pUYo_1HFEt54XQWOVszPFcmBc2wyX6jWXdvOZ0w5gdqS81SyjIozfMQpTfDZQBpVDCnbiwJy_k5YPEhZHAjTw7CNlVWEXk_p6l39dFf5ZKb4HkPpiMVxheYlvqr8m_xmCnOJwGLfHYhn-Osrnx1raY_OLTzxDN0Kqje6uA8",
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Terapeuta senior · 5 años exp.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKnfmWzWtE7tSPdkptauU-WOcL1hfrf3xiGR5pBkndxhBNE8EXIwPDxLDN2-HmOW1fhJ1rkuoMZBnhCBZbjpJpbPy9Gl1R-TAAyc-v4zeUcQB83XLQ18LFK_iSzMKDg_oHtQ0PN6Eefk4kh5uZnG1faeB_DnZNrnVuHGyh83gvi7xG78SVzZL_HCpkw6to_zcDlffgBMLPV6HbN4kB63a4v4RENOqbcxquZdC1dFN25TJMw5P-JhlCB-k2AhJLeXTdek2DBpPu6kCL",
  },
];

const fallbackBusiness: Business = {
  id: 1,
  name: "The Serene Sanctuary",
  image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCp1LOOTi8ivMkLiI_svhIzR5CQ4mkK43VkZcn6m-EUPKfanibK_8vkqsftaFOOT7Lb5LCvwHzXs9AXZuB9cfAk-oorrB_D2KR3SiNebXGXphBXvNOzlcKi_wgLUA5hXF1kbOdUWpvX3uquTYXHkOTRig2LPlQgizCeqs_6gU0r33OCvJstvDuafSjDHKBTmfnoRFFRPQdM5tChWiWGhRoOEgwUOUiMBXZ6mDsB3RjjKIL2MzPXEuJqU_Tv5d0ufFq0PNDZv8E-mRZ2",
  imageAlt: "Interior minimalista de spa moderno",
  category: "Bienestar y Spa",
  distance: "0.8 km de distancia",
  rating: 4.9,
  availability: "Hoy a las 2:30 PM",
  available: true,
  bookingTitle: "Masaje de tejido profundo",
  duration: "60 min",
  price: 60,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateKey(date: Date) {
  const year  = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day   = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ─── Payment Modal ────────────────────────────────────────────────────────────

type PaymentMethod = "card" | "yape" | "plin";
type ModalStep = "review" | "processing" | "success";

interface PaymentModalProps {
  business: Business;
  effectiveTitle: string;
  effectiveDuration: string;
  effectivePrice: number;
  selectedDate: string;
  selectedTime: string;
  selectedPro: Professional;
  onClose: () => void;
  onConfirm: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  business,
  effectiveTitle,
  effectiveDuration,
  effectivePrice,
  selectedDate,
  selectedTime,
  selectedPro,
  onClose,
  onConfirm,
}) => {
  const [step, setStep]             = useState<ModalStep>("review");
  const [paymentMethod, setMethod]  = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName]     = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc]       = useState("");

  const serviceFee = parseFloat((effectivePrice * 0.05).toFixed(2));
  const total      = parseFloat((effectivePrice + serviceFee).toFixed(2));

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const handlePay = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      onConfirm(); // guarda el appointment en localStorage
    }, 2000);
  };

  const canPay =
    paymentMethod !== "card" ||
    (cardNumber.replace(/\s/g, "").length === 16 &&
      cardName.trim().length > 2 &&
      cardExpiry.length === 5 &&
      cardCvc.length === 3);

  // ── Processing ──
  if (step === "processing") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-5 w-full max-w-sm shadow-2xl">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 animate-spin" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#ffe7dd" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke="#d5521b" strokeWidth="8"
                strokeDasharray="160" strokeDashoffset="110"
                strokeLinecap="round"
              />
            </svg>
            <span className="material-symbols-outlined absolute inset-0 m-auto text-[#d5521b] text-3xl flex items-center justify-center">
              lock
            </span>
          </div>
          <p className="text-xl font-extrabold text-[#2f2f2e]">Procesando pago…</p>
          <p className="text-sm text-[#7a7877] text-center">
            Estamos verificando tu información de forma segura. No cierres esta ventana.
          </p>
        </div>
      </div>
    );
  }

  // ── Success ──
  if (step === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-5 w-full max-w-sm shadow-2xl text-center">
          {/* Checkmark animado */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#d5521b] to-[#ff7851] flex items-center justify-center shadow-lg shadow-[#d5521b]/30">
            <span
              className="material-symbols-outlined text-white text-5xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>

          <div>
            <p className="text-2xl font-extrabold text-[#2f2f2e]">¡Reserva confirmada!</p>
            <p className="text-sm text-[#7a7877] mt-2">
              Tu cita en <span className="font-bold text-[#2f2f2e]">{business.name}</span> ha sido agendada exitosamente.
            </p>
          </div>

          <div className="w-full bg-[#f9f6f5] rounded-2xl p-4 space-y-2 text-sm text-left">
            <div className="flex justify-between">
              <span className="text-[#7a7877]">Servicio</span>
              <span className="font-semibold">{effectiveTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7a7877]">Fecha</span>
              <span className="font-semibold">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7a7877]">Hora</span>
              <span className="font-semibold">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7a7877]">Profesional</span>
              <span className="font-semibold">{selectedPro.name}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#e8e3e1] mt-1">
              <span className="font-bold">Total pagado</span>
              <span className="font-extrabold text-[#d5521b]">S/ {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-gradient-to-br from-[#d5521b] to-[#ff7851] text-white font-bold text-sm shadow-lg shadow-[#d5521b]/30 active:scale-95 transition-transform"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  // ── Review / Payment form ──
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-[#2f2f2e]">Confirmar pago</h2>
            <p className="text-xs text-[#7a7877] mt-0.5">Revisa los detalles antes de pagar</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f5f2f1] flex items-center justify-center hover:bg-[#ffe7dd] transition-colors"
          >
            <span className="material-symbols-outlined text-lg text-[#5a5857]">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-5">

          {/* Resumen */}
          <div className="bg-[#f9f6f5] rounded-2xl p-4 space-y-2 text-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-[#e8e3e1]">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                {business.image ? (
                  <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#ab2d00] to-[#ff7851] flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-2xl">storefront</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-extrabold text-[#2f2f2e]">{business.name}</p>
                <p className="text-xs text-[#7a7877]">{effectiveTitle} · {effectiveDuration}</p>
              </div>
            </div>
            <div className="flex justify-between text-[#5a5857]">
              <span>Fecha</span><span className="font-semibold text-[#2f2f2e]">{selectedDate}</span>
            </div>
            <div className="flex justify-between text-[#5a5857]">
              <span>Hora</span><span className="font-semibold text-[#2f2f2e]">{selectedTime}</span>
            </div>
            <div className="flex justify-between text-[#5a5857]">
              <span>Profesional</span><span className="font-semibold text-[#2f2f2e]">{selectedPro.name}</span>
            </div>
            <div className="pt-2 border-t border-[#e8e3e1] space-y-1">
              <div className="flex justify-between text-[#5a5857]">
                <span>Servicio</span><span>S/ {effectivePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#5a5857]">
                <span>Cargo por servicio (5%)</span><span>S/ {serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-[#2f2f2e] text-base pt-1">
                <span>Total</span><span className="text-[#d5521b]">S/ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <p className="text-sm font-bold text-[#2f2f2e] mb-3">Método de pago</p>
            <div className="grid grid-cols-3 gap-2">
              {(["card", "yape", "plin"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all ${
                    paymentMethod === m
                      ? "border-[#d5521b] bg-[#fff4ee]"
                      : "border-transparent bg-[#f5f2f1] hover:border-[#e0cfc9]"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl text-[#d5521b]">
                    {m === "card" ? "credit_card" : m === "yape" ? "smartphone" : "payments"}
                  </span>
                  <span className="text-xs font-bold text-[#2f2f2e] capitalize">
                    {m === "card" ? "Tarjeta" : m === "yape" ? "Yape" : "Plin"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Formulario tarjeta */}
          {paymentMethod === "card" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#7a7877] mb-1 block">Número de tarjeta</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCard(e.target.value))}
                  className="w-full bg-[#f5f2f1] rounded-xl px-4 py-3 text-sm font-semibold text-[#2f2f2e] placeholder-[#c0bab8] outline-none focus:ring-2 focus:ring-[#d5521b]/30 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#7a7877] mb-1 block">Nombre en la tarjeta</label>
                <input
                  type="text"
                  placeholder="JUAN PÉREZ"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  className="w-full bg-[#f5f2f1] rounded-xl px-4 py-3 text-sm font-semibold text-[#2f2f2e] placeholder-[#c0bab8] outline-none focus:ring-2 focus:ring-[#d5521b]/30 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#7a7877] mb-1 block">Vencimiento</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    className="w-full bg-[#f5f2f1] rounded-xl px-4 py-3 text-sm font-semibold text-[#2f2f2e] placeholder-[#c0bab8] outline-none focus:ring-2 focus:ring-[#d5521b]/30 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#7a7877] mb-1 block">CVC</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    className="w-full bg-[#f5f2f1] rounded-xl px-4 py-3 text-sm font-semibold text-[#2f2f2e] placeholder-[#c0bab8] outline-none focus:ring-2 focus:ring-[#d5521b]/30 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Yape / Plin */}
          {(paymentMethod === "yape" || paymentMethod === "plin") && (
            <div className="bg-[#f5f2f1] rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
              <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                {/* QR simulado */}
                <svg viewBox="0 0 80 80" width="96" height="96">
                  <rect width="80" height="80" fill="white" />
                  {[0,1,2,3,4,5,6].map(r =>
                    [0,1,2,3,4,5,6].map(c => {
                      const pat = [[1,1,1,1,1,1,1],[1,0,1,0,1,0,1],[1,1,1,1,1,1,1],[0,1,0,0,0,1,0],[1,1,1,1,1,1,1],[1,0,1,0,1,0,1],[1,1,1,1,1,1,1]];
                      return pat[r][c] ? (
                        <rect key={`${r}-${c}`} x={c*11+1} y={r*11+1} width="10" height="10" fill="#2f2f2e" rx="1" />
                      ) : null;
                    })
                  )}
                </svg>
              </div>
              <div>
                <p className="font-extrabold text-[#2f2f2e]">Escanea con {paymentMethod === "yape" ? "Yape" : "Plin"}</p>
                <p className="text-xs text-[#7a7877] mt-1">
                  Abre tu app, escanea el QR y confirma el pago de{" "}
                  <span className="font-bold text-[#d5521b]">S/ {total.toFixed(2)}</span>
                </p>
              </div>
            </div>
          )}

          {/* Seguridad */}
          <div className="flex items-center gap-2 text-xs text-[#7a7877]">
            <span className="material-symbols-outlined text-sm text-[#27ae60]">lock</span>
            <span>Pago cifrado con SSL 256-bit · Garantía Hearth Secure™</span>
          </div>

          {/* Botón pagar */}
          <button
            onClick={handlePay}
            disabled={!canPay}
            className="w-full py-4 rounded-full bg-gradient-to-br from-[#d5521b] to-[#ff7851] text-white font-bold text-sm shadow-lg shadow-[#d5521b]/30 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Pagar S/ {total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Booking: React.FC = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const business: Business = location.state?.business || fallbackBusiness;
  const businessServices   = business.services ?? [];

  const professionals: Professional[] =
    business.team && business.team.length > 0
      ? business.team.map((m, i) => ({ id: i + 1, name: m.name, role: m.role, image: m.image }))
      : fallbackProfessionals;

  const [selectedServiceId, setSelectedServiceId]       = useState<string>(businessServices[0]?.id ?? "");
  const [selectedDateIndex, setSelectedDateIndex]       = useState(1);
  const [selectedTime, setSelectedTime]                 = useState<TimeSlot | null>(morningSlots[2]);
  const [selectedProfessional, setSelectedProfessional] = useState<number>(1);
  const [showModal, setShowModal]                       = useState(false);

  const selectedService  = businessServices.find((s) => s.id === selectedServiceId);
  const effectivePrice   = selectedService
    ? parseFloat(selectedService.price.replace(/[^0-9.]/g, "")) || business.price
    : business.price;
  const effectiveTitle    = selectedService?.title       ?? business.bookingTitle;
  const effectiveDuration = selectedService?.description ?? business.duration;

  const baseDate = new Date();
  const days = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + index);
    return {
      label:      date.toLocaleDateString("es-PE", { weekday: "short" }).replace(".", "").toUpperCase(),
      day:        date.getDate(),
      monthLabel: date.toLocaleDateString("es-PE", { month: "short" }),
      fullDate:   formatDateKey(date),
      fullLabel:  date.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" }),
    };
  });

  const selectedPro = professionals.find((p) => p.id === selectedProfessional)!;

  // Guarda el appointment y lo llama el modal al confirmar
  const handleConfirmReservation = () => {
    if (!selectedTime || !selectedPro) return;

    const newAppointment: Appointment = {
      id:               Date.now(),
      service:          effectiveTitle,
      businessName:     business.name,
      businessCategory: business.category,
      professionalName: selectedPro.name,
      professionalRole: selectedPro.role,
      date:             days[selectedDateIndex].fullDate,
      time:             selectedTime.label,
      price:            effectivePrice,
      businessImage:    business.image,
      status:           "upcoming",
    };

    const raw = localStorage.getItem(STORAGE_KEY);
    const current: Appointment[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, newAppointment]));

    try {
      const session = JSON.parse(localStorage.getItem("zylo_session") || "null");
      if (session?.email) {
        scheduleAppointmentReminder(
          session.email, effectiveTitle, business.name,
          newAppointment.date, newAppointment.time, newAppointment.id,
        );
      }
    } catch (_) {}
  };

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] min-h-screen">
      <HeaderUser />

      {/* Modal */}
      {showModal && selectedTime && selectedPro && (
        <PaymentModal
          business={business}
          effectiveTitle={effectiveTitle}
          effectiveDuration={effectiveDuration}
          effectivePrice={effectivePrice}
          selectedDate={days[selectedDateIndex].fullLabel}
          selectedTime={selectedTime.label}
          selectedPro={selectedPro}
          onClose={() => navigate("/home")}
          onConfirm={handleConfirmReservation}
        />
      )}

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-8">

          {/* ── Cabecera negocio ── */}
          <section className="bg-white rounded-3xl shadow-sm p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-full md:w-28 h-28 rounded-2xl overflow-hidden shrink-0">
              {business.image ? (
                <img src={business.image} alt={business.imageAlt || business.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#ab2d00] to-[#ff7851] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-4xl">storefront</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffe7dd] text-[#c1491c] text-[11px] font-bold uppercase tracking-wide">
                {business.category}
              </span>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{business.name}</h1>
                  <p className="text-base font-semibold text-[#ab2d00] mt-1">{effectiveTitle}</p>
                  <p className="text-sm text-[#7a7877] flex flex-wrap items-center gap-2 mt-1">
                    <span>{effectiveDuration}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#ff7851]">star</span>
                      {business.rating.toFixed(1)}
                    </span>
                    {business.distance && <><span>•</span><span>{business.distance}</span></>}
                  </p>
                </div>
                <div className="text-left md:text-right shrink-0">
                  <p className="text-sm text-[#7a7877]">Desde</p>
                  <p className="text-2xl md:text-3xl font-extrabold text-[#d5521b]">S/ {effectivePrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Selector de servicio ── */}
          {businessServices.length > 1 && (
            <section className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Selecciona un servicio</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {businessServices.map((svc) => {
                  const isActive = svc.id === selectedServiceId;
                  return (
                    <button
                      key={svc.id}
                      onClick={() => setSelectedServiceId(svc.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        isActive ? "border-[#d5521b] bg-[#fff4ee]" : "border-transparent bg-[#f5f2f1] hover:border-[#e0cfc9]"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isActive ? "bg-[#ffe7dd] text-[#ab2d00]" : "bg-white text-[#7a7877]"
                      }`}>
                        <span className="material-symbols-outlined text-xl">{svc.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{svc.title}</p>
                        <p className="text-xs text-[#7a7877] truncate">{svc.description}</p>
                      </div>
                      <span className={`font-extrabold text-sm shrink-0 ${isActive ? "text-[#d5521b]" : "text-[#2f2f2e]"}`}>
                        {svc.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Selector de fecha ── */}
          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">Selecciona una fecha</h2>
                <p className="text-xs text-[#7a7877]">Elige el día que prefieras para tu sesión</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#f2eeec] flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">calendar_month</span>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {days.map((d, index) => {
                const isActive = index === selectedDateIndex;
                return (
                  <button
                    key={d.fullDate}
                    onClick={() => setSelectedDateIndex(index)}
                    className={`w-16 h-20 rounded-2xl flex flex-col items-center justify-center text-sm font-semibold transition-all shrink-0 ${
                      isActive ? "bg-[#ff7851] text-white shadow-md" : "bg-[#f5f2f1] text-[#5a5857] hover:bg-[#ffe7dd]"
                    }`}
                  >
                    <span className="text-[11px] uppercase">{d.label}</span>
                    <span className="text-xl font-extrabold mt-1">{d.day}</span>
                    <span className="text-[10px] mt-1">{d.monthLabel}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Selector de horario ── */}
          <section className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold mb-2">Horarios disponibles</h2>
            <div>
              <p className="text-xs font-bold text-[#7a7877] mb-2">MAÑANA</p>
              <div className="flex flex-wrap gap-3">
                {morningSlots.map((slot) => {
                  const isActive = selectedTime?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedTime(slot)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        isActive ? "border-2 border-[#d5521b] text-[#d5521b] bg-[#ffe7dd]" : "bg-[#f5f2f1] text-[#5a5857] hover:bg-[#ffe7dd]"
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-[#7a7877] mb-2">TARDE</p>
              <div className="flex flex-wrap gap-3">
                {afternoonSlots.map((slot) => {
                  const isActive = selectedTime?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedTime(slot)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        isActive ? "border-2 border-[#d5521b] text-[#d5521b] bg-[#ffe7dd]" : "bg-[#f5f2f1] text-[#5a5857] hover:bg-[#ffe7dd]"
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── Selector de profesional ── */}
          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Elige un profesional</h2>
            <div className="flex flex-wrap gap-4">
              {professionals.map((pro) => {
                const isActive = pro.id === selectedProfessional;
                return (
                  <button
                    key={pro.id}
                    onClick={() => setSelectedProfessional(pro.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full border-2 transition-all ${
                      isActive ? "border-[#d5521b] bg-[#fff4ee]" : "border-transparent bg-[#f5f2f1] hover:border-[#e0cfc9]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                      {pro.image ? (
                        <img src={pro.image} alt={pro.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#e4e2e1] to-[#afadac] flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-lg">person</span>
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold">{pro.name}</p>
                      <p className="text-[11px] text-[#7a7877]">{pro.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <button onClick={() => navigate(-1)} className="text-sm font-semibold text-[#ab2d00] hover:underline">
            ← Volver al negocio
          </button>
        </div>

        {/* ── Sidebar resumen ── */}
        <aside className="space-y-4">
          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#7a7877] mb-4">Resumen de la reserva</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#7a7877]">Negocio</span>
                <span className="font-semibold text-right">{business.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#7a7877]">Servicio</span>
                <span className="font-semibold text-right">{effectiveTitle}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#7a7877]">Duración</span>
                <span className="font-semibold text-right">{effectiveDuration}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#7a7877]">Fecha</span>
                <span className="font-semibold text-right">{days[selectedDateIndex].fullLabel}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#7a7877]">Hora</span>
                <span className="font-semibold text-right">{selectedTime?.label ?? "—"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#7a7877]">Especialista</span>
                <span className="font-semibold text-right">{selectedPro?.name ?? "—"}</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#eee1da] space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-[#7a7877] font-semibold">PRECIO TOTAL</p>
                  <p className="text-2xl font-extrabold">S/ {effectivePrice.toFixed(2)}</p>
                </div>
                <span className="px-3 py-1 text-[11px] rounded-full bg-[#ffe7dd] text-[#c1491c] font-semibold">
                  Incl. impuestos
                </span>
              </div>
              {/* Botón que abre el modal */}
              <button
                onClick={() => setShowModal(true)}
                disabled={!selectedTime || !selectedPro}
                className="w-full mt-3 py-3 rounded-full bg-gradient-to-br from-[#d5521b] to-[#ff7851] text-white font-bold text-sm shadow-lg shadow-[#d5521b]/30 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reservar ahora
              </button>
              <p className="text-[10px] text-[#a19b98] mt-2">
                Al confirmar, aceptas nuestra política de cancelación y términos del servicio.
              </p>
            </div>
          </section>

          <section className="bg-gradient-to-r from-[#f4d8ff] to-[#ffe1ef] rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#b048ff]">verified_user</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#7a2e8b]">Garantía Hearth Secure™</p>
                <p className="text-xs text-[#7a2e8b]/90">Pago seguro y proveedores certificados en cada reserva.</p>
              </div>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
};

export default Booking;