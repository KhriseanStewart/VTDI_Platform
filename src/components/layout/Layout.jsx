import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  Home,
  Route,
  Ticket,
  User,
  Heart,
  CalendarHeart,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CURRENT_USER } from '../../data/outyahData'

const NAV = [
  { to: '/', label: 'Feed', icon: Home, end: true },
  { to: '/plan', label: 'Plan', icon: Route },
  { to: '/events', label: 'Events', icon: Ticket },
  { to: '/profile', label: 'Profile', icon: User },
]

function Logo() {
  return (
    <Link to="/" className="logo">
      <span className="logo-mark">
        <CalendarHeart size={20} />
      </span>
      <span className="logo-text">
        Out<span>Yah</span>
      </span>
    </Link>
  )
}

export default function Layout() {
  const { plan, favorites } = useApp()

  return (
    <div className="shell">
      <aside className="sidebar">
        <Logo />
        <nav className="sidebar-nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' is-active' : ''}`
              }
            >
              <Icon size={19} />
              {label}
              {to === '/plan' && plan.length > 0 && (
                <span className="count-pill">{plan.length}</span>
              )}
            </NavLink>
          ))}
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' is-active' : ''}`
            }
          >
            <Heart size={19} />
            Favorites
            {favorites.length > 0 && (
              <span className="count-pill">{favorites.length}</span>
            )}
          </NavLink>
        </nav>

        <Link to="/profile" className="sidebar-user">
          <img src={CURRENT_USER.avatar} alt="" className="avatar" />
          <span>
            <strong>{CURRENT_USER.name}</strong>
            <small>{CURRENT_USER.handle}</small>
          </span>
        </Link>
      </aside>

      <div className="shell-main">
        <main className="page">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `bottom-link${isActive ? ' is-active' : ''}`
            }
          >
            <Icon size={22} strokeWidth={2} />
            {label}
            {to === '/plan' && plan.length > 0 && (
              <span className="badge-dot">{plan.length}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
