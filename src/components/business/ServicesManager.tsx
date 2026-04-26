import { useState, useEffect } from "react";

type Service = {
    id: number;
    name: string;
    price: string;
};

export default function ServicesManager() {
    const [services, setServices] = useState<Service[]>([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const addService = () => {
        if (!name || !price) return;

        const newService = {
            id: Date.now(),
            name,
            price
        };

        saveServices([...services, newService]);

        setName("");
        setPrice("");
    };

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("services") || "[]");
        setServices(data);
    }, []);

    const saveServices = (newServices: Service[]) => {
        setServices(newServices);
        localStorage.setItem("services", JSON.stringify(newServices));
    };

    const deleteService = (id: number) => {
        const filtered = services.filter(s => s.id !== id);
        saveServices(filtered);
    };

    return (
        <div className="bg-[#f9f6f5] p-6 rounded-xl space-y-6">
            <h2 className="font-headline text-2xl font-bold text-[#2f2f2e]">Servicios</h2>

            <div className="bg-white p-6 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)]">
                <div className="flex gap-4 mb-6">
                    <input
                        className="border border-[#e4e2e1] p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Nombre/tipo del Servicio"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <input
                        className="border border-[#e4e2e1] p-3 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="S/ 20"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />

                    <button
                        onClick={addService}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#962700] transition-colors active:scale-95 shadow-lg"
                    >
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {services.map((s) => (
                    <div key={s.id} className="bg-white p-6 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)] flex justify-between items-center">
                        <div>
                            <h3 className="font-headline text-lg font-bold text-[#2f2f2e]">{s.name}</h3>
                            <p className="text-on-surface-variant text-sm">Precio: S/ {s.price}</p>
                        </div>
                        <button
                            onClick={() => deleteService(s.id)}
                            className="text-[#dc3545] hover:text-[#c82333] transition-colors p-2 rounded-full hover:bg-[#f8d7da]"
                        >
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}