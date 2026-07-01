import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default async function MonCoachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rel } = await supabase
    .from('coaching_relationships')
    .select('*, coach:users_profiles!coach_id(*, coach_profiles(*))')
    .eq('sportif_id', user.id)
    .eq('statut', 'actif')
    .single()

  if (!rel) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-5">
        <p className="font-barlow font-black text-3xl uppercase text-white/25">Pas de coach actif</p>
        <Link href="/recherche">
          <Button variant="lime">Trouver un coach</Button>
        </Link>
      </div>
    )
  }

  const coach = (rel as any).coach
  const cp = coach?.coach_profiles

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-8">MON COACH</h1>

      <div className="bg-cards border border-white/6 p-8 flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-shrink-0">
          {coach?.avatar_url ? (
            <Image src={coach.avatar_url} alt={coach.full_name} width={100} height={100}
              className="w-24 h-24 object-cover border border-white/8" />
          ) : (
            <div className="w-24 h-24 bg-c3 border border-white/8 flex items-center justify-center font-barlow font-black text-4xl text-white/20">
              {coach?.full_name?.[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-barlow font-black text-3xl uppercase">{coach?.full_name}</h2>
            {cp?.verifie && <Badge variant="lime">Vérifié</Badge>}
          </div>
          <p className="text-white/40 text-sm mb-4">{cp?.specialite} · {cp?.secteur_sport}</p>
          <p className="text-sm text-white/55 leading-relaxed max-w-lg">{cp?.description}</p>
        </div>
        <div className="flex-shrink-0 flex flex-col gap-3">
          <Link href="/dashboard/messages">
            <Button variant="lime" className="w-full">Envoyer un message</Button>
          </Link>
          <div className="text-xs text-white/25 text-center">
            Actif depuis {new Date(rel.created_at).toLocaleDateString('fr-FR')}
          </div>
        </div>
      </div>

      {cp && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <InfoCard label="Mode" value={cp.mode} />
          <InfoCard label="Zone" value={cp.zone_geographique || '—'} />
          <InfoCard label="Tarif mensuel" value={`${cp.tarif_mensuel}€`} />
        </div>
      )}
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cards border border-white/6 p-4">
      <div className="text-xs text-white/35 uppercase tracking-widest mb-1">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  )
}
