'use client'

import { useState, useEffect } from 'react'
import { getPrestadoresPendientes, aprobarPrestador, rechazarPrestador } from './actions'
import { logout } from '@/app/(auth)/login/actions'
import {
    Store,
    Check,
    X,
    Loader2,
    RefreshCcw,
    Clock,
    Search,
    LogOut,
    LayoutDashboard,
    Users
} from 'lucide-react'
import Link from 'next/link'

export default function AdminPrestadoresPage() {
    const [prestadores, setPrestadores] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionId, setActionId] = useState<string | null>(null)
    const [filter, setFilter] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        const data = await getPrestadoresPendientes()
        setPrestadores(data)
        setLoading(false)
    }

    async function handleAprobar(id: string, nombre: string) {
        if (!confirm(`¿Aprobar al prestador "${nombre}"?`)) return
        setActionId(id)
        const res = await aprobarPrestador(id)
        if (res.error) alert(res.error)
        await fetchData()
        setActionId(null)
    }

    async function handleRechazar(id: string) {
        if (!confirm('¿Rechazar este prestador?')) return
        setActionId(id)
        const res = await rechazarPrestador(id)
        if (res.error) alert(res.error)
        await fetchData()
        setActionId(null)
    }

    const filtrados = prestadores.filter(p =>
        p.nombre_fantasia?.toLowerCase().includes(filter.toLowerCase()) ||
        p.cuit?.includes(filter)
    )

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Simple para Navegación Admin */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-black text-blue-600 tracking-tighter">ADMIN PANEL</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin/solicitudes" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-bold text-sm">
                        <Users className="w-5 h-5" />
                        Solicitudes
                    </Link>
                    <Link href="/admin/prestadores" className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 font-bold text-sm transition-all">
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
                                <Store className="w-8 h-8 text-indigo-600" />
                                Gestión de Prestadores
                            </h1>
                            <p className="text-gray-500 font-medium tracking-tight uppercase text-[10px]">Habilitación de Comercios y Servicios</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o CUIT..."
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none w-64"
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
                            <table className="w-full text-left border-collapse font-sans">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prestador</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rubro</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">CUIT / Email</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading && prestadores.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-200" />
                                                Cargando prestadores...
                                            </td>
                                        </tr>
                                    ) : filtrados.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                                                No se encontraron registros.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtrados.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-800 uppercase text-sm tracking-tight">{p.nombre_fantasia}</p>
                                                    <p className="text-[10px] text-gray-400">{p.direccion}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100">
                                                        {p.rubro}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-mono text-gray-600">{p.cuit}</p>
                                                    <p className="text-[10px] text-gray-400">{p.email}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter ${p.estado === 'PENDIENTE' ? 'text-amber-500' :
                                                            p.estado === 'ACTIVO' ? 'text-green-500' : 'text-red-500'
                                                        }`}>
                                                        {p.estado === 'PENDIENTE' && <Clock className="w-3 h-3" />}
                                                        {p.estado === 'ACTIVO' && <Check className="w-3 h-3" />}
                                                        {p.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {p.estado === 'PENDIENTE' ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleRechazar(p.id)}
                                                                disabled={actionId === p.id}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all shadow-sm bg-white border border-gray-100"
                                                                title="Rechazar"
                                                            >
                                                                {actionId === p.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleAprobar(p.id, p.nombre_fantasia)}
                                                                disabled={actionId === p.id}
                                                                className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-bold text-xs shadow-lg shadow-green-100"
                                                            >
                                                                {actionId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                                APROBAR
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-300 italic">Habilitado</span>
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
