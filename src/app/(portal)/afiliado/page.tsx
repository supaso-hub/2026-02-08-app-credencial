import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { logout } from '@/app/(auth)/login/actions'
import { LogOut, ArrowRight, User, CreditCard, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function AfiliadoPortal() {
    // Leemos la cookie directamente desde el servidor
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session_simulada')

    let afiliado = null
    if (sessionCookie) {
        try {
            afiliado = JSON.parse(sessionCookie.value)
        } catch (e) {
            console.error('Error parseando sesión', e)
        }
    }

    // Si no hay sesión, protegemos la página (aunque el middleware ya lo hace)
    if (!afiliado) {
        redirect('/login')
    }

    const nombreMostrado = `${afiliado.nombre} ${afiliado.apellido}`.toUpperCase()
    const dniMostrado = afiliado.dni

    return (
        <div className="p-6 max-w-lg mx-auto min-h-screen bg-gray-50/50">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Mi Credencial</h1>
                    <p className="text-xs text-gray-500 font-medium">Sindicato Unificado</p>
                </div>
                <form action={logout}>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-3 py-2 bg-white text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all font-semibold border border-gray-100 shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Salir
                    </button>
                </form>
            </div>

            {/* Credencial Digital */}
            <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden mb-8 border border-blue-400/20">
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md">
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-[10px] uppercase tracking-[0.2em] opacity-90 font-bold">Digital ID</p>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-green-300 fill-green-300/20" />
                    </div>

                    <div className="mt-8">
                        <p className="text-[10px] opacity-70 uppercase font-bold tracking-widest mb-1">Titular</p>
                        <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">{nombreMostrado}</h2>
                    </div>

                    <div className="mt-8 flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[9px] opacity-70 uppercase font-bold tracking-widest">DNI Afiliado</p>
                            <p className="font-mono text-xl tracking-[0.1em] font-medium">{dniMostrado}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] opacity-70 uppercase font-bold tracking-widest mb-1 italic">Estado Actual</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-white/20 text-white border border-white/30 backdrop-blur-md">
                                VIGENTE
                            </span>
                        </div>
                    </div>
                </div>

                {/* Elementos Decorativos */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
            </div>

            {/* Menú de Acciones */}
            <div className="grid grid-cols-1 gap-4">
                <Link href="/afiliado/beneficios" className="w-full bg-white border border-gray-100 p-5 rounded-2xl flex justify-between items-center group transition-all shadow-sm hover:shadow-md hover:border-blue-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-gray-800">Red de Beneficios</span>
                            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Ver descuentos y comercios</span>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
                </Link>

                <button className="w-full bg-white border border-gray-100 p-5 rounded-2xl flex justify-between items-center group transition-all shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl text-gray-600">
                            <User className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-gray-800">Mis Datos</span>
                            <span className="text-xs text-gray-400 font-medium">Actualizar información personal</span>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                </button>
            </div>

            <footer className="mt-12 text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Vigencia: 2026 - 2027
                </p>
            </footer>
        </div>
    )
}
