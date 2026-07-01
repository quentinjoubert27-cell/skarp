import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ChatInterface from '@/components/sportif/ChatInterface'

export default async function CoachMessagesPage({ searchParams }: { searchParams: { rel?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: relations } = await supabase
    .from('coaching_relationships')
    .select('id, sportif:users_profiles!sportif_id(id, full_name)')
    .eq('coach_id', user.id)
    .eq('statut', 'actif')

  const activeRelId = searchParams.rel || relations?.[0]?.id
  const activeRel = relations?.find(r => r.id === activeRelId)

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-6">MESSAGERIE</h1>
      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* Liste des conversations */}
        <div className="w-56 flex-shrink-0 border border-white/8 overflow-y-auto">
          {(!relations || relations.length === 0) && (
            <p className="text-xs text-white/25 p-4">Aucun élève actif</p>
          )}
          {relations?.map((r: any) => (
            <Link
              key={r.id}
              href={`/coach-dashboard/messages?rel=${r.id}`}
              className={`block px-4 py-3 border-b border-white/6 text-sm hover:bg-cards transition-colors ${activeRelId === r.id ? 'bg-cards border-l-2 border-l-lime' : ''}`}
            >
              {r.sportif?.full_name}
            </Link>
          ))}
        </div>

        {/* Chat */}
        <div className="flex-1">
          {activeRelId && activeRel ? (
            <ChatInterface relationshipId={activeRelId} currentUserId={user.id} />
          ) : (
            <div className="flex items-center justify-center h-full text-white/25 text-sm">
              Sélectionne un élève
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
