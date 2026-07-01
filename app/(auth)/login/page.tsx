'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }

    const { data: profile } = await supabase
      .from('users_profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const role = profile?.role
    if (role === 'coach') router.push('/coach-dashboard')
    else if (role === 'admin') router.push('/admin')
    else router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-carbon flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-barlow text-2xl font-black block mb-10">
          SKARP<span className="text-lime">.</span>
        </Link>
        <h1 className="font-barlow text-4xl font-black uppercase mb-1">CONNEXION</h1>
        <p className="text-sm text-white/35 mb-8">Pas encore de compte ? <Link href="/signup" className="text-lime hover:underline">Créer un compte</Link></p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          {error && <p className="text-sm text-red/80">{error}</p>}
          <Button type="submit" loading={loading} className="w-full mt-2">Se connecter</Button>
        </form>
      </div>
    </main>
  )
}
