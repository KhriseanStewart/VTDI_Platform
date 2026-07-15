import React from 'react';
import { Link } from 'react-router-dom';

function PlaceCard({ place }) {
  return (
    <div className="place-card">
      <div className="place-header">
        <span className="category-badge">{place.category}</span>
        <span className="separator">•</span>
        <span className="location-badge">{place.location}</span>
      </div>
      <h2 className="place-name">{place.name}</h2>
      <p className="place-description">{place.description}</p>
      <div className="place-actions">
        <Link to={`/venue/${place.id}`} className="btn-view">
          View place
        </Link>
        <button className="btn-location">
          Location
        </button>
      </div>
    </div>
  );
}

export default PlaceCard;