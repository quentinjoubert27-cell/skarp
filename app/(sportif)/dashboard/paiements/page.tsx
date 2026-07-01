import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Badge from '@/components/ui/Badge'

export default async function PaiementsSportifPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: paiements } = await supabase
    .from('paiements')
    .select('*')
    .eq('sportif_id', user.id)
    .order('created_at', { ascending: false })

  const total = paiements?.filter(p => p.statut === 'complete').reduce((s, p) => s + p.montant, 0) ?? 0

  const statusColor: Record<string, 'lime' | 'orange' | 'gray' | 'red'> = {
    complete: 'lime', en_attente: 'orange', rembourse: 'gray', libere: 'lime',
  }

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-8">PAIEMENTS</h1>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-cards border border-white/6 p-5">
          <div className="font-barlow font-black text-4xl text-lime mb-1">{total.toLocaleString('fr-FR')}€</div>
          <div className="text-xs text-white/35 uppercase tracking-widest">Total dépensé</div>
        </div>
        <div className="bg-cards border border-white/6 p-5">
          <div className="font-barlow font-black text-4xl text-lime mb-1">{paiements?.length ?? 0}</div>
          <div className="text-xs text-white/35 uppercase tracking-widest">Transactions</div>
        </div>
      </div>

      <div className="space-y-2">
        {paiements?.map(p => (
          <div key={p.id} className="bg-cards border border-white/6 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium capitalize">{p.type.replace('_', ' ')}</p>
              <p className="text-xs text-white/35 mt-0.5">{new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-barlow font-black text-xl">{p.montant}€</span>
              <Badge variant={statusColor[p.statut] || 'gray'}>{p.statut}</Badge>
            </div>
          </div>
        ))}
        {(!paiements || paiements.length === 0) && (
          <div className="text-center py-16 text-white/25 text-sm">Aucun paiement enregistré</div>
        )}
      </div>
    </div>
  )
}
