import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, MapPin, ExternalLink } from 'lucide-react'
import { getPlace } from '../data/outyahData'
import { formatInstagramTime } from '../lib/instagram'
import { useApp } from '../context/AppContext'

export default function InstagramPostCard({ post }) {
  const [showComments, setShowComments] = useState(false)
  const place = getPlace(post.placeId)
  const { isFavorite, toggleFavorite } = useApp()
  const fav = place ? isFavorite(place.id) : false

  return (
    <article className="ig-card">
      <header className="ig-card-head">
        <img src={post.userAvatar} alt="" className="avatar" />
        <div className="ig-card-user">
          <strong>@{post.username}</strong>
          {place && (
            <Link to={`/place/${place.id}`} className="ig-place-link">
              <MapPin size={12} />
              {place.name}
            </Link>
          )}
        </div>
        <span className="muted">{formatInstagramTime(post.timestamp)}</span>
      </header>

      {place ? (
        <Link to={`/place/${place.id}`} className="ig-card-media">
          <img src={post.mediaUrl} alt={post.caption?.slice(0, 80) || place.name} loading="lazy" />
        </Link>
      ) : (
        <div className="ig-card-media">
          <img src={post.mediaUrl} alt="" loading="lazy" />
        </div>
      )}

      <div className="ig-card-actions">
        {place && (
          <button
            type="button"
            className={`icon-btn${fav ? ' is-liked' : ''}`}
            aria-label={fav ? 'Remove favorite' : 'Save favorite'}
            onClick={() => toggleFavorite(place.id)}
          >
            <Heart size={22} fill={fav ? 'currentColor' : 'none'} />
          </button>
        )}
        <button
          type="button"
          className="icon-btn"
          aria-label="Toggle comments"
          onClick={() => setShowComments((v) => !v)}
        >
          <MessageCircle size={22} />
        </button>
        {post.permalink && (
          <a
            className="icon-btn"
            href={post.permalink}
            target="_blank"
            rel="noreferrer"
            aria-label="Open on Instagram"
          >
            <ExternalLink size={20} />
          </a>
        )}
      </div>

      <div className="ig-card-body">
        <p className="ig-likes">
          {(post.likeCount ?? 0).toLocaleString()} likes ·{' '}
          {(post.commentsCount ?? post.comments?.length ?? 0).toLocaleString()} comments
        </p>
        {post.caption && (
          <p className="ig-caption">
            <strong>@{post.username}</strong> {post.caption}
          </p>
        )}

        {(post.comments?.length > 0 || showComments) && (
          <button
            type="button"
            className="ig-comments-toggle"
            onClick={() => setShowComments((v) => !v)}
          >
            {showComments
              ? 'Hide comments'
              : `View comments (${post.comments?.length ?? 0})`}
          </button>
        )}

        {showComments && (
          <ul className="ig-comments">
            {(post.comments || []).map((c) => (
              <li key={c.id}>
                <strong>@{c.username}</strong> {c.text}
              </li>
            ))}
            {!post.comments?.length && (
              <li className="muted">No comments on this post yet.</li>
            )}
          </ul>
        )}
      </div>
    </article>
  )
}
