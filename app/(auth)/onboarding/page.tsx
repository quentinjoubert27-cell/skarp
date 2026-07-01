'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const SPORTS = ['Rugby', 'Running', 'Natation', 'Cyclisme', 'Musculation', 'Football', 'Basketball', 'Tennis', 'Triathlon', 'Boxe', 'CrossFit', 'Yoga', 'Autre']
const OBJECTIFS = ['Perdre du poids', 'Prendre de la masse', 'Améliorer mes performances', 'Reprendre une activité sportive', 'Préparer une compétition', "Me remettre d'une blessure", 'Rester en forme']
const NIVEAUX = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert']
const MODES = ['Distanciel', 'Présentiel', 'Les deux']

interface FormState {
  sport_pratique: string
  objectif_principal: string
  niveau: string
  age: string
  poids: string
  taille: string
  budget_mensuel: string
  mode_prefere: string
  ville: string
  disponibilite: string
  blessures: string
}

const INITIAL: FormState = {
  sport_pratique: '', objectif_principal: '', niveau: '', age: '', poids: '', taille: '',
  budget_mensuel: '', mode_prefere: '', ville: '', disponibilite: '', blessures: '',
}

const STEPS = [
  { label: 'Sport', field: 'sport_pratique' },
  { label: 'Objectif', field: 'objectif_principal' },
  { label: 'Niveau', field: 'niveau' },
  { label: 'Profil physique', field: 'age' },
  { label: 'Budget & Mode', field: 'budget_mensuel' },
  { label: 'Localisation', field: 'ville' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INITIAL)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function set(k: keyof FormState, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function finish() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    await supabase.from('sportif_profiles').upsert({
      id: user.id,
      sport_pratique: form.sport_pratique,
      objectif_principal: form.objectif_principal,
      niveau: form.niveau,
      age: form.age ? parseInt(form.age) : null,
      poids: form.poids ? parseFloat(form.poids) : null,
      taille: form.taille ? parseInt(form.taille) : null,
      budget_mensuel: form.budget_mensuel ? parseFloat(form.budget_mensuel) : null,
      mode_prefere: form.mode_prefere,
      ville: form.ville,
      disponibilite: form.disponibilite,
      blessures_historique: form.blessures,
    })

    router.push('/dashboard')
  }

  const pct = Math.round(((step + 1) / STEPS.length) * 100)

  return (
    <main className="min-h-screen bg-carbon text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-2 flex justify-between items-center">
          <span className="font-barlow font-black text-2xl">SKARP<span className="text-lime">.</span></span>
          <span className="text-xs text-white/35">{step + 1} / {STEPS.length}</span>
        </div>

        {/* Barre de progression */}
        <div className="h-1 bg-white/8 mb-10">
          <div className="h-full bg-lime transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>

        {step === 0 && (
          <StepCard title="Quel sport tu pratiques ?">
            <div className="grid grid-cols-2 gap-2 mt-4">
              {SPORTS.map(s => (
                <Chip key={s} selected={form.sport_pratique === s} onClick={() => set('sport_pratique', s)}>{s}</Chip>
              ))}
            </div>
          </StepCard>
        )}

        {step === 1 && (
          <StepCard title="Quel est ton objectif principal ?">
            <div className="flex flex-col gap-2 mt-4">
              {OBJECTIFS.map(o => (
                <Chip key={o} selected={form.objectif_principal === o} onClick={() => set('objectif_principal', o)}>{o}</Chip>
              ))}
            </div>
          </StepCard>
        )}

        {step === 2 && (
          <StepCard title="Quel est ton niveau ?">
            <div className="grid grid-cols-2 gap-2 mt-4">
              {NIVEAUX.map(n => (
                <Chip key={n} selected={form.niveau === n} onClick={() => set('niveau', n)}>{n}</Chip>
              ))}
            </div>
          </StepCard>
        )}

        {step === 3 && (
          <StepCard title="Ton profil physique">
            <div className="flex flex-col gap-4 mt-4">
              <Input label="Âge" type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="25" />
              <Input label="Poids (kg)" type="number" value={form.poids} onChange={e => set('poids', e.target.value)} placeholder="75" />
              <Input label="Taille (cm)" type="number" value={form.taille} onChange={e => set('taille', e.target.value)} placeholder="180" />
            </div>
          </StepCard>
        )}

        {step === 4 && (
          <StepCard title="Budget & mode de coaching">
            <div className="flex flex-col gap-4 mt-4">
              <div>
                <p className="text-xs text-white/35 uppercase tracking-widest mb-2">Mode préféré</p>
                <div className="flex gap-2">
                  {MODES.map(m => (
                    <Chip key={m} selected={form.mode_prefere === m} onClick={() => set('mode_prefere', m)}>{m}</Chip>
                  ))}
                </div>
              </div>
              <Input label="Budget mensuel max (€)" type="number" value={form.budget_mensuel} onChange={e => set('budget_mensuel', e.target.value)} placeholder="100" />
              <Input label="Disponibilité (ex: matin en semaine)" value={form.disponibilite} onChange={e => set('disponibilite', e.target.value)} placeholder="Lundi, mercredi soir..." />
            </div>
          </StepCard>
        )}

        {step === 5 && (
          <StepCard title="Où es-tu ?">
            <div className="flex flex-col gap-4 mt-4">
              <Input label="Ville" value={form.ville} onChange={e => set('ville', e.target.value)} placeholder="Paris, Lyon, Bordeaux..." />
              <Input label="Blessures ou antécédents (optionnel)" value={form.blessures} onChange={e => set('blessures', e.target.value)} placeholder="Genou droit, dos..." />
            </div>
          </StepCard>
        )}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
              Retour
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button variant="lime" onClick={() => setStep(s => s + 1)} className="flex-1">
              Continuer
            </Button>
          ) : (
            <Button variant="lime" loading={loading} onClick={finish} className="flex-1">
              Trouver mon coach
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}

function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-barlow font-black text-3xl uppercase leading-tight">{title}</h2>
      {children}
    </div>
  )
}

function Chip({ children, selected, onClick }: { children: React.ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm text-left border transition-all ${selected ? 'border-lime bg-lime/10 text-lime' : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/80'}`}
    >
      {children}
    </button>
  )
}
