import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatInterface from '@/components/sportif/ChatInterface'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: relationship } = await supabase
    .from('coaching_relationships')
    .select('*, coach:users_profiles!coach_id(id, full_name, avatar_url)')
    .eq('sportif_id', user.id)
    .eq('statut', 'actif')
    .single()

  if (!relationship) {
    return (
      <div className="flex items-center justify-center h-96 text-white/25 flex-col gap-3">
        <p className="font-barlow font-black text-2xl uppercase">Pas de coach actif</p>
        <p className="text-sm">Choisis un coach pour débloquer la messagerie.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-6">
        MESSAGES — <span className="text-lime">{(relationship as any).coach?.full_name?.toUpperCase()}</span>
      </h1>
      <ChatInterface
        relationshipId={relationship.id}
        currentUserId={user.id}
      />
    </div>
  )
}
