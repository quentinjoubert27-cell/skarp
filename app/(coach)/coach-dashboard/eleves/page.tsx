import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'

export default async function ElevesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: relations } = await supabase
    .from('coaching_relationships')
    .select('*, sportif:users_profiles!sportif_id(*, sportif_profiles(*))')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  const statusColor: Record<string, 'lime' | 'orange' | 'gray' | 'red'> = {
    actif: 'lime', en_attente: 'orange', termine: 'gray', suspendu: 'red',
  }

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-2">MES ÉLÈVES</h1>
      <p className="text-sm text-white/35 mb-8">{relations?.length ?? 0} élève{(relations?.length ?? 0) > 1 ? 's' : ''} au total</p>

      {(!relations || relations.length === 0) && (
        <div className="border border-dashed border-white/10 p-10 text-center text-white/25">
          <p className="font-barlow font-black text-2xl uppercase">Aucun élève</p>
        </div>
      )}

      <div className="space-y-3">
        {relations?.map((r: any) => {
          const sp = r.sportif?.sportif_profiles
          return (
            <Link key={r.id} href={`/coach-dashboard/eleves/${r.sportif_id}`}
              className="bg-cards border border-white/6 p-5 flex items-center justify-between hover:border-lime/30 transition-colors block">
              <div>
                <p className="font-medium">{r.sportif?.full_name}</p>
                <div className="flex gap-3 text-xs text-white/35 mt-1">
                  {sp?.sport_pratique && <span>{sp.sport_pratique}</span>}
                  {sp?.objectif_principal && <span>· {sp.objectif_principal}</span>}
                  {sp?.niveau && <span>· {sp.niveau}</span>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/25">{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                <Badge variant={statusColor[r.statut] || 'gray'}>{r.statut}</Badge>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
