import React, { useState } from 'react';
import PlaceCard from '../components/PlaceCard';
import placesData from '../data/placesData';

function Search() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlaces = placesData.filter(place =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section>
      <h1>🔍 Search</h1>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search places, categories, or locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {searchTerm && (
        <div className="search-results">
          <p className="results-count">Found {filteredPlaces.length} results</p>
          <div className="places-feed">
            {filteredPlaces.length > 0 ? (
              filteredPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))
            ) : (
              <p className="no-results">No places found. Try a different search!</p>
            )}
          </div>
        </div>
      )}

      {!searchTerm && (
        <div className="search-hint">
          <p>💡 Start typing to search for places</p>
          <div className="popular-searches">
            <span className="popular-tag">Nightlife</span>
            <span className="popular-tag">Attractions</span>
            <span className="popular-tag">Kingston</span>
            <span className="popular-tag">Restaurants</span>
            <span className="popular-tag">Beach</span>
          </div>
        </div>
      )}

      <div className="scroll-hint">
        <span>⬇️ Scroll to discover!</span>
      </div>
    </section>
  );
}

export default Search;