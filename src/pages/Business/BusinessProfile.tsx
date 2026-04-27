import { useState } from "react";
import "./index.css";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Service {
  icon: string;
  name: string;
  duration: string;
  price: string;
  bgColor: string;
  textColor: string;
}

const SESSION_KEY = 'zylo_session';

function getFavoritesKey(): string {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    return `zylo_favorites_${session?.email ?? 'guest'}`;
  } catch {
    return 'zylo_favorites_guest';
  }
}

function getFavorites(): FavoriteBusiness[] {
  try { return JSON.parse(localStorage.getItem(getFavoritesKey()) || '[]'); }
  catch { return []; }
}

function saveFavorites(favs: FavoriteBusiness[]) {
  localStorage.setItem(getFavoritesKey(), JSON.stringify(favs));
}

// ─── Data ────────────────────────────────────────────────────────────────────

const SERVICES: Service[] = [
  { icon: "cleaning_services", name: "Premium Deep Clean",       duration: "120 min", price: "$150.00", bgColor: "bg-[#ff7851]",  textColor: "text-[#470e00]" },
  { icon: "handyman",          name: "General Maintenance Hour", duration: "60 min",  price: "$85.00",  bgColor: "bg-[#ffc3c0]",  textColor: "text-[#852327]" },
  { icon: "verified",          name: "Safety Inspection",        duration: "45 min",  price: "$60.00",  bgColor: "bg-[#e699fd]",  textColor: "text-[#570e6f]" },
];

const TEAM: TeamMember[] = [
  {
    name: "Marcus Chen", role: "Senior Tech", roleColor: "text-[#833e9a]",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFnhXVho9RYrUmCEfsdeWaKNPY-pWVZJWyFxpTojlVyS2f7pcBXp1iHSs3VVSxj8XLIEwkGj8EBGpfD4JCnk1h0r2EBEFftJE_sIWVcwU8LfB5H50758ZpAQ3W6B09Rty122glBgNGXQTwpOKIRSupwniQ6u_VngVmlbOPc2bExMfqOYI-qpE28b0RbNVzC2ELM_karOHvReJBie4nhBuPdBjMXxRnbWI7AxI361ZS4ACDDGfLxp28nlOaWmA6UzX5vFXpxIGXrNNh",
  },
  {
    name: "Sarah Miller", role: "Operations", roleColor: "text-[#a03739]",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjy4K4RvDocQa4eMS-YwuopOIUNUfZy0L8cKRl9l71Xm33juDPuEdSbMDe3u1d77UE2sOa1eYuG2ajypYfia1YD3CLNJiEcEzwDReObS95vE6jJLjGb8KlvaurWfJtnpZskJ0iAxS-1M0x4ezbDNLpZ2aDnjOM2dKjb-noDSZwDLfr2pM0s53gfKWZjKAZsYEw35WuVWwkrWigZDmW87xCYo9WuwvHoGg3UnjhrahpZBEw8ELAI5JATkfVoAlBRNS97zpOF3mYw6AK",
  },
];

const INITIAL_DAYS: DayConfig[] = [
  { name: "Monday",    enabled: true,  start: "09:00", end: "18:00" },
  { name: "Tuesday",   enabled: true,  start: "09:00", end: "18:00" },
  { name: "Wednesday", enabled: true,  start: "09:00", end: "18:00" },
  { name: "Thursday",  enabled: true,  start: "09:00", end: "18:00" },
  { name: "Friday",    enabled: true,  start: "09:00", end: "18:00" },
  { name: "Saturday",  enabled: false, start: "10:00", end: "16:00" },
  { name: "Sunday",    enabled: false, start: "10:00", end: "16:00" },
];

