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

  const reviews = useMemo(() => place?.reviews ?? [], [place])
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
          <Link to="/" className={btn(ui.btnPrimary)}>
            Back to feed
          </Link>
        }
      />
    )
  }

  const inPlan = isInPlan(place.id)
  const fav = isFavorite(place.id)

  return (
    <div className={ui.stackLg}>
      <Link to="/" className={ui.textLink}>
        ← Back to feed
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
          <span className={cn(pill, place.openNow && 'bg-primary-soft text-primary')}>
            {place.openNow ? `Open until ${place.openUntil}` : 'Closed'}
          </span>
        </div>
        <h1 className={ui.display}>{place.name}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-[0.45rem] text-[0.9rem] text-muted">
          <span className={ui.rating}>
            <Star size={14} fill="currentColor" /> {place.rating}
          </span>
          <span>·</span>
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
            {t === 'instagram' ? 'Instagram' : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className={ui.stack}>
          <p className={ui.lede}>{place.description}</p>
          <div className="grid gap-[0.65rem]">
            <div className="flex items-center gap-[0.55rem] text-muted">
              <MapPin size={16} /> {place.address}
            </div>
            <div className="flex items-center gap-[0.55rem] text-muted">
              <Phone size={16} /> {place.phone}
            </div>
            <div className="flex items-center gap-[0.55rem] text-muted">
              <Clock size={16} /> {place.openNow ? `Open until ${place.openUntil}` : 'Closed now'}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {place.amenities.map((a) => (
              <span key={a} className={pill}>
                {a}
              </span>
            ))}
          </div>
          <div className={cn(ui.mapPanel, 'mt-1')}>
            <div className={cn(ui.mapCanvas, ui.mapCanvasSm)}>
              <PlaceMap place={place} />
            </div>
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="grid gap-4">
          {reviews.map((r) => (
            <article key={r.id} className="flex gap-3 rounded-[0.9rem] border border-border bg-card p-4">
              <img src={r.avatar} alt="" className={ui.avatar} />
              <div>
                <div className="flex flex-wrap items-center gap-[0.4rem]">
                  <strong>{r.author}</strong>
                  <span className={cn(pill, 'text-[0.68rem]')}>{r.source}</span>
                  <span className={ui.muted}>{r.date}</span>
                </div>
                <div className={ui.rating}>
                  <Star size={12} fill="currentColor" /> {r.rating}
                </div>
                <p>{r.text}</p>
                {r.businessReply && (
                  <blockquote className="mt-[0.65rem] rounded-r-[0.75rem] border-l-[3px] border-l-primary bg-primary-soft px-3 py-[0.65rem] text-[0.88rem] text-fg">
                    Business reply: {r.businessReply}
                  </blockquote>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'instagram' && (
        <div className={ui.stack}>
          {igPosts.length === 0 ? (
            <EmptyState
              icon={Camera}
              eyebrow="Posts"
              title="No posts for this place"
              description="When the community (or admin) tags this venue, photos and comments will show here."
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
                <p className={ui.igLikes}>
                  {post.likeCount.toLocaleString()} likes · {post.commentsCount} comments
                </p>
                <p className={ui.igCaption}>
                  <strong>@{post.username}</strong> {post.caption}
                </p>
                <ul className={ui.igComments}>
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
