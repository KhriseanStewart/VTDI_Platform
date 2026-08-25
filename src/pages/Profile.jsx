import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { btn, cn, ui } from '../lib/ui'

export default function Profile() {
  const { favorites, plan } = useApp()
  const { user, profile, loading, isAdmin, signOut, configured } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return <p className={ui.muted}>Loading profile…</p>
  }

  if (!user) {
    return (
      <div className={cn(ui.stack, 'mx-auto w-full max-w-md gap-5 py-6 text-center sm:py-12')}>
        <header>
          <p className={ui.eyebrow}>Profile</p>
          <h1 className={ui.display}>Your OutYah account</h1>
          <p className={cn(ui.lede, 'mx-auto mt-2')}>
            Sign in to sync favorites and outing plans across devices.
          </p>
        </header>
        <Link to="/auth?next=/profile" className={cn(btn(ui.btnPrimary), ui.btnLg, 'mx-auto')}>
          Sign in
        </Link>
        {!configured && (
          <p className={ui.note}>Supabase is not configured in this environment.</p>
        )}
      </div>
    )
  }

  const name = profile?.name || user.email
  const handle = profile?.handle || `@${user.email?.split('@')[0]}`
  const avatar =
    profile?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || 'user')}`

  const menuItem = cn(
    'flex w-full cursor-pointer items-center justify-between gap-3 border-none bg-transparent px-4 py-3.5 text-left text-[0.95rem] font-semibold text-fg hover:bg-bg',
    'transition-colors duration-150',
  )

  const MENU = [
    { to: '/favorites', label: 'Saved places', meta: favorites.length || null },
    { to: '/plan', label: 'Current outing', meta: plan.length || null },
    { to: '/events', label: 'Events near you' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin portal' }] : []),
  ]

  return (
    <div className={cn(ui.stackLg, 'mx-auto w-full max-w-2xl')}>
      <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        <img src={avatar} alt="" className={ui.avatarXl} />
        <div className="min-w-0">
          <h1 className={ui.display}>{name}</h1>
          <p className="mt-1 text-[0.92rem] font-semibold text-primary">{handle}</p>
          <p className={cn(ui.lede, 'mt-2 text-[0.92rem]')}>{profile?.bio || user.email}</p>
        </div>
      </header>

      <div className={ui.statGrid}>
        <div className={ui.stat}>
          <strong className={ui.statValue}>{favorites.length}</strong>
          <span className={ui.statLabel}>Favorites</span>
        </div>
        <div className={ui.stat}>
          <strong className={ui.statValue}>{plan.length}</strong>
          <span className={ui.statLabel}>In plan</span>
        </div>
        <div className={ui.stat}>
          <strong className={ui.statValue}>{isAdmin ? 'Admin' : 'Member'}</strong>
          <span className={ui.statLabel}>Role</span>
        </div>
      </div>

      <nav className={ui.listGroup}>
        {MENU.map((item) => (
          <Link key={item.to} to={item.to} className={menuItem}>
            {item.label}
            <span className="flex items-center gap-2 text-muted">
              {item.meta != null && (
                <span className="text-[0.82rem] font-bold tabular-nums">{item.meta}</span>
              )}
              <ChevronRight size={16} />
            </span>
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className={cn(btn(ui.btnOutline), ui.btnBlock, 'text-danger hover:bg-danger-soft')}
        onClick={async () => {
          await signOut()
          navigate('/')
        }}
      >
        <LogOut size={16} />
        Log out
      </button>
    </div>
  )
}
