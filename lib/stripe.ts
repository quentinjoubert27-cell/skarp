import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || '0.12')

// Crée ou récupère un compte Stripe Connect pour un coach
export async function getOrCreateStripeAccount(coachId: string, email: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    metadata: { supabase_user_id: coachId },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })
  return account
}

// Génère un lien d'onboarding Stripe pour un coach
export async function createOnboardingLink(accountId: string, origin: string) {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/coach-dashboard/finances?stripe=refresh`,
    return_url: `${origin}/coach-dashboard/finances?stripe=success`,
    type: 'account_onboarding',
  })
}

// Crée un PaymentIntent pour coaching personnalisé (mensuel)
export async function createCoachingPayment({
  amount,
  coachStripeAccountId,
  metadata,
}: {
  amount: number          // en centimes
  coachStripeAccountId: string
  metadata: Record<string, string>
}) {
  const commission = Math.round(amount * COMMISSION_RATE)
  return stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    application_fee_amount: commission,
    transfer_data: { destination: coachStripeAccountId },
    metadata,
  })
}

// Crée un PaymentIntent pour achat programme universel
export async function createProgrammePayment({
  amount,
  coachStripeAccountId,
  metadata,
}: {
  amount: number
  coachStripeAccountId: string
  metadata: Record<string, string>
}) {
  const commission = Math.round(amount * COMMISSION_RATE)
  return stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    application_fee_amount: commission,
    transfer_data: { destination: coachStripeAccountId },
    metadata,
  })
}

// Crée un PaymentIntent pour réservation présentiel
export async function createReservationPayment({
  amount,
  coachStripeAccountId,
  metadata,
}: {
  amount: number
  coachStripeAccountId: string
  metadata: Record<string, string>
}) {
  const commission = Math.round(amount * COMMISSION_RATE)
  return stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    capture_method: 'manual',   // séquestre : capture manuelle après la séance
    application_fee_amount: commission,
    transfer_data: { destination: coachStripeAccountId },
    metadata,
  })
}
