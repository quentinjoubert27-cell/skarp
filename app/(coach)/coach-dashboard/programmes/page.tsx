'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'

interface Programme {
  id: string; titre: string; description: string | null; prix: number
  duree_semaines: number; nb_seances_semaine: number; actif: boolean
}

export default function ProgrammesCoachPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [showForm, setShowForm] = useState(false)
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState({ titre: '', description: '', prix: '', duree_semaines: '', nb_seances_semaine: '' })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  async function load(uid: string) {
    const { data } = await supabase.from('programmes_universels').select('*').eq('coach_id', uid).order('created_at', { ascending: false })
    setProgrammes(data || [])
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      load(user.id)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('programmes_universels').insert({
      coach_id: userId,
      titre: form.titre,
      description: form.description || null,
      prix: parseFloat(form.prix),
      duree_semaines: parseInt(form.duree_semaines),
      nb_seances_semaine: parseInt(form.nb_seances_semaine),
      actif: true,
    })
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'error' })
    } else {
      toast({ title: 'Programme créé', variant: 'success' })
      setShowForm(false)
      setForm({ titre: '', description: '', prix: '', duree_semaines: '', nb_seances_semaine: '' })
      load(userId)
    }
    setLoading(false)
  }

  async function toggleActif(id: string, actif: boolean) {
    await supabase.from('programmes_universels').update({ actif: !actif }).eq('id', id)
    load(userId)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-barlow font-black text-4xl uppercase">MES PROGRAMMES</h1>
        <Button variant="lime" onClick={() => setShowForm(v => !v)}>+ Créer un programme</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-cards border border-white/8 p-5 mb-8 space-y-4">
          <h3 className="font-barlow font-black text-lg uppercase">Nouveau programme</h3>
          <Input label="Titre" value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} required />
          <div>
            <label className="text-xs text-white/35 uppercase tracking-widest block mb-2">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} className="w-full bg-c3 border border-white/8 text-white text-sm px-3 py-2 outline-none focus:border-lime/30 resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Prix (€)" type="number" value={form.prix} onChange={e => setForm(f => ({ ...f, prix: e.target.value }))} required />
            <Input label="Durée (semaines)" type="number" value={form.duree_semaines} onChange={e => setForm(f => ({ ...f, duree_semaines: e.target.value }))} required />
            <Input label="Séances/semaine" type="number" value={form.nb_seances_semaine} onChange={e => setForm(f => ({ ...f, nb_seances_semaine: e.target.value }))} required />
          </div>
          <div className="flex gap-3">
            <Button type="submit" loading={loading} variant="lime">Créer</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
          </div>
        </form>
      )}

      {programmes.length === 0 && !showForm && (
        <div className="border border-dashed border-white/10 p-10 text-center text-white/25">
          <p className="font-barlow font-black text-2xl uppercase">Aucun programme</p>
          <p className="text-sm mt-2">Crée ton premier programme pour qu'il soit visible sur ton profil.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {programmes.map(p => (
          <div key={p.id} className={`border p-5 ${p.actif ? 'border-white/8 bg-cards' : 'border-white/4 bg-cards/40 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium">{p.titre}</h3>
              <Badge variant={p.actif ? 'lime' : 'gray'}>{p.actif ? 'Actif' : 'Inactif'}</Badge>
            </div>
            {p.description && <p className="text-xs text-white/40 mb-3 leading-relaxed">{p.description}</p>}
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-xs text-white/35">
                <span>{p.duree_semaines} sem.</span>
                <span>{p.nb_seances_semaine} séances/sem</span>
                <span className="font-barlow font-black text-lime text-base">{p.prix}€</span>
              </div>
              <button onClick={() => toggleActif(p.id, p.actif)} className="text-xs text-white/35 hover:text-white">
                {p.actif ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
