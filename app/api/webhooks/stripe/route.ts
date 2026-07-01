import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPaymentConfirmation } from '@/lib/resend'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature invalide' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const { relationship_id, type, sportif_email, sportif_name, description } = pi.metadata

      if (!relationship_id) break

      const commission = Math.round(pi.amount * parseFloat(process.env.COMMISSION_RATE || '0.12'))

      // Enregistrer le paiement
      await supabase.from('paiements').upsert({
        relationship_id,
        montant: pi.amount,
        commission,
        stripe_payment_intent_id: pi.id,
        statut: 'en_attente',
      }, { onConflict: 'stripe_payment_intent_id' })

      // Si coaching personnalisé → passer la relation en actif
      if (type === 'coaching') {
        await supabase
          .from('coaching_relationships')
          .update({ status: 'actif' })
          .eq('id', relationship_id)
      }

      // Email de confirmation
      if (sportif_email && sportif_name) {
        await sendPaymentConfirmation(
          sportif_email,
          sportif_name,
          pi.amount / 100,
          description || 'Coaching SKARP'
        )
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      const { relationship_id } = pi.metadata
      if (relationship_id) {
        await supabase
          .from('paiements')
          .update({ statut: 'rembourse' })
          .eq('stripe_payment_intent_id', pi.id)
      }
      break
    }

    case 'account.updated': {
      // Coach a terminé l'onboarding Stripe Connect
      const account = event.data.object as Stripe.Account
      if (account.details_submitted) {
        await supabase
          .from('coach_profiles')
          .update({ stripe_account_id: account.id })
          .eq('stripe_account_id', account.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
