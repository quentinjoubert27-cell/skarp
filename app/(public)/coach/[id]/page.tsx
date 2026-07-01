import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

export default async function CoachProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('users_profiles')
    .select(`*, coach_profiles(*)`)
    .eq('id', params.id)
    .eq('role', 'coach')
    .single()

  if (!profile) notFound()

  const cp = (profile as any).coach_profiles

  const { data: avis } = await supabase
    .from('avis')
    .select('*, users_profiles(full_name, avatar_url)')
    .eq('coach_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: programmes } = await supabase
    .from('programmes_universels')
    .select('*')
    .eq('coach_id', params.id)
    .eq('actif', true)

  const note = avis && avis.length > 0
    ? (avis.reduce((s: number, a: any) => s + a.note, 0) / avis.length).toFixed(1)
    : null

  return (
    <main className="min-h-screen bg-carbon text-white">
      <nav className="border-b border-white/5 px-8 h-14 flex items-center bg-[#111]">
        <Link href="/recherche" className="text-sm text-white/40 hover:text-white mr-6">← Retour</Link>
        <span className="font-barlow text-xl font-black">SKARP<span className="text-lime">.</span></span>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Header coach */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.full_name} width={120} height={120}
                className="w-28 h-28 object-cover border border-white/8" />
            ) : (
              <div className="w-28 h-28 bg-cards flex items-center justify-center text-4xl font-barlow font-black text-white/20 border border-white/8">
                {profile.full_name?.[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-barlow font-black text-4xl uppercase">{profile.full_name}</h1>
              {cp?.verifie && <Badge variant="lime">Vérifié</Badge>}
            </div>
            <p className="text-white/40 mb-3">{cp?.specialite} · {cp?.secteur_sport}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/50 mb-4">
              {note && <span className="text-lime font-barlow font-black text-lg">{note}★ <span className="text-white/30 font-sans font-normal text-xs">({avis?.length} avis)</span></span>}
              <span>{cp?.mode}</span>
              {cp?.zone_geographique && <span>📍 {cp?.zone_geographique}</span>}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-barlow font-black text-3xl text-lime">{cp?.tarif_mensuel}€<span className="text-white/30 font-sans font-normal text-sm">/mois</span></span>
              {cp?.essai_gratuit_jours && (
                <span className="text-xs text-lime/70 border border-lime/30 px-2 py-1">{cp.essai_gratuit_jours} jours gratuits</span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <Link href={`/signup?coach=${params.id}`}>
              <Button variant="lime" size="lg">Choisir ce coach</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="md:col-span-2 space-y-10">
            {cp?.description && (
              <section>
                <h2 className="font-barlow font-black text-2xl uppercase mb-4">À PROPOS</h2>
                <p className="text-white/55 leading-relaxed">{cp.description}</p>
              </section>
            )}

            {/* Programmes */}
            {programmes && programmes.length > 0 && (
              <section>
                <h2 className="font-barlow font-black text-2xl uppercase mb-4">PROGRAMMES</h2>
                <div className="space-y-3">
                  {programmes.map((p: any) => (
                    <div key={p.id} className="border border-white/8 p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{p.titre}</p>
                        <p className="text-xs text-white/35 mt-1">{p.duree_semaines} semaines · {p.nb_seances_semaine} séances/sem</p>
                      </div>
                      <span className="font-barlow font-black text-xl text-lime">{p.prix}€</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Avis */}
            {avis && avis.length > 0 && (
              <section>
                <h2 className="font-barlow font-black text-2xl uppercase mb-4">AVIS ({avis.length})</h2>
                <div className="space-y-4">
                  {avis.map((a: any) => (
                    <div key={a.id} className="border border-white/6 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{a.users_profiles?.full_name || 'Sportif'}</span>
                        <span className="font-barlow font-black text-lime">{a.note}★</span>
                      </div>
                      {a.commentaire && <p className="text-sm text-white/45 leading-relaxed">{a.commentaire}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="border border-white/8 p-5">
              <h3 className="font-barlow font-black text-lg uppercase mb-4">INFOS</h3>
              <dl className="space-y-3 text-sm">
                {cp?.mode && (
                  <div className="flex justify-between">
                    <dt className="text-white/35">Mode</dt>
                    <dd>{cp.mode}</dd>
                  </div>
                )}
                {cp?.secteur_sport && (
                  <div className="flex justify-between">
                    <dt className="text-white/35">Sport</dt>
                    <dd>{cp.secteur_sport}</dd>
                  </div>
                )}
                {cp?.tarif_seance_presentiel && (
                  <div className="flex justify-between">
                    <dt className="text-white/35">Séance présentiel</dt>
                    <dd>{cp.tarif_seance_presentiel}€</dd>
                  </div>
                )}
              </dl>
            </div>

            <Link href={`/signup?coach=${params.id}`} className="block">
              <Button variant="lime" className="w-full">Commencer l'essai</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
