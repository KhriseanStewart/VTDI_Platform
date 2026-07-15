import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Planner() {
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [date, setDate] = useState('');

  const placesList = [
    { id: 1, name: "Fiction Bar", location: "Kingston", category: "Nightlife" },
    { id: 2, name: "Margaritaville", location: "St. James", category: "Nightlife" },
    { id: 3, name: "Monte Carlo", location: "St. James", category: "Bars" }
  ];

  const togglePlace = (place) => {
    if (selectedPlaces.find(p => p.id === place.id)) {
      setSelectedPlaces(selectedPlaces.filter(p => p.id !== place.id));
    } else {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  };

  return (
    <section>
      <h1>Sat Night Outing Plan</h1>
      
      {/* Date Selector */}
      <div className="plan-date">
        <label>📅 Select Date</label>
        <input 
          type="date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="date-input"
        />
      </div>

      {/* Ordered venue list */}
      <div className="venue-list">
        <h3>📍 Your Venues</h3>
        {placesList.map((place) => (
          <div key={place.id} className="venue-item">
            <div className="venue-check">
              <input 
                type="checkbox" 
                checked={selectedPlaces.find(p => p.id === place.id) ? true : false}
                onChange={() => togglePlace(place)}
              />
            </div>
            <div className="venue-info">
              <span className="venue-name">{place.name}</span>
              <span className="venue-location">{place.category} • {place.location}</span>
            </div>
            <div className="venue-order">
              <span className="order-number">{place.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Map preview */}
      <div className="map-preview">
        <div className="map-placeholder">
          <span>🗺️ Map Preview</span>
          <p>Your venues will appear here</p>
          <div className="map-dots">
            <span className="dot">📍</span>
            <span className="dot">📍</span>
            <span className="dot">📍</span>
          </div>
        </div>
      </div>

      {/* Get Directions CTA */}
      <div className="plan-actions">
        <button className="btn-view">Get Directions</button>
        <button className="btn-location">Save Plan</button>
      </div>

      <div className="scroll-hint">
        <span>⬇️ Scroll to discover</span>
      </div>
    </section>
  );
}

export default Planner;