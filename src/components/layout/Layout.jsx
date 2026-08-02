import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import {
  Home,
  Route,
  Ticket,
  User,
  Heart,
  CalendarHeart,
  LayoutDashboard,
  MapPin,
  Calendar,
  Camera,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { cn, ui } from '../../lib/ui'

const NAV = [
  { to: '/', label: 'Feed', icon: Home, end: true },
  { to: '/plan', label: 'Plan', icon: Route },
  { to: '/events', label: 'Events', icon: Ticket },
  { to: '/profile', label: 'Profile', icon: User },
]

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/places', label: 'Places', icon: MapPin },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/posts', label: 'Posts', icon: Camera },
]

function Logo() {
  return (
    <Link to="/" className={ui.logo}>
      <span className={ui.logoMark}>
        <CalendarHeart size={20} />
      </span>
      <span className={ui.logoText}>
        Out<span className="text-primary">Yah</span>
      </span>
    </Link>
  )
}

export default function Layout() {
  const { plan, favorites } = useApp()
  const { user, profile, isAdmin } = useAuth()
  const { pathname } = useLocation()
  const onAdmin = pathname.startsWith('/admin')

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Guest'
  const handle = profile?.handle || (user ? `@${user.email?.split('@')[0]}` : 'Sign in to sync')
  const avatar =
    profile?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || 'guest')}`

  return (
    <div className={ui.shell}>
      <aside className={ui.sidebar}>
        <Logo />
        <nav className={ui.sidebarNav}>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(ui.sidebarLink, isActive && ui.sidebarLinkActive)
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} />
                  {label}
                  {to === '/plan' && plan.length > 0 && (
                    <span className={cn(ui.countPill, isActive && ui.countPillOnActive)}>
                      {plan.length}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              cn(ui.sidebarLink, isActive && ui.sidebarLinkActive)
            }
          >
            {({ isActive }) => (
              <>
                <Heart size={19} />
                Favorites
                {favorites.length > 0 && (
                  <span className={cn(ui.countPill, isActive && ui.countPillOnActive)}>
                    {favorites.length}
                  </span>
                )}
              </>
            )}
          </NavLink>

          {isAdmin && (
            <>
              <p className="mt-4 px-3 text-[0.7rem] font-bold uppercase tracking-wider text-muted">
                Admin
              </p>
              {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(ui.sidebarLink, isActive && ui.sidebarLinkActive)
                  }
                >
                  <Icon size={19} />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <Link to={user ? '/profile' : '/auth?next=/profile'} className={ui.sidebarUser}>
          <img src={avatar} alt="" className={ui.avatar} />
          <span>
            <strong className="block">{displayName}</strong>
            <small className="block text-[0.75rem] text-muted">
              {user ? handle : 'Sign in'}
            </small>
          </span>
        </Link>
      </aside>

      <div className={ui.shellMain}>
        <main className={ui.page}>
          {isAdmin && onAdmin && (
            <nav
              className="mb-4 flex gap-1 overflow-x-auto pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Admin"
            >
              {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[0.8rem] font-semibold text-fg',
                      isActive && 'border-primary bg-primary text-on-primary',
                    )
                  }
                >
                  <Icon size={14} />
                  {label}
                </NavLink>
              ))}
            </nav>
          )}
          <Outlet />
        </main>
      </div>

      <nav className={ui.bottomNav}>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(ui.bottomLink, isActive && ui.bottomLinkActive)
            }
          >
            <Icon size={22} strokeWidth={2} />
            {label}
            {to === '/plan' && plan.length > 0 && (
              <span className={ui.badgeDot}>{plan.length}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
