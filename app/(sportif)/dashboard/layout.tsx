import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

const NAV = [
  { label: 'Tableau de bord', href: '/dashboard', icon: '▣' },
  { label: 'Mon coach', href: '/dashboard/coach', icon: '👤' },
  { label: 'Mes séances', href: '/dashboard/seances', icon: '📋' },
  { label: 'Bilans', href: '/dashboard/bilans', icon: '📊' },
  { label: 'Messagerie', href: '/dashboard/messages', icon: '💬' },
  { label: 'Programmes', href: '/dashboard/programmes', icon: '📁' },
  { label: 'Paiements', href: '/dashboard/paiements', icon: '💳' },
]

export default async function SportifLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'sportif') redirect('/login')

  return (
    <div className="flex min-h-screen bg-carbon text-white">
      <Sidebar items={NAV} activePath="" userName={profile?.full_name || ''} userRole="sportif" avatarUrl={profile?.avatar_url} />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  )
}
