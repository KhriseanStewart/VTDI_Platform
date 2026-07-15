import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PlaceCard from '../components/PlaceCard';

function Favorites() {
 
  const [favorites, setFavorites] = useState([]);

  return (
    <section>
      <h1>⭐ Favorites</h1>
      
      {favorites.length === 0 ? (
        <div className="empty-state">
          <p>You haven't saved any favorites yet.</p>
          <p>💡 Explore places and save your favorites!</p>
          <Link to="/" className="btn-view">Browse Places</Link>
        </div>
      ) : (
        <div className="places-feed">
          {favorites.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}

      <div className="scroll-hint">
        <span>⬇️ Scroll to discover</span>
      </div>
    </section>
  );
}

export default Favorites;

