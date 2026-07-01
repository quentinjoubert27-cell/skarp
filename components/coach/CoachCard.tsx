import Link from 'next/link'
import Image from 'next/image'
import Badge from '@/components/ui/Badge'
import type { CoachWithProfile } from '@/types/database.types'

interface CoachCardProps {
  coach: CoachWithProfile
}

export default function CoachCard({ coach }: CoachCardProps) {
  const profile = coach.coach_profiles
  const stars = profile.note_moyenne ? Math.round(profile.note_moyenne * 10) / 10 : null

  return (
    <Link href={`/coach/${coach.id}`} className="block group">
      <div className="bg-cards border border-white/6 overflow-hidden transition-all duration-300 hover:border-lime/30 hover:-translate-y-1">
        <div className="aspect-[4/3] overflow-hidden relative bg-c3">
          {coach.avatar_url ? (
            <Image
              src={coach.avatar_url}
              alt={coach.full_name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-barlow text-5xl font-black text-lime/20">
              {coach.full_name.charAt(0)}
            </div>
          )}
          {profile.verifie && (
            <div className="absolute top-3 right-3 bg-lime text-carbon text-[9px] font-black uppercase tracking-widest px-2 py-0.5 flex items-center gap-1">
              <svg className="w-2.5 h-2.5 stroke-carbon fill-none stroke-[2.5] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              Vérifié
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-barlow text-xl font-black uppercase mb-0.5">{coach.full_name}</h3>
          <p className="text-xs text-white/40 mb-3">{profile.specialite}</p>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {profile.secteur_sport && <Badge variant="lime">{profile.secteur_sport}</Badge>}
            {profile.mode && <Badge variant="gray">{profile.mode}</Badge>}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="font-barlow text-xl font-black text-lime">
              {profile.tarif_mensuel}€<span className="text-xs font-normal text-white/30"> /mois</span>
            </span>
            {stars && (
              <span className="text-xs text-white/50">
                ★ {stars} <span className="text-white/25">({profile.nb_avis || 0})</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
