import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderUser from "../../components/user/HeaderUser";
import { scheduleAppointmentReminder } from "../../data/notifications";

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

const professionals: Professional[] = [
  {
    id: 1,
    name: "Dra. Elena Rodríguez",
    role: "Especialista principal · 8 años exp.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDHlpypTJLBDZGOsrcf59gDBZbAncEkdHrCED_WevgVyJ1rLsxPkhgtvKtdzbyAuXVU_lLuapDrUGGymov6y54nWkh7sF-aP1l3_DQz9pUYo_1HFEt54XQWOVszPFcmBc2wyX6jWXdvOZ0w5gdqS81SyjIozfMQpTfDZQBpVDCnbiwJy_k5YPEhZHAjTw7CNlVWEXk_p6l39dFf5ZKb4HkPpiMVxheYlvqr8m_xmCnOJwGLfHYhn-Osrnx1raY_OLTzxDN0Kqje6uA8",
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Terapeuta senior · 5 años exp.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDKnfmWzWtE7tSPdkptauU-WOcL1hfrf3xiGR5pBkndxhBNE8EXIwPDxLDN2-HmOW1fhJ1rkuoMZBnhCBZbjpJpbPy9Gl1R-TAAyc-v4zeUcQB83XLQ18LFK_iSzMKDg_oHtQ0PN6Eefk4kh5uZnG1faeB_DnZNrnVuHGyh83gvi7xG78SVzZL_HCpkw6to_zcDlffgBMLPV6HbN4kB63a4v4RENOqbcxquZdC1dFN25TJMw5P-JhlCB-k2AhJLeXTdek2DBpPu6kCL",
  },
];

