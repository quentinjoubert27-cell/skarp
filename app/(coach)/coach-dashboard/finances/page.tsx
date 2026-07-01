import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Badge from '@/components/ui/Badge'

export default async function FinancesCoachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: paiements } = await supabase
    .from('paiements')
    .select('*')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  const { data: coachProfile } = await supabase
    .from('coach_profiles')
    .select('stripe_account_id, onboarding_complete')
    .eq('id', user.id)
    .single()

  const brut = paiements?.filter(p => p.statut === 'complete').reduce((s, p) => s + p.montant, 0) ?? 0
  const commission = paiements?.filter(p => p.statut === 'complete').reduce((s, p) => s + (p.commission_plateforme ?? 0), 0) ?? 0
  const net = brut - commission

  const statusColor: Record<string, 'lime' | 'orange' | 'gray' | 'red'> = {
    complete: 'lime', en_attente: 'orange', rembourse: 'gray', libere: 'lime',
  }

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-8">FINANCES</h1>

      {!coachProfile?.onboarding_complete && (
        <div className="border border-orange/30 bg-orange/5 p-5 mb-8">
          <p className="text-sm text-orange mb-3">⚠ Ton compte Stripe n'est pas encore configuré. Tu ne peux pas recevoir de paiements.</p>
          <a href="/api/stripe/onboarding" className="text-sm text-lime hover:underline font-medium">Configurer Stripe Connect →</a>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-cards border border-white/6 p-5">
          <div className="font-barlow font-black text-4xl text-lime leading-none mb-1">{brut.toLocaleString('fr-FR')}€</div>
          <div className="text-xs text-white/35 uppercase tracking-widest">Volume brut</div>
        </div>
        <div className="bg-cards border border-white/6 p-5">
          <div className="font-barlow font-black text-4xl text-orange leading-none mb-1">{commission.toLocaleString('fr-FR')}€</div>
          <div className="text-xs text-white/35 uppercase tracking-widest">Commission SKARP (12%)</div>
        </div>
        <div className="bg-cards border border-white/6 p-5">
          <div className="font-barlow font-black text-4xl text-lime leading-none mb-1">{net.toLocaleString('fr-FR')}€</div>
          <div className="text-xs text-white/35 uppercase tracking-widest">Revenus nets</div>
        </div>
      </div>

      {/* Transactions */}
      <h2 className="font-barlow font-black text-xl uppercase mb-4">TRANSACTIONS</h2>
      <div className="space-y-2">
        {paiements?.map(p => (
          <div key={p.id} className="bg-cards border border-white/6 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium capitalize">{p.type.replace('_', ' ')}</p>
              <p className="text-xs text-white/35 mt-0.5">{new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-barlow font-black text-xl">{p.montant}€</span>
                {p.commission_plateforme && (
                  <div className="text-xs text-white/25">-{p.commission_plateforme}€ commission</div>
                )}
              </div>
              <Badge variant={statusColor[p.statut] || 'gray'}>{p.statut}</Badge>
            </div>
          </div>
        ))}
        {(!paiements || paiements.length === 0) && (
          <div className="text-center py-16 text-white/25 text-sm">Aucune transaction</div>
        )}
      </div>
    </div>
  )
}
