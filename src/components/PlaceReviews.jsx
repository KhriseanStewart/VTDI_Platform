import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, MessageSquareQuote } from 'lucide-react'
import { createPlaceReview, fetchReviewsForPlace } from '../lib/data'
import {
  REVIEW_SOURCES,
  averageRating,
  formatReviewDate,
  reviewSourceMeta,
} from '../lib/reviews'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import EmptyState from './EmptyState'
import { btn, cn, ui } from '../lib/ui'

function SourceBadge({ source }) {
  const meta = reviewSourceMeta(source)
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-bold"
      style={{ color: meta.color, background: meta.soft }}
      title={`Imported from ${meta.label}`}
    >
      <span className="font-semibold opacity-70">via</span>
      {meta.label}
    </span>
  )
}

function Stars({ value, onChange, size = 16 }) {
  const interactive = typeof onChange === 'function'
  return (
    <div className="inline-flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          className={cn(
            'p-0',
            interactive ? 'cursor-pointer border-none bg-transparent' : 'cursor-default border-none bg-transparent',
            n <= value ? 'text-accent' : 'text-border',
          )}
          onClick={() => onChange?.(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star size={size} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}

export default function PlaceReviews({ placeId, placeRating }) {
  const { user, profile } = useAuth()
  const { refresh } = useData()
  const [reviews, setReviews] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const rows = await fetchReviewsForPlace(placeId)
      setReviews(rows)
    } catch (err) {
      setError(err.message || 'Could not load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [placeId])

  const filtered = useMemo(() => {
    if (filter === 'all') return reviews
    return reviews.filter((r) => r.source === filter)
  }, [reviews, filter])

  const displayRating =
    placeRating != null && placeRating > 0 ? placeRating : averageRating(reviews)
  const sourcesPresent = useMemo(() => {
    const set = new Set(reviews.map((r) => r.source))
    return Object.keys(REVIEW_SOURCES).filter((s) => set.has(s))
  }, [reviews])

  async function onSubmit(e) {
    e.preventDefault()
    if (!user) return
    if (!text.trim()) {
      setError('Write a short review before posting.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const author =
        profile?.name || user.email?.split('@')[0] || 'OutYah guest'
      const avatar =
        profile?.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author)}`
      await createPlaceReview({
        placeId,
        rating,
        text: text.trim(),
        author,
        avatar,
        userId: user.id,
      })
      setText('')
      setRating(5)
      await load()
      await refresh()
    } catch (err) {
      setError(err.message || 'Could not post review')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className={ui.muted}>Loading reviews…</p>

  return (
    <div className={ui.stack}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-lg font-bold">
            <Star size={18} className="text-accent" fill="currentColor" />
            {displayRating || '—'}
            <span className={cn(ui.muted, 'text-sm font-semibold')}>
              · {reviews.length} review{reviews.length === 1 ? '' : 's'} shown
            </span>
          </p>
          <p className={cn(ui.muted, 'mt-1 text-sm')}>
            Live Google reviews (and OutYah when you post). Each one tagged by source.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className={cn(
              ui.chip,
              'py-1.5 text-[0.78rem]',
              filter === 'all' && ui.chipActive,
            )}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {sourcesPresent.map((s) => (
            <button
              key={s}
              type="button"
              className={cn(
                ui.chip,
                'py-1.5 text-[0.78rem]',
                filter === s && ui.chipActive,
              )}
              onClick={() => setFilter(s)}
            >
              {REVIEW_SOURCES[s].label}
            </button>
          ))}
        </div>
      </div>

      {user ? (
        <form className={cn(ui.cardPanel, ui.stack)} onSubmit={onSubmit}>
          <h3 className="text-[1rem] font-bold">Write an OutYah review</h3>
          <div className="flex items-center gap-3">
            <span className={ui.muted}>Your rating</span>
            <Stars value={rating} onChange={setRating} size={22} />
          </div>
          <textarea
            className={ui.fieldControl}
            rows={3}
            placeholder={`What was the vibe at this spot?`}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {error && <p className={ui.formError}>{error}</p>}
          <button type="submit" className={btn(ui.btnPrimary)} disabled={busy}>
            {busy ? 'Posting…' : 'Post review'}
          </button>
        </form>
      ) : (
        <p className={ui.note}>
          <Link to={`/auth?next=/place/${placeId}`} className={ui.textLink}>
            Sign in
          </Link>{' '}
          to leave an OutYah review. Imported reviews from other platforms stay visible either way.
        </p>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuote}
          eyebrow="Reviews"
          title={reviews.length === 0 ? 'No reviews yet' : 'No matches'}
          description={
            reviews.length === 0
              ? 'Be the first to leave an OutYah review — or check back when Google reviews sync.'
              : 'Try another source filter.'
          }
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
            >
              <img
                src={
                  r.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.author)}`
                }
                alt=""
                className={ui.avatar}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong>{r.author}</strong>
                  <SourceBadge source={r.source} />
                  <span className={cn(ui.muted, 'text-sm')}>{formatReviewDate(r.date)}</span>
                </div>
                <div className="mt-1">
                  <Stars value={r.rating} size={14} />
                </div>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-fg">{r.text}</p>
                {r.businessReply && (
                  <blockquote className="mt-3 rounded-r-[0.75rem] border-l-[3px] border-l-primary bg-primary-soft px-3 py-2.5 text-[0.88rem]">
                    <span className="font-semibold text-primary">Business reply · </span>
                    {r.businessReply}
                  </blockquote>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
