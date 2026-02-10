'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginManual(formData: FormData) {
    const supabase = createClient()
    const email = (formData.get('email') as string).trim()
    const dni = (formData.get('dni') as string).trim()

    // 1. Validar contra la tabla de afiliados
    const { data: afiliado, error: dbError } = await supabase
        .from('afiliados')
        .select('*')
        .eq('email', email)
        .eq('dni', dni)
        .single()

    if (dbError || !afiliado) {
        return { error: 'Los datos (Email/DNI) no coinciden con nuestros registros.' }
    }

    if (afiliado.estado !== 'VIGENTE') {
        return { error: `Acceso denegado. Estado del afiliado: ${afiliado.estado || 'INACTIVO'}` }
    }

    // 2. Verificar si es Superadmin en la tabla usuarios_roles
    const { data: userRole } = await supabase
        .from('usuarios_roles')
        .select('rol')
        .eq('email', email)
        .single()

    const esAdmin = userRole?.rol === 'superadmin'

    // 3. Crear una "Sesión de Simulación" usando cookies
    cookies().set('session_simulada', JSON.stringify({
        id: afiliado.id,
        nombre: afiliado.nombre,
        apellido: afiliado.apellido,
        dni: afiliado.dni,
        email: afiliado.email,
        rol: esAdmin ? 'superadmin' : 'afiliado'
    }), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 // 24 horas
    })

    // Redirigir según el rol
    if (esAdmin) {
        redirect('/admin/solicitudes')
    } else {
        redirect('/afiliado')
    }
}

export async function logout() {
    cookies().delete('session_simulada')
    redirect('/login')
}
