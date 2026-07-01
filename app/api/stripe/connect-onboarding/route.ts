import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateStripeAccount, createOnboardingLink } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('email, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'coach') return NextResponse.json({ error: 'Réservé aux coachs' }, { status: 403 })

  const { data: coachProfile } = await supabase
    .from('coach_profiles')
    .select('stripe_account_id')
    .eq('user_id', user.id)
    .single()

  let accountId = coachProfile?.stripe_account_id

  if (!accountId) {
    const account = await getOrCreateStripeAccount(user.id, profile.email)
    accountId = account.id
    await supabase.from('coach_profiles').update({ stripe_account_id: accountId }).eq('user_id', user.id)
  }

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL!
  const link = await createOnboardingLink(accountId, origin)

  return NextResponse.json({ url: link.url })
}
