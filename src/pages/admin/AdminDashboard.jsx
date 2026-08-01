import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ui } from '../../lib/ui'

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ places: 0, events: 0, posts: 0, comments: 0 })

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

  return (
    <div className={ui.stackLg}>
      <header>
        <p className={ui.eyebrow}>Control center</p>
        <h1 className={ui.display}>Dashboard</h1>
      </header>
      <div className={ui.adminStatGrid}>
        <Link to="/admin/places" className={ui.adminStat}>
          <strong className={ui.adminStatValue}>{counts.places}</strong>
          <span className={ui.adminStatLabel}>Places</span>
        </Link>
        <Link to="/admin/events" className={ui.adminStat}>
          <strong className={ui.adminStatValue}>{counts.events}</strong>
          <span className={ui.adminStatLabel}>Events</span>
        </Link>
        <Link to="/admin/posts" className={ui.adminStat}>
          <strong className={ui.adminStatValue}>{counts.posts}</strong>
          <span className={ui.adminStatLabel}>Posts</span>
        </Link>
        <div className={ui.adminStat}>
          <strong className={ui.adminStatValue}>{counts.comments}</strong>
          <span className={ui.adminStatLabel}>Comments</span>
        </div>
      </div>
      <p className={ui.lede}>
        Manage venues, events, and Instagram-style posts. Changes appear on the public app after
        refresh.
      </p>
    </div>
  )
}
