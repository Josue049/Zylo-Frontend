import { useState, useEffect } from "react";
// import { notifyStatusChange } from "../../data/notifications";

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

  const getAuthToken = (): string => {
    try {
      const rawSession = localStorage.getItem("zylo_session");
      if (rawSession) {
        const session = JSON.parse(rawSession);
        return session?.token ?? "";
      }
    } catch (error) {
      console.error("Error al recuperar el token de sesión:", error);
    }
    return "";
  };

  useEffect(() => {
    const token = getAuthToken();

    fetch("http://127.0.0.1:8000/businesses/me/bookings", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error en el servidor: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Respuesta del backend exitosa:", data);
        if (data && Array.isArray(data.items)) {
          const adapted = data.items.map((b: any) => ({
            id: b.id,
            cliente: b.user_name,
            servicio: b.service_name,
            fecha: new Date(b.start_at).toLocaleString(),
            estado: b.status,
            userId: b.user_id,
          }));
          setReservations(adapted);
        }
      })
      .catch((error) => {
        console.error("Hubo un problema con la petición fetch:", error);
      });
  }, []);

  const changeStatus = async (id: string, status: string) => {
    try {
      const token = getAuthToken();

      const response = await fetch(
        `http://127.0.0.1:8000/bookings/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado");
      }

      const updated = reservations.map((r) =>
        r.id === id ? { ...r, estado: status } : r,
      );

      setReservations(updated);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className='bg-[#f9f6f5] p-6 rounded-xl space-y-6'>
      <h2 className='font-headline text-2xl font-bold'>Reservas</h2>

      <div className='space-y-4'>
        {reservations.map((r) => (
          <div
            key={r.id}
            className='bg-white p-6 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)] flex flex-col gap-4'
          >
            <div className='flex justify-between items-center'>
              <h3 className='font-headline text-lg font-bold text-[#2f2f2e]'>
                {r.cliente}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  r.estado === "aceptado" ? "bg-[#d4edda] text-[#155724]"
                  : r.estado === "rechazado" ? "bg-[#f8d7da] text-[#721c24]"
                  : "bg-[#fff3cd] text-[#856404]"
                }`}
              >
                {r.estado}
              </span>
            </div>
            <div className='space-y-2'>
              <p className='text-on-surface-variant text-sm'>
                <span className='font-semibold'>Servicio:</span> {r.servicio}
              </p>
              <p className='text-on-surface-variant text-sm'>
                <span className='font-semibold'>Fecha:</span> {r.fecha}
              </p>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => changeStatus(r.id, "aceptado")}
                className='bg-[#28a745] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#218838] transition-colors active:scale-95'
              >
                Aceptar
              </button>
              <button
                onClick={() => changeStatus(r.id, "rechazado")}
                className='bg-[#dc3545] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#c82333] transition-colors active:scale-95'
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