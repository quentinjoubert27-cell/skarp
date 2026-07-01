import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendBilanReminder } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()

  const { data, error } = await supabase.from('bilans_hebdo').insert({
    relationship_id: body.relationship_id,
    sportif_id: body.sportif_id,
    coach_id: user.id,
    semaine_debut: body.semaine_debut,
    seances_prevues: body.seances_prevues,
    seances_realisees: body.seances_realisees,
    objectif_atteint: body.objectif_atteint ?? false,
    poids_kg: body.poids_kg || null,
    niveau_fatigue: body.niveau_fatigue || null,
    commentaire_coach: body.commentaire_coach || null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Notifier le sportif
  const { data: sportif } = await supabase
    .from('users_profiles')
    .select('email, full_name')
    .eq('id', body.sportif_id)
    .single()

  if (sportif) {
    await sendBilanReminder(sportif.email, sportif.full_name).catch(() => {})
  }

  return NextResponse.json({ ok: true, data })
}
