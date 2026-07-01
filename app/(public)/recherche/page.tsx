import { createClient } from '@/lib/supabase/server'
import CoachCard from '@/components/coach/CoachCard'
import type { CoachWithProfile } from '@/types/database.types'

interface SearchParams {
  sport?: string
  mode?: string
  budget?: string
  q?: string
}

export default async function RecherchePage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()

  let query = supabase
    .from('users_profiles')
    .select(`
      *,
      coach_profiles (
        specialite, secteur_sport, mode, tarif_mensuel, zone_geographique,
        verifie, description, essai_gratuit_jours,
        note_moyenne:avis(note.avg()),
        nb_avis:avis(count),
        nb_eleves_actifs:coaching_relationships(count)
      )
    `)
    .eq('role', 'coach')
    .eq('statut', 'actif')

  if (searchParams.q) {
    query = query.ilike('full_name', `%${searchParams.q}%`)
  }
  if (searchParams.sport) {
    query = query.ilike('coach_profiles.secteur_sport', `%${searchParams.sport}%`)
  }
  if (searchParams.mode) {
    query = query.eq('coach_profiles.mode', searchParams.mode)
  }
  if (searchParams.budget) {
    query = query.lte('coach_profiles.tarif_mensuel', parseInt(searchParams.budget))
  }

  const { data: coachs } = await query
  const list = (coachs || []) as CoachWithProfile[]

  return (
    <main className="min-h-screen bg-carbon text-white">
      <nav className="border-b border-white/5 px-8 h-14 flex items-center justify-between bg-[#111]">
        <a href="/" className="font-barlow text-xl font-black">SKARP<span className="text-lime">.</span></a>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <h1 className="font-barlow font-black text-5xl uppercase mb-8">
          TROUVE TON <span className="text-lime">COACH</span>
        </h1>

        {/* Filtres */}
        <form className="flex flex-wrap gap-3 mb-10">
          <input name="q" defaultValue={searchParams.q} placeholder="Nom du coach…"
            className="bg-cards border border-white/8 text-white px-4 py-2 text-sm outline-none focus:border-lime/30 placeholder:text-white/20" />
          <input name="sport" defaultValue={searchParams.sport} placeholder="Sport (rugby, running…)"
            className="bg-cards border border-white/8 text-white px-4 py-2 text-sm outline-none focus:border-lime/30 placeholder:text-white/20" />
          <select name="mode" defaultValue={searchParams.mode}
            className="bg-cards border border-white/8 text-white px-4 py-2 text-sm outline-none">
            <option value="">Mode (tous)</option>
            <option value="Distanciel">Distanciel</option>
            <option value="Présentiel">Présentiel</option>
            <option value="Distanciel et présentiel">Les deux</option>
          </select>
          <select name="budget" defaultValue={searchParams.budget}
            className="bg-cards border border-white/8 text-white px-4 py-2 text-sm outline-none">
            <option value="">Budget (tous)</option>
            <option value="80">Moins de 80€/mois</option>
            <option value="120">Moins de 120€/mois</option>
            <option value="200">Moins de 200€/mois</option>
          </select>
          <button type="submit" className="font-barlow font-black uppercase bg-lime text-carbon px-6 py-2 text-sm tracking-widest hover:bg-[#d4ff5a] transition-colors">
            Filtrer
          </button>
        </form>

        {/* Résultats */}
        <p className="text-sm text-white/30 mb-6">{list.length} coach{list.length > 1 ? 's' : ''} trouvé{list.length > 1 ? 's' : ''}</p>

        {list.length === 0 ? (
          <div className="text-center py-24 text-white/25">
            <p className="font-barlow text-3xl font-black uppercase mb-3">Aucun résultat</p>
            <p className="text-sm">Modifie tes filtres pour trouver un coach.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {list.map(coach => <CoachCard key={coach.id} coach={coach} />)}
          </div>
        )}
      </div>
    </main>
  )
}
