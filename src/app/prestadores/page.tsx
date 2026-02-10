'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    Store,
    Send,
    Loader2,
    AlertCircle,
    CheckCircle2,
    AtSign,
    Building2,
    Phone,
    MapPin,
    Terminal
} from 'lucide-react'

export default function AltaPrestadorPage() {
    const [isPending, setIsPending] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [debugLog, setDebugLog] = useState<string>('')

    const supabase = createClient()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsPending(true)
        setError(null)
        setSuccess(false)
        setDebugLog('Iniciando alta de prestador...')

        const formData = new FormData(event.currentTarget)

        const payload = {
            nombre_fantasia: (formData.get('nombre_fantasia') as string).toUpperCase().trim(),
            razon_social: (formData.get('razon_social') as string).toUpperCase().trim(),
            cuit: (formData.get('cuit') as string).replace(/\D/g, ''),
            rubro: formData.get('rubro') as string,
            email: (formData.get('email') as string).trim(),
            telefono: (formData.get('telefono') as string).replace(/\D/g, ''),
            direccion: (formData.get('direccion') as string).toUpperCase().trim(),
            estado: 'PENDIENTE', // El admin debe aprobarlo
            created_at: new Date().toISOString()
        }

        try {
            setDebugLog(prev => prev + '\nEnviando a Supabase: ' + JSON.stringify(payload, null, 2))

            const { error: dbError } = await supabase
                .from('prestadores')
                .insert([payload])

            if (dbError) {
                setDebugLog(prev => prev + '\n❌ ERROR:\n' + JSON.stringify(dbError, null, 2))
                throw dbError
            }

            setDebugLog(prev => prev + '\n✅ ÉXITO: Registro enviado para revisión.')
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Error al registrar prestador.')
        } finally {
            setIsPending(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-gray-900">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center space-y-4 border border-blue-100">
                    <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <Store className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold">Registro Enviado</h2>
                    <p className="text-gray-600">
                        La solicitud de alta para <strong>Comercio/Prestador</strong> ha sido recibida. El administrador revisará los datos para habilitar la publicación de sus beneficios.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        Cargar otro
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <div className="mx-auto h-16 w-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-4 transform rotate-3">
                        <Store className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Alta de Prestadores
                    </h1>
                    <p className="mt-2 text-gray-600 font-medium">
                        Registra un comercio o servicio en la red de beneficios
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nombre Fantasía */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre Fantasía</label>
                                <input
                                    name="nombre_fantasia"
                                    type="text"
                                    required
                                    placeholder="Ej: FARMACIA CENTRAL"
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold outline-none text-gray-900"
                                />
                            </div>

                            {/* Razón Social */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Razón Social</label>
                                <input
                                    name="razon_social"
                                    type="text"
                                    required
                                    placeholder="Ej: FARMACIAS DEL SUR S.A."
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold outline-none text-gray-900"
                                />
                            </div>

                            {/* CUIT */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">CUIT (Solo números)</label>
                                <input
                                    name="cuit"
                                    type="text"
                                    required
                                    placeholder="30123456789"
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono outline-none text-gray-900"
                                />
                            </div>

                            {/* Teléfono */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Teléfono</label>
                                <input
                                    name="telefono"
                                    type="tel"
                                    required
                                    placeholder="3764000000"
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold outline-none text-gray-900"
                                />
                            </div>

                            {/* Rubro */}
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Rubro / Categoría</label>
                                <select
                                    name="rubro"
                                    required
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold outline-none text-gray-900 appearance-none"
                                >
                                    <option value="SALUD">SALUD Y FARMACIA</option>
                                    <option value="SUPERMERCADO">SUPERMERCADOS</option>
                                    <option value="GASTRONOMIA">GASTRONOMÍA</option>
                                    <option value="TURISMO">TURISMO Y OCIO</option>
                                    <option value="OTROS">OTROS</option>
                                </select>
                            </div>

                            {/* Email */}
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email de Contacto</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="contacto@comercio.com"
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold outline-none text-gray-900"
                                />
                            </div>

                            {/* Dirección */}
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Dirección</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        name="direccion"
                                        type="text"
                                        required
                                        placeholder="CALLE FALSA 123 - POSADAS"
                                        className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold outline-none text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isPending ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />}
                            ENVIAR ALTA PRESTADOR
                        </button>
                    </form>
                </div>

                {/* DEBUG */}
                {debugLog && (
                    <div className="mt-8 bg-gray-900 rounded-2xl p-4 overflow-hidden border border-gray-800">
                        <pre className="text-red-400 font-mono text-[10px] whitespace-pre-wrap">{debugLog}</pre>
                    </div>
                )}
            </div>
        </div>
    )
}
