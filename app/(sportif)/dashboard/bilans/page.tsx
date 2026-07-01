import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function BilansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bilans } = await supabase
    .from('bilans_hebdo')
    .select('*')
    .eq('sportif_id', user.id)
    .order('semaine_debut', { ascending: false })

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-8">BILANS HEBDOMADAIRES</h1>

      {(!bilans || bilans.length === 0) && (
        <div className="border border-dashed border-white/10 p-10 text-center text-white/25">
          <p className="font-barlow font-black text-2xl uppercase">Aucun bilan encore</p>
          <p className="text-sm mt-2">Ton coach rempli les bilans chaque semaine.</p>
        </div>
      )}

      <div className="space-y-4">
        {bilans?.map(b => (
          <div key={b.id} className="bg-cards border border-white/6 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-barlow font-black text-lg uppercase">
                Semaine du {new Date(b.semaine_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </h3>
              <span className={`text-xs px-2 py-1 border ${b.objectif_atteint ? 'border-lime/30 text-lime' : 'border-orange/30 text-orange'}`}>
                {b.objectif_atteint ? 'Objectif atteint ✓' : 'Objectif non atteint'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Stat label="Séances réalisées" value={b.seances_realisees ?? '—'} />
              <Stat label="Séances prévues" value={b.seances_prevues ?? '—'} />
              {b.poids_kg && <Stat label="Poids" value={`${b.poids_kg} kg`} />}
              {b.niveau_fatigue && <Stat label="Fatigue" value={`${b.niveau_fatigue}/10`} />}
            </div>

            {b.commentaire_coach && (
              <div className="border-t border-white/6 pt-4 mt-4">
                <p className="text-xs text-white/35 uppercase tracking-widest mb-2">Commentaire coach</p>
                <p className="text-sm text-white/70 leading-relaxed italic">"{b.commentaire_coach}"</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="font-barlow font-black text-3xl text-lime leading-none mb-1">{value}</div>
      <div className="text-xs text-white/35">{label}</div>
    </div>
  )
}
