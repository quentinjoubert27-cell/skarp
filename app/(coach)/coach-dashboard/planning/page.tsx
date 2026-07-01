'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'

interface Seance {
  id: string
  titre: string
  date_heure: string
  duree_minutes: number | null
  statut: string
  sportif_id: string
}

interface Eleve {
  id: string
  sportif: { full_name: string }
}

export default function PlanningPage() {
  const [seances, setSeances] = useState<Seance[]>([])
  const [eleves, setEleves] = useState<Eleve[]>([])
  const [showForm, setShowForm] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [form, setForm] = useState({ titre: '', date_heure: '', duree_minutes: '', sportif_id: '' })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data: s }, { data: e }] = await Promise.all([
        supabase.from('seances').select('*').eq('coach_id', user.id).order('date_heure'),
        supabase.from('coaching_relationships')
          .select('id, sportif_id, sportif:users_profiles!sportif_id(full_name)')
          .eq('coach_id', user.id)
          .eq('statut', 'actif'),
      ])
      setSeances(s || [])
      setEleves((e || []) as any)
    }
    load()
  }, [])

  async function addSeance(ev: React.FormEvent) {
    ev.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('seances').insert({
      coach_id: userId,
      sportif_id: form.sportif_id,
      titre: form.titre,
      date_heure: form.date_heure,
      duree_minutes: form.duree_minutes ? parseInt(form.duree_minutes) : null,
      statut: 'planifie',
    })
    if (error) {
      toast({ title: 'Erreur', message: error.message, type: 'error' })
    } else {
      toast({ title: 'Séance ajoutée', type: 'success' })
      setShowForm(false)
      setForm({ titre: '', date_heure: '', duree_minutes: '', sportif_id: '' })
      const { data } = await supabase.from('seances').select('*').eq('coach_id', userId).order('date_heure')
      setSeances(data || [])
    }
    setLoading(false)
  }

  const upcoming = seances.filter(s => new Date(s.date_heure) >= new Date())
  const past = seances.filter(s => new Date(s.date_heure) < new Date())

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-barlow font-black text-4xl uppercase">PLANNING</h1>
        <Button variant="lime" onClick={() => setShowForm(v => !v)}>+ Ajouter une séance</Button>
      </div>

      {showForm && (
        <form onSubmit={addSeance} className="bg-cards border border-white/8 p-5 mb-8 space-y-4">
          <h3 className="font-barlow font-black text-lg uppercase">Nouvelle séance</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Titre" value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} required />
            <div>
              <label className="text-xs text-white/35 uppercase tracking-widest block mb-2">Élève</label>
              <select value={form.sportif_id} onChange={e => setForm(f => ({ ...f, sportif_id: e.target.value }))}
                className="w-full bg-c3 border border-white/8 text-white text-sm px-3 py-2.5 outline-none" required>
                <option value="">Choisir…</option>
                {eleves.map((e: any) => (
                  <option key={e.sportif_id} value={e.sportif_id}>{e.sportif?.full_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date & heure" type="datetime-local" value={form.date_heure} onChange={e => setForm(f => ({ ...f, date_heure: e.target.value }))} required />
            <Input label="Durée (minutes)" type="number" value={form.duree_minutes} onChange={e => setForm(f => ({ ...f, duree_minutes: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" loading={loading} variant="lime">Créer</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
          </div>
        </form>
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="font-barlow font-black text-xl uppercase mb-4">À VENIR ({upcoming.length})</h2>
          <div className="space-y-2">
            {upcoming.map(s => <SeanceRow key={s.id} s={s} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="font-barlow font-black text-xl uppercase mb-4 text-white/40">PASSÉES ({past.length})</h2>
          <div className="space-y-2">
            {past.slice(0, 10).map(s => <SeanceRow key={s.id} s={s} dimmed />)}
          </div>
        </section>
      )}
    </div>
  )
}

function SeanceRow({ s, dimmed }: { s: Seance; dimmed?: boolean }) {
  const color: Record<string, 'lime' | 'orange' | 'gray' | 'red'> = { planifie: 'gray', valide: 'lime', annule: 'red' }
  return (
    <div className={`bg-cards border border-white/6 p-4 flex items-center justify-between ${dimmed ? 'opacity-50' : ''}`}>
      <div>
        <p className="text-sm font-medium">{s.titre}</p>
        <p className="text-xs text-white/35 mt-0.5">
          {new Date(s.date_heure).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
          {' à '}{new Date(s.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          {s.duree_minutes && ` · ${s.duree_minutes} min`}
        </p>
      </div>
      <Badge variant={color[s.statut] || 'gray'}>{s.statut}</Badge>
    </div>
  )
}
