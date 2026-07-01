import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCoachingPayment } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { relationship_id } = await req.json()

  // Récupérer la relation + infos coach
  const { data: rel } = await supabase
    .from('coaching_relationships')
    .select('*, coach:coach_id(email, full_name, coach_profiles(tarif_mensuel, stripe_account_id))')
    .eq('id', relationship_id)
    .eq('sportif_id', user.id)
    .single()

  if (!rel) return NextResponse.json({ error: 'Relation introuvable' }, { status: 404 })

  const coach = rel.coach as any
  const tarif = coach.coach_profiles?.tarif_mensuel
  const stripeAccountId = coach.coach_profiles?.stripe_account_id

  if (!tarif || !stripeAccountId) {
    return NextResponse.json({ error: 'Profil coach incomplet' }, { status: 400 })
  }

  const { data: sportifProfile } = await supabase
    .from('users_profiles')
    .select('email, full_name')
    .eq('id', user.id)
    .single()

  const paymentIntent = await createCoachingPayment({
    amount: tarif * 100,
    coachStripeAccountId: stripeAccountId,
    metadata: {
      relationship_id,
      type: 'coaching',
      sportif_email: sportifProfile?.email || '',
      sportif_name: sportifProfile?.full_name || '',
      description: `Coaching personnalisé — ${coach.full_name}`,
    },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
