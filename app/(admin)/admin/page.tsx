import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminOverviewPage() {
  const supabase = createAdminClient()

  const [
    { count: totalUsers },
    { count: totalCoachs },
    { count: totalSportifs },
    { data: paiements },
    { count: pendingCoachs },
  ] = await Promise.all([
    supabase.from('users_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('users_profiles').select('*', { count: 'exact', head: true }).eq('role', 'coach'),
    supabase.from('users_profiles').select('*', { count: 'exact', head: true }).eq('role', 'sportif'),
    supabase.from('paiements').select('montant, commission_plateforme, statut'),
    supabase.from('coach_profiles').select('*', { count: 'exact', head: true }).eq('verifie', false),
  ])

  const revenuBrut = paiements?.filter(p => p.statut === 'complete').reduce((s, p) => s + p.montant, 0) ?? 0
  const commissions = paiements?.filter(p => p.statut === 'complete').reduce((s, p) => s + (p.commission_plateforme ?? 0), 0) ?? 0

  return (
    <div>
      <h1 className="font-barlow font-black text-4xl uppercase mb-1">VUE GLOBALE</h1>
      <p className="text-sm text-white/35 mb-10">Tableau de bord administrateur SKARP</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <KPI v={totalUsers ?? 0} l="Utilisateurs" />
        <KPI v={totalCoachs ?? 0} l="Coachs" />
        <KPI v={totalSportifs ?? 0} l="Sportifs" />
        <KPI v={`${commissions.toLocaleString('fr-FR')}€`} l="Commissions SKARP" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Finances */}
        <section>
          <h2 className="font-barlow font-black text-xl uppercase mb-4">FINANCES</h2>
          <div className="bg-cards border border-white/6 p-6 space-y-4">
            <FinRow label="Volume total" value={`${revenuBrut.toLocaleString('fr-FR')}€`} />
            <FinRow label="Commissions (12%)" value={`${commissions.toLocaleString('fr-FR')}€`} accent />
            <FinRow label="Reversé aux coachs" value={`${(revenuBrut - commissions).toLocaleString('fr-FR')}€`} />
          </div>
        </section>

        {/* Actions rapides */}
        <section>
          <h2 className="font-barlow font-black text-xl uppercase mb-4">ACTIONS RAPIDES</h2>
          <div className="space-y-2">
            <ActionLink href="/admin/coachs?filter=pending" label={`Coachs en attente de vérification (${pendingCoachs ?? 0})`} accent={!!pendingCoachs} />
            <ActionLink href="/admin/paiements?filter=sequestre" label="Paiements en séquestre" />
            <ActionLink href="/admin/utilisateurs" label="Gérer les utilisateurs" />
          </div>
        </section>
      </div>
    </div>
  )
}

function KPI({ v, l }: { v: string | number; l: string }) {
  return (
    <div className="bg-cards border border-white/6 p-5">
      <div className="font-barlow font-black text-4xl text-lime leading-none mb-1">{v}</div>
      <div className="text-xs text-white/35 uppercase tracking-widest">{l}</div>
    </div>
  )
}

function FinRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/40">{label}</span>
      <span className={accent ? 'text-lime font-medium' : ''}>{value}</span>
    </div>
  )
}

function ActionLink({ href, label, accent }: { href: string; label: string; accent?: boolean }) {
  return (
    <Link href={href} className={`block p-4 border transition-colors hover:border-lime/30 ${accent ? 'border-orange/30 bg-orange/5' : 'border-white/6 bg-cards'}`}>
      <span className="text-sm">{label}</span>
      <span className="text-lime ml-2">→</span>
    </Link>
  )
}
