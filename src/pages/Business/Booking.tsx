import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import HeaderUser from "../../components/user/HeaderUser";
import { apiFetch } from "../../utils/api";

interface Business {
  id: string;
  name: string;
  category_name: string;
  image_url: string;
  rating: number;
  reviews_count: number;
  address: string;
}

interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  active: boolean;
  professionals?: { id: string }[];
  weekly_hours?: Record<string, string[]>;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: string;
}

interface TimeSlot {
  id: string;
  label: string;
  hour: number;
  minute: number;
  period: "MORNING" | "AFTERNOON";
}

interface AvailabilityBlockApi {
  id: string;
  start_at: string;
  end_at: string;
}

interface BookingApi {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
}

interface AvailabilityResponse {
  blocks: AvailabilityBlockApi[];
  bookings: BookingApi[];
  weekly_hours: Record<string, string[]>;
}

const WEEKDAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const SLOT_STEP_MINUTES = 30;

function parseClock(value: string): { hour: number; minute: number } {
  const [h, m] = value.split(":").map((n) => parseInt(n, 10));
  return { hour: h || 0, minute: m || 0 };
}

function formatSlotLabel(hour: number, minute: number) {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Builds the list of bookable time slots for a given date, based on the
 * business' (or service's) weekly_hours windows, the service duration,
 * and existing blocks/bookings that would make a slot unavailable.
 * Mirrors the overlap logic the backend uses in business_is_available /
 * schedule_allows_slot so the UI doesn't offer slots the backend will reject.
 */
