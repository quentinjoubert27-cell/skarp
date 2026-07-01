import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'

export default async function SportifDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: relationship }, { data: prochaines }] = await Promise.all([
    supabase.from('sportif_profiles').select('*, users_profiles(full_name)').eq('id', user.id).single(),
    supabase.from('coaching_relationships')
      .select('*, coach:users_profiles!coach_id(*)')
      .eq('sportif_id', user.id)
      .eq('statut', 'actif')
      .single(),
    supabase.from('seances')
      .select('*')
      .eq('sportif_id', user.id)
      .gte('date_heure', new Date().toISOString())
      .order('date_heure')
      .limit(5),
  ])

  const { data: lastBilan } = await supabase
    .from('bilans_hebdo')
    .select('*')
    .eq('sportif_id', user.id)
    .order('semaine_debut', { ascending: false })
    .limit(1)
    .single()

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-1">
        BONJOUR, <span className="text-lime">{(profile as any)?.users_profiles?.full_name?.split(' ')[0]?.toUpperCase()}</span>
      </h1>
      <p className="text-sm text-white/35 mb-10">Voici ton résumé de la semaine</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Séances réalisées', value: lastBilan?.seances_realisees ?? '—', sub: 'ce mois' },
          { label: 'Objectif atteint', value: lastBilan ? `${lastBilan.objectif_atteint ? '✓' : '✗'}` : '—', sub: 'cette semaine' },
          { label: 'Coach actif', value: relationship ? '1' : '0', sub: 'en cours' },
          { label: 'Prochain rendez-vous', value: prochaines?.[0] ? new Date(prochaines[0].date_heure).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—', sub: '' },
        ].map(k => (
          <div key={k.label} className="bg-cards border border-white/6 p-5">
            <div className="font-barlow font-black text-4xl text-lime leading-none mb-1">{k.value}</div>
            <div className="text-xs text-white/35 uppercase tracking-widest">{k.label}</div>
            {k.sub && <div className="text-xs text-white/20 mt-1">{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Coach actif */}
      {relationship && (
        <section className="mb-8">
          <h2 className="font-barlow font-black text-xl uppercase mb-4">MON COACH</h2>
          <div className="bg-cards border border-white/6 p-5 flex items-center justify-between">
            <div>
              <p className="font-medium">{(relationship as any).coach?.full_name}</p>
              <p className="text-xs text-white/35 mt-1">Coaching actif depuis {new Date(relationship.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/messages" className="text-sm text-lime hover:underline">Écrire</Link>
              <Link href="/dashboard/coach" className="text-sm text-white/40 hover:text-white">Profil</Link>
            </div>
          </div>
        </section>
      )}

      {!relationship && (
        <div className="border border-dashed border-white/10 p-8 text-center mb-8">
          <p className="font-barlow font-black text-2xl uppercase mb-3">PAS ENCORE DE COACH</p>
          <p className="text-sm text-white/35 mb-5">Trouve ton coach et commence ton programme personnalisé.</p>
          <Link href="/recherche" className="font-barlow font-black uppercase bg-lime text-carbon px-6 py-3 text-sm tracking-widest hover:bg-[#d4ff5a] transition-colors inline-block">
            Trouver un coach
          </Link>
        </div>
      )}

      {/* Prochaines séances */}
      {prochaines && prochaines.length > 0 && (
        <section>
          <h2 className="font-barlow font-black text-xl uppercase mb-4">PROCHAINES SÉANCES</h2>
          <div className="space-y-2">
            {prochaines.map((s: any) => (
              <div key={s.id} className="bg-cards border border-white/6 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{s.titre}</p>
                  <p className="text-xs text-white/35 mt-1">
                    {new Date(s.date_heure).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {' '}à {new Date(s.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Badge variant={s.statut === 'valide' ? 'lime' : 'gray'}>{s.statut}</Badge>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
