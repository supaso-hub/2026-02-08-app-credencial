'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    Tag,
    Send,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Percent,
    FileText,
    Store,
    ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export default function NuevoBeneficioPage() {
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
        setDebugLog('Iniciando carga de beneficio...')

        const formData = new FormData(event.currentTarget)
        const emailPrestador = (formData.get('email_prestador') as string).trim()

        try {
            // 1. Verificar que el prestador existe y está ACTIVO
            setDebugLog(prev => prev + `\nVerificando prestador: ${emailPrestador}`)
            const { data: prestador, error: pError } = await supabase
                .from('prestadores')
                .select('id, nombre_fantasia, estado')
                .eq('email', emailPrestador)
                .single()

            if (pError || !prestador) {
                throw new Error('No se encontró un prestador registrado con ese email.')
            }

            if (prestador.estado !== 'ACTIVO') {
                throw new Error('El prestador aún no ha sido aprobado por el administrador.')
            }

            // 2. Insertar el beneficio pendiente de aprobación
            const payload = {
                prestador_id: prestador.id,
                titulo: (formData.get('titulo') as string).toUpperCase().trim(),
                descripcion: formData.get('descripcion') as string,
                tipo: formData.get('tipo') as string,
                porcentaje_descuento: parseFloat(formData.get('descuento') as string) || 0,
                condiciones: formData.get('condiciones') as string,
                estado: 'PENDIENTE',
                created_at: new Date().toISOString()
            }

            setDebugLog(prev => prev + '\nEnviando beneficio: ' + JSON.stringify(payload, null, 2))

            const { error: dbError } = await supabase
                .from('beneficios')
                .insert([payload])

            if (dbError) throw dbError

            setDebugLog(prev => prev + '\n✅ ÉXITO: Beneficio cargado correctamente.')
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Error al cargar el beneficio.')
            setDebugLog(prev => prev + '\n❌ ERROR: ' + JSON.stringify(err, null, 2))
        } finally {
            setIsPending(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center space-y-4 border border-blue-100">
                    <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl">
                        <Tag className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Beneficio en Revisión</h2>
                    <p className="text-gray-600">
                        El beneficio ha sido cargado exitosamente y está pendiente de aprobación por el administrador del sindicato.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        Cargar otro beneficio
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <div className="mx-auto h-16 w-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-4 transform -rotate-3 transition-transform hover:rotate-0">
                        <Tag className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">
                        Cargar Nuevo Beneficio
                    </h1>
                    <p className="mt-2 text-gray-600 font-medium">
                        Publica un descuento para los afiliados del sindicato
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Verificación de Prestador */}
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-4">
                            <label className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 block">Email del Prestador Registrado</label>
                            <div className="relative">
                                <Store className="absolute left-3 top-3.5 w-5 h-5 text-blue-400" />
                                <input
                                    name="email_prestador"
                                    type="email"
                                    required
                                    placeholder="email@del-comercio.com"
                                    className="w-full bg-white border border-blue-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold outline-none text-gray-900"
                                />
                            </div>
                            <p className="text-[10px] text-blue-400 mt-2 font-medium italic">* El prestador debe estar previamente aprobado por el sistema.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Título */}
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Título del Beneficio</label>
                                <input
                                    name="titulo"
                                    type="text"
                                    required
                                    placeholder="Ej: 20% DE DESCUENTO EN MEDICAMENTOS"
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold outline-none text-gray-900"
                                />
                            </div>

                            {/* Tipo */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Tipo de Beneficio</label>
                                <select
                                    name="tipo"
                                    required
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold outline-none text-gray-900 appearance-none"
                                >
                                    <option value="DESCUENTO">DESCUENTO DIRECTO</option>
                                    <option value="PROMO">PROMOCIÓN / REGALO</option>
                                    <option value="RESERVADO">EXCLUSIVO AFILIADOS</option>
                                </select>
                            </div>

                            {/* Porcentaje */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">% Descuento</label>
                                <div className="relative">
                                    <Percent className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        name="descuento"
                                        type="number"
                                        placeholder="0"
                                        className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono font-bold outline-none text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Descripción corta</label>
                                <textarea
                                    name="descripcion"
                                    rows={2}
                                    placeholder="Detalle breve del beneficio..."
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium outline-none text-gray-900 resise-none"
                                ></textarea>
                            </div>

                            {/* Condiciones */}
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Condiciones / Letra chica</label>
                                <textarea
                                    name="condiciones"
                                    rows={2}
                                    placeholder="Ej: No acumulable con otras promos. Presentar DNI."
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium outline-none text-gray-900 resize-none opacity-80"
                                ></textarea>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm font-bold flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 tracking-widest"
                        >
                            {isPending ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />}
                            SOLICITAR CARGA DE BENEFICIO
                        </button>
                    </form>
                </div>

                {/* VISOR DEBUG */}
                {debugLog && (
                    <div className="mt-8 bg-black rounded-2xl p-4 overflow-hidden border border-gray-800 shadow-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Terminal className="w-4 h-4 text-gray-500" />
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Beneficios Debugger</span>
                        </div>
                        <pre className="text-blue-400 font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">{debugLog}</pre>
                    </div>
                )}
            </div>
        </div>
    )
}
