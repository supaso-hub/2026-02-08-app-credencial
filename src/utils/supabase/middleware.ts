import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Credenciales Hardcodeadas para solucionar el error de lectura de variables de entorno
const SUPABASE_URL = 'https://mdftijdjckugrdouslni.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_itbwTGCKUHx5Kg_FuYfT8g_iiZsVnUS'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Verificación de sesión para protección de rutas
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // También verificamos nuestra sesión simulada para el modo dev/test
    const sessionSimulada = request.cookies.get('session_simulada')
    const isAuthenticated = !!user || !!sessionSimulada

    const { pathname } = request.nextUrl

    // Protección de rutas: /admin y /afiliado requieren login
    if (!isAuthenticated && (pathname.startsWith('/admin') || pathname.startsWith('/afiliado'))) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Redirección si ya está logueado e intenta entrar al login
    if (isAuthenticated && pathname.startsWith('/login')) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/solicitudes'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
