'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

export default function LiberePaiementButton({ paymentId, paymentIntentId }: { paymentId: string; paymentIntentId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function liberer() {
    if (!confirm('Libérer ce paiement vers le coach ?')) return
    setLoading(true)
    const res = await fetch('/api/stripe/liberer-paiement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, paymentIntentId }),
    })
    const data = await res.json()
    if (data.ok) {
      toast({ title: 'Paiement libéré', type: 'success' })
      router.refresh()
    } else {
      toast({ title: 'Erreur', message: data.error, type: 'error' })
    }
    setLoading(false)
  }

  return (
    <button
      onClick={liberer}
      disabled={loading}
      className="text-xs px-3 py-1 border border-lime/40 text-lime hover:bg-lime/10 transition-colors"
    >
      {loading ? '…' : 'Libérer'}
    </button>
  )
}
