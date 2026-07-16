import { useState, useEffect } from "react";
import { apiFetch } from "../../utils/api";

type Reservation = {
  id: string;
  cliente: string;
  servicio: string;
  fecha: string;
  estado: string;
  userId?: string;
  businessName?: string;
};

export default function ReservationsManager() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const normalizeStatus = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
      case "pendiente":
        return "Pendiente";

      case "accepted":
      case "aceptada":
      case "aceptado":
        return "Aceptada";

      case "rejected":
      case "rechazada":
      case "rechazado":
        return "Rechazada";

      case "canceled":
      case "cancelled":
      case "cancelada":
      case "cancelado":
        return "Cancelada";

      case "completed":
      case "completada":
      case "completado":
        return "Completada";

      default:
        return status;
    }
  };

  useEffect(() => {
    apiFetch("/businesses/me/bookings")
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          const adapted = data.items.map((b: any) => ({
            id: b.id,
            cliente: b.user_name || "Cliente",
            servicio: b.service_name || "Servicio",
            fecha: b.start_at
              ? new Date(b.start_at).toLocaleString("es-ES")
              : "Sin fecha",
            estado: normalizeStatus(b.status),
            userId: b.user_id,
            businessName: b.business_name,
          }));

          setReservations(adapted);
        }
      })
      .catch((error) => {
        console.error("Hubo un problema con la petición API:", error);
      });
  }, []);

  const changeStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setReservations((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, estado: normalizeStatus(status) } : r,
        ),
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const statusClass = (estado: string) => {
    switch (normalizeStatus(estado)) {
      case "Aceptada":
        return "bg-[#d4edda] text-[#155724]";

      case "Rechazada":
        return "bg-[#f8d7da] text-[#721c24]";

      case "Cancelada":
        return "bg-[#f8d7da] text-[#721c24]";

      case "Completada":
        return "bg-[#d1ecf1] text-[#0c5460]";

      default:
        return "bg-[#fff3cd] text-[#856404]";
    }
  };

  return (
    <div className="bg-[#f9f6f5] p-6 rounded-xl space-y-6">
      <h2 className="font-headline text-2xl font-bold">Reservas</h2>

      <div className="space-y-4">
        {reservations.map((r) => (
          <div
            key={r.id}
            className="bg-white p-6 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)] flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-headline text-lg font-bold text-[#2f2f2e]">
                {r.cliente}
              </h3>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusClass(
                  r.estado,
                )}`}
              >
                {normalizeStatus(r.estado)}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-on-surface-variant text-sm">
                <span className="font-semibold">Servicio:</span> {r.servicio}
              </p>

              <p className="text-on-surface-variant text-sm">
                <span className="font-semibold">Fecha:</span> {r.fecha}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => changeStatus(r.id, "accepted")}
                className="bg-[#28a745] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#218838] transition-colors active:scale-95"
              >
                Aceptar
              </button>

              <button
                onClick={() => changeStatus(r.id, "rejected")}
                className="bg-[#dc3545] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#c82333] transition-colors active:scale-95"
              >
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
