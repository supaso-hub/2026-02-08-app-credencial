'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPrestadoresPendientes() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('prestadores')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching prestadores:', error)
        return []
    }
    return data
}

export async function aprobarPrestador(id: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from('prestadores')
        .update({ estado: 'ACTIVO' })
        .eq('id', id)

    if (error) {
        console.error('Error al aprobar prestador:', error)
        return { error: 'No se pudo aprobar el prestador.' }
    }

    revalidatePath('/admin/prestadores')
    revalidatePath('/afiliado/beneficios')
    return { success: true }
}

export async function rechazarPrestador(id: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from('prestadores')
        .update({ estado: 'INACTIVO' })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/prestadores')
    revalidatePath('/afiliado/beneficios')
    return { success: true }
}
