import { useState, useEffect } from "react";
import { getSession } from "../../hooks/userCurrentUser";

const BASE_URL = "https://backend-zylo.vercel.app";

type Service = {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  active?: boolean;
  professionals?: { id: string }[];
};

type TeamMember = {
  id: string;
  name: string;
  role?: string;
};

async function apiFetch(path: string, options?: RequestInit) {
  const session = getSession();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.token}`,
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error del servidor");
  }
  return res.json();
}

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30");
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const session = getSession();

        // 1. Get business_id
        const meRes = await fetch(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${session?.token}` },
        });
        if (!meRes.ok) throw new Error("No se pudo obtener el perfil");
        const meData = await meRes.json();
        const businessId = meData.user?.business_id;
        if (!businessId) throw new Error("No se encontró el negocio asociado");

        // 2. Load services and team in parallel
        const [servicesData, teamData] = await Promise.all([
          apiFetch("/businesses/me/services"),
          apiFetch(`/businesses/${businessId}/team`),
        ]);

        setServices(servicesData.items || []);
        setTeam(teamData.items || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleProfessional = (id: string) => {
    setSelectedProfessionals((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const addService = async () => {
    if (!name || !price) return;
    if (selectedProfessionals.length === 0) {
      setError("Selecciona al menos un profesional para este servicio");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const professionals = selectedProfessionals.map((id) => ({ id }));

      const body = {
        name,
        description: description || undefined,
        price: parseFloat(price),
        duration_minutes: parseInt(duration) || 30,
        active: true,
        professionals,
        weekly_hours: {},
      };
      const data = await apiFetch("/businesses/me/services", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setServices((prev) => [data.service, ...prev]);
      setName("");
      setPrice("");
      setDescription("");
      setDuration("30");
      setSelectedProfessionals([]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar este servicio? Esta acción no se puede deshacer.")) {
      return;
    }
    setError(null);
    setDeletingId(id);
    try {
      await apiFetch(`/businesses/me/services/${id}`, { method: "DELETE" });
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const professionalNames = (service: Service) => {
    if (!service.professionals || service.professionals.length === 0) return null;
    return service.professionals
      .map((p) => team.find((m) => m.id === p.id)?.name || p.id)
      .join(", ");
  };

  return (
    <div className="bg-[#f9f6f5] p-6 rounded-xl space-y-6">
      <h2 className="font-headline text-2xl font-bold text-[#2f2f2e]">Servicios</h2>

      {error && (
        <div className="bg-[#f8d7da] text-[#721c24] px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)] space-y-4">
        <div className="flex gap-4">
          <input
            className="border border-[#e4e2e1] p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Nombre del servicio"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border border-[#e4e2e1] p-3 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="S/ 20"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <input
            className="border border-[#e4e2e1] p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            className="border border-[#e4e2e1] p-3 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Duración (min)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <button
            onClick={addService}
            disabled={saving || !name || !price}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#962700] transition-colors active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined">add</span>
            )}
          </button>
        </div>

        {/* Professional selection */}
        <div>
          <p className="font-semibold text-sm text-on-surface-variant mb-2 uppercase tracking-wider">
            ¿Quién puede ofrecer este servicio?
          </p>
          {team.length === 0 ? (
            <p className="text-sm text-on-surface-variant italic">
              {/* No tienes miembros en tu equipo. Agrega al menos uno en la pestaña "Equipo" antes de crear un servicio. */}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {team.map((member) => {
                const selected = selectedProfessionals.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleProfessional(member.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                      selected
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-[#2f2f2e] border-[#e4e2e1] hover:border-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      {selected ? "check_circle" : "person"}
                    </span>
                    {member.name}
                    {member.role && <span className="opacity-70">• {member.role}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-8 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-2 block">spa</span>
          <p>Aún no tienes servicios. ¡Agrega el primero!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-white p-6 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)] flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline text-lg font-bold text-[#2f2f2e]">{s.name}</h3>
                  {s.active === false && (
                    <span className="text-xs bg-[#e4e2e1] text-on-surface-variant px-2 py-0.5 rounded-full">
                      Inactivo
                    </span>
                  )}
                </div>
                {s.description && (
                  <p className="text-on-surface-variant text-sm">{s.description}</p>
                )}
                <div className="flex gap-3 mt-1">
                  <p className="text-on-surface-variant text-sm">
                    <span className="font-semibold">S/ {s.price}</span>
                  </p>
                  {s.duration_minutes && (
                    <p className="text-on-surface-variant text-sm">• {s.duration_minutes} min</p>
                  )}
                </div>
                {professionalNames(s) && (
                  <p className="text-on-surface-variant text-xs mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
                    {professionalNames(s)}
                  </p>
                )}
              </div>
              <button
                onClick={() => deleteService(s.id)}
                disabled={deletingId === s.id}
                className="text-[#dc3545] hover:text-[#c82333] transition-colors p-2 rounded-full hover:bg-[#f8d7da] shrink-0 disabled:opacity-50"
              >
                {deletingId === s.id ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined">delete</span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}