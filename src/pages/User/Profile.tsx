import { useEffect, useRef, useState } from 'react'
import HeaderUser from '../../components/user/HeaderUser'

const API_URL = import.meta.env.VITE_API_URL
const SESSION_KEY = 'zylo_session'

type AccountType = 'user' | 'business'

interface SessionData {
  token: string
  email?: string
  name?: string
  accountType?: AccountType
  user?: BackendUser
}

interface BackendUser {
  id: string
  name: string
  email: string
  phone?: string | null
  location?: string | null
  bio?: string | null
  photo_url?: string | null
  role?: string
  business_id?: string | null
  favorites_count?: number
  created_at?: string
  createdAt?: string
}

const supportLinks = [
  { icon: 'help_center', label: 'Centro de ayuda' },
  { icon: 'support_agent', label: 'Contactar soporte' },
]

const footerLinks = ['Privacidad', 'Términos', 'Soporte', 'Empleo']

function getSession(): SessionData | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

function saveSession(session: SessionData) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function normalizeAccountType(user: BackendUser): AccountType {
  return user.role === 'business_owner' ? 'business' : 'user'
}

export default function UserProfile() {
  const session = getSession()
  const token = session?.token || ''

  const [user, setUser] = useState<BackendUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
  })
  const [saveMsg, setSaveMsg] = useState<'saved' | 'error' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (!token || !API_URL) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_URL}/users/me`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json().catch(() => null)

        if (!response.ok || !data?.user) {
          setUser(null)
          setLoading(false)
          return
        }

        setUser(data.user)
        setEditForm({
          name: data.user.name || '',
          phone: data.user.phone || '',
          location: data.user.location || '',
          bio: data.user.bio || '',
        })

        saveSession({
          ...(session || { token }),
          token,
          email: data.user.email,
          name: data.user.name,
          accountType: normalizeAccountType(data.user),
          user: data.user,
        })
      } catch (error) {
        console.error('Error cargando perfil:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [token])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !API_URL || !token) return

    try {
      setUploadingPhoto(true)

      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch(`${API_URL}/users/me/photo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.user) {
        setSaveMsg('error')
        setTimeout(() => setSaveMsg(null), 3000)
        return
      }

      setUser(data.user)
      saveSession({
        ...(getSession() || { token }),
        token,
        email: data.user.email,
        name: data.user.name,
        accountType: normalizeAccountType(data.user),
        user: data.user,
      })

      setSaveMsg('saved')
      setTimeout(() => setSaveMsg(null), 3000)
    } catch (error) {
      console.error('Error subiendo foto:', error)
      setSaveMsg('error')
      setTimeout(() => setSaveMsg(null), 3000)
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!user || !API_URL || !token) return

    if (!editForm.name.trim()) {
      setSaveMsg('error')
      setTimeout(() => setSaveMsg(null), 3000)
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          phone: editForm.phone.trim() || null,
          location: editForm.location.trim() || null,
          bio: editForm.bio.trim() || null,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.user) {
        setSaveMsg('error')
        setTimeout(() => setSaveMsg(null), 3000)
        return
      }

      setUser(data.user)
      setEditForm({
        name: data.user.name || '',
        phone: data.user.phone || '',
        location: data.user.location || '',
        bio: data.user.bio || '',
      })
      setEditing(false)

      saveSession({
        ...(getSession() || { token }),
        token,
        email: data.user.email,
        name: data.user.name,
        accountType: normalizeAccountType(data.user),
        user: data.user,
      })

      setSaveMsg('saved')
      setTimeout(() => setSaveMsg(null), 3000)
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      setSaveMsg('error')
      setTimeout(() => setSaveMsg(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (!user) return
    setEditForm({
      name: user.name || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
    })
    setEditing(false)
    setSaveMsg(null)
  }

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY)
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen font-body flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-5xl text-outline animate-pulse">hourglass_empty</span>
        <p className="text-on-surface-variant font-medium">Cargando perfil...</p>
      </div>
    )
  }

  if (!user || !token) {
    return (
      <div className="bg-surface text-on-surface min-h-screen font-body flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-5xl text-outline">person_off</span>
        <p className="text-on-surface-variant font-medium">No hay sesión activa.</p>
        <a
          href="/login"
          className="signature-gradient text-white px-8 py-3 rounded-full font-headline font-bold shadow-lg hover:opacity-90 transition-all"
        >
          Iniciar sesión
        </a>
      </div>
    )
  }

  const accountType = normalizeAccountType(user)
  const displayPhoto = user.photo_url ?? null
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const createdDate = user.created_at || user.createdAt

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body antialiased">
      <HeaderUser />

      {saveMsg && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-xl text-sm font-bold transition-all ${
            saveMsg === 'saved' ? 'bg-[#22c55e] text-white' : 'bg-[#ef4444] text-white'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {saveMsg === 'saved' ? 'check_circle' : 'error'}
          </span>
          {saveMsg === 'saved'
            ? 'Cambios guardados correctamente'
            : 'No se pudieron guardar los cambios'}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-20">
        <section className="mb-16">
          <div className="bg-[#f3f0ef] rounded-xl p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative shrink-0">
              {displayPhoto ? (
                <img
                  alt={user.name}
                  className="w-36 h-36 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-xl"
                  src={displayPhoto}
                />
              ) : (
                <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-xl signature-gradient flex items-center justify-center">
                  <span className="font-headline text-4xl font-extrabold text-white">{initials}</span>
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-2 right-2 bg-white p-2 rounded-full border-4 border-[#f3f0ef] shadow-md hover:bg-[#f3f0ef] transition-colors group disabled:opacity-50"
                title="Cambiar foto"
              >
                <span
                  className="material-symbols-outlined text-primary text-lg"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  {uploadingPhoto ? 'progress_activity' : 'photo_camera'}
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="flex-1 text-center md:text-left w-full">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1 rounded-full mb-4">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: '"FILL" 1', fontSize: 16 }}
                >
                  {accountType === 'business' ? 'storefront' : 'person'}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider font-label">
                  {accountType === 'business' ? 'Empresa' : 'Usuario'}
                </span>
              </div>

              {editing ? (
                <div className="space-y-3 max-w-sm mx-auto md:mx-0">
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Nombre completo"
                    className="w-full bg-white rounded-xl px-4 py-3 font-headline text-2xl font-extrabold text-on-surface outline-none focus:ring-2 focus:ring-[#ff785133] border border-[#afadac]/20"
                  />
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Teléfono"
                    type="tel"
                    inputMode="tel"
                    className="w-full bg-white rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-[#ff785133] border border-[#afadac]/20"
                  />
                  <input
                    value={editForm.location}
                    onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Ciudad, País"
                    className="w-full bg-white rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-[#ff785133] border border-[#afadac]/20"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Cuéntanos sobre ti"
                    rows={4}
                    className="w-full bg-white rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-[#ff785133] border border-[#afadac]/20 resize-none"
                  />
                  <p className="text-xs text-on-surface-variant px-1">
                    ✉ {user.email} — <span className="text-outline">el correo no se puede cambiar</span>
                  </p>
                </div>
              ) : (
                <>
                  <h1 className="font-headline text-4xl sm:text-5xl font-extrabold text-on-surface tracking-tight mb-2">
                    {user.name}
                  </h1>
                  <div className="flex flex-col sm:flex-row items-center md:items-start gap-1 sm:gap-4 text-on-surface-variant font-medium text-sm">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-base">mail</span>
                      {user.email}
                    </span>

                    {user.phone && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-base">call</span>
                        {user.phone}
                      </span>
                    )}

                    {user.location && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-base">location_on</span>
                        {user.location}
                      </span>
                    )}
                  </div>

                  {user.bio && (
                    <p className="mt-4 text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                      {user.bio}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3 shrink-0">
              {editing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-6 py-3 rounded-full font-headline font-bold border-2 border-[#afadac]/30 text-on-surface-variant hover:bg-[#e4e2e1] transition-all active:scale-95 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="signature-gradient text-white px-8 py-3 rounded-full font-headline font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="signature-gradient text-white px-8 py-4 rounded-full font-headline font-bold shadow-lg hover:shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Editar perfil
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-10">
            <h2 className="text-2xl font-headline font-bold">Mi actividad</h2>

            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-3xl">calendar_month</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-xl font-bold">Mis reservas</h3>
                    <p className="text-on-surface-variant">Gestiona tus servicios próximos y pasados</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-primary">—</span>
                  <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickCard
                icon="bookmark"
                iconColor="text-[#a03739]"
                iconBg="bg-[#a03739]/10"
                title="Lugares guardados"
                subtitle={`${user.favorites_count ?? 0} favoritos guardados`}
                linkLabel="Ver lista"
              />
              <QuickCard
                icon="payments"
                iconColor="text-[#833e9a]"
                iconBg="bg-[#833e9a]/10"
                title="Métodos de pago"
                subtitle="Ninguno configurado"
                linkLabel="Gestionar tarjetas"
              />
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-[#afadac]/10">
              <h2 className="font-headline text-xl font-bold mb-6">Información de cuenta</h2>
              <div className="space-y-4 text-sm">
                {[
                  { icon: 'badge', label: 'Nombre', value: user.name },
                  { icon: 'mail', label: 'Correo', value: user.email },
                  { icon: 'call', label: 'Teléfono', value: user.phone || '—' },
                  { icon: 'location_on', label: 'Ubicación', value: user.location || '—' },
                  { icon: 'calendar_today', label: 'Miembro desde', value: createdDate ? new Date(createdDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-2 border-b border-[#f3f0ef] last:border-0"
                  >
                    <span className="flex items-center gap-3 text-on-surface-variant font-medium">
                      <span className="material-symbols-outlined text-base text-outline">{row.icon}</span>
                      {row.label}
                    </span>
                    <span className="font-semibold text-on-surface text-right max-w-[60%] truncate">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-[#afadac]/10">
              <h2 className="font-headline text-xl font-bold mb-6">Soporte</h2>
              <nav className="space-y-2">
                {supportLinks.map((link) => (
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

            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-xl font-headline font-bold border-2 border-[#afadac]/30 text-on-surface-variant hover:bg-[#dfdcdc] transition-colors active:scale-95 flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined">logout</span>
              Cerrar sesión
            </button>
          </div>
        </div>
      </main>

      <footer className="w-full rounded-t-[3rem] mt-20 bg-[#f3f0ef] font-body text-sm tracking-wide">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 sm:px-12 py-16 w-full max-w-7xl mx-auto">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <span className="text-lg font-headline font-bold text-[#2f2f2e] block mb-2">Zylo</span>
            <p className="text-[#5c5b5b]">© 2026 Zylo Marketplace. Construido para la velocidad.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {footerLinks.map((link) => (
              <a key={link} href="#" className="text-[#5c5b5b] hover:text-primary transition-all">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

function QuickCard({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  linkLabel,
}: {
  icon: string
  iconColor: string
  iconBg: string
  title: string
  subtitle: string
  linkLabel: string
}) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
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