'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSolicitudes() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('afiliado_solicitudes')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching solicitudes:', error)
        return []
    }
    return data
}

export async function aprobarSolicitud(solicitud: any) {
    const supabase = createClient()

    // 1. Mover datos a la tabla de afiliados
    const { error: insertError } = await supabase
        .from('afiliados')
        .insert([{
            dni: solicitud.dni,
            nombre: solicitud.nombre,
            apellido: solicitud.apellido,
            email: solicitud.email,
            telefono: solicitud.telefono,
            tipo_afiliado: solicitud.tipo_afiliado,
            estado: 'VIGENTE',
            fecha_alta: new Date().toISOString()
        }])

    if (insertError) {
        console.error('Error al crear afiliado:', insertError)
        return { error: 'No se pudo crear el afiliado. Verifique si el DNI ya existe.' }
    }

    // 2. Actualizar estado de la solicitud
    const { error: updateError } = await supabase
        .from('afiliado_solicitudes')
        .update({ estado: 'APROBADA' })
        .eq('id', solicitud.id)

    if (updateError) {
        console.error('Error al actualizar solicitud:', updateError)
        return { error: 'Afiliado creado pero la solicitud no cambió de estado.' }
    }

    revalidatePath('/admin/solicitudes')
    return { success: true }
}

export async function rechazarSolicitud(id: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from('afiliado_solicitudes')
        .update({ estado: 'RECHAZADA' })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/solicitudes')
    return { success: true }
}
