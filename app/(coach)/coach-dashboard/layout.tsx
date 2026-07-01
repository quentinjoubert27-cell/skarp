import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

const NAV = [
  { label: 'Tableau de bord', href: '/coach-dashboard', icon: '▣' },
  { label: 'Mes élèves', href: '/coach-dashboard/eleves', icon: '👥' },
  { label: 'Planning', href: '/coach-dashboard/planning', icon: '📅' },
  { label: 'Bilans', href: '/coach-dashboard/bilans', icon: '📊' },
  { label: 'Messagerie', href: '/coach-dashboard/messages', icon: '💬' },
  { label: 'Programmes', href: '/coach-dashboard/programmes', icon: '📁' },
  { label: 'Finances', href: '/coach-dashboard/finances', icon: '💳' },
]

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'coach') redirect('/login')

  return (
    <div className="flex min-h-screen bg-carbon text-white">
      <Sidebar items={NAV} activePath="" userName={profile?.full_name || ''} userRole="coach" avatarUrl={profile?.avatar_url} />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  )
}
