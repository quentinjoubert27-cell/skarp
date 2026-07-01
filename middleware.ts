import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Routes publiques — pas de protection
  const publicRoutes = ['/', '/recherche', '/login', '/signup']
  const isPublic = publicRoutes.some(r => pathname === r) ||
    pathname.startsWith('/coach/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/webhooks')

  if (isPublic) return supabaseResponse

  // Non connecté → login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Récupérer le rôle
  const { data: profile } = await supabase
    .from('users_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  // Protéger les routes par rôle
  if (pathname.startsWith('/dashboard') && role !== 'sportif') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  if (pathname.startsWith('/coach-dashboard') && role !== 'coach') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Onboarding obligatoire si profil incomplet
  if (pathname !== '/onboarding' && role === 'sportif') {
    const { data: sportifProfile } = await supabase
      .from('sportif_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single()
    if (!sportifProfile) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html)$).*)'],
}
