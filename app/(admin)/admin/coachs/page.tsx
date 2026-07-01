import { createAdminClient } from '@/lib/supabase/server'
import Badge from '@/components/ui/Badge'
import VerifyCoachButton from '@/components/admin/VerifyCoachButton'

interface SearchParams { filter?: string }

export default async function AdminCoachsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createAdminClient()

  let query = supabase
    .from('users_profiles')
    .select('*, coach_profiles(*)')
    .eq('role', 'coach')
    .order('created_at', { ascending: false })

  if (searchParams.filter === 'pending') {
    query = (query as any).eq('coach_profiles.verifie', false)
  }

  const { data: coachs } = await query

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-2">COACHS</h1>
      <div className="flex gap-3 mb-8">
        <a href="/admin/coachs" className={`text-sm px-4 py-2 border ${!searchParams.filter ? 'border-lime text-lime' : 'border-white/10 text-white/40'}`}>Tous</a>
        <a href="/admin/coachs?filter=pending" className={`text-sm px-4 py-2 border ${searchParams.filter === 'pending' ? 'border-lime text-lime' : 'border-white/10 text-white/40'}`}>En attente</a>
      </div>

      <div className="space-y-2">
        {coachs?.map((c: any) => {
          const cp = c.coach_profiles
          return (
            <div key={c.id} className="bg-cards border border-white/6 p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-medium">{c.full_name}</p>
                  {cp?.verifie ? <Badge variant="lime">Vérifié</Badge> : <Badge variant="orange">Non vérifié</Badge>}
                </div>
                <p className="text-xs text-white/35">
                  {c.email} · {cp?.specialite} · {cp?.secteur_sport}
                  {cp?.tarif_mensuel && ` · ${cp.tarif_mensuel}€/mois`}
                </p>
                <p className="text-xs text-white/25 mt-1">
                  {cp?.stripe_account_id ? '✓ Stripe configuré' : '✗ Stripe non configuré'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={c.statut === 'actif' ? 'lime' : 'red'}>{c.statut}</Badge>
                {!cp?.verifie && <VerifyCoachButton coachId={c.id} coachName={c.full_name} />}
              </div>
            </div>
          )
        })}
        {(!coachs || coachs.length === 0) && (
          <div className="text-center py-16 text-white/25 text-sm">Aucun coach</div>
        )}
      </div>
    </div>
  )
}
