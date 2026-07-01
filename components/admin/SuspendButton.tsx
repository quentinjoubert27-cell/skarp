'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  currentStatus: string
  userName: string
}

export default function SuspendButton({ userId, currentStatus, userName }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggle() {
    const isSuspended = currentStatus === 'suspendu'
    const msg = isSuspended
      ? `Réactiver ${userName} ?`
      : `Suspendre ${userName} ? Cette action bloquera son accès à la plateforme.`

    if (!confirm(msg)) return
    setLoading(true)
    await supabase.from('users_profiles').update({ statut: isSuspended ? 'actif' : 'suspendu' }).eq('id', userId)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs px-3 py-1 border transition-colors ${
        currentStatus === 'suspendu'
          ? 'border-lime/30 text-lime hover:bg-lime/10'
          : 'border-red/30 text-red hover:bg-red/10'
      }`}
    >
      {loading ? '…' : currentStatus === 'suspendu' ? 'Réactiver' : 'Suspendre'}
    </button>
  )
}
