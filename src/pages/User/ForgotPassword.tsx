import { useState } from 'react'
import HeaderClose from '../../components/HeaderClose'

const API_URL = import.meta.env.VITE_API_URL

type SubmitState = 'idle' | 'loading' | 'success'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [submitState, setSubmitState] = useState<SubmitState>('idle')
    const [resetToken, setResetToken] = useState('')

    const handleSubmit = async () => {
        setError('')

        if (!email.trim()) {
            setError('El correo es obligatorio')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Correo inválido')
            return
        }

        if (!API_URL) {
            setError('VITE_API_URL no está configurada')
            return
        }

        try {
            setSubmitState('loading')

            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                }),
            })

            const data = await response.json().catch(() => null)

            if (!response.ok) {
                setError(data?.detail || 'No se pudo procesar la solicitud')
                setSubmitState('idle')
                return
            }

            setResetToken(data?.reset_token || '')
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

                <main className="flex-grow flex items-center justify-center px-4 py-12">
                    <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(47,47,46,0.06)] p-8 md:p-10 border border-[#afadac]/10 w-full max-w-xl">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 rounded-full signature-gradient flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-white text-4xl">mail</span>
                            </div>

                            <h1 className="font-headline text-3xl font-extrabold text-on-surface">
                                Revisa tu recuperación
                            </h1>

                            <p className="text-on-surface-variant">
                                Si la cuenta existe, el backend ya generó un token de recuperación.
                            </p>
                        </div>

                        <div className="mt-6 bg-[#f3f0ef] rounded-xl p-4 space-y-2">
                            <p className="text-sm font-semibold text-on-surface">Correo</p>
                            <p className="text-sm text-on-surface-variant break-all">{email}</p>

                            <div className="pt-3 border-t border-[#e4e2e1]">
                                <p className="text-sm font-semibold text-on-surface mb-1">Token de prueba</p>
                                <p className="text-xs text-on-surface-variant break-all">
                                    {resetToken || 'No se recibió token'}
                                </p>
                            </div>
                        </div>

                        <a
                            href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                            className="mt-6 block w-full signature-gradient text-white font-headline font-bold py-4 rounded-full text-center hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                            Continuar al cambio de contraseña
                        </a>

                        <div className="text-center mt-5">
                            <a href="/login" className="text-sm text-primary font-bold hover:underline">
                                Volver a iniciar sesión
                            </a>
                        </div>
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
                                Recupera <br />
                                <span className="text-primary">tu acceso.</span>
                            </h1>

                            <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
                                Te ayudamos a volver a entrar a tu cuenta de forma rápida y segura.
                            </p>
                        </div>

                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-20 right-0 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl pointer-events-none" />
                    </div>

                    <div className="bg-[#ffffff] rounded-xl shadow-[0_20px_40px_rgba(47,47,46,0.06)] p-8 md:p-12 border border-[#afadac]/10">
                        <div className="md:hidden text-center mb-6">
                            <h2 className="font-headline text-3xl font-extrabold text-on-surface leading-tight">
                                Recupera <span className="text-primary">tu acceso</span>
                            </h2>
                            <p className="text-sm text-on-surface-variant mt-1">
                                Ingresa tu correo para continuar.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="font-label text-sm font-semibold text-on-surface px-1">
                                    Correo Electrónico
                                </label>

                                <div className="relative group">
                                    <input
                                        type="email"
                                        placeholder="hola@zylo.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value)
                                            setError('')
                                        }}
                                        inputMode="email"
                                        autoComplete="email"
                                        className={`w-full bg-[#f3f0ef] border-none rounded-full px-6 py-4 text-on-surface placeholder:text-outline focus:ring-2 transition-all outline-none text-base ${error ? 'ring-2 ring-red-300 focus:ring-red-300' : 'focus:ring-[#ff785133]'
                                            }`}
                                    />

                                    <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                                        alternate_email
                                    </span>
                                </div>

                                {error && <p className="text-xs text-error px-1">{error}</p>}
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitState === 'loading'}
                                className="w-full signature-gradient text-white font-headline font-bold py-5 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50"
                            >
                                {submitState === 'loading' ? 'Enviando...' : 'Enviar recuperación'}
                            </button>

                            <div className="text-center">
                                <p className="text-sm font-label text-on-surface-variant">
                                    ¿Recordaste tu contraseña?{' '}
                                    <a href="/login" className="text-primary font-bold hover:underline transition-all">
                                        Inicia sesión
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