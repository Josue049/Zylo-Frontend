import { useMemo, useState } from 'react'
import HeaderClose from '../../components/HeaderClose'

const API_URL = import.meta.env.VITE_API_URL

type SubmitState = 'idle' | 'loading' | 'success'

export default function ResetPassword() {
    const token = useMemo(() => {
        const params = new URLSearchParams(window.location.search)
        return params.get('token') || ''
    }, [])

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [error, setError] = useState('')
    const [submitState, setSubmitState] = useState<SubmitState>('idle')

    const handleSubmit = async () => {
        setError('')

        if (!token) {
            setError('Token de recuperación no encontrado')
            return
        }

        if (!password) {
            setError('La nueva contraseña es obligatoria')
            return
        }

        if (password.length < 8) {
            setError('La contraseña debe tener mínimo 8 caracteres')
            return
        }

        if (!confirmPassword) {
            setError('Debes confirmar la nueva contraseña')
            return
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (!API_URL) {
            setError('VITE_API_URL no está configurada')
            return
        }

        try {
            setSubmitState('loading')

            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    token,
                    new_password: password,
                }),
            })

            const data = await response.json().catch(() => null)

            if (!response.ok) {
                setError(data?.detail || 'No se pudo actualizar la contraseña')
                setSubmitState('idle')
                return
            }

            setSubmitState('success')
        } catch (err) {
            console.error(err)
            setError('Hubo un problema de conexión con el servidor')
            setSubmitState('idle')
        }
    }

    if (submitState === 'success') {
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
                                Contraseña actualizada
                            </h2>
                            <p className="text-on-surface-variant">
                                Ya puedes ingresar nuevamente con tu nueva contraseña.
                            </p>
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
        <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
            <HeaderClose />

            <main className="flex-grow flex items-center justify-center px-4 py-12 md:py-20">
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="hidden md:block relative">
                        <div className="space-y-6 relative z-10">
                            <h1 className="font-headline text-7xl font-extrabold tracking-tight text-on-surface leading-none">
                                Nueva <br />
                                <span className="text-primary">contraseña.</span>
                            </h1>

                            <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
                                Crea una contraseña segura para volver a entrar a tu cuenta.
                            </p>
                        </div>

                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-20 right-0 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl pointer-events-none" />
                    </div>

                    <div className="bg-[#ffffff] rounded-xl shadow-[0_20px_40px_rgba(47,47,46,0.06)] p-8 md:p-12 border border-[#afadac]/10">
                        <div className="md:hidden text-center mb-6">
                            <h2 className="font-headline text-3xl font-extrabold text-on-surface leading-tight">
                                Nueva <span className="text-primary">contraseña</span>
                            </h2>
                            <p className="text-sm text-on-surface-variant mt-1">
                                Ingresa tu nueva clave.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="font-label text-sm font-semibold text-on-surface px-1">
                                    Nueva contraseña
                                </label>

                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Mínimo 8 caracteres"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value)
                                            setError('')
                                        }}
                                        className={`w-full bg-[#f3f0ef] border-none rounded-full px-6 py-4 text-on-surface placeholder:text-outline focus:ring-2 transition-all outline-none text-base ${error ? 'ring-2 ring-red-300 focus:ring-red-300' : 'focus:ring-[#ff785133]'
                                            }`}
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? 'visibility_off' : 'lock'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-label text-sm font-semibold text-on-surface px-1">
                                    Confirmar contraseña
                                </label>

                                <div className="relative group">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="Repite tu nueva contraseña"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value)
                                            setError('')
                                        }}
                                        className={`w-full bg-[#f3f0ef] border-none rounded-full px-6 py-4 text-on-surface placeholder:text-outline focus:ring-2 transition-all outline-none text-base ${error ? 'ring-2 ring-red-300 focus:ring-red-300' : 'focus:ring-[#ff785133]'
                                            }`}
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined">
                                            {showConfirm ? 'visibility_off' : 'lock'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-2xl border border-[#ff785133] bg-[#fff5f2] p-4 flex gap-3">
                                    <span
                                        className="material-symbols-outlined text-primary mt-0.5 flex-shrink-0"
                                        style={{ fontSize: 20 }}
                                    >
                                        error
                                    </span>

                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-on-surface">No se pudo actualizar</p>
                                        <p className="text-xs text-on-surface-variant leading-relaxed">{error}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={submitState === 'loading'}
                                className="w-full signature-gradient text-white font-headline font-bold py-5 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50"
                            >
                                {submitState === 'loading' ? 'Actualizando...' : 'Actualizar contraseña'}
                            </button>

                            <div className="text-center">
                                <a href="/login" className="text-sm font-label text-primary font-bold hover:underline">
                                    Volver a iniciar sesión
                                </a>
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