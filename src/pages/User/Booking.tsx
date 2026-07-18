import { useEffect, useState } from "react";
import HeaderUser from "../../components/user/HeaderUser";
import { apiFetch } from "../../utils/api";

// Estructura de datos actualizada según el payload del backend
interface Booking {
  id: string;
  user_id: string;
  business_id: string;
  business_name?: string;
  business_category?: string; // Añadido para mostrar categoría del local
  business_image_url?: string;
  service_id: string;
  service_name?: string;
  professional_id: string;
  professional_name?: string; // Añadido para mostrar nombre del profesional
  start_at: string;
  end_at: string;
  status: "pending" | "confirmed" | "cancelled" | "canceled" | string;
  price: number; // Usamos 'price' del servicio, no 'total_price'
}

// Mapeo de estados con estilos actualizados
const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pendiente", classes: "bg-amber-100 text-amber-700 border border-amber-200" },
  confirmed: { label: "Confirmada", classes: "bg-green-100 text-green-700 border border-green-200" },
  cancelled: { label: "Cancelada", classes: "bg-red-100 text-red-700 border border-red-200" },
  canceled: { label: "Cancelada", classes: "bg-red-100 text-red-700 border border-red-200" }, // Soporte para ambas ortografías
};

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        // Llamada al endpoint correcto definido en el backend
        const data = await apiFetch("/users/me/bookings");
        // Aseguramos que data.items exista, si no, usamos un array vacío
        setBookings(data.items ?? []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar tus reservas. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  return (
    <div className="bg-[#faf9f8] text-on-surface min-h-screen font-body antialiased flex flex-col">
      <HeaderUser />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface mb-2">
              Mis Reservas
            </h1>
            <p className="text-base text-on-surface-variant max-w-2xl">
              Gestiona tus próximas citas, revisa tu historial y sigue el estado de tus servicios contratados en Zylo.
            </p>
          </div>
          <a
            href="/home"
            className="inline-flex items-center gap-2 bg-white border border-black/[0.08] text-on-surface px-5 py-3 rounded-full text-sm font-bold shadow-sm hover:bg-[#f3f0ef] transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-base">search</span>
            Buscar nuevos servicios
          </a>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-black/[0.03] shadow-sm flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-on-surface-variant text-base font-medium">Estamos recuperando tus reservas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 rounded-2xl p-8 text-center border border-red-200 text-base font-semibold shadow-inner">
            <span className="material-symbols-outlined text-3xl mb-2 block">error</span>
            {error}
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const statusConfig = STATUS_MAP[booking.status] ?? {
                label: booking.status,
                classes: "bg-gray-100 text-gray-700 border border-gray-200",
              };

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.03] shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto min-w-0">
                    <img
                      src={booking.business_image_url || "https://placehold.co/180?text=Negocio"}
                      alt={booking.business_name || "Negocio"}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 bg-[#f3f0ef] shadow-inner border border-black/[0.03]"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/180?text=Negocio";
                      }}
                    />
                    <div className="min-w-0 flex-1 space-y-3">
                      {/* Información del Local y Servicio */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="material-symbols-outlined text-primary text-base">storefront</span>
                          <p className="text-sm text-primary font-bold truncate uppercase tracking-wider">
                            {booking.business_name || "Establecimiento"}
                            {booking.business_category && <span className="text-outline font-medium"> • {booking.business_category}</span>}
                          </p>
                        </div>
                        <h3 className="font-headline font-extrabold text-xl sm:text-2xl text-on-surface truncate leading-tight">
                          {booking.service_name || "Servicio Contratado"}
                        </h3>
                      </div>

                      {/* Información del Profesional */}
                      {/* <div className="flex items-center gap-2.5 bg-[#f9f6f5] px-4 py-2 rounded-xl border border-black/[0.03]">
                        <span className="material-symbols-outlined text-outline text-lg">person</span>
                        <p className="text-sm text-on-surface-variant font-mediumtruncate">
                          Atendido por: <span className="font-semibold text-on-surface">{booking.professional_name || "Profesional asignado"}</span>
                        </p>
                      </div> */}

                      {/* Fecha y Hora */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-outline font-medium pt-1">
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-primary">calendar_today</span>
                          {new Date(booking.start_at).toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-primary">schedule</span>
                          {new Date(booking.start_at).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estado y Precio */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 w-full lg:w-auto pt-5 lg:pt-0 border-t lg:border-0 border-black/[0.05] shrink-0">
                    <span className={`text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider ${statusConfig.classes}`}>
                      {statusConfig.label}
                    </span>
                    <div className="text-right">
                      <p className="text-xs text-outline font-medium mb-0.5">Precio del servicio</p>
                      <span className="font-headline font-black text-2xl sm:text-3xl text-on-surface leading-none">
                        S/ {booking.price?.toFixed(2) ?? "0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-black/[0.03] shadow-sm flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 bg-[#f3f0ef] rounded-full flex items-center justify-center text-outline shadow-inner">
              <span className="material-symbols-outlined text-4xl">calendar_today</span>
            </div>
            <div className="max-w-md">
              <p className="text-on-surface font-extrabold text-xl mb-2">Aún no tienes reservas activas</p>
              <p className="text-on-surface-variant text-base">Parece que no has agendado ninguna cita últimamente. Explora los mejores locales de belleza y bienestar cerca de ti para empezar.</p>
            </div>
            <a
              href="/home"
              className="bg-primary text-white px-8 py-3.5 rounded-full text-base font-bold hover:bg-[#8a2400] transition-colors shadow-lg shadow-primary/20 flex items-center gap-2.5"
            >
              <span className="material-symbols-outlined text-xl">search</span>
              Explorar locales y servicios
            </a>
          </div>
        )}
      </main>
    </div>
  );
}