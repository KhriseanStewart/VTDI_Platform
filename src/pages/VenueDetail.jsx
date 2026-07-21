import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  MapPin,
  Phone,
  Clock,
  Share2,
  Navigation,
  Plus,
  Check,
  Sparkles,
  Star,
} from 'lucide-react'
import {
  getPlace,
  CATEGORY_SINGULAR,
  priceLabel,
} from '../data/outyahData'
import { useApp } from '../context/AppContext'
import { PlaceMap } from '../components/maps/GoogleMaps'
import { directionsUrl } from '../lib/maps'
import { MOCK_INSTAGRAM_POSTS } from '../data/instagramFeed'
import { formatInstagramTime } from '../lib/instagram'

export default function VenueDetail() {
  const { id } = useParams()
  const place = getPlace(id)
  const [tab, setTab] = useState('overview')
  const [activeImage, setActiveImage] = useState(null)
  const [slot, setSlot] = useState(null)
  const { isFavorite, toggleFavorite, isInPlan, togglePlan } = useApp()

  const reviews = useMemo(() => place?.reviews ?? [], [place])
  const igPosts = useMemo(
    () => MOCK_INSTAGRAM_POSTS.filter((p) => p.placeId === place?.id),
    [place],
  )
  const heroImage = activeImage || place?.images?.[0] || place?.image

  if (!place) {
    return (
      <section className="stack">
        <h1 className="display">Place not found</h1>
        <Link to="/" className="btn btn-primary">
          Back to feed
        </Link>
      </section>
    )
  }

  const inPlan = isInPlan(place.id)
  const fav = isFavorite(place.id)

  return (
    <div className="stack-lg place-detail">
      <Link to="/" className="text-link">
        ← Back to feed
      </Link>

      <div className="gallery">
        <div className="gallery-main">
          <img src={heroImage} alt={place.name} />
          <button
            type="button"
            className={`fav-btn floating${fav ? ' is-on' : ''}`}
            onClick={() => toggleFavorite(place.id)}
          >
            ★
          </button>
          {place.special && (
            <span className="special-pill">
              <Sparkles size={14} />
              {place.special}
            </span>
          )}
        </div>
        {place.images.length > 1 && (
          <div className="gallery-thumbs">
            {place.images.map((img) => (
              <button
                key={img}
                type="button"
                className={heroImage === img ? 'is-active' : ''}
                onClick={() => setActiveImage(img)}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <header className="place-detail-header">
        <div className="badge-row">
          <span className="pill">{CATEGORY_SINGULAR[place.category]}</span>
          <span className={`pill${place.openNow ? ' pill-green' : ''}`}>
            {place.openNow ? `Open until ${place.openUntil}` : 'Closed'}
          </span>
        </div>
        <h1 className="display">{place.name}</h1>
        <p className="place-detail-meta">
          <span className="rating">
            <Star size={14} fill="currentColor" /> {place.rating}
          </span>
          <span>·</span>
          <span>
            {priceLabel(place.priceRange)} · {place.currency}
          </span>
          <span>·</span>
          <span>
            <MapPin size={14} /> {place.neighborhood}, {place.area}
          </span>
        </p>
      </header>

      <div className="action-row">
        <button
          type="button"
          className={`btn ${inPlan ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => togglePlan(place.id)}
        >
          {inPlan ? <Check size={18} /> : <Plus size={18} />}
          {inPlan ? 'Added to outing' : 'Add to outing'}
        </button>
        <a
          className="btn btn-outline"
          href={directionsUrl([place])}
          target="_blank"
          rel="noreferrer"
        >
          <Navigation size={18} />
          Directions
        </a>
        <button type="button" className="btn btn-outline">
          <Share2 size={18} />
          Share
        </button>
      </div>

      {place.slots?.length > 0 && (
        <section className="card-panel">
          <h2>{place.slotLabel ?? 'Book a time'}</h2>
          <div className="slot-grid">
            {place.slots.map((s) => {
              const key = s.time + (s.label ?? '')
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!s.available}
                  className={`slot${slot === key ? ' is-active' : ''}`}
                  onClick={() => setSlot(key)}
                >
                  <strong>{s.time}</strong>
                  {s.label && <small>{s.label}</small>}
                </button>
              )
            })}
          </div>
        </section>
      )}

      <div className="tabs">
        {['overview', 'reviews', 'instagram', 'hours'].map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? 'is-active' : ''}
            onClick={() => setTab(t)}
          >
            {t === 'instagram' ? 'Instagram' : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="stack">
          <p className="lede">{place.description}</p>
          <div className="info-list">
            <div>
              <MapPin size={16} /> {place.address}
            </div>
            <div>
              <Phone size={16} /> {place.phone}
            </div>
            <div>
              <Clock size={16} /> {place.openNow ? `Open until ${place.openUntil}` : 'Closed now'}
            </div>
          </div>
          <div className="amenity-wrap">
            {place.amenities.map((a) => (
              <span key={a} className="pill">
                {a}
              </span>
            ))}
          </div>
          <div className="map-panel place-map">
            <div className="map-canvas map-canvas-sm">
              <PlaceMap place={place} />
            </div>
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="review-list">
          {reviews.map((r) => (
            <article key={r.id} className="review">
              <img src={r.avatar} alt="" className="avatar" />
              <div>
                <div className="review-head">
                  <strong>{r.author}</strong>
                  <span className="pill pill-sm">{r.source}</span>
                  <span className="muted">{r.date}</span>
                </div>
                <div className="rating">
                  <Star size={12} fill="currentColor" /> {r.rating}
                </div>
                <p>{r.text}</p>
                {r.businessReply && (
                  <blockquote>Business reply: {r.businessReply}</blockquote>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'instagram' && (
        <div className="stack">
          {igPosts.length === 0 ? (
            <p className="muted">No Instagram posts linked to this place yet.</p>
          ) : (
            igPosts.map((post) => (
              <article key={post.id} className="ig-card">
                <header className="ig-card-head">
                  <img src={post.userAvatar} alt="" className="avatar" />
                  <div className="ig-card-user">
                    <strong>@{post.username}</strong>
                    <span className="muted">{formatInstagramTime(post.timestamp)}</span>
                  </div>
                </header>
                <div className="ig-card-media">
                  <img src={post.mediaUrl} alt="" />
                </div>
                <p className="ig-likes">
                  {post.likeCount.toLocaleString()} likes · {post.commentsCount} comments
                </p>
                <p className="ig-caption">
                  <strong>@{post.username}</strong> {post.caption}
                </p>
                <ul className="ig-comments">
                  {post.comments.map((c) => (
                    <li key={c.id}>
                      <strong>@{c.username}</strong> {c.text}
                    </li>
                  ))}
                </ul>
              </article>
            ))
          )}
        </div>
      )}

      {tab === 'hours' && (
        <div className="hours-list">
          {place.hours.map((h) => (
            <div key={h.day} className="hours-row">
              <span>{h.day}</span>
              <span>{h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
