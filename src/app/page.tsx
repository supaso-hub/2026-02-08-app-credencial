import Link from 'next/link'

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-8">Credencial Sindicato</h1>
            <div className="flex gap-4">
                <Link
                    href="/login"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Iniciar Sesión
                </Link>
                <Link
                    href="/afiliado"
                    className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition"
                >
                    Mi Credencial
                </Link>
            </div>
        </main>
    )
}
