import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

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
    <div className="stack-lg">
      <header>
        <p className="eyebrow">Control center</p>
        <h1 className="display">Dashboard</h1>
      </header>
      <div className="admin-stat-grid">
        <Link to="/admin/places" className="admin-stat">
          <strong>{counts.places}</strong>
          <span>Places</span>
        </Link>
        <Link to="/admin/events" className="admin-stat">
          <strong>{counts.events}</strong>
          <span>Events</span>
        </Link>
        <Link to="/admin/posts" className="admin-stat">
          <strong>{counts.posts}</strong>
          <span>Posts</span>
        </Link>
        <div className="admin-stat">
          <strong>{counts.comments}</strong>
          <span>Comments</span>
        </div>
      </div>
      <p className="lede">
        Manage venues, events, and Instagram-style posts. Changes appear on the public app after
        refresh.
      </p>
    </div>
  )
}
