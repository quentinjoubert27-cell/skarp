import { createAdminClient } from '@/lib/supabase/server'
import Badge from '@/components/ui/Badge'
import SuspendButton from '@/components/admin/SuspendButton'

interface SearchParams { role?: string; q?: string }

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createAdminClient()

  let query = supabase
    .from('users_profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (searchParams.role) query = query.eq('role', searchParams.role)
  if (searchParams.q) query = query.ilike('full_name', `%${searchParams.q}%`)

  const { data: users } = await query

  const roleColor: Record<string, 'lime' | 'coach' | 'sportif' | 'gray'> = {
    coach: 'coach', sportif: 'sportif', admin: 'lime',
  }
  const statusColor: Record<string, 'lime' | 'red' | 'orange' | 'gray'> = {
    actif: 'lime', suspendu: 'red', inactif: 'gray',
  }

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-8">UTILISATEURS</h1>

      {/* Filtres */}
      <form className="flex gap-3 mb-8">
        <input name="q" defaultValue={searchParams.q} placeholder="Rechercher…"
          className="bg-cards border border-white/8 text-white px-4 py-2 text-sm outline-none focus:border-lime/30 placeholder:text-white/20" />
        <select name="role" defaultValue={searchParams.role}
          className="bg-cards border border-white/8 text-white px-4 py-2 text-sm outline-none">
          <option value="">Tous les rôles</option>
          <option value="sportif">Sportifs</option>
          <option value="coach">Coachs</option>
          <option value="admin">Admins</option>
        </select>
        <button type="submit" className="font-barlow font-black uppercase bg-lime text-carbon px-5 py-2 text-sm tracking-widest">Filtrer</button>
      </form>

      <div className="space-y-2">
        {users?.map(u => (
          <div key={u.id} className="bg-cards border border-white/6 p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{u.full_name}</p>
              <p className="text-xs text-white/35 mt-0.5">{u.email} · {new Date(u.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={roleColor[u.role] || 'gray'}>{u.role}</Badge>
              <Badge variant={statusColor[u.statut] || 'gray'}>{u.statut}</Badge>
              <SuspendButton userId={u.id} currentStatus={u.statut} userName={u.full_name} />
            </div>
          </div>
        ))}
        {(!users || users.length === 0) && (
          <div className="text-center py-16 text-white/25 text-sm">Aucun utilisateur trouvé</div>
        )}
      </div>
    </div>
  )
}
