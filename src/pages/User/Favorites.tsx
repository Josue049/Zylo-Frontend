import { useState, useEffect, useRef } from "react";
import HeaderUser from "../../components/user/HeaderUser";
import { apiFetch } from "../../utils/api";

interface FavoriteBusiness {
  id: string;
  name: string;
  category_name: string;
  rating: number;
  image_url: string;
  address: string;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  // Track IDs currently being removed to show visual feedback
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  // Ref to avoid stale closure in rollback
  const favoritesRef = useRef<FavoriteBusiness[]>([]);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      try {
        setLoading(true);
        const data = await apiFetch("/users/me/favorites");
        if (!cancelled) {
          setFavorites(data.items || []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setFavorites([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, []); // Single fetch on mount, no extra re-runs

  const handleRemove = async (id: string) => {
    // Prevent double-clicking while request is in flight
    if (removing.has(id)) return;

    // Snapshot before optimistic update
    const snapshot = favoritesRef.current;

    // Optimistic UI: remove immediately
    setRemoving((prev) => new Set(prev).add(id));
    setFavorites((prev) => prev.filter((f) => f.id !== id));

    try {
      await apiFetch(`/users/me/favorites/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(err);
      // Rollback to snapshot on failure
      setFavorites(snapshot);
    } finally {
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-[#f9f6f5] min-h-screen font-['Inter']">
        <HeaderUser />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <div className="h-9 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
              >
                <div className="h-44 bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] min-h-screen font-['Inter']">
      <HeaderUser />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold">Mis Favoritos</h2>
          <p className="text-[#5c5b5b] mt-1">
            {favorites.length} negocio{favorites.length !== 1 ? "s" : ""}{" "}
            guardado{favorites.length !== 1 ? "s" : ""}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-24 text-[#5c5b5b]">
            <p className="text-lg font-medium">No tienes favoritos aún</p>
            <p className="text-sm mt-1">
              Guarda negocios que te interesen para verlos aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {favorites.map((biz) => {
              const isRemoving = removing.has(biz.id);
              return (
                <div
                  key={biz.id}
                  className={`bg-white rounded-xl overflow-hidden shadow-sm transition-opacity duration-200 ${
                    isRemoving
                      ? "opacity-50 pointer-events-none"
                      : "opacity-100"
                  }`}
                >
                  {/* Imagen */}
                  <div className="relative h-44">
                    <img
                      src={biz.image_url}
                      alt={biz.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Botón quitar favorito — corazón sólido rojo porque YA es favorito */}
                    <button
                      onClick={() => handleRemove(biz.id)}
                      disabled={isRemoving}
                      title="Quitar de favoritos"
                      className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform disabled:cursor-not-allowed"
                    >
                      {/* Corazón sólido rojo = guardado. Al hacer clic se elimina. */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="#ab2d00"
                        className="w-5 h-5"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg">{biz.name}</h3>
                    <p className="text-sm text-[#5c5b5b]">
                      {biz.category_name}
                    </p>
                    <p className="text-sm text-[#5c5b5b] mt-2">{biz.address}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm">⭐ {biz.rating}</span>
                      <a
                        href={`/businessProfile/${biz.id}`}
                        className="text-sm font-bold text-[#ab2d00] hover:underline"
                      >
                        Ver negocio →
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
