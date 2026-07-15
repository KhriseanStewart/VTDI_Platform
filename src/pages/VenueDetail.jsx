import React from 'react';
import { useParams, Link } from 'react-router-dom';
import placesData from '../data/placesData';

function VenueDetail() {
  const { id } = useParams();
  const place = placesData.find(p => p.id === parseInt(id));

  if (!place) {
    return (
      <section>
        <h1>Venue not found</h1>
        <Link to="/" className="btn-view">Go Back Home</Link>
      </section>
    );
  }

  return (
    <section className="venue-detail">
      <Link to="/" className="back-link">← Back to Feed</Link>
      
      <div className="venue-header">
        <div className="venue-badges">
          <span className="category-badge">{place.category}</span>
          <span className="separator">•</span>
          <span className="location-badge">{place.location}</span>
        </div>
        <h1 className="venue-name">{place.name}</h1>
      </div>

      <div className="venue-image">
        <div className="image-placeholder">📸 {place.name}</div>
      </div>

      <div className="venue-description">
        <h3>About</h3>
        <p>{place.description}</p>
      </div>

      <div className="venue-details">
        <div className="detail-item">
          <span className="detail-label">📍 Location</span>
          <span className="detail-value">{place.location}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">🏷️ Category</span>
          <span className="detail-value">{place.category}</span>
        </div>
      </div>

      <div className="venue-actions">
        <button className="btn-view">📍 Get Directions</button>
        <button className="btn-favorite">⭐ Save to Favorites</button>
      </div>

      <div className="scroll-hint">
        <span>⬇️ Scroll to discover</span>
      </div>
    </section>
  );
}

export default VenueDetail;
