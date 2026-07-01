import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'

export default async function CoachDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: eleves }, { data: prochaines }, { data: paiements }] = await Promise.all([
    supabase.from('users_profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('coaching_relationships')
      .select('*, sportif:users_profiles!sportif_id(full_name)')
      .eq('coach_id', user.id)
      .eq('statut', 'actif'),
    supabase.from('seances')
      .select('*')
      .eq('coach_id', user.id)
      .gte('date_heure', new Date().toISOString())
      .order('date_heure')
      .limit(5),
    supabase.from('paiements')
      .select('montant, commission_plateforme')
      .eq('coach_id', user.id)
      .eq('statut', 'complete'),
  ])

  const revenuNet = paiements?.reduce((s, p) => s + p.montant - (p.commission_plateforme ?? 0), 0) ?? 0

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-1">
        BONJOUR, <span className="text-lime">{(profile as any)?.full_name?.split(' ')[0]?.toUpperCase()}</span>
      </h1>
      <p className="text-sm text-white/35 mb-10">Vue d'ensemble de ton activité</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <KPI v={eleves?.length ?? 0} l="Élèves actifs" />
        <KPI v={prochaines?.length ?? 0} l="Séances à venir" />
        <KPI v={`${revenuNet.toLocaleString('fr-FR')}€`} l="Revenus nets" />
        <KPI v={paiements?.length ?? 0} l="Paiements reçus" />
      </div>

      {/* Prochaines séances */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-barlow font-black text-xl uppercase">PROCHAINES SÉANCES</h2>
          <Link href="/coach-dashboard/planning" className="text-xs text-lime hover:underline">Voir tout</Link>
        </div>
        {(!prochaines || prochaines.length === 0) ? (
          <p className="text-sm text-white/25">Aucune séance planifiée</p>
        ) : (
          <div className="space-y-2">
            {prochaines.map((s: any) => (
              <div key={s.id} className="bg-cards border border-white/6 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{s.titre}</p>
                  <p className="text-xs text-white/35 mt-0.5">
                    {new Date(s.date_heure).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' à '}{new Date(s.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Badge variant="gray">{s.statut}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Élèves */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-barlow font-black text-xl uppercase">MES ÉLÈVES ACTIFS</h2>
          <Link href="/coach-dashboard/eleves" className="text-xs text-lime hover:underline">Voir tout</Link>
        </div>
        {(!eleves || eleves.length === 0) ? (
          <p className="text-sm text-white/25">Aucun élève actif pour l'instant</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {eleves.map((e: any) => (
              <Link key={e.id} href={`/coach-dashboard/eleves/${e.sportif_id}`}
                className="bg-cards border border-white/6 p-4 hover:border-lime/30 transition-colors">
                <p className="font-medium text-sm">{e.sportif?.full_name}</p>
                <p className="text-xs text-white/35 mt-1">Actif depuis {new Date(e.created_at).toLocaleDateString('fr-FR')}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function KPI({ v, l }: { v: string | number; l: string }) {
  return (
    <div className="bg-cards border border-white/6 p-5">
      <div className="font-barlow font-black text-4xl text-lime leading-none mb-1">{v}</div>
      <div className="text-xs text-white/35 uppercase tracking-widest">{l}</div>
    </div>
  )
}
