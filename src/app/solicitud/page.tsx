'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    UserPlus,
    Send,
    Loader2,
    AlertCircle,
    CheckCircle2,
    AtSign,
    CreditCard,
    Phone,
    Terminal
} from 'lucide-react'

export default function SolicitudPage() {
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
        setDebugLog('Iniciando envío de solicitud...')

        const formData = new FormData(event.currentTarget)
        const dni = (formData.get('dni') as string).replace(/\D/g, '')
        const email = (formData.get('email') as string).trim()

        const payload = {
            dni,
            nombre: (formData.get('nombre') as string).toUpperCase().trim(),
            apellido: (formData.get('apellido') as string).toUpperCase().trim(),
            email,
            telefono: (formData.get('telefono') as string).replace(/\D/g, ''),
            tipo_afiliado: formData.get('tipo_afiliado') as string,
            estado: 'PENDIENTE',
            created_at: new Date().toISOString()
        }

        try {
            setDebugLog(prev => prev + '\nVerificando duplicados...')

            // 1. Verificar en solicitudes
            const { data: existingSolicitud, error: solError } = await supabase
                .from('afiliado_solicitudes')
                .select('id')
                .or(`dni.eq.${dni},email.eq.${email}`)
                .maybeSingle()

            if (solError) throw solError
            if (existingSolicitud) {
                const msg = "Error: El DNI o Email ya tiene una solicitud registrada"
                setDebugLog(prev => prev + '\n❌ ' + msg)
                setError(msg)
                setIsPending(false)
                return
            }

            // 2. Verificar en afiliados
            const { data: existingAfiliado, error: afiError } = await supabase
                .from('afiliados')
                .select('id')
                .or(`dni.eq.${dni},email.eq.${email}`)
                .maybeSingle()

            if (afiError) throw afiError
            if (existingAfiliado) {
                const msg = "Error: Este DNI o Email ya pertenece a un afiliado activo"
                setDebugLog(prev => prev + '\n❌ ' + msg)
                setError(msg)
                setIsPending(false)
                return
            }

            setDebugLog(prev => prev + '\nEnviando datos a Supabase: ' + JSON.stringify(payload, null, 2))

            const { error: dbError } = await supabase
                .from('afiliado_solicitudes')
                .insert([payload])

            if (dbError) {
                setDebugLog(prev => prev + '\n❌ ERROR DE SUPABASE:\n' + JSON.stringify(dbError, null, 2))
                throw dbError
            }

            setDebugLog(prev => prev + '\n✅ ÉXITO: Solicitud insertada correctamente.')
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado al enviar la solicitud.')
            console.error('Submission error:', err)
        } finally {
            setIsPending(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center space-y-4 border border-green-100">
                    <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">¡Solicitud Enviada!</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Tu solicitud de ingreso ha sido registrada correctamente. Un operador revisará tus datos y te contactará por email a la brevedad.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                    >
                        Volver a empezar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="mx-auto h-16 w-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-4 transform -rotate-3 hover:rotate-0 transition-transform cursor-default">
                        <UserPlus className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Solicitud de Ingreso al Sindicato
                    </h1>
                    <p className="mt-2 text-gray-600 font-medium">
                        Completa el formulario para iniciar tu proceso de afiliación
                    </p>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nombre */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre</label>
                                <div className="relative">
                                    <input
                                        name="nombre"
                                        type="text"
                                        required
                                        placeholder="Ej: JUAN CARLOS"
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold outline-none text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Apellido */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Apellido</label>
                                <div className="relative">
                                    <input
                                        name="apellido"
                                        type="text"
                                        required
                                        placeholder="Ej: PEREZ"
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold outline-none text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* DNI */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">DNI (Sin puntos)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <input
                                        name="dni"
                                        type="text"
                                        pattern="[0-9]*"
                                        required
                                        placeholder="12345678"
                                        className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono outline-none text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Teléfono (10 dígitos)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <input
                                        name="telefono"
                                        type="tel"
                                        pattern="[0-9]{10}"
                                        required
                                        placeholder="3764000000"
                                        title="Ingresa los 10 dígitos del número sin guiones ni espacios"
                                        className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold outline-none text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <AtSign className="w-5 h-5" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="ejemplo@correo.com"
                                    className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold outline-none text-gray-900"
                                />
                            </div>
                        </div>

                        {/* Tipo de Afiliado */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Tipo de Afiliación</label>
                            <select
                                name="tipo_afiliado"
                                required
                                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold outline-none appearance-none text-gray-900"
                            >
                                <option value="ACTIVO">ACTIVO (En actividad laboral)</option>
                                <option value="ADHERENTE">ADHERENTE (Familiar/Independiente)</option>
                                <option value="JUBILADO">JUBILADO</option>
                            </select>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
                        >
                            {isPending ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    ENVIAR SOLICITUD
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* DEBUG LOG VISOR */}
                {debugLog && (
                    <div className="mt-12 bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                        <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-gray-800">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-gray-400" />
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Supabase Debug Log</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                            </div>
                        </div>
                        <div className="p-6">
                            <pre className="text-red-400 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[400px]">
                                {debugLog}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
