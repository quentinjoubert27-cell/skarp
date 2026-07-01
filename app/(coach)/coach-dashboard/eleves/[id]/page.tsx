import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import BilanForm from '@/components/coach/BilanForm'
import Badge from '@/components/ui/Badge'

export default async function EleveDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rel } = await supabase
    .from('coaching_relationships')
    .select('*, sportif:users_profiles!sportif_id(*, sportif_profiles(*))')
    .eq('coach_id', user.id)
    .eq('sportif_id', params.id)
    .single()

  if (!rel) notFound()

  const { data: bilans } = await supabase
    .from('bilans_hebdo')
    .select('*')
    .eq('relationship_id', rel.id)
    .order('semaine_debut', { ascending: false })
    .limit(10)

  const { data: seances } = await supabase
    .from('seances')
    .select('*')
    .eq('sportif_id', params.id)
    .eq('coach_id', user.id)
    .order('date_heure', { ascending: false })
    .limit(10)

  const sportif = (rel as any).sportif
  const sp = sportif?.sportif_profiles

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-2">{sportif?.full_name?.toUpperCase()}</h1>
      <div className="flex gap-3 mb-8">
        {sp?.sport_pratique && <Badge variant="gray">{sp.sport_pratique}</Badge>}
        {sp?.niveau && <Badge variant="gray">{sp.niveau}</Badge>}
        {sp?.objectif_principal && <span className="text-xs text-white/35">{sp.objectif_principal}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Infos sportif */}
        <section>
          <h2 className="font-barlow font-black text-xl uppercase mb-4">PROFIL</h2>
          <div className="bg-cards border border-white/6 p-5 space-y-3">
            {[
              { l: 'Âge', v: sp?.age ? `${sp.age} ans` : '—' },
              { l: 'Poids', v: sp?.poids ? `${sp.poids} kg` : '—' },
              { l: 'Taille', v: sp?.taille ? `${sp.taille} cm` : '—' },
              { l: 'Ville', v: sp?.ville || '—' },
              { l: 'Disponibilité', v: sp?.disponibilite || '—' },
              { l: 'Blessures', v: sp?.blessures_historique || 'Aucune' },
            ].map(r => (
              <div key={r.l} className="flex justify-between text-sm">
                <span className="text-white/35">{r.l}</span>
                <span>{r.v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bilan Form */}
        <section>
          <h2 className="font-barlow font-black text-xl uppercase mb-4">NOUVEAU BILAN</h2>
          <BilanForm relationshipId={rel.id} sportifId={params.id} coachId={user.id} />
        </section>
      </div>

      {/* Historique bilans */}
      {bilans && bilans.length > 0 && (
        <section className="mt-10">
          <h2 className="font-barlow font-black text-xl uppercase mb-4">HISTORIQUE BILANS</h2>
          <div className="space-y-3">
            {bilans.map(b => (
              <div key={b.id} className="bg-cards border border-white/6 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Semaine du {new Date(b.semaine_debut).toLocaleDateString('fr-FR')}</p>
                  {b.commentaire_coach && <p className="text-xs text-white/35 mt-1 italic">"{b.commentaire_coach}"</p>}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-white/40">{b.seances_realisees}/{b.seances_prevues} séances</span>
                  <span className={b.objectif_atteint ? 'text-lime' : 'text-orange'}>
                    {b.objectif_atteint ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
