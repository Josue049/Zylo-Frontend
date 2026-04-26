import { useState, useEffect } from "react";

type Reservation = {
    id: number;
    cliente: string;
    servicio: string;
    fecha: string;
    estado: string;
};

export default function ReservationsManager() {
    const [reservations, setReservations] = useState<Reservation[]>([]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("reservations") || "[]");

        if (data.length === 0) {
            const demo: Reservation[] = [
                {
                    id: 1,
                    cliente: "Sebastian",
                    servicio: "Corte degradado",
                    fecha: "2026-04-27",
                    estado: "pendiente"
                },
                {
                    id: 2,
                    cliente: "Jessenia",
                    servicio: "Pintado de cabello",
                    fecha: "2026-04-28",
                    estado: "pendiente"
                },
                {
                    id: 3,
                    cliente: "Alonso",
                    servicio: "Limpieza facial",
                    fecha: "2026-04-29",
                    estado: "pendiente"
                },
                {
                    id: 4,
                    cliente: "Raúl",
                    servicio: "Corte normal + depilación de cejas",
                    fecha: "2026-04-30",
                    estado: "pendiente"
                },
                {
                    id: 5,
                    cliente: "Enrique",
                    servicio: "Corte degradado + limpieza facial",
                    fecha: "2026-05-02",
                    estado: "pendiente"
                },
                {
                    id: 6,
                    cliente: "Luisa",
                    servicio: "Planchado de cabello",
                    fecha: "2026-05-03",
                    estado: "pendiente"
                },
                {
                    id: 7,
                    cliente: "María",
                    servicio: "Corte de cabello",
                    fecha: "2026-05-05",
                    estado: "pendiente"
                }
            ];

            localStorage.setItem("reservations", JSON.stringify(demo));
            setReservations(demo);
        } else {
            setReservations(data);
        }
    }, []);

    const saveReservations = (newData: Reservation[]) => {
        setReservations(newData);
        localStorage.setItem("reservations", JSON.stringify(newData));
    };

    const changeStatus = (id: number, status: string) => {
        const updated = reservations.map(r =>
            r.id === id ? { ...r, estado: status } : r
        );

        saveReservations(updated);
    };

    return (
        <div className="bg-[#f9f6f5] p-6 rounded-xl space-y-6">
            <h2 className="font-headline text-2xl font-bold">Reservas</h2>

            <div className="space-y-4">
                {reservations.map((r) => (
                    <div key={r.id} className="bg-white p-6 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)] flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-headline text-lg font-bold text-[#2f2f2e]">{r.cliente}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                r.estado === "aceptado"
                                    ? "bg-[#d4edda] text-[#155724]"
                                    : r.estado === "rechazado"
                                        ? "bg-[#f8d7da] text-[#721c24]"
                                        : "bg-[#fff3cd] text-[#856404]"
                            }`}>
                                {r.estado}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-on-surface-variant text-sm"><span className="font-semibold">Servicio:</span> {r.servicio}</p>
                            <p className="text-on-surface-variant text-sm"><span className="font-semibold">Fecha:</span> {r.fecha}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => changeStatus(r.id, "aceptado")}
                                className="bg-[#28a745] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#218838] transition-colors active:scale-95"
                            >
                                Aceptar
                            </button>
                            <button
                                onClick={() => changeStatus(r.id, "rechazado")}
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