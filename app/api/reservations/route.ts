import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createReservationPayment } from '@/lib/stripe'
import { sendReservationConfirmation } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { coach_id, date_heure, duree_minutes, lieu, montant } = body

  // Récupérer le Stripe account du coach
  const { data: coach } = await supabase
    .from('users_profiles')
    .select('full_name, email, coach_profiles(stripe_account_id, tarif_seance_presentiel)')
    .eq('id', coach_id)
    .single()

  const stripeAccountId = (coach as any)?.coach_profiles?.stripe_account_id
  if (!stripeAccountId) return NextResponse.json({ error: 'Coach non configuré sur Stripe' }, { status: 400 })

  // Créer le PaymentIntent en mode séquestre
  const { data: sportif } = await supabase.from('users_profiles').select('full_name, email').eq('id', user.id).single()

  const intent = await createReservationPayment({
    amount: montant,
    coachStripeAccountId: stripeAccountId,
    metadata: { sportif_id: user.id, coach_id, type: 'reservation_presentiel' },
  })

  // Créer la réservation en DB
  const { data: reservation, error } = await supabase.from('reservations_presentiel').insert({
    coach_id,
    sportif_id: user.id,
    date_heure,
    duree_minutes: duree_minutes || 60,
    lieu: lieu || null,
    montant,
    statut: 'en_attente',
    stripe_payment_intent_id: intent.id,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Email de confirmation
  if (sportif && coach) {
    await sendReservationConfirmation(
      sportif.email, sportif.full_name,
      coach.full_name,
      new Date(date_heure).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
    ).catch(() => {})
  }

  return NextResponse.json({ ok: true, clientSecret: intent.client_secret, reservation })
}
