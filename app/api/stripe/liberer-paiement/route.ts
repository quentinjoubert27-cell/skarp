import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

// Route admin uniquement — libère un paiement en séquestre
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profile } = await supabase.from('users_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { paiement_id } = await req.json()

  const { data: paiement } = await supabase
    .from('paiements')
    .select('stripe_payment_intent_id')
    .eq('id', paiement_id)
    .single()

  if (!paiement?.stripe_payment_intent_id) {
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
  }

  // Capture du PaymentIntent (si capture_method=manual) — sinon juste MAJ statut
  try {
    await stripe.paymentIntents.capture(paiement.stripe_payment_intent_id)
  } catch {
    // PaymentIntent déjà capturé (payment type normal) → on passe directement au statut libéré
  }

  await supabase.from('paiements').update({ statut: 'libere' }).eq('id', paiement_id)

  return NextResponse.json({ ok: true })
}
