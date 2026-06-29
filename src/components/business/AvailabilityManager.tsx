import { useState } from "react";

export default function AvailabilityManager() {
    // 1. Estados para capturar los datos del formulario
    const [fecha, setFecha] = useState("");
    const [horaInicio, setHoraInicio] = useState("");
    const [horaFin, setHoraFin] = useState("");
    const [reason, setReason] = useState("Disponible");
    const [loading, setLoading] = useState(false);

    // ID de negocio de prueba (puedes cambiarlo por el que tengas en tu base de datos)
    const businessId = "1"; 

    // 2. Función para enviar los datos al backend en Python
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fecha || !horaInicio || !horaFin) {
            alert("Por favor, completa todos los campos de fecha y hora.");
            return;
        }

        setLoading(true);

        // Convertimos la combinación de Fecha + Hora al formato ISO (YYYY-MM-DDTHH:MM:SS.mmmZ) que pide FastAPI
        const start_at = new Date(`${fecha}T${horaInicio}:00`).toISOString();
        const end_at = new Date(`${fecha}T${horaFin}:00`).toISOString();

        // Estructura exacta del Request Body según Swagger
        const bodyBackend = {
            start_at,
            end_at,
            reason
        };

        try {
            // Petición POST al backend de FastAPI ejecutándose localmente
            const response = await fetch(`http://localhost:8000/businesses/${businessId}/availability-blocks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Si el backend pide token en el avance, descomenta la siguiente línea:
                    // "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(bodyBackend),
            });

            if (response.ok) {
                alert("¡Bloque de disponibilidad agregado con éxito en el Backend!");
                // Limpiamos los campos del formulario
                setFecha("");
                setHoraInicio("");
                setHoraFin("");
                setReason("Disponible");
            } else {
                const errorData = await response.json();
                alert(`Error del servidor: ${errorData.detail || "No se pudo guardar el bloque."}`);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("Hubo un error de red al intentar conectar con el backend. Asegúrate de que Python está corriendo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f9f6f5] p-6 rounded-xl space-y-6 max-w-md mx-auto mt-10 shadow-sm">
            <h2 className="font-headline text-2xl font-bold text-[#2f2f2e] text-center">
                Disponibilidad - Añadir Bloque
            </h2>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)] space-y-4">
                {/* Selector de Fecha */}
                <div>
                    <label className="block text-sm font-semibold text-[#2f2f2e] mb-1">Selecciona el Día</label>
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full border border-[#e4e2e1] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                {/* Grid de Horas */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#2f2f2e] mb-1">Hora Inicio</label>
                        <input
                            type="time"
                            value={horaInicio}
                            onChange={(e) => setHoraInicio(e.target.value)}
                            className="w-full border border-[#e4e2e1] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#2f2f2e] mb-1">Hora Fin</label>
                        <input
                            type="time"
                            value={horaFin}
                            onChange={(e) => setHoraFin(e.target.value)}
                            className="w-full border border-[#e4e2e1] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Motivo del bloqueo */}
                <div>
                    <label className="block text-sm font-semibold text-[#2f2f2e] mb-1">Motivo / Razón</label>
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ej. Disponible, Almuerzo, Reunión"
                        className="w-full border border-[#e4e2e1] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                {/* Botón de envío */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white p-3 rounded-lg font-semibold hover:bg-[#2f2f2e] transition-colors active:scale-95 shadow-lg disabled:bg-gray-400"
                >
                    {loading ? "Guardando..." : "Guardar Bloque"}
                </button>
            </form>
        </div>
    );
}