import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendDouleurAlertToCoach } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { coach_id, note, commentaire, relationship_id, douleur_signalement } = body

  const { data, error } = await supabase.from('avis').insert({
    sportif_id: user.id,
    coach_id,
    relationship_id,
    note,
    commentaire: commentaire || null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Alerte si douleur signalée
  if (douleur_signalement) {
    const [{ data: coach }, { data: sportif }] = await Promise.all([
      supabase.from('users_profiles').select('email, full_name').eq('id', coach_id).single(),
      supabase.from('users_profiles').select('full_name').eq('id', user.id).single(),
    ])
    if (coach && sportif) {
      await sendDouleurAlertToCoach(coach.email, coach.full_name, sportif.full_name, douleur_signalement)
    }
  }

  return NextResponse.json({ ok: true, data })
}
