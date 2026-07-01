import { createAdminClient } from '@/lib/supabase/server'
import Badge from '@/components/ui/Badge'
import LiberePaiementButton from '@/components/admin/LiberePaiementButton'

interface SearchParams { filter?: string }

export default async function AdminPaiementsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createAdminClient()

  let query = supabase
    .from('paiements')
    .select('*, sportif:users_profiles!sportif_id(full_name), coach:users_profiles!coach_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (searchParams.filter === 'sequestre') {
    query = query.eq('type', 'reservation_presentiel').eq('statut', 'en_attente')
  }

  const { data: paiements } = await query

  const total = paiements?.filter(p => p.statut === 'complete').reduce((s, p) => s + p.montant, 0) ?? 0
  const commissions = paiements?.filter(p => p.statut === 'complete').reduce((s, p) => s + (p.commission_plateforme ?? 0), 0) ?? 0

  const statusColor: Record<string, 'lime' | 'orange' | 'gray' | 'red'> = {
    complete: 'lime', en_attente: 'orange', rembourse: 'gray', libere: 'lime',
  }

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-2">PAIEMENTS</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-cards border border-white/6 p-4">
          <div className="font-barlow font-black text-3xl text-lime mb-1">{total.toLocaleString('fr-FR')}€</div>
          <div className="text-xs text-white/35 uppercase tracking-widest">Volume total</div>
        </div>
        <div className="bg-cards border border-white/6 p-4">
          <div className="font-barlow font-black text-3xl text-lime mb-1">{commissions.toLocaleString('fr-FR')}€</div>
          <div className="text-xs text-white/35 uppercase tracking-widest">Commissions SKARP</div>
        </div>
        <div className="bg-cards border border-white/6 p-4">
          <div className="font-barlow font-black text-3xl text-lime mb-1">{paiements?.length ?? 0}</div>
          <div className="text-xs text-white/35 uppercase tracking-widest">Transactions</div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <a href="/admin/paiements" className={`text-sm px-4 py-2 border ${!searchParams.filter ? 'border-lime text-lime' : 'border-white/10 text-white/40'}`}>Tous</a>
        <a href="/admin/paiements?filter=sequestre" className={`text-sm px-4 py-2 border ${searchParams.filter === 'sequestre' ? 'border-lime text-lime' : 'border-white/10 text-white/40'}`}>Séquestre</a>
      </div>

      <div className="space-y-2">
        {paiements?.map((p: any) => (
          <div key={p.id} className="bg-cards border border-white/6 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium capitalize">{p.type.replace(/_/g, ' ')}</p>
              <p className="text-xs text-white/35 mt-0.5">
                {p.sportif?.full_name} → {p.coach?.full_name}
                {' · '}{new Date(p.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-barlow font-black text-xl">{p.montant}€</span>
                {p.commission_plateforme && <div className="text-xs text-white/25">commission: {p.commission_plateforme}€</div>}
              </div>
              <Badge variant={statusColor[p.statut] || 'gray'}>{p.statut}</Badge>
              {p.type === 'reservation_presentiel' && p.statut === 'en_attente' && p.stripe_payment_intent_id && (
                <LiberePaiementButton paymentId={p.id} paymentIntentId={p.stripe_payment_intent_id} />
              )}
            </div>
          </div>
        ))}
        {(!paiements || paiements.length === 0) && (
          <div className="text-center py-16 text-white/25 text-sm">Aucun paiement</div>
        )}
      </div>
    </div>
  )
}
