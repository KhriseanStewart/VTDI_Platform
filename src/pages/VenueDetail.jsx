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
  ArrowLeft,
  Heart,
} from 'lucide-react'
import { CATEGORY_SINGULAR, priceLabel } from '../data/outyahData'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { PlaceMap } from '../components/maps/GoogleMaps'
import EmptyState from '../components/EmptyState'
import PlaceReviews from '../components/PlaceReviews'
import VenuePhotoSubmit from '../components/VenuePhotoSubmit'
import { shareReel } from '../lib/reelMeta'
import { directionsUrl } from '../lib/maps'
import { formatInstagramTime } from '../lib/instagram'
import { btn, cn, ui } from '../lib/ui'

const TABS = ['overview', 'reviews', 'instagram', 'hours']

function tabLabel(tab, place) {
  if (tab === 'instagram') return 'Photos'
  if (tab === 'reviews') return `Reviews${place.reviewCount ? ` · ${place.reviewCount}` : ''}`
  return tab[0].toUpperCase() + tab.slice(1)
}

export default function VenueDetail() {
  const { id } = useParams()
  const { getPlace, posts, loading } = useData()
  const place = getPlace(id)
  const [tab, setTab] = useState('overview')
  const [activeImage, setActiveImage] = useState(null)
  const [slot, setSlot] = useState(null)
  const { isFavorite, toggleFavorite, isInPlan, togglePlan } = useApp()

  const igPosts = useMemo(() => posts.filter((p) => p.placeId === place?.id), [posts, place])
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
  const gallery = place.images?.length > 1 ? place.images : []
  const openLabel = place.openNow
    ? place.openUntil
      ? `Open until ${place.openUntil}`
      : 'Open now'
    : 'Closed now'

  return (
    <div className={ui.stackLg}>
      <div>
        <Link to="/explore" className={ui.backLink}>
          <ArrowLeft size={15} />
          Back to explore
        </Link>

        <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <span className={ui.pill}>{CATEGORY_SINGULAR[place.category]}</span>
              {place.openNow != null && (
                <span className={place.openNow ? ui.pill : ui.pillMuted}>{openLabel}</span>
              )}
              {place.special && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[0.75rem] font-bold text-on-accent">
                  <Sparkles size={13} />
                  {place.special}
                </span>
              )}
            </div>
            <h1 className={ui.display}>{place.name}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.9rem] text-muted">
              {place.rating > 0 && (
                <>
                  <span className={ui.rating}>
                    <Star size={14} fill="currentColor" /> {place.rating}
                    {place.reviewCount ? (
                      <span className="font-medium text-muted">({place.reviewCount})</span>
                    ) : null}
                  </span>
                  <span aria-hidden className="text-border-strong">
                    ·
                  </span>
                </>
              )}
              {place.priceRange && (
                <>
                  <span className="font-medium">{priceLabel(place.priceRange)}</span>
                  <span aria-hidden className="text-border-strong">
                    ·
                  </span>
                </>
              )}
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} />
                {[place.neighborhood, place.area].filter(Boolean).join(', ')}
              </span>
            </p>
          </div>

          <button
            type="button"
            className={cn(btn(ui.btnOutline), ui.btnSm, 'hidden shrink-0 sm:inline-flex', fav && 'text-danger')}
            onClick={() => toggleFavorite(place.id)}
            aria-pressed={fav}
          >
            <Heart size={15} fill={fav ? 'currentColor' : 'none'} />
            {fav ? 'Saved' : 'Save'}
          </button>
        </header>
      </div>

      <div>
        <div className={ui.heroFrame}>
          <img src={heroImage} alt={place.name} className={cn(ui.heroMedia, 'lg:aspect-21/9')} />
          <button
            type="button"
            className={cn(ui.favBtn, ui.favBtnFloating, fav && ui.favBtnOn, 'sm:hidden')}
            onClick={() => toggleFavorite(place.id)}
            aria-label={fav ? 'Remove from favorites' : 'Save to favorites'}
            aria-pressed={fav}
          >
            <Heart size={17} fill={fav ? 'currentColor' : 'none'} />
          </button>
        </div>
        {gallery.length > 0 && (
          <div className={ui.thumbRail}>
            {gallery.map((img) => (
              <button
                key={img}
                type="button"
                className={cn(ui.thumb, heroImage === img && ui.thumbActive)}
                onClick={() => setActiveImage(img)}
                aria-label="Show photo"
                aria-current={heroImage === img}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={ui.detailGrid}>
        <aside className={cn(ui.detailAside, 'lg:col-start-2 lg:row-start-1')}>
          <div className={cn(ui.cardPanel, 'flex flex-col gap-3')}>
            <button
              type="button"
              className={cn(btn(inPlan ? ui.btnSecondary : ui.btnPrimary), ui.btnBlock)}
              onClick={() => togglePlan(place.id)}
            >
              {inPlan ? <Check size={17} /> : <Plus size={17} />}
              {inPlan ? 'Added to outing' : 'Add to outing'}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <a
                className={btn(ui.btnOutline, ui.btnSm)}
                href={directionsUrl([place])}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation size={15} />
                Directions
              </a>
              <button
                type="button"
                className={btn(ui.btnOutline, ui.btnSm)}
                onClick={() => shareReel(place.name, `/place/${place.id}`)}
              >
                <Share2 size={15} />
                Share
              </button>
            </div>

            <div className={ui.divider} />

            <div className="grid gap-2.5">
              {place.address && (
                <p className={ui.infoRow}>
                  <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                  {place.address}
                </p>
              )}
              {place.phone && (
                <a
                  href={`tel:${place.phone.replace(/\s/g, '')}`}
                  className={cn(ui.infoRow, 'hover:text-primary')}
                >
                  <Phone size={16} className="mt-0.5 shrink-0 text-primary" />
                  {place.phone}
                </a>
              )}
              {place.openNow != null && (
                <p className={ui.infoRow}>
                  <Clock size={16} className="mt-0.5 shrink-0 text-primary" />
                  {openLabel}
                </p>
              )}
            </div>
          </div>

          {place.slots?.length > 0 && (
            <section className={ui.cardPanel}>
              <h2 className={ui.h3}>{place.slotLabel ?? 'Book a time'}</h2>
              <p className={cn(ui.small, 'mt-1.5')}>
                Pick a window, then call the venue to confirm. OutYah doesn&apos;t take payments.
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2">
                {place.slots.map((s) => {
                  const key = s.time + (s.label ?? '')
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!s.available}
                      className={cn(
                        'flex cursor-pointer flex-col items-start gap-0.5 rounded-xl border border-border bg-card px-3 py-2 text-left transition-colors duration-150 hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-40',
                        slot === key && 'border-primary bg-primary-soft',
                      )}
                      onClick={() => setSlot(key)}
                      aria-pressed={slot === key}
                    >
                      <strong className="text-[0.9rem]">{s.time}</strong>
                      {s.label && <small className="text-[0.75rem] text-muted">{s.label}</small>}
                    </button>
                  )
                })}
              </div>
              {slot && place.phone && (
                <a
                  href={`tel:${place.phone.replace(/\s/g, '')}`}
                  className={cn(btn(ui.btnPrimary), ui.btnBlock, 'mt-3.5')}
                >
                  <Phone size={16} /> Call to book
                </a>
              )}
            </section>
          )}

          {!place.slots?.length && place.phone && (
            <section className={ui.cardPanel}>
              <h2 className={ui.h3}>Booking &amp; contact</h2>
              <p className={cn(ui.small, 'mt-1.5 mb-3.5')}>
                Contact the venue directly to reserve a table or ask about tickets.
              </p>
              <a
                href={`tel:${place.phone.replace(/\s/g, '')}`}
                className={cn(btn(ui.btnPrimary), ui.btnBlock)}
              >
                <Phone size={16} /> {place.phone}
              </a>
            </section>
          )}
        </aside>

        <div className={cn(ui.stack, 'min-w-0 lg:col-start-1 lg:row-start-1')}>
          <div className={ui.tabs} role="tablist">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                className={cn(ui.tab, tab === t && ui.tabActive)}
                onClick={() => setTab(t)}
              >
                {tabLabel(t, place)}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className={ui.stack}>
              <p className={cn(ui.lede, 'max-w-none')}>{place.description}</p>
              {(place.amenities || []).length > 0 && (
                <div>
                  <h3 className={cn(ui.h3, 'mb-2.5')}>What&apos;s here</h3>
                  <div className="flex flex-wrap gap-2">
                    {place.amenities.map((a) => (
                      <span key={a} className={ui.pillMuted}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className={cn(ui.h3, 'mb-2.5')}>Where to find it</h3>
                <div className={ui.mapPanel}>
                  <div className={cn(ui.mapCanvas, ui.mapCanvasSm)}>
                    <PlaceMap place={place} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'reviews' && <PlaceReviews placeId={place.id} placeRating={place.rating} />}

          {tab === 'instagram' && (
            <div className={ui.stack}>
              {igPosts.length === 0 ? (
                <EmptyState
                  icon={Camera}
                  eyebrow="Photos"
                  title="No community photos yet"
                  description="This venue is already live. Share a photo for the feed — it appears after admin review."
                />
              ) : (
                <div className={ui.igFeed}>
                  {igPosts.map((post) => (
                    <article key={post.id} className={ui.igCard}>
                      <header className={ui.igCardHead}>
                        <img src={post.userAvatar} alt="" className={ui.avatarSm} />
                        <div className={ui.igCardUser}>
                          <strong className="truncate text-[0.88rem]">@{post.username}</strong>
                          <span className="text-[0.78rem] text-subtle">
                            {formatInstagramTime(post.timestamp)}
                          </span>
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
                  ))}
                </div>
              )}
              <VenuePhotoSubmit placeId={place.id} placeName={place.name} />
            </div>
          )}

          {tab === 'hours' && (
            <div className={ui.listGroup}>
              {place.hours.map((h) => (
                <div
                  key={h.day}
                  className="flex items-center justify-between px-4 py-3 text-[0.92rem]"
                >
                  <span className="font-semibold">{h.day}</span>
                  <span className={h.closed ? 'text-muted' : 'tabular-nums'}>
                    {h.closed ? 'Closed' : `${h.open} – ${h.close}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
