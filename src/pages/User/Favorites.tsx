import { useState, useEffect } from 'react';
import HeaderUser from '../../components/user/HeaderUser';

interface FavoriteBusiness {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  address: string;
}

const SESSION_KEY = "zylo_session";

function getFavoritesKey(): string {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    return `zylo_favorites_${session?.email ?? "guest"}`;
  } catch {
    return "zylo_favorites_guest";
  }
}

function getFavorites(): FavoriteBusiness[] {
  try {
    return JSON.parse(localStorage.getItem(getFavoritesKey()) || "[]");
  } catch {
    return [];
  }
}

function removeFavorite(id: string): FavoriteBusiness[] {
  const updated = getFavorites().filter((f) => f.id !== id);
  localStorage.setItem(getFavoritesKey(), JSON.stringify(updated));
  return updated;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteBusiness[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleRemove = (id: string) => {
    setFavorites(removeFavorite(id));
  };

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] min-h-screen font-['Inter']">
      <HeaderUser />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h2 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight">
            Mis Favoritos
          </h2>
          <p className="text-[#5c5b5b] mt-1">
            {favorites.length > 0
              ? `${favorites.length} negocio${favorites.length > 1 ? 's' : ''} guardado${favorites.length > 1 ? 's' : ''}`
              : 'Aún no tienes favoritos guardados'}
          </p>
        </div>

        {favorites.length === 0 ? (
          /* Estado vacío */
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-[#ff7851]/10 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[#ab2d00] text-4xl"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                favorite
              </span>
            </div>
            <h3 className="font-bold text-xl">Nada por aquí todavía</h3>
            <p className="text-[#5c5b5b] max-w-xs">
              Explora negocios y toca el corazón para guardarlos aquí para acceso rápido.
            </p>
            <a
              href="/home"
              className="mt-2 bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-8 py-3 rounded-full font-bold active:scale-95 transition-all"
            >
              Explorar negocios
            </a>
          </div>
        ) : (
          /* Grid de favoritos */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {favorites.map((biz) => (
              <div
                key={biz.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group border border-transparent hover:border-[#ff785133]"
              >
                {/* Imagen */}
                <div className="relative w-full h-44 overflow-hidden">
                  <img
                    src={biz.image}
                    alt={biz.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Botón quitar favorito */}
                  <button
                    onClick={() => handleRemove(biz.id)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#ab2d00] shadow-sm active:scale-95 transition-all hover:bg-white"
                    title="Quitar de favoritos"
                  >
                    <span
                      className="material-symbols-outlined text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                  </button>
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-lg leading-tight">
                      {biz.name}
                    </h4>
                    <div className="flex items-center gap-1 bg-[#f3f0ef] px-2 py-1 rounded-full shrink-0 ml-2">
                      <span
                        className="material-symbols-outlined text-[#ab2d00]"
                        style={{ fontSize: 13, fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="text-xs font-bold">{biz.rating}</span>
                    </div>
                  </div>

                  <p className="text-[#ab2d00] text-xs font-bold uppercase tracking-wider mb-2">
                    {biz.category}
                  </p>

                  <div className="flex items-center gap-1 text-[#5c5b5b] text-sm mb-4">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    <span className="line-clamp-1">{biz.address}</span>
                  </div>

                  <a
                    href="/BusinessProfile"
                    className="block w-full text-center bg-[#2f2f2e] text-white py-2.5 rounded-full text-sm font-bold group-hover:bg-gradient-to-br group-hover:from-[#ab2d00] group-hover:to-[#ff7851] transition-all"
                  >
                    Ver negocio
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}