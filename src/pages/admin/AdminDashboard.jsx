import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, MapPin, Plus } from 'lucide-react'
import { CATEGORY_LABELS } from '../../data/outyahData'
import { useAuth } from '../../context/AuthContext'
import { mapEvent, mapPlace } from '../../lib/data'
import { eventStatus, eventStatusLabel } from '../../lib/events'
import { supabase } from '../../lib/supabase'
import { btn, cn, ui } from '../../lib/ui'

function formatAdded(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-JM', { month: 'short', day: 'numeric', year: 'numeric' })
}

function MineSection({ title, to, addLabel, empty, items, kind }) {
  return (
    <section className={cn(ui.cardFlat, 'overflow-hidden shadow-[var(--shadow-card)]')}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5">
        <div>
          <h2 className={ui.adminSubhead}>{title}</h2>
          <p className={cn(ui.small, 'mt-0.5')}>
            {items.length > 0 ? `${items.length} you added` : empty}
          </p>
        </div>
        <Link to={to} className={cn(btn(ui.btnOutline), ui.btnSm)}>
          <Plus size={14} />
          {addLabel}
        </Link>
      </div>

      {items.length === 0 ? (
        <p className={ui.adminEmptyInline}>{empty}</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={kind === 'place' ? `/place/${item.id}` : `/events/${item.id}`}
                className={cn('flex items-center gap-3 px-4 py-3 hover:bg-bg', ui.focus)}
              >
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="h-12 w-12 shrink-0 rounded-xl bg-border object-cover"
                />
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-[0.92rem]">
                    {kind === 'place' ? item.name : item.title}
                  </strong>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.78rem] text-muted">
                    {kind === 'place' ? (
                      <>
                        <span className={ui.pillMuted}>{CATEGORY_LABELS[item.category] || item.category}</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} />
                          {item.area}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={11} />
                          {item.date || 'Date TBA'}
                        </span>
                        <span>{item.area}</span>
                        <span className={ui.pillMuted}>{eventStatusLabel(eventStatus(item))}</span>
                      </>
                    )}
                    {item.createdAt && (
                      <span className="text-subtle">Added {formatAdded(item.createdAt)}</span>
                    )}
                  </span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-subtle" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div className="border-t border-border bg-bg/60 px-4 py-2.5 text-right">
          <Link to={to} className={ui.textLink}>
            Manage all
          </Link>
        </div>
      )}
    </section>
  )
}

export default function AdminDashboard() {
  const { user, profile } = useAuth()
  const [counts, setCounts] = useState({ places: 0, events: 0, posts: 0, comments: 0 })
  const [mine, setMine] = useState({ places: [], events: [] })
  const [loadingMine, setLoadingMine] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [places, events, posts, comments] = await Promise.all([
        supabase.from('places').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('post_comments').select('id', { count: 'exact', head: true }),
      ])
      setCounts({
        places: places.count || 0,
        events: events.count || 0,
        posts: posts.count || 0,
        comments: comments.count || 0,
      })
    })()
  }, [])

  useEffect(() => {
    if (!user?.id) {
      setMine({ places: [], events: [] })
      setLoadingMine(false)
      return undefined
    }

    let cancelled = false
    setLoadingMine(true)

    ;(async () => {
      const [placesRes, eventsRes] = await Promise.all([
        supabase
          .from('places')
          .select('id,name,area,category,image,created_at')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('events')
          .select('id,title,date_label,area,image,starts_at,created_at,recurring,ends_at')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
          .limit(8),
      ])

      if (cancelled) return

      if (placesRes.error || eventsRes.error) {
        setMine({ places: [], events: [] })
      } else {
        setMine({
          places: (placesRes.data || []).map(mapPlace),
          events: (eventsRes.data || []).map(mapEvent),
        })
      }
      setLoadingMine(false)
    })()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const firstName = profile?.name?.split(' ')[0] || 'your'

  return (
    <div className={ui.stackLg}>
      <header>
        <p className={ui.eyebrow}>Control center</p>
        <h1 className={ui.display}>Dashboard</h1>
        <p className={cn(ui.lede, 'mt-2')}>
          Manage venues, events, and community posts. Changes appear on the public app after
          refresh.
        </p>
      </header>

      <div className={ui.adminStatGrid}>
        <Link to="/admin/places" className={cn(ui.adminStat, ui.cardHover)}>
          <strong className={ui.adminStatValue}>{counts.places}</strong>
          <span className={ui.adminStatLabel}>Places</span>
        </Link>
        <Link to="/admin/events" className={cn(ui.adminStat, ui.cardHover)}>
          <strong className={ui.adminStatValue}>{counts.events}</strong>
          <span className={ui.adminStatLabel}>Events</span>
        </Link>
        <Link to="/admin/posts" className={cn(ui.adminStat, ui.cardHover)}>
          <strong className={ui.adminStatValue}>{counts.posts}</strong>
          <span className={ui.adminStatLabel}>Posts</span>
        </Link>
        <div className={ui.adminStat}>
          <strong className={ui.adminStatValue}>{counts.comments}</strong>
          <span className={ui.adminStatLabel}>Comments</span>
        </div>
      </div>

      <section className={ui.stack}>
        <div>
          <h2 className={ui.sectionHeadTitle}>Your catalog additions</h2>
          <p className={cn(ui.small, 'mt-1')}>
            Places and events {firstName} added through admin. Seeded catalog rows are not tagged.
          </p>
        </div>

        {loadingMine ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" aria-busy="true" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <MineSection
              title="Your places"
              to="/admin/places"
              addLabel="Add place"
              empty="Nothing here yet — add a venue from Places."
              items={mine.places}
              kind="place"
            />
            <MineSection
              title="Your events"
              to="/admin/events"
              addLabel="Add event"
              empty="Nothing here yet — add an event from Events."
              items={mine.events}
              kind="event"
            />
          </div>
        )}
      </section>
    </div>
  )
}
