import { useState, useEffect, useRef } from "react";
import { getSession } from "../../hooks/userCurrentUser";
import { apiFetch } from "../../utils/api";

type TeamMember = {
  id: string;
  name: string;
  role?: string;
  photo?: string;
};

function makeId() {
  return "mbr_" + Math.random().toString(36).slice(2, 10);
}

export default function TeamManager() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const businessIdRef = useRef<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const session = getSession();
        const businessId = session?.businessId;
        if (!businessId) throw new Error("No se encontró el negocio asociado");
        businessIdRef.current = businessId;

        const teamData = await apiFetch(`/businesses/${businessId}/team`);
        setTeam(teamData.items || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveTeam = async (newTeam: TeamMember[]) => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const data = await apiFetch("/businesses/me/team", {
        method: "PATCH",
        body: JSON.stringify({ items: newTeam }),
      });
      // Use items from response to keep server state
      setTeam(data.team || newTeam);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const addMember = async () => {
    if (!newName.trim()) return;
    const member: TeamMember = {
      id: makeId(),
      name: newName.trim(),
      role: newRole.trim() || undefined,
    };
    const updated = [...team, member];
    setNewName("");
    setNewRole("");
    // Save immediately so the new member persists
    setTeam(updated);
    await saveTeam(updated);
  };

  const removeMember = (id: string) => {
    setTeam((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMember = (id: string, field: keyof TeamMember, value: string) => {
    setTeam((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  return (
    <div className="bg-[#f9f6f5] p-6 rounded-xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-2xl font-bold">Equipo</h2>
        <button
          onClick={() => saveTeam(team)}
          disabled={saving}
          className="bg-primary text-white px-5 py-2 rounded-full font-semibold hover:bg-[#962700] transition-colors active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <span className="material-symbols-outlined animate-spin text-sm">
              progress_activity
            </span>
          ) : (
            <span className="material-symbols-outlined text-sm">save</span>
          )}
          Guardar cambios
        </button>
      </div>

      {error && (
        <div className="bg-[#f8d7da] text-[#721c24] px-4 py-3 rounded-lg text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
      {success && (
        <div className="bg-[#d4edda] text-[#155724] px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">
            check_circle
          </span>
          Equipo guardado correctamente
        </div>
      )}

      {/* Add member form */}
      <div className="bg-white p-6 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)]">
        <p className="font-semibold text-sm text-on-surface-variant mb-4 uppercase tracking-wider">
          Agregar miembro
        </p>
        <div className="flex gap-3">
          <input
            className="border border-[#e4e2e1] p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Nombre completo"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMember()}
          />
          <input
            className="border border-[#e4e2e1] p-3 rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Cargo (opcional)"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMember()}
          />
          <button
            onClick={addMember}
            disabled={!newName.trim() || saving}
            className="bg-primary text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#962700] transition-colors active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <span className="material-symbols-outlined animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined">person_add</span>
            )}
          </button>
        </div>
      </div>

      {/* Team list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <span className="material-symbols-outlined animate-spin text-primary text-3xl">
            progress_activity
          </span>
        </div>
      ) : team.length === 0 ? (
        <div className="text-center py-10 text-on-surface-variant bg-white rounded-xl">
          <span className="material-symbols-outlined text-4xl mb-2 block">
            group
          </span>
          <p>Aún no tienes miembros. Agrega el primero arriba.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {team.map((member) => (
            <div
              key={member.id}
              className="bg-white p-5 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)] flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                {member.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 flex gap-3 min-w-0">
                <input
                  className="border border-[#e4e2e1] p-2 rounded-lg flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={member.name}
                  onChange={(e) =>
                    updateMember(member.id, "name", e.target.value)
                  }
                  placeholder="Nombre"
                />
                <input
                  className="border border-[#e4e2e1] p-2 rounded-lg w-36 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={member.role || ""}
                  onChange={(e) =>
                    updateMember(member.id, "role", e.target.value)
                  }
                  placeholder="Cargo"
                />
              </div>
              <span className="text-xs text-on-surface-variant font-mono hidden md:block shrink-0 max-w-[120px] truncate">
                {member.id}
              </span>
              <button
                onClick={() => removeMember(member.id)}
                className="text-[#dc3545] hover:text-[#c82333] transition-colors p-2 rounded-full hover:bg-[#f8d7da] shrink-0"
              >
                <span className="material-symbols-outlined">person_remove</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-on-surface-variant text-center">
        Presiona "Guardar cambios" para actualizar nombres y cargos. Agregar
        miembro guarda automáticamente.
      </p>
    </div>
  );
}
