import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'

export default async function ProgrammesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: achats } = await supabase
    .from('achats_programmes')
    .select('*, programme:programmes_universels(*)')
    .eq('sportif_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-8">MES PROGRAMMES</h1>

      {(!achats || achats.length === 0) && (
        <div className="border border-dashed border-white/10 p-10 text-center text-white/25">
          <p className="font-barlow font-black text-2xl uppercase">Aucun programme acheté</p>
          <p className="text-sm mt-2">Explore les programmes disponibles dans la recherche.</p>
          <Link href="/recherche" className="inline-block mt-5 font-barlow font-black uppercase bg-lime text-carbon px-5 py-2 text-sm tracking-widest">
            Trouver un programme
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {achats?.map((a: any) => (
          <div key={a.id} className="bg-cards border border-white/6 p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium">{a.programme?.titre}</h3>
              <Badge variant={a.statut === 'actif' ? 'lime' : 'gray'}>{a.statut}</Badge>
            </div>
            <p className="text-xs text-white/35 mb-3">{a.programme?.description}</p>
            <div className="flex gap-4 text-xs text-white/40">
              <span>{a.programme?.duree_semaines} semaines</span>
              <span>{a.programme?.nb_seances_semaine} séances/sem</span>
              <span>{a.programme?.prix}€</span>
            </div>
            <div className="text-xs text-white/25 mt-2">
              Acheté le {new Date(a.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
