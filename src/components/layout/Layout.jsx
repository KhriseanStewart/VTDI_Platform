import { Outlet, NavLink } from 'react-router-dom';
import './Navbar.css';

function Layout() {
  return (
    <div className="app">
      <header className="header">
        <h1 className="app-title">🌴 Jamaica Outing Platform</h1>
        <div className="weather">
          <span className="temp">30°C</span>
          <span className="condition">☀️ Partly sunny</span>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          🏠 Feed
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          🔍 Search
        </NavLink>
        <NavLink to="/plan" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          📋 Plan
        </NavLink>
        <NavLink to="/favorites" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          ⭐ Favorites
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          👤 Profile
        </NavLink>
      </nav>
    </div>
  );
}

export default Layout;