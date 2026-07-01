import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Badge from '@/components/ui/Badge'

export default async function SeancesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: seances } = await supabase
    .from('seances')
    .select('*')
    .eq('sportif_id', user.id)
    .order('date_heure', { ascending: false })

  const statusColor: Record<string, 'lime' | 'orange' | 'gray' | 'red'> = {
    planifie: 'gray', valide: 'lime', annule: 'red', en_attente: 'orange',
  }

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-8">MES SÉANCES</h1>

      {(!seances || seances.length === 0) && (
        <div className="border border-dashed border-white/10 p-10 text-center text-white/25">
          <p className="font-barlow font-black text-2xl uppercase">Aucune séance planifiée</p>
        </div>
      )}

      <div className="space-y-3">
        {seances?.map(s => (
          <div key={s.id} className="bg-cards border border-white/6 p-5 flex items-start justify-between">
            <div>
              <p className="font-medium mb-1">{s.titre}</p>
              <p className="text-sm text-white/40">
                {new Date(s.date_heure).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {' — '}{new Date(s.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {s.duree_minutes && <p className="text-xs text-white/25 mt-1">{s.duree_minutes} minutes</p>}
              {s.notes_coach && <p className="text-xs text-lime/70 mt-2 italic">"{s.notes_coach}"</p>}
            </div>
            <Badge variant={statusColor[s.statut] || 'gray'}>{s.statut}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
