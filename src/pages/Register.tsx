import { useState } from 'react'
import HeaderClose from '../components/HeaderClose'

type AccountType = 'user' | 'business'

interface FormData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  terms: boolean
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  terms?: string
}

interface StoredUser {
  name: string
  email: string
  phone: string
  passwordHash: string
  accountType: AccountType
  createdAt: string
}

// Simple hash para no guardar contraseña en plano
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return hash.toString(16)
}

const STORAGE_KEY = 'zylo_users'

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveUser(user: StoredUser): void {
  const users = getStoredUsers()
  users.push(user)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

function getExistingAccountType(email: string): AccountType | null {
  const found = getStoredUsers().find(u => u.email.toLowerCase() === email.toLowerCase())
  return found ? found.accountType : null
}

type SubmitStatus = 'idle' | 'success' | 'duplicate'

export default function Register() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
  })
  const [accountType, setAccountType] = useState<AccountType>('user')
  const [duplicateAccountType, setDuplicateAccountType] = useState<AccountType | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.name.trim()) e.name = 'El nombre es obligatorio'
    if (!form.email.trim()) e.email = 'El correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido'
    if (!form.phone.trim()) e.phone = 'El teléfono es obligatorio'
    if (!form.password) e.password = 'La contraseña es obligatoria'
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (!form.confirmPassword) e.confirmPassword = 'Confirma tu contraseña'
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden'
    if (!form.terms) e.terms = 'Debes aceptar los términos'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    setSubmitStatus('idle')
    setDuplicateAccountType(null)
    if (!validate()) return

    const existingType = getExistingAccountType(form.email)
    if (existingType !== null) {
      const label = existingType === 'user' ? 'usuario' : 'empresa'
      setErrors(prev => ({ ...prev, email: `Este correo ya está registrado como ${label}` }))
      setDuplicateAccountType(existingType)
      setSubmitStatus('duplicate')
      return
    }

    const newUser: StoredUser = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      passwordHash: simpleHash(form.password),
      accountType,
      createdAt: new Date().toISOString(),
    }

    saveUser(newUser)
    // Guardar sesión activa
    localStorage.setItem('zylo_session', JSON.stringify({ email: newUser.email, name: newUser.name, accountType }))
    setSubmitStatus('success')
  }

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'terms' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
    if (field === 'email') setDuplicateAccountType(null)
    if (submitStatus !== 'idle') setSubmitStatus('idle')
  }

  // Pantalla de éxito
  if (submitStatus === 'success') {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
        <HeaderClose />
        <main className="flex-grow flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(47,47,46,0.08)] border border-[#afadac]/10 p-10 max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full signature-gradient flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
              <span className="material-symbols-outlined text-white text-4xl">check_circle</span>
            </div>
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-extrabold text-on-surface">
                ¡Bienvenido, {form.name.split(' ')[0]}!
              </h2>
              <p className="text-on-surface-variant">
                Tu cuenta ha sido creada correctamente.
              </p>
            </div>
            <div className="bg-[#f3f0ef] rounded-xl p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-semibold">Nombre</span>
                <span className="font-bold">{form.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-semibold">Correo</span>
                <span className="font-bold">{form.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-semibold">Teléfono</span>
                <span className="font-bold">{form.phone}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#e4e2e1]">
                <span className="text-on-surface-variant font-semibold">Tipo de cuenta</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fff0eb] text-primary`}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                    {accountType === 'business' ? 'storefront' : 'person'}
                  </span>
                  {accountType === 'business' ? 'Empresa' : 'Usuario'}
                </span>
              </div>
            </div>
            <a
              href="/login"
              className="block w-full signature-gradient text-white font-headline font-bold py-4 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              Ir a Iniciar Sesión
            </a>
          </div>
        </main>
        <footer className="w-full py-8 text-center text-xs font-label text-outline uppercase tracking-[0.2em]">
          © 2026 Zylo. Todos los derechos reservados.
        </footer>
      </div>
    )
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col selection:bg-[#ff7851] selection:text-[#470e00]">

      <HeaderClose />

      <main className="relative px-4 sm:px-6 pb-24 pt-4 flex flex-col items-center flex-grow">

        {/* Background accent */}
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-[600px] opacity-10 bg-gradient-to-bl from-[#ff7851] to-transparent rounded-bl-[10rem] pointer-events-none" />

        {/* Decorative ring */}
        <div className="fixed bottom-12 left-12 opacity-20 hidden lg:block pointer-events-none">
          <div className="w-32 h-32 rounded-full border-[24px] border-[#ff5d2b]/30" />
        </div>

        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">

          {/* Left editorial — desktop only */}
          <div className="hidden md:flex flex-col space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1 rounded-full bg-[#ffc3c0] text-[#852327] text-xs font-bold tracking-widest uppercase">
                Comienza tu viaje
              </span>
              <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface leading-[1.1]">
                Descubre la energía{' '}
                <span className="text-primary">cinética</span>{' '}
                del servicio local.
              </h1>
              <p className="text-on-surface-variant text-lg leading-relaxed max-w-sm">
                Conecta con profesionales de primer nivel y gestiona tus reservas con eficiencia.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f3f0ef] p-6 rounded-xl space-y-2">
                <span className="material-symbols-outlined text-primary text-3xl">bolt</span>
                <p className="font-bold text-sm">Reserva rápida</p>
              </div>
              <div className="bg-[#f3f0ef] p-6 rounded-xl space-y-2">
                <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                <p className="font-bold text-sm">Profesionales verificados</p>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-[#ffffff] rounded-xl p-6 sm:p-8 md:p-10 shadow-[0_20px_40px_-10px_rgba(47,47,46,0.06)] border border-[#afadac]/10 w-full">

            {/* Mobile heading — hidden on md+ */}
            <div className="md:hidden text-center mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-[#ffc3c0] text-[#852327] text-xs font-bold tracking-widest uppercase mb-3">
                Comienza tu viaje
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-on-surface leading-tight">
                Únete a <span className="text-primary">Zylo</span>
              </h2>
            </div>

            <div className="hidden md:block mb-8 text-left">
              <h2 className="font-headline text-3xl font-bold mb-2">Crear Cuenta</h2>
              <p className="text-on-surface-variant">Únete a nuestro marketplace hoy</p>
            </div>

            <div className="space-y-5">

              {/* Account type toggle */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface-variant px-1 tracking-widest">
                  TIPO DE CUENTA
                </label>
                <div className="grid grid-cols-2 p-1.5 bg-[#f3f0ef] rounded-full gap-1">
                  <button
                    type="button"
                    onClick={() => setAccountType('user')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-full font-headline font-bold text-sm transition-all ${
                      accountType === 'user'
                        ? 'signature-gradient text-white shadow-md shadow-primary/20'
                        : 'text-on-surface-variant hover:bg-[#e4e2e1]'
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
                    Usuario
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('business')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-full font-headline font-bold text-sm transition-all ${
                      accountType === 'business'
                        ? 'signature-gradient text-white shadow-md shadow-primary/20'
                        : 'text-on-surface-variant hover:bg-[#e4e2e1]'
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>storefront</span>
                    Empresa
                  </button>
                </div>
                {/* Context hint */}
                <p className="text-xs text-on-surface-variant px-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                    {accountType === 'business' ? 'storefront' : 'person'}
                  </span>
                  {accountType === 'business'
                    ? 'Podrás publicar y gestionar tus servicios en Zylo.'
                    : 'Podrás contratar y reservar servicios en Zylo.'}
                </p>
              </div>

              {/* Full name */}
              <Field label="NOMBRE COMPLETO" error={errors.name}>
                <InputWrapper icon="person">
                  <input
                    type="text"
                    placeholder="Tu nombre completo"
                    value={form.name}
                    onChange={set('name')}
                    className={inputClass(!!errors.name)}
                    autoComplete="name"
                  />
                </InputWrapper>
              </Field>

              {/* Email & Phone — stacked on mobile, side by side on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="CORREO" error={errors.email}>
                  <InputWrapper icon="mail">
                    <input
                      type="email"
                      placeholder="hola@zylo.com"
                      value={form.email}
                      onChange={set('email')}
                      className={inputClass(!!errors.email)}
                      autoComplete="email"
                      inputMode="email"
                    />
                  </InputWrapper>
                </Field>
                <Field label="TELÉFONO" error={errors.phone}>
                  <InputWrapper icon="call">
                    <input
                      type="tel"
                      placeholder="+51 999 000 000"
                      value={form.phone}
                      onChange={set('phone')}
                      className={inputClass(!!errors.phone)}
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </InputWrapper>
                </Field>
              </div>

              {/* Password */}
              <Field label="CONTRASEÑA" error={errors.password}>
                <InputWrapper icon="lock" onToggle={() => setShowPassword(v => !v)} showToggle showingPassword={showPassword}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={set('password')}
                    className={inputClass(!!errors.password)}
                    autoComplete="new-password"
                  />
                </InputWrapper>
                {/* Strength indicator */}
                {form.password.length > 0 && (
                  <PasswordStrength password={form.password} />
                )}
              </Field>

              {/* Confirm password */}
              <Field label="CONFIRMAR CONTRASEÑA" error={errors.confirmPassword}>
                <InputWrapper icon="enhanced_encryption" onToggle={() => setShowConfirm(v => !v)} showToggle showingPassword={showConfirm}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    className={inputClass(!!errors.confirmPassword)}
                    autoComplete="new-password"
                  />
                </InputWrapper>
              </Field>

              {/* Terms */}
              <div className="flex items-start space-x-3 pt-1">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={form.terms}
                    onChange={set('terms')}
                    className="w-5 h-5 text-primary border-[#afadac] rounded focus:ring-primary focus:ring-offset-0 bg-[#f3f0ef] transition-colors cursor-pointer accent-primary"
                  />
                </div>
                <div>
                  <label htmlFor="terms" className="text-sm text-on-surface-variant leading-tight cursor-pointer">
                    Acepto los{' '}
                    <a href="#" className="text-primary font-semibold hover:underline">Términos de Servicio</a>
                    {' '}y la{' '}
                    <a href="#" className="text-primary font-semibold hover:underline">Política de Privacidad</a>.
                  </label>
                  {errors.terms && (
                    <p className="text-xs text-error mt-1">{errors.terms}</p>
                  )}
                </div>
              </div>

              {/* Alerta de correo duplicado */}
              {submitStatus === 'duplicate' && duplicateAccountType !== null && (() => {
                const isTryingBusiness = accountType === 'business'
                const existingLabel = duplicateAccountType === 'user' ? 'usuario' : 'empresa'
                const existingIcon = duplicateAccountType === 'user' ? 'person' : 'storefront'
                const tryingLabel = isTryingBusiness ? 'empresa' : 'usuario'
                const sameType = duplicateAccountType === accountType
                return (
                  <div className="rounded-2xl border border-[#ff785133] bg-[#fff5f2] p-4 flex gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5 flex-shrink-0" style={{ fontSize: 20 }}>
                      warning
                    </span>
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-on-surface">
                        Correo ya en uso
                      </p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Este correo ya está registrado como{' '}
                        <span className="inline-flex items-center gap-1 font-bold text-on-surface">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{existingIcon}</span>
                          {existingLabel}
                        </span>.
                        {!sameType && (
                          <> No puedes usarlo para crear una cuenta de <span className="font-bold text-on-surface">{tryingLabel}</span>.</>
                        )}
                      </p>
                      <a
                        href="/login"
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-1"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>login</span>
                        Iniciar sesión con este correo
                      </a>
                    </div>
                  </div>
                )
              })()}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="w-full signature-gradient text-white font-headline font-bold py-4 sm:py-5 rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 text-sm sm:text-base"
              >
                <span>Crear Cuenta</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>

              {/* Login link */}
              <div className="text-center pt-1">
                <p className="text-on-surface-variant text-sm">
                  ¿Ya tienes cuenta?{' '}
                  <a href="/login" className="text-primary font-extrabold hover:underline ml-1">
                    Inicia Sesión
                  </a>
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 text-center text-xs font-label text-outline uppercase tracking-[0.2em]">
        © 2026 Zylo. Todos los derechos reservados.
      </footer>
    </div>
  )
}

/* ── Sub-components ── */

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-on-surface-variant px-1 tracking-widest">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-error px-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs" style={{ fontSize: 13 }}>error</span>
          {error}
        </p>
      )}
    </div>
  )
}

function InputWrapper({
  icon,
  children,
  showToggle = false,
  showingPassword = false,
  onToggle,
}: {
  icon: string
  children: React.ReactNode
  showToggle?: boolean
  showingPassword?: boolean
  onToggle?: () => void
}) {
  return (
    <div className="relative group">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl transition-colors group-focus-within:text-primary pointer-events-none">
        {icon}
      </span>
      {children}
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors p-1"
        >
          <span className="material-symbols-outlined text-xl">
            {showingPassword ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      )}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return [
    'w-full pl-12 pr-4 py-3.5 sm:py-4 bg-[#f3f0ef] border-none rounded-xl',
    'focus:ring-2 transition-all placeholder:text-outline outline-none text-sm sm:text-base',
    hasError
      ? 'ring-2 ring-error/40 focus:ring-error/60'
      : 'focus:ring-[#ff785133]',
  ].join(' ')
}

function PasswordStrength({ password }: { password: string }) {
  const getStrength = (p: string): { level: number; label: string; color: string } => {
    let score = 0
    if (p.length >= 8) score++
    if (p.length >= 12) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++

    if (score <= 1) return { level: 1, label: 'Muy débil', color: '#ef4444' }
    if (score === 2) return { level: 2, label: 'Débil', color: '#f97316' }
    if (score === 3) return { level: 3, label: 'Regular', color: '#eab308' }
    if (score === 4) return { level: 4, label: 'Fuerte', color: '#22c55e' }
    return { level: 5, label: 'Muy fuerte', color: '#16a34a' }
  }

  const { level, label, color } = getStrength(password)

  return (
    <div className="px-1 mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= level ? color : '#e4e2e1' }}
          />
        ))}
      </div>
      <p className="text-xs font-semibold" style={{ color }}>{label}</p>
    </div>
  )
}