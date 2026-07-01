import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: string | number
  badgeColor?: 'lime' | 'red'
}

interface SidebarProps {
  items: NavItem[]
  activePath: string
  userName: string
  userRole: string
  avatarUrl?: string | null
  bottomContent?: React.ReactNode
}

export default function Sidebar({ items, activePath, userName, userRole, avatarUrl, bottomContent }: SidebarProps) {
  return (
    <aside className="w-[244px] flex-shrink-0 bg-[#111] border-r border-white/5 flex flex-col overflow-y-auto h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/" className="font-barlow text-2xl font-black">
          SKARP<span className="text-lime">.</span>
        </Link>
      </div>

      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={userName} className="w-10 h-10 rounded-full object-cover border-2 border-lime/35 flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-lime/10 border-2 border-lime/35 flex items-center justify-center font-barlow font-black text-lime text-sm flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-[10px] text-lime uppercase tracking-widest mt-0.5">{userRole}</p>
        </div>
      </div>

      <nav className="flex-1 py-2">
        {items.map(item => {
          const isActive = activePath === item.href || activePath.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all border-l-2',
                isActive
                  ? 'bg-lime text-carbon border-lime [&_svg]:stroke-carbon'
                  : 'border-transparent text-white/60 hover:bg-white/4 hover:text-lime [&_svg]:stroke-current'
              )}
            >
              <span className="w-[18px] h-[18px] flex-shrink-0 [&_svg]:w-full [&_svg]:h-full">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={cn(
                  'text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center',
                  item.badgeColor === 'red' ? 'bg-red text-white' : 'bg-lime text-carbon',
                  isActive && 'bg-carbon text-lime'
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {bottomContent}

      <div className="px-5 py-4 border-t border-white/5">
        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="flex items-center gap-2.5 text-xs text-white/30 hover:text-red transition-colors w-full">
            <svg className="w-4 h-4 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  )
}
