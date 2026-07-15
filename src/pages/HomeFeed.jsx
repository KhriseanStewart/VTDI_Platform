import React, { useState } from 'react';
import PlaceCard from '../components/PlaceCard';
import placesData from '../data/placesData';

function HomeFeed() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlaces = placesData.filter(place =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section>
      <h1>Discover Jamaica.</h1>
      
      {/* Weather */}
      <div className="weather-bar">
        <span className="temp">30°C</span>
        <span className="condition">Partly sunny</span>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Masonry/grid feed of venue post cards */}
      <div className="places-feed">
        {filteredPlaces.length > 0 ? (
          filteredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))
        ) : (
          <p className="no-results">No places found. Try a different search!</p>
        )}
      </div>

      {/* Scroll to discover */}
      <div className="scroll-hint">
        <span>Scroll to discover</span>
      </div>
    </section>
  );
}

export default HomeFeed;