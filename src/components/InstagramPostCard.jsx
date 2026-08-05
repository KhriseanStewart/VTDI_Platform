import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, MapPin, ExternalLink } from 'lucide-react'
import { formatInstagramTime } from '../lib/instagram'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { cn, ui } from '../lib/ui'

export default function InstagramPostCard({ post }) {
  const [showComments, setShowComments] = useState(false)
  const { getPlace } = useData()
  const place = getPlace(post.placeId)
  const { isFavorite, toggleFavorite } = useApp()
  const fav = place ? isFavorite(place.id) : false

  return (
    <article className={ui.igCard}>
      <header className={ui.igCardHead}>
        <img src={post.userAvatar} alt="" className={ui.avatar} />
        <div className={ui.igCardUser}>
          <strong>@{post.username}</strong>
          {place && (
            <Link to={`/place/${place.id}`} className={ui.igPlaceLink}>
              <MapPin size={12} />
              {place.name}
            </Link>
          )}
        </div>
        <span className={ui.muted}>{formatInstagramTime(post.timestamp)}</span>
      </header>

      {place ? (
        <Link to={`/place/${place.id}`} className={ui.igCardMedia}>
          <img
            src={post.mediaUrl}
            alt={post.caption?.slice(0, 80) || place.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </Link>
      ) : (
        <div className={ui.igCardMedia}>
          <img
            src={post.mediaUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className={ui.igCardActions}>
        {place && (
          <button
            type="button"
            className={cn(ui.iconBtn, fav && ui.iconBtnLiked)}
            aria-label={fav ? 'Remove favorite' : 'Save favorite'}
            onClick={() => toggleFavorite(place.id)}
          >
            <Heart size={22} fill={fav ? 'currentColor' : 'none'} />
          </button>
        )}
        <button
          type="button"
          className={ui.iconBtn}
          aria-label="Toggle comments"
          onClick={() => setShowComments((v) => !v)}
        >
          <MessageCircle size={22} />
        </button>
        {post.permalink && (
          <a
            className={ui.iconBtn}
            href={post.permalink}
            target="_blank"
            rel="noreferrer"
            aria-label="Open on Instagram"
          >
            <ExternalLink size={20} />
          </a>
        )}
      </div>

      <div className={ui.igCardBody}>
        {((post.likeCount ?? 0) > 0 ||
          (post.commentsCount ?? post.comments?.length ?? 0) > 0) && (
          <p className={ui.igLikes}>
            {(post.likeCount ?? 0) > 0 && (
              <>{(post.likeCount ?? 0).toLocaleString()} likes</>
            )}
            {(post.likeCount ?? 0) > 0 &&
              (post.commentsCount ?? post.comments?.length ?? 0) > 0 &&
              ' · '}
            {(post.commentsCount ?? post.comments?.length ?? 0) > 0 && (
              <>
                {(post.commentsCount ?? post.comments?.length ?? 0).toLocaleString()}{' '}
                comments
              </>
            )}
          </p>
        )}
        {post.caption && (
          <p className={ui.igCaption}>
            <strong>@{post.username}</strong> {post.caption}
          </p>
        )}

        {(post.comments?.length > 0 || showComments) && (
          <button
            type="button"
            className={ui.igCommentsToggle}
            onClick={() => setShowComments((v) => !v)}
          >
            {showComments
              ? 'Hide comments'
              : `View comments (${post.comments?.length ?? 0})`}
          </button>
        )}

        {showComments && (
          <ul className={ui.igComments}>
            {(post.comments || []).map((c) => (
              <li key={c.id}>
                <strong>@{c.username}</strong> {c.text}
              </li>
            ))}
            {!post.comments?.length && (
              <li className={ui.muted}>No comments on this post yet.</li>
            )}
          </ul>
        )}
      </div>
    </article>
  )
}
