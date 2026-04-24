import { useState } from 'react'
import HeaderUser from '../../components/user/HeaderUser'

/* ── Types ── */
interface TogglePref {
  icon: string
  label: string
  enabled: boolean
}

/* ── Data ── */
const supportLinks = [
  { icon: 'help_center', label: 'Help Center' },
  { icon: 'support_agent', label: 'Contact Support' },
]

const footerLinks = ['Privacy', 'Terms', 'Support', 'Careers']

/* ── Main Component ── */
export default function UserProfile() {
  const [prefs, setPrefs] = useState<TogglePref[]>([
    { icon: 'notifications_active', label: 'Push Notifications', enabled: true },
    { icon: 'dark_mode', label: 'Dark Mode', enabled: false },
  ])

  const togglePref = (idx: number) => {
    setPrefs(prev =>
      prev.map((p, i) => (i === idx ? { ...p, enabled: !p.enabled } : p))
    )
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body antialiased">

      {/* ── Header ── */}
      <HeaderUser />

      {/* ── Main Content ── */}

      <main className="max-w-7xl mx-auto px-8 pt-12 pb-20">

        {/* ── Profile Hero ── */}
        <section className="mb-20">
          <div className="bg-[#f3f0ef] rounded-xl p-12 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                alt="Marcus Rodriguez"
                className="w-40 h-40 rounded-full object-cover border-4 border-[#ffffff] shadow-xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBetIIk2vkL0F9L1kTIJ0K8lifnSnKCnWOv-OvshNnHj1NLQiql_cL9PI8_aBT3-iXVeBH_1-29z4bKxaqBlnoHvaqDZohagMKDENM1jNmAYjLt_YcyhTa7iqCB8qQmlHHNjDRNvc9rqIyB3RHSNR4tslFKpuwsboOobJP3qLlLNmpCt2jzU_eMUp90IAeBcZ4Dz1aRNQ0hf-P1Vdezvl89sr5cWgxe9BLa0xCcaKaKJUVIaOTLGNfVncv_xeeQQQk2EX1Y573JRPvJ"
              />
              <div className="absolute bottom-2 right-2 bg-[#833e9a] p-2 rounded-full border-4 border-[#f3f0ef]">
                <span
                  className="material-symbols-outlined text-white text-xl"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  verified
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[#833e9a]/10 text-[#833e9a] px-4 py-1 rounded-full mb-4">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: '"FILL" 1', fontSize: 16 }}
                >
                  workspace_premium
                </span>
                <span className="text-xs font-bold uppercase tracking-wider font-label">Zylo Gold</span>
              </div>
              <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-2">
                Marcus Rodriguez
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <span>Bogotá, Colombia</span>
              </div>
            </div>

            <button className="signature-gradient text-white px-8 py-4 rounded-full font-headline font-bold shadow-lg hover:shadow-primary/20 active:scale-95 transition-all shrink-0">
              Edit Profile
            </button>
          </div>
        </section>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left column */}
          <div className="lg:col-span-7 space-y-10">
            <h2 className="text-2xl font-headline font-bold">My Activity</h2>

            {/* Bookings card */}
            <div className="bg-[#ffffff] rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-3xl">calendar_month</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-xl font-bold">My Bookings</h3>
                    <p className="text-on-surface-variant">Manage your upcoming and past services</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-primary">12</span>
                  <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </div>
              </div>
            </div>

            {/* Saved + Payment grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickCard
                icon="bookmark"
                iconColor="text-[#a03739]"
                iconBg="bg-[#a03739]/10"
                title="Saved Places"
                subtitle="4 favorites saved"
                linkLabel="View list"
              />
              <QuickCard
                icon="payments"
                iconColor="text-[#833e9a]"
                iconBg="bg-[#833e9a]/10"
                title="Payment Methods"
                subtitle="Visa ending in ••42"
                linkLabel="Manage cards"
              />
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 space-y-8">

            {/* Preferences */}
            <div className="bg-[#f3f0ef] rounded-xl p-8">
              <h2 className="font-headline text-xl font-bold mb-6">Preferences</h2>
              <div className="space-y-6">
                {prefs.map((pref, i) => (
                  <div key={pref.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-outline">{pref.icon}</span>
                      <span className="font-medium">{pref.label}</span>
                    </div>
                    <Toggle enabled={pref.enabled} onToggle={() => togglePref(i)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="bg-[#ffffff] rounded-xl p-8 shadow-sm border border-[#afadac]/10">
              <h2 className="font-headline text-xl font-bold mb-6">Support</h2>
              <nav className="space-y-2">
                {supportLinks.map(link => (
                  <a
                    key={link.label}
                    href="#"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f3f0ef] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary">{link.icon}</span>
                      <span className="font-medium">{link.label}</span>
                    </div>
                    <span className="material-symbols-outlined text-outline">chevron_right</span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Log out */}
            <button className="w-full py-4 rounded-xl font-headline font-bold border-2 border-[#afadac]/30 text-on-surface-variant hover:bg-[#dfdcdc] transition-colors active:scale-95 flex items-center justify-center gap-3">
              <span className="material-symbols-outlined">logout</span>
              Log Out
            </button>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full rounded-t-[3rem] mt-20 bg-[#f3f0ef] font-body text-sm tracking-wide">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 w-full max-w-7xl mx-auto">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <span className="text-lg font-headline font-bold text-[#2f2f2e] block mb-2">Zylo</span>
            <p className="text-[#5c5b5b]">© 2024 Zylo Marketplace. Built for speed.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {footerLinks.map(link => (
              <a key={link} href="#" className="text-[#5c5b5b] hover:text-[#FF5722] transition-all">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ── Sub-components ── */

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
        enabled ? 'bg-primary' : 'bg-[#dfdcdc]'
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
          enabled ? 'right-1' : 'left-1'
        }`}
      />
    </button>
  )
}

function QuickCard({
  icon, iconColor, iconBg, title, subtitle, linkLabel,
}: {
  icon: string
  iconColor: string
  iconBg: string
  title: string
  subtitle: string
  linkLabel: string
}) {
  return (
    <div className="bg-[#ffffff] rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center ${iconColor} mb-6`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h3 className="font-headline text-lg font-bold mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant mb-4">{subtitle}</p>
      <a href="#" className="text-primary font-semibold text-sm flex items-center gap-1 group">
        {linkLabel}
        <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">
          arrow_forward
        </span>
      </a>
    </div>
  )
}