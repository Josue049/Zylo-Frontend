import { useState, useEffect } from 'react'
import HeaderBusiness from '../../components/business/HeaderBusiness'
import ServicesManager from '../../components/business/ServicesManager'
import AvailabilityManager from '../../components/business/AvailabilityManager'
import ReservationsManager from '../../components/business/ReservationsManager'

/* ── Types ── */
interface AgendaItem {
  dayLabel: string
  dayNum: number
  title: string
  time?: string
  client?: string
  duration?: string
  initials?: string
  avatarColor?: string
  blocked?: boolean
  active?: boolean
}

interface StatBar {
  label: string
  value: string
  percent: number
  color: string
}

/* ── Data ── */
const avatarColors = ['bg-[#ff7851]', 'bg-[#a03739]', 'bg-[#833e9a]', 'bg-[#4a90e2]', 'bg-[#50e3c2]'];

const PULSE_STATS: StatBar[] = [
  { label: 'Vistas de Perfil', value: '1.2k', percent: 70, color: 'bg-primary' },
  { label: 'Tiempo de Respuesta', value: '8 min', percent: 90, color: 'bg-[#ff7851]' },
]

const REVENUE_BARS = [40, 60, 90, 50, 100]

const NAV_ITEMS = [
  { icon: 'calendar_today', label: 'Bookings' },
  { icon: 'favorite', label: 'Saved' },
  { icon: 'chat_bubble', label: 'Messages' },
  { icon: 'person_outline', label: 'Profile' },
]

