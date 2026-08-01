import { NavLink, Navigate, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, MapPin, Calendar, Camera, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn, ui } from '../../lib/ui'

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/places', label: 'Places', icon: MapPin },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/posts', label: 'Posts', icon: Camera },
]

export default function AdminLayout() {
  const { loading, user, isAdmin } = useAuth()

  if (loading) return <p className={cn(ui.muted, ui.adminLoading)}>Checking access…</p>
  if (!user) return <Navigate to="/auth?next=/admin" replace />
  if (!isAdmin) {
    return (
      <div className={cn(ui.stackLg, ui.adminDenied)}>
        <h1 className={ui.display}>Admin only</h1>
        <p className={ui.lede}>
          Your account is signed in but not an admin. In Supabase SQL Editor run:
        </p>
        <pre className={ui.codeBlock}>{`update profiles set role = 'admin' where id = '${user.id}';`}</pre>
        <Link to="/" className={cn(ui.btn, ui.btnOutline)}>
          Back to app
        </Link>
      </div>
    )
  }

  return (
    <div className={ui.adminShell}>
      <aside className={ui.adminSidebar}>
        <div className={ui.adminBrand}>OutYah Admin</div>
        <nav className={ui.adminNav}>
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(ui.adminLink, 'inline-flex items-center gap-2', isActive && ui.adminLinkActive)
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className={cn(ui.adminBack, 'items-center gap-1.5')}>
          <ArrowLeft size={16} /> Back to app
        </Link>
      </aside>
      <main className={cn(ui.adminMain, 'mx-auto w-full max-w-[1100px]')}>
        <Outlet />
      </main>
    </div>
  )
}
