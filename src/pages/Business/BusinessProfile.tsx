import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderBusiness from '../../components/user/HeaderUser';
import { businesses } from '../../data/businesses';
import { getSession, getOrCreateConversation } from '../../data/messages';

/* ── Favoritos en localStorage ── */
interface FavoriteBusiness {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  address: string;
}

const FAVORITES_KEY = 'zylo_favorites';

function getFavorites(): FavoriteBusiness[] {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); }
  catch { return []; }
}

function saveFavorites(favs: FavoriteBusiness[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

export default function BusinessProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const business = businesses.find(b => b.id === Number(id));

  useEffect(() => {
    if (!business) return;
    const favs = getFavorites();
    setIsFavorite(favs.some(f => f.id === String(business.id)));
  }, [business]);

  const handleMessage = () => {
    if (!business) return;
    const session = getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    const conv = getOrCreateConversation(
      session.email,
      session.name,
      undefined,
      business.email,
      business.name,
      business.category,
      business.image,
    );
    navigate(`/messages?conv=${conv.id}`);
  };

  if (!business) {
    return (
      <div className="bg-[#f9f6f5] min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-[#2f2f2e]">Negocio no encontrado.</p>
        <button
          onClick={() => navigate('/home')}
          className="bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-8 py-3 rounded-full font-bold"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const toggleFavorite = () => {
    const favs = getFavorites();
    if (isFavorite) {
      saveFavorites(favs.filter(f => f.id !== String(business.id)));
      setIsFavorite(false);
    } else {
      saveFavorites([...favs, {
        id: String(business.id),
        name: business.name,
        category: business.category,
        rating: business.rating,
        image: business.image,
        address: business.address,
      }]);
      setIsFavorite(true);
    }
  };

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] font-['Inter'] min-h-screen pb-32">
      <HeaderBusiness />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">

        {/* --- Galería Bento --- */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px]">
          <div className="md:col-span-2 md:row-span-2 rounded-xl overflow-hidden relative group">
            <img src={business.gallery[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Principal" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
          <div className="hidden md:block md:col-span-2 rounded-xl overflow-hidden group">
            <img src={business.gallery[1]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Interior" />
          </div>
          <div className="hidden md:block rounded-xl overflow-hidden group">
            <img src={business.gallery[2]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Detalle" />
          </div>
          <div className="hidden md:block rounded-xl overflow-hidden group">
            <img src={business.gallery[3]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Extra" />
          </div>
        </section>

        {/* --- Info principal --- */}
        <section className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#ff7851]/20 text-[#ab2d00] font-bold text-xs uppercase tracking-wider">
                {business.category}
              </span>
              <div className="flex items-center text-[#ab2d00]">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-sm font-bold ml-1">{business.rating} ({Math.floor(business.rating * 25)} Reseñas)</span>
              </div>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-4xl md:text-5xl font-extrabold tracking-tight">{business.name}</h1>
            <div className="flex items-center gap-2 text-[#5c5b5b]">
              <span className="material-symbols-outlined text-lg">location_on</span>
              <span className="font-medium">{business.address}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={toggleFavorite}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 border-2 ${
                isFavorite
                  ? 'bg-[#ff7851]/10 border-[#ab2d00] text-[#ab2d00]'
                  : 'bg-[#dfdcdc] border-transparent text-[#2f2f2e] hover:border-[#ab2d00] hover:text-[#ab2d00]'
              }`}
              title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}>
                favorite
              </span>
            </button>
            <button
              onClick={handleMessage}
              className="bg-[#dfdcdc] text-[#2f2f2e] px-8 py-4 rounded-full font-bold active:scale-95 transition-all"
            >
              Mensaje
            </button>
            <button
              onClick={() => navigate(`/booking/${business.id}`)}
              className="bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-[#ab2d00]/20 active:scale-95 transition-all"
            >
              Reservar
            </button>
          </div>
        </section>

        {/* --- Contenido principal --- */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-4">Acerca de</h2>
              <p className="text-[#5c5b5b] leading-relaxed text-lg">{business.description}</p>
            </section>

            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold">Nuestros Servicios</h2>
                <button className="text-[#ab2d00] font-bold text-sm hover:underline">Ver todos</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {business.services.map((service) => (
                  <div key={service.id} className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group ${service.featured ? 'border-l-4 border-[#ab2d00]' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-[#ff7851]/10 rounded-full flex items-center justify-center text-[#ab2d00]">
                        <span className="material-symbols-outlined">{service.icon}</span>
                      </div>
                      <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-[#ab2d00]">{service.price}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-[#ab2d00] transition-colors">{service.title}</h3>
                    <p className="text-[#5c5b5b] text-sm line-clamp-2">{service.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-6">Conoce al Equipo</h2>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                {business.team.map((member) => (
                  <div key={member.id} className="flex-shrink-0 w-32 group">
                    <div className="w-32 h-32 rounded-xl overflow-hidden mb-3 grayscale group-hover:grayscale-0 transition-all duration-300">
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-bold text-center">{member.name}</p>
                    <p className="text-xs text-[#5c5b5b] text-center">{member.role}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="bg-[#f3f0ef] p-8 rounded-xl space-y-6">
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab2d00]">schedule</span> Horario de Atención
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between"><span>Lun — Vie</span><span className="font-semibold">{business.hours.weekdays}</span></li>
                  <li className="flex justify-between"><span>Sáb</span><span className="font-semibold">{business.hours.saturday}</span></li>
                  <li className={`flex justify-between font-medium ${business.hours.sunday === 'Cerrado' ? 'text-red-600' : ''}`}>
                    <span>Dom</span><span>{business.hours.sunday}</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 border-t border-[#dfdcdc]">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab2d00]">location_on</span> Ubicación
                </h3>
                <p className="text-sm text-[#5c5b5b] font-medium">{business.address}</p>
                <div className="mt-3 w-full h-48 rounded-xl overflow-hidden bg-[#dfdcdc] relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#ab2d00] text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}