'use client'

import { useState, useEffect } from 'react'
import { getSolicitudes, aprobarSolicitud, rechazarSolicitud } from './actions'
import { logout } from '@/app/(auth)/login/actions'
import {
    Users,
    Check,
    X,
    Loader2,
    RefreshCcw,
    Clock,
    UserCheck,
    UserX,
    Search,
    LogOut,
    Store
} from 'lucide-react'
import Link from 'next/link'

export default function AdminSolicitudesPage() {
    const [solicitudes, setSolicitudes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionId, setActionId] = useState<string | null>(null)
    const [filter, setFilter] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        const data = await getSolicitudes()
        setSolicitudes(data)
        setLoading(false)
    }

    async function handleAprobar(solicitud: any) {
        if (!confirm(`¿Está seguro de aprobar a ${solicitud.nombre} ${solicitud.apellido}?`)) return
        setActionId(solicitud.id)
        const res = await aprobarSolicitud(solicitud)
        if (res.error) alert(res.error)
        await fetchData()
        setActionId(null)
    }

    async function handleRechazar(id: string) {
        if (!confirm('¿Está seguro de rechazar esta solicitud?')) return
        setActionId(id)
        const res = await rechazarSolicitud(id)
        if (res.error) alert(res.error)
        await fetchData()
        setActionId(null)
    }

    const solicitudesFiltradas = solicitudes.filter(s =>
        s.nombre?.toLowerCase().includes(filter.toLowerCase()) ||
        s.apellido?.toLowerCase().includes(filter.toLowerCase()) ||
        s.dni?.includes(filter)
    )

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar para Admin */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-black text-blue-600 tracking-tighter uppercase">Admin Panel</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin/solicitudes" className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 font-bold text-sm transition-all">
                        <Users className="w-5 h-5" />
                        Solicitudes
                    </Link>
                    <Link href="/admin/prestadores" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-bold text-sm">
                        <Store className="w-5 h-5" />
                        Prestadores
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={async () => await logout()}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                                <Users className="w-8 h-8 text-blue-600" />
                                Gestión de Solicitudes
                            </h1>
                            <p className="text-gray-500 font-medium tracking-tight uppercase text-[10px]">Revisión de nuevos afiliados</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o DNI..."
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-64"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={fetchData}
                                className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 shadow-sm"
                            >
                                <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Solicitante</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">DNI</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading && solicitudes.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-200" />
                                                Cargando solicitudes...
                                            </td>
                                        </tr>
                                    ) : solicitudesFiltradas.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                                                No se encontraron registros.
                                            </td>
                                        </tr>
                                    ) : (
                                        solicitudesFiltradas.map((s) => (
                                            <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4 text-[10px] text-gray-500 font-mono">
                                                    {new Date(s.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-800 uppercase text-sm">{s.nombre} {s.apellido}</p>
                                                    <p className="text-[10px] text-gray-400 lowercase">{s.email}</p>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-mono text-gray-600">{s.dni}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter ${s.estado === 'PENDIENTE' ? 'text-amber-500' :
                                                            s.estado === 'APROBADA' ? 'text-green-500' : 'text-red-500'
                                                        }`}>
                                                        {s.estado === 'PENDIENTE' && <Clock className="w-3 h-3" />}
                                                        {s.estado === 'APROBADA' && <UserCheck className="w-3 h-3" />}
                                                        {s.estado === 'RECHAZADA' && <UserX className="w-3 h-3" />}
                                                        {s.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {s.estado === 'PENDIENTE' ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleRechazar(s.id)}
                                                                disabled={actionId === s.id}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all shadow-sm bg-white border border-gray-100"
                                                                title="Rechazar"
                                                            >
                                                                {actionId === s.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleAprobar(s)}
                                                                disabled={actionId === s.id}
                                                                className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-bold text-xs shadow-lg shadow-green-100"
                                                            >
                                                                {actionId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                                APROBAR
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-300 italic">Procesado</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
