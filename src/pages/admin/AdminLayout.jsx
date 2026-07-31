import { NavLink, Navigate, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, MapPin, Calendar, Camera, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/places', label: 'Places', icon: MapPin },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/posts', label: 'Posts', icon: Camera },
]

export default function AdminLayout() {
  const { loading, user, isAdmin } = useAuth()

  if (loading) return <p className="muted admin-loading">Checking access…</p>
  if (!user) return <Navigate to="/auth?next=/admin" replace />
  if (!isAdmin) {
    return (
      <div className="stack-lg admin-denied">
        <h1 className="display">Admin only</h1>
        <p className="lede">
          Your account is signed in but not an admin. In Supabase SQL Editor run:
        </p>
        <pre className="code-block">{`update profiles set role = 'admin' where id = '${user.id}';`}</pre>
        <Link to="/" className="btn btn-outline">
          Back to app
        </Link>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">OutYah Admin</div>
        <nav className="admin-nav">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-link${isActive ? ' is-active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="admin-back">
          <ArrowLeft size={16} /> Back to app
        </Link>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
