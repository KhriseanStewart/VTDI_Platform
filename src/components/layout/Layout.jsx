import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import {
  Compass,
  Route,
  Ticket,
  User,
  Heart,
  LayoutDashboard,
  MapPin,
  Calendar,
  Camera,
  GalleryVerticalEnd,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import Logo from '../Logo'
import { cn, ui } from '../../lib/ui'

const NAV = [
  { to: '/explore', label: 'Explore', icon: Compass, end: true },
  { to: '/plan', label: 'Plan', icon: Route },
  { to: '/feed', label: 'Feed', icon: GalleryVerticalEnd },
  { to: '/events', label: 'Events', icon: Ticket },
  { to: '/profile', label: 'Profile', icon: User },
]

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/places', label: 'Places', icon: MapPin },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/posts', label: 'Posts', icon: Camera },
]

export default function Layout() {
  const { plan, favorites } = useApp()
  const { user, profile, isAdmin } = useAuth()
  const { pathname } = useLocation()
  const onAdmin = pathname.startsWith('/admin')
  const onFeed = pathname === '/feed'

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Guest'
  const handle = profile?.handle || (user ? `@${user.email?.split('@')[0]}` : 'Sign in to sync')
  const avatar =
    profile?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || 'guest')}`

  const navLinkClass = ({ isActive }) => cn(ui.sidebarLink, isActive && ui.sidebarLinkActive)

  return (
    <div className={ui.shell}>
      <aside className={ui.sidebar}>
        <Logo />
        <nav className={ui.sidebarNav} aria-label="Main">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
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
          <NavLink to="/favorites" className={navLinkClass}>
            {({ isActive }) => (
              <>
                <Heart size={19} strokeWidth={isActive ? 2.4 : 2} />
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
              <p className={ui.navGroupLabel}>Admin</p>
              {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <Link to={user ? '/profile' : '/auth?next=/profile'} className={ui.sidebarUser}>
          <img src={avatar} alt="" className={ui.avatarSm} />
          <span className="min-w-0">
            <strong className="block truncate text-[0.88rem]">{displayName}</strong>
            <small className="block truncate text-[0.75rem] text-subtle">
              {user ? handle : 'Sign in'}
            </small>
          </span>
        </Link>
      </aside>

      <div className={ui.shellMain}>
        <header
          className={cn(
            'sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-bg/85 px-4 py-2.5 backdrop-blur-xl lg:hidden',
            onFeed && 'hidden',
          )}
        >
          <Logo size="sm" />
          <Link
            to={user ? '/profile' : '/auth?next=/profile'}
            className={cn('rounded-full', ui.focus)}
            aria-label={user ? 'Your profile' : 'Sign in'}
          >
            <img src={avatar} alt="" className="h-8 w-8 rounded-full bg-border object-cover" />
          </Link>
        </header>

        <main className={cn(ui.page, onFeed && ui.pageFeed)}>
          {isAdmin && onAdmin && (
            <nav className="mb-5 flex gap-1.5 overflow-x-auto pb-1 rail-scroll lg:hidden" aria-label="Admin">
              {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(ui.chip, ui.btnSm, 'gap-1.5', isActive && ui.chipActive)
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

      <nav className={ui.bottomNav} aria-label="Main">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(ui.bottomLink, isActive && ui.bottomLinkActive)}
          >
            {({ isActive }) => (
              <>
                <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
                {label}
                {to === '/plan' && plan.length > 0 && (
                  <span className={ui.badgeDot}>{plan.length}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
