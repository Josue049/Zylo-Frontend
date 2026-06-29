import { useEffect, useState } from 'react';
import HeaderUser from '../../components/user/HeaderUser';

interface FavoriteBusiness {
  id: string;
  name: string;
  category?: string;
  rating?: number;
  image?: string;
  image_url?: string;
  photo_url?: string;
  address?: string;
  location?: string;
}

interface SessionData {
  token: string;
  email?: string;
  name?: string;
}

const SESSION_KEY = 'zylo_session';
const API_URL = import.meta.env.VITE_API_URL;

function getSession(): SessionData | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

export default function Favorites() {
  const session = getSession();
  const token = session?.token || '';

  const [favorites, setFavorites] = useState<FavoriteBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!token || !API_URL) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/me/favorites`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        setFavorites(data?.items ?? []);
      } catch (error) {
        console.error('Error cargando favoritos:', error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [token]);

  const handleRemove = async (id: string) => {
    if (!token || !API_URL) return;

    try {
      setRemovingId(id);

      const response = await fetch(`${API_URL}/users/me/favorites/${id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error('Error quitando favorito:', error);
    } finally {
      setRemovingId(null);
    }
  };

  if (!token) {
    return (
      <div className="bg-[#f9f6f5] text-[#2f2f2e] min-h-screen font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-[#afadac]">favorite</span>
          <p className="mt-3 text-[#5c5b5b] font-medium">Debes iniciar sesión para ver tus favoritos.</p>
          <a
            href="/login"
            className="inline-block mt-4 bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-8 py-3 rounded-full font-bold"
          >
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] min-h-screen font-['Inter']">
      <HeaderUser />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h2 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight">
            Mis Favoritos
          </h2>
          <p className="text-[#5c5b5b] mt-1">
            {loading
              ? 'Cargando favoritos...'
              : favorites.length > 0
              ? `${favorites.length} negocio${favorites.length > 1 ? 's' : ''} guardado${favorites.length > 1 ? 's' : ''}`
              : 'Aún no tienes favoritos guardados'}
          </p>
        </div>

        {!loading && favorites.length === 0 ? (
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
        ) : loading ? (
          <div className="py-20 text-center text-[#5c5b5b] font-medium">
            Cargando favoritos...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {favorites.map((biz) => {
              const imageSrc =
                biz.image ||
                biz.image_url ||
                biz.photo_url ||
                'https://via.placeholder.com/600x400?text=Zylo';

              return (
                <div
                  key={biz.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group border border-transparent hover:border-[#ff785133]"
                >
                  <div className="relative w-full h-44 overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={biz.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    <button
                      onClick={() => handleRemove(biz.id)}
                      disabled={removingId === biz.id}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#ab2d00] shadow-sm active:scale-95 transition-all hover:bg-white disabled:opacity-50"
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

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-lg leading-tight">
                        {biz.name}
                      </h4>

                      {typeof biz.rating === 'number' && (
                        <div className="flex items-center gap-1 bg-[#f3f0ef] px-2 py-1 rounded-full shrink-0 ml-2">
                          <span
                            className="material-symbols-outlined text-[#ab2d00]"
                            style={{ fontSize: 13, fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          <span className="text-xs font-bold">{biz.rating}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-[#ab2d00] text-xs font-bold uppercase tracking-wider mb-2">
                      {biz.category || 'Negocio'}
                    </p>

                    <div className="flex items-center gap-1 text-[#5c5b5b] text-sm mb-4">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      <span className="line-clamp-1">{biz.address || biz.location || 'Sin dirección'}</span>
                    </div>

                    <a
                      href={`/BusinessProfile?id=${biz.id}`}
                      className="block w-full text-center bg-[#2f2f2e] text-white py-2.5 rounded-full text-sm font-bold group-hover:bg-gradient-to-br group-hover:from-[#ab2d00] group-hover:to-[#ff7851] transition-all"
                    >
                      Ver negocio
                    </a>
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