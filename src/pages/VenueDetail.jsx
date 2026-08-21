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
  SearchX,
  Camera,
} from 'lucide-react'
import { CATEGORY_SINGULAR, priceLabel } from '../data/outyahData'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { PlaceMap } from '../components/maps/GoogleMaps'
import EmptyState from '../components/EmptyState'
import PlaceReviews from '../components/PlaceReviews'
import VenuePhotoSubmit from '../components/VenuePhotoSubmit'
import { directionsUrl } from '../lib/maps'
import { formatInstagramTime } from '../lib/instagram'
import { btn, cn, ui } from '../lib/ui'

const pill =
  'inline-flex items-center rounded-full bg-[color-mix(in_oklab,var(--color-fg)_6%,transparent)] px-[0.65rem] py-[0.3rem] text-[0.75rem] font-semibold'

export default function VenueDetail() {
  const { id } = useParams()
  const { getPlace, posts, loading } = useData()
  const place = getPlace(id)
  const [tab, setTab] = useState('overview')
  const [activeImage, setActiveImage] = useState(null)
  const [slot, setSlot] = useState(null)
  const { isFavorite, toggleFavorite, isInPlan, togglePlan } = useApp()

  const igPosts = useMemo(
    () => posts.filter((p) => p.placeId === place?.id),
    [posts, place],
  )
  const heroImage = activeImage || place?.images?.[0] || place?.image

  if (loading) return <p className={ui.muted}>Loading place…</p>

  if (!place) {
    return (
      <EmptyState
        icon={SearchX}
        eyebrow="404"
        title="Place not found"
        description="This venue isn't in Supabase — it may have been removed."
        action={
          <Link to="/explore" className={btn(ui.btnPrimary)}>
            Back to explore
          </Link>
        }
      />
    )
  }

  const inPlan = isInPlan(place.id)
  const fav = isFavorite(place.id)

  return (
    <div className={ui.stackLg}>
      <Link to="/explore" className={ui.textLink}>
        ← Back to explore
      </Link>

      <div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[1.1rem]">
          <img src={heroImage} alt={place.name} className="h-full w-full object-cover" />
          <button
            type="button"
            className={cn(ui.favBtn, ui.favBtnFloating, fav && ui.favBtnOn)}
            onClick={() => toggleFavorite(place.id)}
          >
            ★
          </button>
          {place.special && (
            <span className="absolute bottom-[0.85rem] left-[0.85rem] inline-flex items-center gap-[0.35rem] rounded-full bg-accent px-3 py-[0.45rem] text-[0.75rem] font-bold text-on-accent">
              <Sparkles size={14} />
              {place.special}
            </span>
          )}
        </div>
        {place.images.length > 1 && (
          <div className="mt-[0.65rem] flex gap-2 overflow-x-auto">
            {place.images.map((img) => (
              <button
                key={img}
                type="button"
                className={cn(
                  'h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-[0.85rem] border-2 border-transparent p-0 opacity-70',
                  heroImage === img && 'border-primary opacity-100',
                )}
                onClick={() => setActiveImage(img)}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <header>
        <div className="flex flex-wrap gap-2">
          <span className={pill}>{CATEGORY_SINGULAR[place.category]}</span>
          {place.openNow != null && (
            <span className={cn(pill, place.openNow && 'bg-primary-soft text-primary')}>
              {place.openNow
                ? place.openUntil
                  ? `Open until ${place.openUntil}`
                  : 'Open now'
                : 'Closed'}
            </span>
          )}
        </div>
        <h1 className={ui.display}>{place.name}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-[0.45rem] text-[0.9rem] text-muted">
          {place.rating > 0 && (
            <>
              <span className={ui.rating}>
                <Star size={14} fill="currentColor" /> {place.rating}
              </span>
              <span>·</span>
            </>
          )}
          <span>{priceLabel(place.priceRange)}</span>
          <span>·</span>
          <span>
            <MapPin size={14} /> {place.neighborhood}, {place.area}
          </span>
        </p>
      </header>

      <div className={ui.actionRow}>
        <button
          type="button"
          className={btn(inPlan ? ui.btnSecondary : ui.btnPrimary)}
          onClick={() => togglePlan(place.id)}
        >
          {inPlan ? <Check size={18} /> : <Plus size={18} />}
          {inPlan ? 'Added to outing' : 'Add to outing'}
        </button>
        <a
          className={btn(ui.btnOutline)}
          href={directionsUrl([place])}
          target="_blank"
          rel="noreferrer"
        >
          <Navigation size={18} />
          Directions
        </a>
        <button type="button" className={btn(ui.btnOutline)}>
          <Share2 size={18} />
          Share
        </button>
      </div>

      {place.slots?.length > 0 && (
        <section className={ui.cardPanel}>
          <h2 className="mb-[0.85rem] text-[1.05rem] font-bold">
            {place.slotLabel ?? 'Book a time'}
          </h2>
          <p className={cn(ui.muted, 'mb-3 text-sm')}>
            Pick a preferred window, then call the venue to confirm. OutYah does not take
            payments.
          </p>
          <div className="flex flex-wrap gap-2">
            {place.slots.map((s) => {
              const key = s.time + (s.label ?? '')
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!s.available}
                  className={cn(
                    'flex cursor-pointer flex-col items-start gap-[0.15rem] rounded-[0.85rem] border border-border bg-card px-[0.8rem] py-[0.55rem] disabled:cursor-not-allowed disabled:opacity-40',
                    slot === key && 'border-primary bg-primary-soft',
                  )}
                  onClick={() => setSlot(key)}
                >
                  <strong>{s.time}</strong>
                  {s.label && <small className="text-muted">{s.label}</small>}
                </button>
              )
            })}
          </div>
          {slot && place.phone && (
            <a href={`tel:${place.phone.replace(/\s/g, '')}`} className={cn(btn(ui.btnPrimary), 'mt-3')}>
              <Phone size={16} /> Call to book · {place.phone}
            </a>
          )}
        </section>
      )}

      {!place.slots?.length && place.phone && (
        <section className={ui.cardPanel}>
          <h2 className="mb-[0.55rem] text-[1.05rem] font-bold">Booking & contact</h2>
          <p className={cn(ui.muted, 'mb-3 text-sm')}>
            Contact the venue directly to reserve a table or ask about tickets.
          </p>
          <a href={`tel:${place.phone.replace(/\s/g, '')}`} className={btn(ui.btnPrimary)}>
            <Phone size={16} /> {place.phone}
          </a>
        </section>
      )}

      <div className="flex gap-[0.35rem] border-b border-border">
        {['overview', 'reviews', 'instagram', 'hours'].map((t) => (
          <button
            key={t}
            type="button"
            className={cn(
              'cursor-pointer border-none border-b-2 border-transparent bg-transparent px-[0.9rem] py-[0.7rem] font-semibold text-muted',
              tab === t && 'border-b-primary text-primary',
            )}
            onClick={() => setTab(t)}
          >
            {t === 'instagram'
              ? 'Instagram'
              : t === 'reviews'
                ? `Reviews${place.reviewCount ? ` (${place.reviewCount})` : ''}`
                : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className={ui.stack}>
          <p className={ui.lede}>{place.description}</p>
          <div className="grid gap-[0.65rem]">
            {place.address && (
              <div className="flex items-center gap-[0.55rem] text-muted">
                <MapPin size={16} /> {place.address}
              </div>
            )}
            {place.phone && (
              <div className="flex items-center gap-[0.55rem] text-muted">
                <Phone size={16} /> {place.phone}
              </div>
            )}
            {place.openNow != null && (
              <div className="flex items-center gap-[0.55rem] text-muted">
                <Clock size={16} />{' '}
                {place.openNow
                  ? place.openUntil
                    ? `Open until ${place.openUntil}`
                    : 'Open now'
                  : 'Closed now'}
              </div>
            )}
          </div>
          {(place.amenities || []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {place.amenities.map((a) => (
              <span key={a} className={pill}>
                {a}
              </span>
            ))}
          </div>
          )}
          <div className={cn(ui.mapPanel, 'mt-1')}>
            <div className={cn(ui.mapCanvas, ui.mapCanvasSm)}>
              <PlaceMap place={place} />
            </div>
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <PlaceReviews placeId={place.id} placeRating={place.rating} />
      )}

      {tab === 'instagram' && (
        <div className={ui.stack}>
          {igPosts.length === 0 ? (
            <EmptyState
              icon={Camera}
              eyebrow="Posts"
              title="No community posts yet"
              description="This venue is already live. Optional: share a photo for the feed — it appears after admin review."
            />
          ) : (
            igPosts.map((post) => (
              <article key={post.id} className={ui.igCard}>
                <header className={ui.igCardHead}>
                  <img src={post.userAvatar} alt="" className={ui.avatar} />
                  <div className={ui.igCardUser}>
                    <strong>@{post.username}</strong>
                    <span className={ui.muted}>{formatInstagramTime(post.timestamp)}</span>
                  </div>
                </header>
                <div className={ui.igCardMedia}>
                  <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <p className={ui.igCaption}>
                  <strong>@{post.username}</strong> {post.caption}
                </p>
                {(post.likeCount > 0 || post.commentsCount > 0) && (
                  <p className={ui.igLikes}>
                    {post.likeCount > 0 && <>{post.likeCount.toLocaleString()} likes</>}
                    {post.likeCount > 0 && post.commentsCount > 0 && ' · '}
                    {post.commentsCount > 0 && <>{post.commentsCount} comments</>}
                  </p>
                )}
                {(post.comments?.length ?? 0) > 0 && (
                  <ul className={ui.igComments}>
                    {post.comments.map((c) => (
                      <li key={c.id}>
                        <strong>@{c.username}</strong> {c.text}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))
          )}
          <VenuePhotoSubmit placeId={place.id} placeName={place.name} />
        </div>
      )}

      {tab === 'hours' && (
        <div className="grid gap-[0.45rem]">
          {place.hours.map((h) => (
            <div key={h.day} className="flex justify-between border-b border-border py-[0.65rem]">
              <span>{h.day}</span>
              <span>{h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
