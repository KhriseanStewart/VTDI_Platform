import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { favorites, plan } = useApp()
  const { user, profile, loading, isAdmin, signOut, configured } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return <p className="muted">Loading profile…</p>
  }

  if (!user) {
    return (
      <div className="stack-lg">
        <header>
          <h1 className="display">Your profile</h1>
          <p className="lede">Sign in to sync favorites and outing plans across devices.</p>
        </header>
        <Link to="/auth?next=/profile" className="btn btn-primary">
          Sign in
        </Link>
        {!configured && (
          <p className="ig-source-note">Supabase is not configured in this environment.</p>
        )}
      </div>
    )
  }

  const name = profile?.name || user.email
  const handle = profile?.handle || `@${user.email?.split('@')[0]}`
  const avatar =
    profile?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || 'user')}`

  return (
    <div className="stack-lg">
      <header className="profile-hero">
        <img src={avatar} alt="" className="avatar xl" />
        <div>
          <h1 className="display">{name}</h1>
          <p className="muted">{handle}</p>
          <p className="lede">{profile?.bio || user.email}</p>
        </div>
      </header>

      <div className="stat-row">
        <div>
          <strong>{favorites.length}</strong>
          <span>Favorites</span>
        </div>
        <div>
          <strong>{plan.length}</strong>
          <span>In plan</span>
        </div>
        <div>
          <strong>{isAdmin ? 'Admin' : 'Member'}</strong>
          <span>Role</span>
        </div>
      </div>

      <nav className="menu-list">
        <Link to="/favorites">Saved places</Link>
        <Link to="/plan">Current outing</Link>
        <Link to="/events">Events near you</Link>
        {isAdmin && <Link to="/admin">Admin portal</Link>}
        <button
          type="button"
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
