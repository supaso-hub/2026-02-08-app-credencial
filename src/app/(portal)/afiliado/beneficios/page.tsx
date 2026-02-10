'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    Store,
    Tag,
    Search,
    ArrowLeft,
    MapPin,
    Phone,
    ChevronRight,
    Star,
    Check,
    FileText,
    Coffee,
    Activity,
    ShoppingBag,
    Plane,
    Sparkles,
    User
} from 'lucide-react'
import Link from 'next/link'

const CATEGORIAS = [
    { id: 'TODOS', label: 'Todos', icon: Sparkles },
    { id: 'SALUD', label: 'Salud', icon: Activity, matches: ['SALUD', 'FARMACIA', 'OPTICA'] },
    { id: 'SUPERMERCADO', label: 'Super', icon: ShoppingBag, matches: ['SUPERMERCADO', 'ALIMENTOS'] },
    { id: 'GASTRONOMIA', label: 'Comida', icon: Coffee, matches: ['GASTRONOMIA', 'RESTAURANTE', 'BAR'] },
    { id: 'OTROS', label: 'Otros', icon: Plane, matches: ['OTROS', 'TURISMO', 'SERVICIOS'] },
]

function RefreshCcw(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
        </svg>
    )
}

export default function RedBeneficiosPage() {
    const [prestadores, setPrestadores] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [categoria, setCategoria] = useState('TODOS')

    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const { data } = await supabase
                .from('prestadores')
                .select(`
                    *,
                    beneficios (*)
                `)
                .eq('estado', 'ACTIVO')
                .order('nombre_fantasia')

            if (data) setPrestadores(data)
            setLoading(false)
        }
        fetchData()
    }, [])

    const filtrados = prestadores.filter(p => {
        const matchesSearch = p.nombre_fantasia.toLowerCase().includes(search.toLowerCase()) ||
            p.rubro?.toLowerCase().includes(search.toLowerCase())

        if (categoria === 'TODOS') return matchesSearch

        const catObj = CATEGORIAS.find(c => c.id === categoria)
        const matchesCat = catObj?.matches?.includes(p.rubro?.toUpperCase()) ||
            p.rubro?.toUpperCase() === categoria

        return matchesSearch && matchesCat
    })

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
            {/* Header Fijo Estilizado */}
            <div className="bg-white/80 backdrop-blur-md px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/afiliado" className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-all">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 leading-none">RED DE BENEFICIOS</h1>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none">Sindicato Activo</span>
                    </div>
                </div>
            </div>

            {/* Buscador y Filtros */}
            <div className="p-4 space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Busca por nombre o rubro..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {CATEGORIAS.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoria(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all font-bold text-[11px] uppercase tracking-wider ${categoria === cat.id
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                                : 'bg-white text-gray-500 border border-gray-100'
                                }`}
                        >
                            <cat.icon className="w-3.5 h-3.5" />
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Listado Principal */}
            <div className="px-4 space-y-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center opacity-30">
                        <RefreshCcw className="w-8 h-8 animate-spin mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizando...</span>
                    </div>
                ) : filtrados.length > 0 ? (
                    filtrados.map((p) => (
                        <div key={p.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            {/* Header Comercio Compacto */}
                            <div className="p-4 flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md flex-shrink-0">
                                    {p.logo_url ? (
                                        <img src={p.logo_url} alt={p.nombre_fantasia} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        p.nombre_fantasia?.substring(0, 1)
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                                        <h3 className="font-extrabold text-gray-900 text-sm uppercase truncate leading-tight">{p.nombre_fantasia}</h3>
                                        <div className="flex items-center gap-0.5 text-amber-400 flex-shrink-0">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span className="text-[9px] font-black text-gray-400">4.9</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                            {p.rubro}
                                        </span>
                                        <div className="flex items-center gap-1 text-gray-400 overflow-hidden">
                                            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                                            <span className="text-[9px] font-bold truncate opacity-70">{p.direccion}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Beneficios - Diseño Ultra-Resiliente */}
                            <div className="px-4 pb-4 space-y-2 border-t border-gray-50 pt-3 bg-gray-50/20">
                                {p.beneficios && p.beneficios.length > 0 ? (
                                    p.beneficios.map((b: any) => (
                                        <div key={b.id} className="bg-white border border-blue-100 rounded-2xl p-3 flex items-center gap-4 shadow-sm hover:border-blue-300 transition-all active:scale-[0.98]">
                                            <div className="bg-blue-600 text-white px-3 py-2 rounded-xl flex flex-col items-center justify-center min-w-[60px] shadow-sm">
                                                <span className="text-sm font-black leading-none">{b.porcentaje_descuento > 0 ? `${b.porcentaje_descuento}%` : <Tag className="w-4 h-4" />}</span>
                                                <span className="text-[7px] font-black uppercase mt-1 tracking-widest">OFF</span>
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-gray-800 text-xs leading-tight uppercase truncate">{b.titulo}</h4>
                                                    <span className="text-[6px] font-bold text-gray-300 uppercase border border-gray-100 px-1 rounded">DEBUG: {b.estado || 'SIN ESTADO'}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 font-medium line-clamp-1 mt-0.5">{b.descripcion}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-blue-200" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-4 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-white/50">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic mb-1">Cargando promos...</p>
                                        <div className="text-[8px] text-gray-300 font-bold uppercase">
                                            Sin beneficios vinculados para ID: {p.id.substring(0, 8)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm mx-4">
                        <Search className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                        <h4 className="text-lg font-black text-gray-900 uppercase italic">Sin Resultados</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest max-w-[180px] mx-auto mt-1">Intenta con otra búsqueda o categoría</p>
                    </div>
                )}
            </div>

            {/* Navbar Inferior Estancia */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-8 py-3 flex justify-around items-center z-50">
                <Link href="/afiliado" className="flex flex-col items-center text-gray-400 gap-1">
                    <Store className="w-5 h-5 opacity-50" />
                    <span className="text-[8px] font-black uppercase">Home</span>
                </Link>
                <div className="flex flex-col items-center gap-1 text-blue-600">
                    <Sparkles className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase">Beneficios</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-400">
                    <Phone className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase">Soporte</span>
                </div>
            </div>
        </div>
    )
}
