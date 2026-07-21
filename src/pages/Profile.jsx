import { Link } from 'react-router-dom'
import { CURRENT_USER } from '../data/outyahData'
import { useApp } from '../context/AppContext'

export default function Profile() {
  const { favorites, plan } = useApp()

  return (
    <div className="stack-lg">
      <header className="profile-hero">
        <img src={CURRENT_USER.avatar} alt="" className="avatar xl" />
        <div>
          <h1 className="display">{CURRENT_USER.name}</h1>
          <p className="muted">{CURRENT_USER.handle}</p>
          <p className="lede">{CURRENT_USER.bio}</p>
        </div>
      </header>

      <div className="stat-row">
        <div>
          <strong>{CURRENT_USER.followers}</strong>
          <span>Followers</span>
        </div>
        <div>
          <strong>{CURRENT_USER.following}</strong>
          <span>Following</span>
        </div>
        <div>
          <strong>{CURRENT_USER.reviewsCount}</strong>
          <span>Reviews</span>
        </div>
        <div>
          <strong>{favorites.length}</strong>
          <span>Favorites</span>
        </div>
        <div>
          <strong>{plan.length}</strong>
          <span>In plan</span>
        </div>
      </div>

      <nav className="menu-list">
        <Link to="/favorites">Saved places</Link>
        <Link to="/plan">Current outing</Link>
        <Link to="/events">Events near you</Link>
        <button type="button">Settings</button>
        <button type="button">Log out</button>
      </nav>
    </div>
  )
}
