import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState({
    name: 'Traveler',
    email: 'traveler@email.com',
    bio: 'Exploring the beautiful island of Jamaica 🌴'
  });

  const [isEditing, setIsEditing] = useState(false);
  
  // Stats that start at 0
  const [stats, setStats] = useState({
    visited: 0,
    favorites: 0,
    plans: 0
  });

  const [showAddOptions, setShowAddOptions] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
  };

  // Functions to add to each stat
  const addVisited = () => {
    setStats({ ...stats, visited: stats.visited + 1 });
  };

  const addFavorite = () => {
    setStats({ ...stats, favorites: stats.favorites + 1 });
  };

  const addPlan = () => {
    setStats({ ...stats, plans: stats.plans + 1 });
  };

  // Reset all stats to 0
  const resetStats = () => {
    setStats({ visited: 0, favorites: 0, plans: 0 });
  };

  return (
    <section>
      <h1>👤 Profile</h1>
      
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">🌴</div>
        </div>
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-number">{stats.visited}</span>
            <span className="stat-label">Visited</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.favorites}</span>
            <span className="stat-label">Favorites</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.plans}</span>
            <span className="stat-label">Plans</span>
          </div>
        </div>
      </div>

      {/* Add Buttons */}
      <div className="add-stats-section">
        <button 
          className="btn-add-stat"
          onClick={() => setShowAddOptions(!showAddOptions)}
        >
          {showAddOptions ? '− Hide' : '+ Add Activity'}
        </button>
        
        {showAddOptions && (
          <div className="add-options">
            <button onClick={addVisited} className="btn-add-option">
              📍 Add Visited Place
            </button>
            <button onClick={addFavorite} className="btn-add-option">
              ⭐ Add Favorite
            </button>
            <button onClick={addPlan} className="btn-add-option">
              📋 Add Plan
            </button>
            <button onClick={resetStats} className="btn-add-option btn-reset">
              🔄 Reset All
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="profile-edit">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({...user, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({...user, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={user.bio}
              onChange={(e) => setUser({...user, bio: e.target.value})}
              rows="3"
            />
          </div>
          <button onClick={handleSave} className="btn-view">Save Profile</button>
        </div>
      ) : (
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p className="user-email">{user.email}</p>
          <p className="user-bio">{user.bio}</p>
          <button onClick={() => setIsEditing(true)} className="btn-location">
            ✏️ Edit Profile
          </button>
        </div>
      )}

      <div className="profile-menu">
        <Link to="/favorites" className="menu-item">⭐ Saved Places</Link>
        <Link to="/plan" className="menu-item">📋 Trip History</Link>
        <div className="menu-item">⚙️ Settings</div>
        <div className="menu-item">🚪 Logout</div>
      </div>

      <div className="scroll-hint">
        <span>⬇️ Scroll to discover</span>
      </div>
    </section>
  );
}

export default Profile;