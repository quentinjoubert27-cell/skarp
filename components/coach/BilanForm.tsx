'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

interface Props {
  relationshipId: string
  sportifId: string
  coachId: string
}

export default function BilanForm({ relationshipId, sportifId, coachId }: Props) {
  const [form, setForm] = useState({
    semaine_debut: '',
    seances_prevues: '',
    seances_realisees: '',
    objectif_atteint: false,
    poids_kg: '',
    niveau_fatigue: '',
    commentaire_coach: '',
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  function set(k: string, v: string | boolean) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('bilans_hebdo').insert({
      relationship_id: relationshipId,
      sportif_id: sportifId,
      coach_id: coachId,
      semaine_debut: form.semaine_debut,
      seances_prevues: parseInt(form.seances_prevues),
      seances_realisees: parseInt(form.seances_realisees),
      objectif_atteint: form.objectif_atteint,
      poids_kg: form.poids_kg ? parseFloat(form.poids_kg) : null,
      niveau_fatigue: form.niveau_fatigue ? parseInt(form.niveau_fatigue) : null,
      commentaire_coach: form.commentaire_coach || null,
    })

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'error' })
    } else {
      toast({ title: 'Bilan enregistré', variant: 'success' })
      setForm({ semaine_debut: '', seances_prevues: '', seances_realisees: '', objectif_atteint: false, poids_kg: '', niveau_fatigue: '', commentaire_coach: '' })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-cards border border-white/6 p-5 space-y-4">
      <Input label="Semaine du (lundi)" type="date" value={form.semaine_debut} onChange={e => set('semaine_debut', e.target.value)} required />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Séances prévues" type="number" value={form.seances_prevues} onChange={e => set('seances_prevues', e.target.value)} required />
        <Input label="Séances réalisées" type="number" value={form.seances_realisees} onChange={e => set('seances_realisees', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Poids (kg, optionnel)" type="number" value={form.poids_kg} onChange={e => set('poids_kg', e.target.value)} />
        <Input label="Fatigue /10 (optionnel)" type="number" value={form.niveau_fatigue} onChange={e => set('niveau_fatigue', e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-white/35 uppercase tracking-widest block mb-2">Commentaire</label>
        <textarea
          value={form.commentaire_coach}
          onChange={e => set('commentaire_coach', e.target.value)}
          rows={3}
          className="w-full bg-c3 border border-white/8 text-white text-sm px-3 py-2 outline-none focus:border-lime/30 placeholder:text-white/20 resize-none"
          placeholder="Observations de la semaine…"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.objectif_atteint} onChange={e => set('objectif_atteint', e.target.checked)}
          className="accent-lime" />
        <span className="text-sm text-white/70">Objectif de la semaine atteint</span>
      </label>
      <Button type="submit" loading={loading} variant="lime" className="w-full">
        Enregistrer le bilan
      </Button>
    </form>
  )
}
