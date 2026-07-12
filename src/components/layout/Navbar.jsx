import { NavLink } from 'react-router-dom'
import './Navbar.css'

const links = [
  { to: '/', label: 'Feed', end: true },
  { to: '/search', label: 'Search' },
  { to: '/plan', label: 'Plan' },
  { to: '/favorites', label: 'Favorites' },
]

const linkClass = ({ isActive }) =>
  isActive ? 'navbar__link is-active' : 'navbar__link'

function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar__inner">
        <NavLink to="/" className="navbar__logo" aria-label="Jamaica Outing Platform home">
          <span className="navbar__logo-mark">JOP</span>
        </NavLink>

        <ul className="navbar__links">
          {links.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={linkClass}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <NavLink
          to="/profile"
          aria-label="Profile"
          className={({ isActive }) =>
            isActive ? 'navbar__profile is-active' : 'navbar__profile'
          }
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8" r="4" fill="currentColor" />
            <path
              d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
              fill="currentColor"
            />
          </svg>
        </NavLink>
      </nav>
    </header>
  )
}

export default Navbar
