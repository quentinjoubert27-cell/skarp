'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'

function SignupForm() {
  const params = useSearchParams()
  const [role, setRole] = useState<'sportif' | 'coach'>(
    (params.get('role') as 'sportif' | 'coach') || 'sportif'
  )
  const [fullName, setFullName] = useState('')
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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })

    if (error) { setError(error.message); setLoading(false); return }

    await fetch('/api/auth/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: fullName, role }),
    })

    if (role === 'coach') router.push('/coach-dashboard')
    else router.push('/onboarding')
  }

  return (
    <main className="min-h-screen bg-carbon flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-barlow text-2xl font-black block mb-10">
          SKARP<span className="text-lime">.</span>
        </Link>
        <h1 className="font-barlow text-4xl font-black uppercase mb-1">CRÉER UN COMPTE</h1>
        <p className="text-sm text-white/35 mb-8">Déjà un compte ? <Link href="/login" className="text-lime hover:underline">Se connecter</Link></p>

        <div className="flex gap-3 mb-6">
          {(['sportif', 'coach'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={cn(
                'flex-1 py-3 font-barlow font-black uppercase text-sm tracking-widest border transition-all',
                role === r
                  ? 'bg-lime text-carbon border-lime'
                  : 'border-white/10 text-white/40 hover:border-white/25'
              )}
            >
              Je suis {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Prénom et nom" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
          {error && <p className="text-sm text-red/80">{error}</p>}
          <Button type="submit" loading={loading} className="w-full mt-2">Créer mon compte</Button>
        </form>
      </div>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
