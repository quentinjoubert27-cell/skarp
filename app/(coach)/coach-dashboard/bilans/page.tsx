import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BilansCoachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bilans } = await supabase
    .from('bilans_hebdo')
    .select('*, sportif:users_profiles!sportif_id(full_name)')
    .eq('coach_id', user.id)
    .order('semaine_debut', { ascending: false })
    .limit(50)

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-8">BILANS ENVOYÉS</h1>

      {(!bilans || bilans.length === 0) && (
        <div className="text-center py-16 text-white/25">
          <p className="font-barlow font-black text-2xl uppercase">Aucun bilan</p>
          <p className="text-sm mt-2">Va sur la fiche d'un élève pour créer un bilan.</p>
          <Link href="/coach-dashboard/eleves" className="inline-block mt-5 text-sm text-lime hover:underline">
            Voir mes élèves →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {bilans?.map((b: any) => (
          <div key={b.id} className="bg-cards border border-white/6 p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{b.sportif?.full_name}</p>
              <p className="text-xs text-white/35 mt-1">
                Semaine du {new Date(b.semaine_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </p>
              {b.commentaire_coach && <p className="text-xs text-white/40 mt-1 italic">"{b.commentaire_coach}"</p>}
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-white/40">{b.seances_realisees}/{b.seances_prevues} séances</span>
              <span className={b.objectif_atteint ? 'text-lime' : 'text-orange'}>
                {b.objectif_atteint ? 'Objectif ✓' : 'Objectif ✗'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