function buildSlotsForDate(
  date: Date,
  weeklyHours: Record<string, string[]> | undefined,
  durationMinutes: number,
  blocks: AvailabilityBlockApi[],
  bookings: BookingApi[],
): TimeSlot[] {
  if (!weeklyHours) return [];

  const dayKey = WEEKDAY_KEYS[(date.getDay() + 6) % 7]; // getDay(): 0=Sun -> map to monday-first
  const windows = weeklyHours[dayKey] || [];
  if (windows.length < 2 || windows.length % 2 !== 0) return [];

  const busyRanges = [
    ...blocks.map((b) => ({
      start: new Date(b.start_at),
      end: new Date(b.end_at),
    })),
    ...bookings
      .filter((b) => !["canceled", "rejected"].includes(b.status))
      .map((b) => ({ start: new Date(b.start_at), end: new Date(b.end_at) })),
  ];

  const slots: TimeSlot[] = [];

  for (let i = 0; i < windows.length; i += 2) {
    const start = parseClock(windows[i]);
    const end = parseClock(windows[i + 1]);

    const windowStart = new Date(date);
    windowStart.setHours(start.hour, start.minute, 0, 0);
    const windowEnd = new Date(date);
    windowEnd.setHours(end.hour, end.minute, 0, 0);

    let cursor = new Date(windowStart);
    while (true) {
      const slotEnd = new Date(cursor.getTime() + durationMinutes * 60000);
      if (slotEnd > windowEnd) break;

      const isBusy = busyRanges.some((range) =>
        rangesOverlap(cursor, slotEnd, range.start, range.end),
      );

      if (!isBusy) {
        const hour = cursor.getHours();
        slots.push({
          id: `${cursor.getHours()}:${cursor.getMinutes()}`,
          label: formatSlotLabel(cursor.getHours(), cursor.getMinutes()),
          hour: cursor.getHours(),
          minute: cursor.getMinutes(),
          period: hour < 12 ? "MORNING" : "AFTERNOON",
        });
      }

      cursor = new Date(cursor.getTime() + SLOT_STEP_MINUTES * 60000);
    }
  }

  return slots;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const Booking: React.FC = () => {
  const { id: businessIdFromUrl } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state || {}) as {
    business?: Business;
    services?: Service[];
    team?: TeamMember[];
    preselectedServiceId?: string;
  };

  const business = state.business;
  const services = useMemo(() => state.services ?? [], [state.services]);
  const team = useMemo(() => state.team ?? [], [state.team]);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    state.preselectedServiceId ??
      (services.length === 1 ? services[0].id : null),
  );
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    string | null
  >(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState("");

  const [availability, setAvailability] = useState<AvailabilityResponse | null>(
    null,
  );
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load real availability (existing blocks + bookings + weekly_hours) so
  // the slots offered actually match what the backend will accept.
  useEffect(() => {
    if (!business?.id) return;
    setAvailabilityLoading(true);
    setAvailabilityError(null);
    apiFetch(`/businesses/${business.id}/availability`)
      .then((data: AvailabilityResponse) => setAvailability(data))
      .catch((e) => setAvailabilityError(e.message))
      .finally(() => setAvailabilityLoading(false));
  }, [business?.id]);

  const baseDate = new Date();
  const days = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + index);
    return {
      label: date
        .toLocaleDateString("es-PE", { weekday: "short" })
        .replace(".", "")
        .toUpperCase(),
      day: date.getDate(),
      monthLabel: date.toLocaleDateString("es-PE", { month: "short" }),
      fullDate: formatDateKey(date),
      fullLabel: date.toLocaleDateString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      raw: date,
    };
  });

  const selectedService =
    services.find((s) => s.id === selectedServiceId) || null;

  // Only professionals assigned to the selected service can be chosen,
  // matching the backend rule in POST /bookings.
  const availableProfessionals: TeamMember[] = useMemo(() => {
    if (!selectedService) return [];
    const allowedIds = new Set(
      (selectedService.professionals || []).map((p) => p.id),
    );
    return team.filter((member) => allowedIds.has(member.id));
  }, [selectedService, team]);

  const selectedProfessional =
    availableProfessionals.find((p) => p.id === selectedProfessionalId) || null;

  // Service-specific schedule takes priority; otherwise fall back to the
  // business' general weekly_hours, same precedence as the backend's
  // service_allows_slot().
  const effectiveWeeklyHours = useMemo(() => {
    if (
      selectedService?.weekly_hours &&
      Object.keys(selectedService.weekly_hours).length > 0
    ) {
      return selectedService.weekly_hours;
    }
    return availability?.weekly_hours;
  }, [selectedService, availability]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedService || !availability) return [];
    const date = days[selectedDateIndex]?.raw;
    if (!date) return [];
    return buildSlotsForDate(
      date,
      effectiveWeeklyHours,
      selectedService.duration_minutes,
      availability.blocks,
      availability.bookings,
    );
  }, [selectedService, availability, effectiveWeeklyHours, selectedDateIndex]);

  const morningSlotsForDate = slotsForSelectedDate.filter(
    (s) => s.period === "MORNING",
  );
  const afternoonSlotsForDate = slotsForSelectedDate.filter(
    (s) => s.period === "AFTERNOON",
  );

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedProfessionalId(null);
    setSelectedTime(null);
    setError(null);
  };

  const handleSelectDate = (index: number) => {
    setSelectedDateIndex(index);
    setSelectedTime(null);
  };

  if (!business || services.length === 0) {
    return (
      <div className="bg-[#f9f6f5] text-[#2f2f2e] min-h-screen">
        <HeaderUser />
        <main className="max-w-3xl mx-auto px-6 pt-28 pb-8 text-center">
          <p className="text-lg font-semibold mb-4">
            No se encontró información del negocio para reservar.
          </p>
          <p className="text-sm text-[#7a7877] mb-6">
            Vuelve al perfil del negocio y selecciona "Reservar" o un servicio
            específico.
          </p>
          <button
            onClick={() =>
              navigate(
                businessIdFromUrl ? `/business/${businessIdFromUrl}` : "/home",
              )
            }
            className="text-sm font-semibold text-[#ab2d00] hover:underline"
          >
            ← Volver al negocio
          </button>
        </main>
      </div>
    );
  }

  const handleOpenModal = () => {
    setError(null);
    if (!selectedService) {
      setError("Selecciona un servicio");
      return;
    }
    if (!selectedProfessional) {
      setError("Selecciona un profesional");
      return;
    }
    if (!selectedTime) {
      setError("Selecciona un horario");
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmReservation = async () => {
    if (!selectedService || !selectedProfessional || !selectedTime) return;

    setIsProcessing(true);
    setError(null);

    try {
      const date = days[selectedDateIndex].raw;
      const startAt = new Date(date);
      startAt.setHours(selectedTime.hour, selectedTime.minute, 0, 0);

      await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify({
          business_id: business.id,
          service_id: selectedService.id,
          professional_id: selectedProfessional.id,
          start_at: startAt.toISOString(),
          notes: notes || undefined,
        }),
      });

      setShowPaymentModal(false);
      navigate("/home", { state: { bookingConfirmed: true } });
    } catch (err: any) {
      setError(err.message || "No se pudo crear la reserva");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] min-h-screen">
      <HeaderUser />

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-8">
          {/* Business Card */}
          <section className="bg-white rounded-3xl shadow-sm p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-full md:w-28 h-28 rounded-2xl overflow-hidden shrink-0">
              <img
                src={business.image_url}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffe7dd] text-[#c1491c] text-[11px] font-bold uppercase tracking-wide">
                {business.category_name}
              </span>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
                    {business.name}
                  </h1>
                  <p className="text-sm text-[#7a7877] flex flex-wrap items-center gap-2 mt-2">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#ff7851]">
                        star
                      </span>
                      {business.rating.toFixed(1)} ({business.reviews_count}{" "}
                      reseñas)
                    </span>
                  </p>
                  <p className="text-sm text-[#7a7877] mt-2">
                    {business.address}
                  </p>
                </div>
                {selectedService && (
                  <div className="text-left md:text-right">
                    <p className="text-sm text-[#7a7877]">Servicio elegido</p>
                    <p className="text-xl md:text-2xl font-extrabold text-[#d5521b]">
                      S/. {selectedService.price.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Service Picker */}
          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-1">Elige un servicio</h2>
            <p className="text-xs text-[#7a7877] mb-4">
              ¿Qué quieres reservar?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((service) => {
                const isActive = service.id === selectedServiceId;
                return (
                  <button
                    key={service.id}
                    onClick={() => handleSelectService(service.id)}
                    disabled={service.active === false}
                    className={`text-left p-4 rounded-2xl border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      isActive
                        ? "border-[#d5521b] bg-[#fff4ee]"
                        : "border-transparent bg-[#f5f2f1]"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-bold text-sm">{service.name}</p>
                      <span className="font-bold text-sm text-[#d5521b] shrink-0">
                        S/. {service.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-[#7a7877] mt-1">
                      {service.duration_minutes} min
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Professionals (filtered by selected service) */}
          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Elige un profesional</h2>
            {!selectedService ? (
              <p className="text-sm text-[#7a7877]">
                Primero selecciona un servicio.
              </p>
            ) : availableProfessionals.length === 0 ? (
              <p className="text-sm text-[#7a7877]">
                Este servicio no tiene profesionales disponibles en este
                momento.
              </p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {availableProfessionals.map((pro) => {
                  const isActive = pro.id === selectedProfessionalId;
                  return (
                    <button
                      key={pro.id}
                      onClick={() => setSelectedProfessionalId(pro.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-full border transition-all ${
                        isActive
                          ? "border-[#d5521b] bg-[#fff4ee]"
                          : "border-transparent bg-[#f5f2f1]"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        <img
                          src={
                            pro.image || "https://placehold.co/100x100?text=%20"
                          }
                          alt={pro.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">{pro.name}</p>
                        {pro.role && (
                          <p className="text-[11px] text-[#7a7877]">
                            {pro.role}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Date Picker */}
          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">Selecciona una fecha</h2>
                <p className="text-xs text-[#7a7877]">
                  Elige el día que prefieras para tu sesión
                </p>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {days.map((d, index) => {
                const isActive = index === selectedDateIndex;
                return (
                  <button
                    key={d.fullDate}
                    onClick={() => handleSelectDate(index)}
                    className={`w-16 h-20 rounded-2xl flex flex-col items-center justify-center text-sm font-semibold transition-all shrink-0 ${
                      isActive
                        ? "bg-[#ff7851] text-white shadow-md"
                        : "bg-[#f5f2f1] text-[#5a5857]"
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

            {!selectedService ? (
              <p className="text-sm text-[#7a7877]">
                Primero selecciona un servicio.
              </p>
            ) : availabilityLoading ? (
              <p className="text-sm text-[#7a7877]">
                Cargando horarios disponibles...
              </p>
            ) : availabilityError ? (
              <p className="text-sm text-[#a02323]">{availabilityError}</p>
            ) : slotsForSelectedDate.length === 0 ? (
              <p className="text-sm text-[#7a7877]">
                No hay horarios disponibles para este día. Prueba otra fecha.
              </p>
            ) : (
              <>
                {morningSlotsForDate.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#7a7877] mb-2">
                      MAÑANA
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {morningSlotsForDate.map((slot) => {
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
                )}
                {afternoonSlotsForDate.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#7a7877] mb-2">
                      TARDE
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {afternoonSlotsForDate.map((slot) => {
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
                )}
              </>
            )}
          </section>

          {/* Notes */}
          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-2">Notas (opcional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Algo que el negocio deba saber antes de tu cita..."
              className="w-full border border-[#eee] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7851] resize-none"
              rows={3}
            />
          </section>

          {error && (
            <div className="bg-[#fde2e2] text-[#a02323] px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={() => navigate(`/business/${business.id}`)}
            className="text-sm font-semibold text-[#ab2d00] hover:underline"
          >
            ← Volver al negocio
          </button>
        </div>

        {/* Aside Summary */}
        <aside className="space-y-4">
          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#7a7877] mb-4">
              Resumen de la reserva
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#7a7877]">Servicio</span>
                <span className="font-semibold text-right">
                  {selectedService?.name || "—"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#7a7877]">Fecha</span>
                <span className="font-semibold text-right">
                  {days[selectedDateIndex].fullLabel}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#7a7877]">Hora</span>
                <span className="font-semibold text-right">
                  {selectedTime?.label || "—"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#7a7877]">Especialista</span>
                <span className="font-semibold text-right">
                  {selectedProfessional?.name || "—"}
                </span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#eee1da] space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-[#7a7877] font-semibold">
                    PRECIO TOTAL
                  </p>
                  <p className="text-2xl font-extrabold">
                    S/.{" "}
                    {selectedService
                      ? selectedService.price.toFixed(2)
                      : "0.00"}
                  </p>
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
                Al hacer clic en confirmar, aceptas nuestra política de
                cancelación y términos del servicio.
              </p>
            </div>
          </section>

          <section className="bg-gradient-to-r from-[#f4d8ff] to-[#ffe1ef] rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#b048ff]">
                  verified_user
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#7a2e8b]">
                  Garantía Hearth Secure™
                </p>
                <p className="text-xs text-[#7a2e8b]/90">
                  Pago seguro y proveedores certificados en cada reserva.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isProcessing && setShowPaymentModal(false)}
          />

          <div
            className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            style={{ animation: "slideUp 0.3s ease-out" }}
          >
            <div className="bg-gradient-to-br from-[#d5521b] to-[#ff7851] p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                    Confirmar pago
                  </p>
                  <p className="text-3xl font-extrabold mt-1">
                    S/. {selectedService.price.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => !isProcessing && setShowPaymentModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">
                    close
                  </span>
                </button>
              </div>

              <div className="mt-4 bg-white/15 rounded-2xl p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-80">Servicio</span>
                  <span className="font-semibold">{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Fecha</span>
                  <span className="font-semibold">
                    {days[selectedDateIndex].fullLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Hora</span>
                  <span className="font-semibold">{selectedTime?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Especialista</span>
                  <span className="font-semibold">
                    {selectedProfessional?.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm font-bold text-[#2f2f2e]">Método de pago</p>

              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === "card"
                      ? "border-[#d5521b] bg-[#fff4ee]"
                      : "border-[#eee] bg-[#f9f6f5]"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      paymentMethod === "card"
                        ? "bg-[#d5521b] text-white"
                        : "bg-[#eee] text-[#7a7877]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      credit_card
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">
                      Tarjeta de crédito / débito
                    </p>
                    <p className="text-xs text-[#7a7877]">
                      Visa, Mastercard, Amex
                    </p>
                  </div>
                  {paymentMethod === "card" && (
                    <span className="material-symbols-outlined text-[#d5521b] ml-auto">
                      check_circle
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === "cash"
                      ? "border-[#d5521b] bg-[#fff4ee]"
                      : "border-[#eee] bg-[#f9f6f5]"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      paymentMethod === "cash"
                        ? "bg-[#d5521b] text-white"
                        : "bg-[#eee] text-[#7a7877]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      payments
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">Pago en efectivo</p>
                    <p className="text-xs text-[#7a7877]">
                      Paga directamente en el local
                    </p>
                  </div>
                  {paymentMethod === "cash" && (
                    <span className="material-symbols-outlined text-[#d5521b] ml-auto">
                      check_circle
                    </span>
                  )}
                </button>
              </div>

              {error && (
                <div className="bg-[#fde2e2] text-[#a02323] px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleConfirmReservation}
                disabled={isProcessing}
                className="w-full py-4 rounded-full bg-gradient-to-br from-[#d5521b] to-[#ff7851] text-white font-bold text-sm shadow-lg shadow-[#d5521b]/30 active:scale-95 transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">
                      lock
                    </span>
                    Confirmar reserva
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
