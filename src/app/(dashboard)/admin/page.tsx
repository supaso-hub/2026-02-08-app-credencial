export default function AdminDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
            <p className="text-gray-600">Bienvenido al centro de gestión del sindicato.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-semibold text-lg">Solicitudes Pendientes</h3>
                    <p className="text-3xl font-bold mt-2 text-blue-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-semibold text-lg">Afiliados Vigentes</h3>
                    <p className="text-3xl font-bold mt-2 text-green-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-semibold text-lg">Prestadores Activos</h3>
                    <p className="text-3xl font-bold mt-2 text-purple-600">0</p>
                </div>
            </div>
        </div>
    )
}
