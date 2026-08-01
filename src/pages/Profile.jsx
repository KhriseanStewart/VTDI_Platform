import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { btn, ui } from '../lib/ui'

export default function Profile() {
  const { favorites, plan } = useApp()
  const { user, profile, loading, isAdmin, signOut, configured } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return <p className={ui.muted}>Loading profile…</p>
  }

  if (!user) {
    return (
      <div className={ui.stackLg}>
        <header>
          <h1 className={ui.display}>Your profile</h1>
          <p className={ui.lede}>Sign in to sync favorites and outing plans across devices.</p>
        </header>
        <Link to="/auth?next=/profile" className={btn(ui.btnPrimary)}>
          Sign in
        </Link>
        {!configured && (
          <p className={ui.igSourceNote}>Supabase is not configured in this environment.</p>
        )}
      </div>
    )
  }

  const name = profile?.name || user.email
  const handle = profile?.handle || `@${user.email?.split('@')[0]}`
  const avatar =
    profile?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || 'user')}`

  const menuItem =
    'block w-full cursor-pointer border-none border-b border-border bg-transparent px-4 py-[0.95rem] text-left font-semibold text-fg last:border-b-0 hover:bg-primary-soft hover:text-primary'

  return (
    <div className={ui.stackLg}>
      <header className="flex items-start gap-4">
        <img src={avatar} alt="" className={ui.avatarXl} />
        <div>
          <h1 className={ui.display}>{name}</h1>
          <p className={ui.muted}>{handle}</p>
          <p className={ui.lede}>{profile?.bio || user.email}</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-[0.65rem] min-[720px]:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card p-[0.9rem] text-center">
          <strong className="font-display block text-xl font-bold">{favorites.length}</strong>
          <span className="text-[0.75rem] text-muted">Favorites</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-[0.9rem] text-center">
          <strong className="font-display block text-xl font-bold">{plan.length}</strong>
          <span className="text-[0.75rem] text-muted">In plan</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-[0.9rem] text-center">
          <strong className="font-display block text-xl font-bold">
            {isAdmin ? 'Admin' : 'Member'}
          </strong>
          <span className="text-[0.75rem] text-muted">Role</span>
        </div>
      </div>

      <nav className="grid overflow-hidden rounded-2xl border border-border bg-card">
        <Link to="/favorites" className={menuItem}>
          Saved places
        </Link>
        <Link to="/plan" className={menuItem}>
          Current outing
        </Link>
        <Link to="/events" className={menuItem}>
          Events near you
        </Link>
        {isAdmin && (
          <Link to="/admin" className={menuItem}>
            Admin portal
          </Link>
        )}
        <button
          type="button"
          className={menuItem}
          onClick={async () => {
            await signOut()
            navigate('/')
          }}
        >
          Log out
        </button>
      </nav>
    </div>
  )
}
