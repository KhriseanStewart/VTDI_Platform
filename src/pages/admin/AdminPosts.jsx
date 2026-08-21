import { startTransition, useEffect, useState } from 'react'
import { mapPost, postToRow, setPostStatus } from '../../lib/data'
import { supabase } from '../../lib/supabase'
import { useData } from '../../context/DataContext'
import { cn, ui } from '../../lib/ui'

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
  status: 'approved',
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
    let cancelled = false
    ;(async () => {
      const [{ data: posts, error: pErr }, { data: comms, error: cErr }] = await Promise.all([
        supabase.from('posts').select('*').order('posted_at', { ascending: false }),
        supabase.from('post_comments').select('*').order('posted_at', { ascending: false }),
      ])
      if (cancelled) return
      startTransition(() => {
        if (pErr || cErr) setError(pErr?.message || cErr?.message)
        else {
          const byPost = {}
          for (const c of comms || []) (byPost[c.post_id] ||= []).push(c)
          setRows((posts || []).map((p) => mapPost(p, byPost[p.id] || [])))
          setComments(comms || [])
        }
      })
    })()
    return () => {
      cancelled = true
    }
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
      status: form.status || 'approved',
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

  async function onModerate(id, status) {
    setError('')
    try {
      await setPostStatus(id, status)
      await load()
      await refresh()
    } catch (err) {
      setError(err.message)
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

  const pending = rows.filter((p) => p.status === 'pending')
  const placeName = (id) => places.find((p) => p.id === id)?.name || id || '—'

  return (
    <div className={ui.stackLg}>
      <header>
        <h1 className={ui.display}>Posts</h1>
        <p className={ui.muted}>Feed items, user photo submissions, and comment moderation</p>
      </header>
      {error && <p className={ui.formError}>{error}</p>}

      {pending.length > 0 && (
        <section className={ui.stack}>
          <h2 className="text-[1.05rem] font-semibold">Approval queue ({pending.length})</h2>
          <div className={ui.adminTableWrap}>
            <table className={ui.adminTable}>
              <thead>
                <tr>
                  <th className={ui.adminTh}>Preview</th>
                  <th className={ui.adminTh}>Submitter</th>
                  <th className={ui.adminTh}>Place</th>
                  <th className={ui.adminTh} />
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.id}>
                    <td className={ui.adminTd}>
                      <img src={p.mediaUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    </td>
                    <td className={ui.adminTd}>
                      <strong>@{p.username}</strong>
                      <div className={ui.muted}>{p.caption?.slice(0, 80) || 'No caption'}</div>
                    </td>
                    <td className={ui.adminTd}>{placeName(p.placeId)}</td>
                    <td className={cn(ui.adminTd, ui.adminRowActions)}>
                      <button
                        type="button"
                        className={cn(ui.btn, ui.btnSm, ui.btnPrimary)}
                        onClick={() => onModerate(p.id, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className={cn(ui.btn, ui.btnSm, ui.btnOutline)}
                        onClick={() => onModerate(p.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <form className={cn(ui.cardPanel, ui.stack)} onSubmit={onSave}>
        <h2 className="mb-3.5 text-[1.05rem] font-semibold">{editing ? 'Edit post' : 'Add post'}</h2>
        <div className={ui.adminFormGrid}>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>ID</span>
            <input
              className={ui.fieldControl}
              value={form.id}
              onChange={(e) => setField('id', e.target.value)}
              required
              disabled={editing}
            />
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Username</span>
            <input
              className={ui.fieldControl}
              value={form.username}
              onChange={(e) => setField('username', e.target.value)}
              required
            />
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Linked place</span>
            <select
              className={ui.fieldControl}
              value={form.placeId}
              onChange={(e) => setField('placeId', e.target.value)}
            >
              <option value="">None</option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Likes</span>
            <input
              className={ui.fieldControl}
              type="number"
              value={form.likeCount}
              onChange={(e) => setField('likeCount', Number(e.target.value))}
            />
          </label>
          <label className={cn(ui.field, 'lg:col-span-2')}>
            <span className={ui.fieldLabel}>Media URL</span>
            <input
              className={ui.fieldControl}
              value={form.mediaUrl}
              onChange={(e) => setField('mediaUrl', e.target.value)}
              required
            />
          </label>
        </div>
        <label className={ui.field}>
          <span className={ui.fieldLabel}>Caption</span>
          <textarea
            className={ui.fieldControl}
            rows={3}
            value={form.caption}
            onChange={(e) => setField('caption', e.target.value)}
          />
        </label>
        <div className={ui.actionRow}>
          <button type="submit" className={cn(ui.btn, ui.btnPrimary)} disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Update' : 'Create'}
          </button>
          {editing && (
            <button
              type="button"
              className={cn(ui.btn, ui.btnOutline)}
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

      <div className={ui.adminTableWrap}>
        <table className={ui.adminTable}>
          <thead>
            <tr>
              <th className={ui.adminTh}>Post</th>
              <th className={ui.adminTh}>Place</th>
              <th className={ui.adminTh}>Status</th>
              <th className={ui.adminTh}>Engagement</th>
              <th className={ui.adminTh} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className={ui.adminTd} colSpan={5}>
                  <div className={ui.adminEmptyInline}>No posts yet — create one above.</div>
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id}>
                  <td className={ui.adminTd}>
                    <strong>@{p.username}</strong>
                    <div className={ui.muted}>{p.caption?.slice(0, 80)}</div>
                  </td>
                  <td className={ui.adminTd}>{placeName(p.placeId)}</td>
                  <td className={ui.adminTd}>{p.status || 'approved'}</td>
                  <td className={ui.adminTd}>
                    {p.likeCount} likes · {p.comments?.length || 0} comments
                  </td>
                  <td className={cn(ui.adminTd, ui.adminRowActions)}>
                    <button
                      type="button"
                      className={cn(ui.btn, ui.btnSm, ui.btnOutline)}
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
                          status: p.status || 'approved',
                        })
                        setEditing(true)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={cn(ui.btn, ui.btnSm, ui.btnOutline)}
                      onClick={() => onDelete(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className={ui.stack}>
        <h2 className="text-[1.05rem] font-semibold">Comments</h2>
        <div className={ui.adminTableWrap}>
          <table className={ui.adminTable}>
            <thead>
              <tr>
                <th className={ui.adminTh}>User</th>
                <th className={ui.adminTh}>Comment</th>
                <th className={ui.adminTh}>Post</th>
                <th className={ui.adminTh} />
              </tr>
            </thead>
            <tbody>
              {comments.length === 0 ? (
                <tr>
                  <td className={ui.adminTd} colSpan={4}>
                    <div className={ui.adminEmptyInline}>No comments.</div>
                  </td>
                </tr>
              ) : (
                comments.map((c) => (
                  <tr key={c.id}>
                    <td className={ui.adminTd}>@{c.username}</td>
                    <td className={ui.adminTd}>{c.body}</td>
                    <td className={ui.adminTd}>{c.post_id}</td>
                    <td className={ui.adminTd}>
                      <button
                        type="button"
                        className={cn(ui.btn, ui.btnSm, ui.btnOutline)}
                        onClick={() => onDeleteComment(c.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