const fallbackBusiness: Business = {
  id: 1,
  name: "The Serene Sanctuary",
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCp1LOOTi8ivMkLiI_svhIzR5CQ4mkK43VkZcn6m-EUPKfanibK_8vkqsftaFOOT7Lb5LCvwHzXs9AXZuB9cfAk-oorrB_D2KR3SiNebXGXphBXvNOzlcKi_wgLUA5hXF1kbOdUWpvX3uquTYXHkOTRig2LPlQgizCeqs_6gU0r33OCvJstvDuafSjDHKBTmfnoRFFRPQdM5tChWiWGhRoOEgwUOUiMBXZ6mDsB3RjjKIL2MzPXEuJqU_Tv5d0ufFq0PNDZv8E-mRZ2",
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

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const Booking: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const business: Business = location.state?.business || fallbackBusiness;

  const [selectedDateIndex, setSelectedDateIndex] = useState(1);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(morningSlots[2]);
  const [selectedProfessional, setSelectedProfessional] = useState<number>(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const baseDate = new Date();
  const days = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + index);
    return {
      label: date.toLocaleDateString("es-PE", { weekday: "short" }).replace(".", "").toUpperCase(),
      day: date.getDate(),
      monthLabel: date.toLocaleDateString("es-PE", { month: "short" }),
      fullDate: formatDateKey(date),
      fullLabel: date.toLocaleDateString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    };
  });

  const selectedPro = professionals.find((p) => p.id === selectedProfessional);

  const handleOpenModal = () => {
    if (!selectedTime || !selectedPro) return;
    setShowPaymentModal(true);
  };

  const handleConfirmReservation = () => {
    if (!selectedTime || !selectedPro) return;
    setIsProcessing(true);

    setTimeout(() => {
      const newAppointment: Appointment = {
        id: Date.now(),
        service: business.bookingTitle,
        businessName: business.name,
        businessCategory: business.category,
        professionalName: selectedPro.name,
        professionalRole: selectedPro.role,
        date: days[selectedDateIndex].fullDate,
        time: selectedTime.label,
        price: business.price,
        businessImage: business.image,
        status: "upcoming",
      };

      const raw = localStorage.getItem(STORAGE_KEY);
      const currentAppointments: Appointment[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...currentAppointments, newAppointment]));

      try {
        const session = JSON.parse(localStorage.getItem("zylo_session") || "null");
        if (session?.email) {
          scheduleAppointmentReminder(
            session.email,
            newAppointment.service,
            newAppointment.businessName,
            newAppointment.date,
            newAppointment.time,
            newAppointment.id,
          );
        }
      } catch (_) {}

      setIsProcessing(false);
      setShowPaymentModal(false);
      navigate("/home");
    }, 1500);
  };

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] min-h-screen">
      <HeaderUser />

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-8">

          {/* Business Card */}
          <section className="bg-white rounded-3xl shadow-sm p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-full md:w-28 h-28 rounded-2xl overflow-hidden shrink-0">
              <img src={business.image} alt={business.imageAlt} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffe7dd] text-[#c1491c] text-[11px] font-bold uppercase tracking-wide">
                {business.category}
              </span>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">{business.bookingTitle}</h1>
                  <p className="text-sm text-[#7a7877] flex flex-wrap items-center gap-2 mt-2">
                    <span>{business.duration}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#ff7851]">star</span>
                      {business.rating} ({business.rating === 4.9 ? 120 : 98} reseñas)
                    </span>
                  </p>
                  <p className="text-sm text-[#7a7877] mt-2">{business.name} • {business.distance}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-[#7a7877]">Desde</p>
                  <p className="text-2xl md:text-4xl font-extrabold text-[#d5521b]">${business.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Date Picker */}
          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">Selecciona una fecha</h2>
                <p className="text-xs text-[#7a7877]">Elige el día que prefieras para tu sesión</p>
              </div>
              <div className="flex gap-2 text-[#7a7877]">
                <button className="w-8 h-8 rounded-full bg-[#f2eeec] flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                </button>
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
                      isActive ? "bg-[#ff7851] text-white shadow-md" : "bg-[#f5f2f1] text-[#5a5857]"
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

          {/* Time Slots */}
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
                        isActive
                          ? "border-2 border-[#d5521b] text-[#d5521b] bg-[#ffe7dd]"
                          : "bg-[#f5f2f1] text-[#5a5857]"
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
                        isActive
                          ? "border-2 border-[#d5521b] text-[#d5521b] bg-[#ffe7dd]"
                          : "bg-[#f5f2f1] text-[#5a5857]"
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Professionals */}
          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Elige un profesional</h2>
            <div className="flex flex-wrap gap-4">
              {professionals.map((pro) => {
                const isActive = pro.id === selectedProfessional;
                return (
                  <button
                    key={pro.id}
                    onClick={() => setSelectedProfessional(pro.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full border transition-all ${
                      isActive ? "border-[#d5521b] bg-[#fff4ee]" : "border-transparent bg-[#f5f2f1]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img src={pro.image} alt={pro.name} className="w-full h-full object-cover" />
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

          <button
            onClick={() => navigate("/home")}
            className="text-sm font-semibold text-[#ab2d00] hover:underline"
          >
            ← Volver al inicio
          </button>
        </div>

        {/* Aside Summary */}
        <aside className="space-y-4">
          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#7a7877] mb-4">Resumen de la reserva</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#7a7877]">Servicio</span>
                <span className="font-semibold text-right">{business.bookingTitle}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#7a7877]">Fecha</span>
                <span className="font-semibold text-right">{days[selectedDateIndex].fullLabel}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#7a7877]">Hora</span>
                <span className="font-semibold text-right">{selectedTime?.label}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#7a7877]">Especialista</span>
                <span className="font-semibold text-right">{selectedPro?.name}</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#eee1da] space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-[#7a7877] font-semibold">PRECIO TOTAL</p>
                  <p className="text-2xl font-extrabold">${business.price.toFixed(2)}</p>
                </div>
                <span className="px-3 py-1 text-[11px] rounded-full bg-[#ffe7dd] text-[#c1491c] font-semibold">
                  Incl. impuestos
                </span>
              </div>
              <button
                onClick={handleOpenModal}
                className="w-full mt-3 py-3 rounded-full bg-gradient-to-br from-[#d5521b] to-[#ff7851] text-white font-bold text-sm shadow-lg shadow-[#d5521b]/30 active:scale-95 transition-transform"
              >
                Confirmar reserva
              </button>
              <p className="text-[10px] text-[#a19b98] mt-2">
                Al hacer clic en confirmar, aceptas nuestra política de cancelación y términos del servicio.
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isProcessing && setShowPaymentModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            style={{ animation: "slideUp 0.3s ease-out" }}>

            {/* Header */}
            <div className="bg-gradient-to-br from-[#d5521b] to-[#ff7851] p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">Confirmar pago</p>
                  <p className="text-3xl font-extrabold mt-1">${business.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => !isProcessing && setShowPaymentModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {/* Quick summary */}
              <div className="mt-4 bg-white/15 rounded-2xl p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-80">Servicio</span>
                  <span className="font-semibold">{business.bookingTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Fecha</span>
                  <span className="font-semibold">{days[selectedDateIndex].fullLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Hora</span>
                  <span className="font-semibold">{selectedTime?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Especialista</span>
                  <span className="font-semibold">{selectedPro?.name}</span>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="p-6 space-y-4">
              <p className="text-sm font-bold text-[#2f2f2e]">Método de pago</p>

              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === "card" ? "border-[#d5521b] bg-[#fff4ee]" : "border-[#eee] bg-[#f9f6f5]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    paymentMethod === "card" ? "bg-[#d5521b] text-white" : "bg-[#eee] text-[#7a7877]"
                  }`}>
                    <span className="material-symbols-outlined text-sm">credit_card</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">Tarjeta de crédito / débito</p>
                    <p className="text-xs text-[#7a7877]">Visa, Mastercard, Amex</p>
                  </div>
                  {paymentMethod === "card" && (
                    <span className="material-symbols-outlined text-[#d5521b] ml-auto">check_circle</span>
                  )}
                </button>

                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === "cash" ? "border-[#d5521b] bg-[#fff4ee]" : "border-[#eee] bg-[#f9f6f5]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    paymentMethod === "cash" ? "bg-[#d5521b] text-white" : "bg-[#eee] text-[#7a7877]"
                  }`}>
                    <span className="material-symbols-outlined text-sm">payments</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">Pago en efectivo</p>
                    <p className="text-xs text-[#7a7877]">Paga directamente en el local</p>
                  </div>
                  {paymentMethod === "cash" && (
                    <span className="material-symbols-outlined text-[#d5521b] ml-auto">check_circle</span>
                  )}
                </button>
              </div>

              <button
                onClick={handleConfirmReservation}
                disabled={isProcessing}
                className="w-full py-4 rounded-full bg-gradient-to-br from-[#d5521b] to-[#ff7851] text-white font-bold text-sm shadow-lg shadow-[#d5521b]/30 active:scale-95 transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Pagar ${business.price.toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-[#a19b98]">
                Pago seguro con cifrado SSL · Garantía Hearth Secure™
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Booking;