const GALLERY = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB9ROnVtf7sSAwm4H6HunMSmrzLbREaxwzLpWWO82Uf7F5DKL91Jp0vICxKj6ltXwN5LrxfgKxDPRqQeqTjriPapPKCQBLeMS9KxUfZQa8nzgJ_c8xlXO94ftEMgc-aN-MqLgM9O1oDnZFfbw_FdYD59Ppmb4enjIKagZbO21k0FVIkkOF1BHAtZqwJfzAuHLI4-fCCI6mruuFXNmeeN3xKez81cOhj4vBXQbftIQ0bkpRH4HnfbieczKZFKrthvTA_OeMjtpMTV46O",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDYqC__6BRJH8NcQIaayZizeJqTB7jp4wGOeqcWchgv9TEaEUg15ab2UzOP6pUKXOeq03oqBf5OGic-7rtM2GqmlCMkgx0mhbnyL7CTV8kNAR9CqO2UNK44WPwa6UQ0wWYoh41HRV_Ey8WmffR-TNNyCtp9XiwiSolZBZcVoiwdMTBpDO5ythfWd8BoF-r_SqK9mUpmATQRTQ-vxmHAPQLHjqiKNRs7tm_5tRVAVwsVv1_QH0Jzxvdrbz-yH_Gt4i16e9IDHWMtYYS9",
];

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [days, setDays] = useState<DayConfig[]>(INITIAL_DAYS);

  const toggleDay = (i: number) =>
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, enabled: !d.enabled } : d)));

  const updateTime = (i: number, field: "start" | "end", value: string) =>
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)));

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] min-h-screen">

      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_40px_40px_-15px_rgba(47,47,46,0.06)]">
        <div className="flex justify-between items-center h-20 px-8 w-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-extrabold tracking-tighter text-orange-600 font-['Plus_Jakarta_Sans']">
              The Kinetic Hearth
            </span>
            <div className="hidden md:flex gap-6">
              {["Dashboard", "Bookings", "Services"].map((item) => (
                <a key={item} href="#" className="text-zinc-600 hover:text-orange-500 transition-colors font-['Plus_Jakarta_Sans'] font-semibold tracking-tight">
                  {item}
                </a>
              ))}
              <a href="#" className="text-orange-600 border-b-2 border-orange-600 font-bold pb-1 font-['Plus_Jakarta_Sans'] tracking-tight">Team</a>
              <a href="#" className="text-zinc-600 hover:text-orange-500 transition-colors font-['Plus_Jakarta_Sans'] font-semibold tracking-tight">Analytics</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-[#5c5b5b] p-2 rounded-full hover:bg-zinc-50 transition-all">notifications</button>
            <button className="material-symbols-outlined text-[#5c5b5b] p-2 rounded-full hover:bg-zinc-50 transition-all">settings</button>
            <button className="bg-gradient-to-br from-[#ab2d00] to-[#ff7851] text-white px-6 py-2.5 rounded-full font-bold active:scale-95 transition-all shadow-lg shadow-[#ab2d00]/20">
              Save Profile
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#2f2f2e] mb-2 font-['Plus_Jakarta_Sans']">
            Edit Business Profile
          </h1>
          <p className="text-[#5c5b5b] text-lg">Manage your identity, services, and operational flow.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── Left Column ── */}
          <div className="lg:col-span-5 space-y-8">

            {/* Business Identity */}
            <section className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex flex-col items-center mb-8">
                <div className="relative group cursor-pointer">
                  <img
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-[#f3f0ef] transition-all group-hover:opacity-80"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuChQstc18rpRpMgdr0LnENbs8T-x9xqaUVPAPKeUPAV3bD_8_CylF5wvZOL8HFnHzZPn8O_4wXdGn4E9Ita-wxnj2wdwu2rpm6D8KKq4jg4U4RleU0VTwv0O2yrXVeqY8tJdzShmF2osE4iB90FUV1Vo5Cy08K6Co-8WhKJsOctwYtOn0DMO_eGgjWwRiSIqAmLbArcq17U_lgMZMQQnrI7H2Y4gIUUYcmX1BUHEp-CzLguHnRdUljqJat2_qa4iTQnQIq1wzTnykZG"
                    alt="Business logo"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
                  </div>
                </div>
                <h3 className="mt-4 font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#2f2f2e]">Update Brand Identity</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#5c5b5b] mb-2">Business Name</label>
                  <input
                    className="w-full bg-[#f3f0ef] border-none rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff7851]/30 text-[#2f2f2e] font-medium"
                    type="text"
                    defaultValue="The Kinetic Hearth Services"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#5c5b5b] mb-2">Primary Category</label>
                  <select className="w-full bg-[#f3f0ef] border-none rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff7851]/30 text-[#2f2f2e] font-medium appearance-none">
                    <option>Home Wellness &amp; Maintenance</option>
                    <option>Personal Care</option>
                    <option>Pet Services</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#5c5b5b] mb-2">About the Business</label>
                  <textarea
                    className="w-full bg-[#f3f0ef] border-none rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#ff7851]/30 text-[#2f2f2e] font-medium resize-none"
                    rows={4}
                    defaultValue="High-velocity marketplace efficiency meet human-centric warmth. We specialize in rapid response home services with a focus on trust and premium delivery."
                  />
                </div>
              </div>
            </section>

            {/* Photo Gallery */}
            <section className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ab2d00]">photo_library</span>
                Photo Gallery
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {GALLERY.map((src, i) => (
                  <div key={i} className="aspect-square relative rounded-lg overflow-hidden group cursor-pointer">
                    <img className="object-cover w-full h-full" src={src} alt={`Gallery ${i + 1}`} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <span className="material-symbols-outlined text-white">delete</span>
                    </div>
                  </div>
                ))}
                {[0, 1].map((i) => (
                  <div key={`up-${i}`} className="aspect-square border-2 border-dashed border-[#afadac]/30 rounded-lg flex flex-col items-center justify-center text-[#5c5b5b] hover:bg-[#f3f0ef] transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-3xl mb-1">add</span>
                    <span className="text-xs font-semibold">Upload</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-7 space-y-8">

            {/* Service Management */}
            <section className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab2d00]">bolt</span>
                  Service Management
                </h3>
                <button className="bg-[#e4e2e1] text-[#2f2f2e] px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 active:scale-95 transition-all hover:bg-[#dfdcdc]">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Service
                </button>
              </div>
              <div className="space-y-3">
                {SERVICES.map((s) => (
                  <div key={s.name} className="flex items-center justify-between p-4 bg-[#f3f0ef] rounded-xl group transition-all hover:bg-[#e4e2e1]">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${s.bgColor} rounded-lg flex items-center justify-center ${s.textColor}`}>
                        <span className="material-symbols-outlined">{s.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-[#2f2f2e]">{s.name}</p>
                        <p className="text-sm text-[#5c5b5b]">{s.duration} • {s.price}</p>
                      </div>
                    </div>
                    <button className="material-symbols-outlined text-[#5c5b5b] opacity-0 group-hover:opacity-100 hover:text-[#b31b25] transition-all">delete</button>
                  </div>
                ))}
              </div>
            </section>

            {/* Weekly Availability */}
            <section className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ab2d00]">schedule</span>
                Weekly Availability
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {days.map((day, i) => (
                  <div key={day.name} className={`grid grid-cols-12 items-center gap-4 p-4 rounded-xl transition-all ${day.enabled ? "hover:bg-[#f3f0ef]" : "bg-[#f3f0ef]/50"}`}>
                    <div className="col-span-3 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={day.enabled}
                        onChange={() => toggleDay(i)}
                        className="w-5 h-5 rounded accent-[#ab2d00] cursor-pointer"
                      />
                      <span className={`font-bold ${day.enabled ? "text-[#2f2f2e]" : "text-[#5c5b5b]"}`}>{day.name}</span>
                    </div>
                    {day.enabled ? (
                      <>
                        <div className="col-span-4">
                          <input type="time" value={day.start} onChange={(e) => updateTime(i, "start", e.target.value)}
                            className="w-full bg-[#f9f6f5] border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7851]/30" />
                        </div>
                        <div className="col-span-1 text-center font-bold text-[#5c5b5b]">to</div>
                        <div className="col-span-4">
                          <input type="time" value={day.end} onChange={(e) => updateTime(i, "end", e.target.value)}
                            className="w-full bg-[#f9f6f5] border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7851]/30" />
                        </div>
                      </>
                    ) : (
                      <div className="col-span-9 text-[#5c5b5b] italic text-sm text-right px-4">Currently marked as unavailable</div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Team Management */}
            <section className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab2d00]">groups</span>
                  Team Management
                </h3>
                <button className="text-[#ab2d00] font-bold text-sm flex items-center gap-1 hover:underline underline-offset-4 active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  Invite Staff
                </button>
              </div>
              <div className="pt-6 border-t border-[#dfdcdc]">
                   <h3 className="font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ab2d00]">location_on</span> Ubicación
                   </h3>
               <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#ab2d00] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  <div>
                   <p className="text-sm text-[#2f2f2e] font-semibold">{business.address}</p>
                   <p className="text-xs text-[#5c5b5b] mt-1">Lima, Perú</p>
                  </div>
               </div>
             </div>
            </div>
          </aside>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-zinc-100 w-full py-12 px-8 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full max-w-[1440px] mx-auto">
          <div className="flex flex-col gap-2">
            <span className="font-['Plus_Jakarta_Sans'] font-bold text-zinc-900">The Kinetic Hearth</span>
            <p className="text-sm text-zinc-500">© 2024 The Kinetic Hearth. Built for high-velocity service.</p>
          </div>
          <div className="flex gap-8">
            {["Privacy Policy", "Terms of Service", "Help Center", "API Documentation"].map((link) => (
              <a key={link} href="#" className="text-sm text-zinc-500 hover:text-orange-600 transition-all duration-300 underline-offset-4 hover:underline">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
