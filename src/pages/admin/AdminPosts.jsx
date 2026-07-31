import { useEffect, useState } from 'react'
import { mapPost, postToRow } from '../../lib/data'
import { supabase } from '../../lib/supabase'
import { useData } from '../../context/DataContext'

const empty = {
  id: '',
  placeId: '',
  username: '',
  userAvatar: '',
  caption: '',
  mediaUrl: '',
  mediaType: 'IMAGE',
  permalink: 'https://www.instagram.com/',
  timestamp: new Date().toISOString(),
  likeCount: 0,
  commentsCount: 0,
}

export default function AdminPosts() {
  const { refresh, places } = useData()
  const [rows, setRows] = useState([])
  const [comments, setComments] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const [{ data: posts, error: pErr }, { data: comms, error: cErr }] = await Promise.all([
      supabase.from('posts').select('*').order('posted_at', { ascending: false }),
      supabase.from('post_comments').select('*').order('posted_at', { ascending: false }),
    ])
    if (pErr || cErr) setError(pErr?.message || cErr?.message)
    else {
      const byPost = {}
      for (const c of comms || []) (byPost[c.post_id] ||= []).push(c)
      setRows((posts || []).map((p) => mapPost(p, byPost[p.id] || [])))
      setComments(comms || [])
    }
  }

  useEffect(() => {
    load()
  }, [])

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSave(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const payload = {
      ...form,
      userAvatar:
        form.userAvatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(form.username || 'ig')}`,
    }
    const { error: err } = await supabase.from('posts').upsert(postToRow(payload))
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    setForm(empty)
    setEditing(false)
    await load()
    await refresh()
  }

  async function onDelete(id) {
    if (!confirm(`Delete post ${id}?`)) return
    const { error: err } = await supabase.from('posts').delete().eq('id', id)
    if (err) setError(err.message)
    else {
      await load()
      await refresh()
    }
  }

  async function onDeleteComment(id) {
    if (!confirm('Delete this comment?')) return
    const { error: err } = await supabase.from('post_comments').delete().eq('id', id)
    if (err) setError(err.message)
    else {
      await load()
      await refresh()
    }
  }

  return (
    <div className="stack-lg">
      <header>
        <h1 className="display">Posts</h1>
        <p className="muted">Instagram-style feed items + comment moderation</p>
      </header>
      {error && <p className="form-error">{error}</p>}

      <form className="card-panel stack admin-form" onSubmit={onSave}>
        <h2>{editing ? 'Edit post' : 'Add post'}</h2>
        <div className="admin-form-grid">
          <label className="field">
            <span>ID</span>
            <input
              value={form.id}
              onChange={(e) => setField('id', e.target.value)}
              required
              disabled={editing}
            />
          </label>
          <label className="field">
            <span>Username</span>
            <input
              value={form.username}
              onChange={(e) => setField('username', e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Linked place</span>
            <select value={form.placeId} onChange={(e) => setField('placeId', e.target.value)}>
              <option value="">None</option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Likes</span>
            <input
              type="number"
              value={form.likeCount}
              onChange={(e) => setField('likeCount', Number(e.target.value))}
            />
          </label>
          <label className="field full">
            <span>Media URL</span>
            <input
              value={form.mediaUrl}
              onChange={(e) => setField('mediaUrl', e.target.value)}
              required
            />
          </label>
        </div>
        <label className="field">
          <span>Caption</span>
          <textarea
            rows={3}
            value={form.caption}
            onChange={(e) => setField('caption', e.target.value)}
          />
        </label>
        <div className="action-row">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Update' : 'Create'}
          </button>
          {editing && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setForm(empty)
                setEditing(false)
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Post</th>
              <th>Place</th>
              <th>Engagement</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="admin-empty-inline">No posts yet — create one above.</div>
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>@{p.username}</strong>
                    <div className="muted">{p.caption?.slice(0, 80)}</div>
                  </td>
                  <td>{p.placeId || '—'}</td>
                  <td>
                    {p.likeCount} likes · {p.comments?.length || 0} comments
                  </td>
                  <td className="admin-row-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        setForm({
                          id: p.id,
                          placeId: p.placeId || '',
                          username: p.username,
                          userAvatar: p.userAvatar,
                          caption: p.caption,
                          mediaUrl: p.mediaUrl,
                          mediaType: p.mediaType,
                          permalink: p.permalink,
                          timestamp: p.timestamp,
                          likeCount: p.likeCount,
                          commentsCount: p.commentsCount,
                        })
                        setEditing(true)
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => onDelete(p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="stack">
        <h2>Comments</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Comment</th>
                <th>Post</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.id}>
                  <td>@{c.username}</td>
                  <td>{c.body}</td>
                  <td className="muted">{c.post_id}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => onDeleteComment(c.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
