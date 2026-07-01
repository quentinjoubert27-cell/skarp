'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function VerifyCoachButton({ coachId, coachName }: { coachId: string; coachName: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function verify() {
    if (!confirm(`Vérifier et valider le coach ${coachName} ?`)) return
    setLoading(true)
    await supabase.from('coach_profiles').update({ verifie: true }).eq('id', coachId)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={verify}
      disabled={loading}
      className="text-xs px-3 py-1 border border-lime/40 text-lime hover:bg-lime/10 transition-colors"
    >
      {loading ? '…' : 'Vérifier'}
    </button>
  )
}
