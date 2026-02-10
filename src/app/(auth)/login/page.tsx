'use client'

import { useState } from 'react'
import { loginManual } from './actions'
import { Loader2, Mail, User, Eye, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsPending(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const result = await loginManual(formData)

        if (result?.error) {
            setError(result.error)
            setIsPending(false)
        }
        // Si es exitoso, loginManual hace redirect('/afiliado')
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div>
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <User className="h-7 w-7" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                        Portal Afiliados
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500 font-medium italic">
                        Validación por Email y DNI
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-gray-50"
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Número de DNI (Sin puntos)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Eye className="h-5 w-5" />
                                </div>
                                <input
                                    name="dni"
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-blue-50 font-mono text-lg"
                                    placeholder="12345678"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm font-medium animate-shake">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all uppercase tracking-widest shadow-lg"
                        >
                            {isPending ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                'Ingresar ahora'
                            )}
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest">O</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <Link
                            href="/solicitud"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-200 text-xs font-black rounded-xl text-gray-500 bg-gray-50 hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all uppercase tracking-widest group"
                        >
                            <UserPlus className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                            ¿No tienes cuenta? Solicita tu Afiliación aquí
                        </Link>
                    </div>
                </form>

                <div className="text-center text-[10px] text-gray-400 uppercase tracking-tighter">
                    Acceso exclusivo para afiliados activos
                </div>
            </div>
        </div>
    )
}