/* ── Main ── */
export default function BusinessDashboard() {
  const [blocked, setBlocked] = useState(true)
  const [activeNav, setActiveNav] = useState(0)
  const [showPanel, setShowPanel] = useState(false)
  const [activePanel, setActivePanel] = useState<"services" | "availability" | "reservations">("services");
  const [userName, setUserName] = useState("Usuario");
  const [citasCount, setCitasCount] = useState(0);
  const [totalAcceptedReservations, setTotalAcceptedReservations] = useState(0);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 1); // Lunes
    return start;
  });

  const nextWeek = () => {
    setCurrentWeekStart(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const prevWeek = () => {
    setCurrentWeekStart(prev => {
      const prevWeek = new Date(prev);
      prevWeek.setDate(prev.getDate() - 7);
      return prevWeek;
    });
  };

  useEffect(() => {
    const reservas = JSON.parse(localStorage.getItem("reservations") || "[]");
    const bloqueos = JSON.parse(localStorage.getItem("availability") || "[]");

    // Cargar nombre de usuario
    const session = JSON.parse(localStorage.getItem("zylo_session") || "{}");
    setUserName(session.name || "Usuario");
    // Contar reservas aceptadas totales
    const totalAccepted = reservas.filter((r: any) => r.estado === "aceptado").length;
    setTotalAcceptedReservations(totalAccepted);
    // Obtener la semana actual
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    // Contar reservas aceptadas para hoy
    const citasHoy = reservas.filter((r: any) => {
      if (r.estado !== "aceptado") return false;
      const reservaDate = new Date(r.fecha);
      const reservaDateStr = reservaDate.getFullYear() + '-' + String(reservaDate.getMonth() + 1).padStart(2, '0') + '-' + String(reservaDate.getDate()).padStart(2, '0');
      return reservaDateStr === todayStr;
    }).length;
    setCitasCount(citasHoy);

    // Generar días de la semana actual
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      return date;
    });

    const agendaItems: AgendaItem[] = [];

    weekDays.forEach((date) => {
      const dayLabel = date.toLocaleDateString("es-ES", { weekday: "short" });
      const dayNum = date.getDate();
      const dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');

      // Reservas del día
      const reservasDelDia = reservas.filter((r: any) => {
        if (r.estado !== "aceptado") return false;
        const reservaDate = new Date(r.fecha);
        const reservaDateStr = reservaDate.getFullYear() + '-' + String(reservaDate.getMonth() + 1).padStart(2, '0') + '-' + String(reservaDate.getDate()).padStart(2, '0');
        return reservaDateStr === dateStr;
      });

      // Bloqueos del día
      const bloqueosDelDia = bloqueos.filter((b: any) => b.date === dateStr);

      if (reservasDelDia.length > 0) {
        reservasDelDia.forEach((r: any) => {
          const initials = r.cliente.split(' ').map((n: string) => n[0]).join('').toUpperCase();
          const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
          agendaItems.push({
            dayLabel,
            dayNum,
            title: r.servicio,
            time: r.hora || '08:00 AM',
            client: r.cliente,
            duration: r.duracion || '1h',
            initials,
            avatarColor,
            active: true
          });
        });
      } else if (bloqueosDelDia.length > 0) {
        agendaItems.push({
          dayLabel,
          dayNum,
          title: 'Bloqueado',
          blocked: true
        });
      }
    });

    setAgenda(agendaItems);
  }, [currentWeekStart]);

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] min-h-screen font-body">

      {/* ── Header ── */}
      <HeaderBusiness />

      <main className="pt-24 pb-36 px-6 max-w-7xl mx-auto">

        {/* ── Welcome ── */}
        <section className="mb-12">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight mb-2">Hola, {userName}</h1>
          <p className="text-on-surface-variant">Tienes {citasCount} citas programadas para hoy.</p>
        </section>

        {/* ── Bento Stats ── */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">

          {/* Appointments */}
          <div className="md:col-span-2 bg-[#ffffff] p-8 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)] flex flex-col justify-between min-h-[200px] relative overflow-hidden group">
            <div className="relative z-10">
              <span className="font-label font-semibold text-primary uppercase tracking-wider text-xs">Citas</span>
              <div className="text-6xl font-headline font-extrabold mt-4">{totalAcceptedReservations}</div>
            </div>
            <div className="flex items-center gap-2 text-primary font-semibold mt-4 relative z-10">
              <span className="material-symbols-outlined">trending_up</span>
              <span>12% respecto a la semana pasada</span>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#ff785133] rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          </div>

          {/* Revenue */}
          <div className="bg-[#ffffff] p-8 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)] flex flex-col justify-between">
            <div>
              <span className="font-label font-semibold text-on-surface-variant uppercase tracking-wider text-xs">Ingresos Semanales</span>
              <div className="font-headline text-3xl font-bold mt-4">S/ 2,480</div>
            </div>
            <div className="mt-4 h-12 flex items-end gap-1">
              {REVENUE_BARS.map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm ${i === 2 ? 'bg-primary' : i === 4 ? 'bg-[#ff7851]' : 'bg-[#e4e2e1]'}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Availability toggle */}
          <div className="bg-primary p-8 rounded-xl text-[#ffefeb] flex flex-col justify-between shadow-xl shadow-primary/20">
            <div>
              <span className="font-label font-semibold uppercase tracking-wider opacity-80 text-xs">Disponibilidad</span>
              <div className="font-headline text-xl font-bold mt-2">Actualmente Activo</div>
            </div>
            <div className="mt-6 flex items-center justify-between bg-white/20 p-4 rounded-full">
              <span className="font-semibold text-sm">Horario de Bloques</span>
              <button
                onClick={() => setBlocked(v => !v)}
                className="w-12 h-6 bg-white rounded-full p-1 flex items-center transition-all duration-300"
              >
                <div className={`w-4 h-4 bg-primary rounded-full shadow-md transition-all duration-300 ${blocked ? 'ml-auto' : ''}`} />
              </button>
            </div>
          </div>
        </section>

        {/* ── Agenda + Sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Agenda */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-headline text-2xl font-bold">Agenda Semanal</h2>
              <div className="flex gap-2">
                {['chevron_left', 'chevron_right'].map((icon, index) => (
                  <button
                    key={icon}
                    onClick={index === 0 ? prevWeek : nextWeek}
                    className="p-2 rounded-full hover:bg-[#f3f0ef] transition-colors active:scale-95"
                  >
                    <span className="material-symbols-outlined">{icon}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {agenda.map((item, i) => (
                <AgendaCard key={i} item={item} />
              ))}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-8">

            {/* Service Pulse */}
            <div className="bg-[#f3f0ef] p-8 rounded-xl">
              <h3 className="font-headline text-xl font-bold mb-6">Pulso de servicio</h3>
              <div className="space-y-6">
                {PULSE_STATS.map(stat => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{stat.label}</span>
                      <span className="text-primary font-bold">{stat.value}</span>
                    </div>
                    <div className="w-full bg-[#e4e2e1] h-2 rounded-full overflow-hidden">
                      <div className={`${stat.color} h-full rounded-full`} style={{ width: `${stat.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="bg-[#2f2f2e] p-8 rounded-xl text-[#f9f6f5] relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-headline text-xl font-bold mb-2">Actualiza a Zylo Pro</h3>
                <p className="text-[#d6d4d3] text-sm mb-6">Desbloquea análisis avanzados y posicionamiento prioritario en los resultados de búsqueda.</p>
                <button className="w-full bg-primary text-white py-3 rounded-full font-headline font-bold hover:bg-[#962700] transition-colors active:scale-95">
                  Hazte Pro hoy mismo
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            </div>
          </aside>
        </div>
        {showPanel && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-[#f9f6f5] text-[#2f2f2e] w-full max-w-4xl rounded-2xl p-8 shadow-[0_4px_40px_rgba(47,47,46,0.06)] relative">

              {/* Botón cerrar */}
              <button
                onClick={() => setShowPanel(false)}
                className="absolute top-4 right-4 text-[#2f2f2e] hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              {/* Tabs */}
              <div className="flex gap-8 mb-8 border-b border-[#e4e2e1] pb-4">
                <button onClick={() => setActivePanel("services")}
                  className={`pb-2 font-headline font-semibold text-sm uppercase tracking-wider transition-colors ${activePanel === "services" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"}`}>
                  Servicios
                </button>

                <button onClick={() => setActivePanel("availability")}
                  className={`pb-2 font-headline font-semibold text-sm uppercase tracking-wider transition-colors ${activePanel === "availability" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"}`}>
                  Disponibilidad
                </button>

                <button onClick={() => setActivePanel("reservations")}
                  className={`pb-2 font-headline font-semibold text-sm uppercase tracking-wider transition-colors ${activePanel === "reservations" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"}`}>
                  Reservas
                </button>
              </div>

              {/* Contenido */}
              <div className="max-h-[70vh] overflow-y-auto">
                {activePanel === "services" && <ServicesManager />}
                {activePanel === "availability" && <AvailabilityManager />}
                {activePanel === "reservations" && <ReservationsManager />}
              </div>

            </div>
          </div>
        )}
      </main>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-white/80 backdrop-blur-xl shadow-[0_-4px_40px_rgba(47,47,46,0.06)] rounded-t-[3rem] md:hidden">
        {/* Active explore button */}
        <button
          onClick={() => setActiveNav(-1)}
          className="flex flex-col items-center justify-center signature-gradient text-white rounded-full p-3 mb-1 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined">search</span>
        </button>
        {NAV_ITEMS.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setActiveNav(i)}
            className={`flex flex-col items-center justify-center p-2 transition-all active:scale-[0.98] ${activeNav === i ? 'text-primary' : 'text-[#2f2f2e] hover:text-primary'
              }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] font-semibold font-label mt-1">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── FAB ── */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform z-40 hover:scale-110 transition-transform duration-200">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  )
}

/* ── Sub-components ── */

function AgendaCard({ item }: { item: AgendaItem }) {
  if (item.blocked) {
    return (
      <div className="bg-[#f3f0ef] p-6 rounded-xl flex items-center gap-6 opacity-60">
        <DayBadge label={item.dayLabel} num={item.dayNum} />
        <div className="flex-1">
          <h3 className="font-bold text-lg text-on-surface-variant italic">{item.title}</h3>
          <p className="text-on-surface-variant text-sm">Todo el día</p>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant">lock</span>
      </div>
    )
  }

  return (
    <div className="bg-[#ffffff] p-6 rounded-xl flex items-center gap-6 hover:scale-[0.99] transition-transform cursor-pointer">
      <DayBadge label={item.dayLabel} num={item.dayNum} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <h3 className="font-bold text-lg truncate">{item.title}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${item.active
              ? 'bg-[#ff785133] text-primary'
              : 'bg-[#e4e2e1] text-on-surface-variant'
              }`}
          >
            {item.time}
          </span>
        </div>
        <p className="text-on-surface-variant text-sm flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>
          {item.client} • {item.duration}
        </p>
      </div>
      {item.initials && (
        <div
          className={`w-8 h-8 rounded-full border-2 border-[#ffffff] ${item.avatarColor} flex items-center justify-center text-[10px] text-white font-bold shrink-0`}
        >
          {item.initials}
        </div>
      )}
    </div>
  )
}

function DayBadge({ label, num }: { label: string; num: number }) {
  return (
    <div className="w-16 flex flex-col items-center border-r border-[#afadac]/20 pr-6 shrink-0">
      <span className="text-xs font-bold text-on-surface-variant uppercase">{label}</span>
      <span className="font-headline text-2xl font-extrabold">{num}</span>
    </div>
  )
}