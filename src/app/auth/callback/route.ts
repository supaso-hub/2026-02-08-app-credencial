import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // El parámetro "next" se puede usar para redirigir después del intercambio de código
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Si no hay error, el middleware se encargará de redirigir según el rol
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Si hay error o no hay código, redirigir al login con mensaje de error
    return NextResponse.redirect(`${origin}/login?error=No se pudo validar el acceso`)
}
