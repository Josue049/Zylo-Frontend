import { useState, useEffect } from "react";

type Availability = {
    id: number;
    date: string;
};

export default function AvailabilityManager() {
    const [dates, setDates] = useState<Availability[]>([]);
    const [date, setDate] = useState("");
    const blockDate = () => {
        if (!date) return;

        const newDate: Availability = {
            id: Date.now(),
            date
        };

        saveDates([...dates, newDate]);
        setDate("");
    };

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("availability") || "[]");
        setDates(data);
    }, []);

    const saveDates = (newDates: Availability[]) => {
        setDates(newDates);
        localStorage.setItem("availability", JSON.stringify(newDates));
    };

    const removeDate = (id: number) => {
        const filtered = dates.filter(d => d.id !== id);
        saveDates(filtered);
    };

    return (
        <div className="bg-[#f9f6f5] p-6 rounded-xl space-y-6">
            <h2 className="font-headline text-2xl font-bold text-[#2f2f2e]">Disponibilidad</h2>

            <div className="bg-white p-6 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)]">
                <div className="flex gap-4 mb-6">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border border-[#e4e2e1] p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                        onClick={blockDate}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#962700] transition-colors active:scale-95 shadow-lg"
                    >
                        Bloquear
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {dates.map((d) => (
                    <div key={d.id} className="bg-white p-6 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)] flex justify-between items-center">
                        <div>
                            <h3 className="font-headline text-lg font-bold text-[#2f2f2e]">Fecha Bloqueada</h3>
                            <p className="text-on-surface-variant text-sm">{d.date}</p>
                        </div>
                        <button
                            onClick={() => removeDate(d.id)}
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