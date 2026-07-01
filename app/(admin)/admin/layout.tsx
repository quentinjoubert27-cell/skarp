import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

const NAV = [
  { label: 'Vue globale', href: '/admin', icon: '▣' },
  { label: 'Utilisateurs', href: '/admin/utilisateurs', icon: '👥' },
  { label: 'Coachs', href: '/admin/coachs', icon: '🏆' },
  { label: 'Paiements', href: '/admin/paiements', icon: '💳' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/login')

  return (
    <div className="flex min-h-screen bg-carbon text-white">
      <Sidebar items={NAV} activePath="" userName={profile?.full_name || ''} userRole="admin" avatarUrl={profile?.avatar_url} />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  )
}
