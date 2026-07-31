import { useEffect, useState } from 'react'
import { eventToRow, mapEvent } from '../../lib/data'
import { supabase } from '../../lib/supabase'
import { useData } from '../../context/DataContext'

const empty = {
  id: '',
  title: '',
  type: 'Live Music',
  date: '',
  time: '',
  venueName: '',
  placeId: '',
  area: 'Kingston',
  image: '',
  description: '',
  going: 0,
  interested: 0,
  price: 'Free',
  attendees: [],
}

export default function AdminEvents() {
  const { refresh, places } = useData()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const { data, error: err } = await supabase.from('events').select('*').order('title')
    if (err) setError(err.message)
    else setRows((data || []).map(mapEvent))
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
    const { error: err } = await supabase.from('events').upsert(eventToRow(form))
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
    if (!confirm(`Delete event ${id}?`)) return
    const { error: err } = await supabase.from('events').delete().eq('id', id)
    if (err) setError(err.message)
    else {
      await load()
      await refresh()
    }
  }

  return (
    <div className="stack-lg">
      <header>
        <h1 className="display">Events</h1>
      </header>
      {error && <p className="form-error">{error}</p>}

      <form className="card-panel stack admin-form" onSubmit={onSave}>
        <h2>{editing ? 'Edit event' : 'Add event'}</h2>
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
            <span>Title</span>
            <input value={form.title} onChange={(e) => setField('title', e.target.value)} required />
          </label>
          <label className="field">
            <span>Type</span>
            <input value={form.type} onChange={(e) => setField('type', e.target.value)} />
          </label>
          <label className="field">
            <span>Place</span>
            <select
              value={form.placeId}
              onChange={(e) => {
                const place = places.find((p) => p.id === e.target.value)
                setForm((f) => ({
                  ...f,
                  placeId: e.target.value,
                  venueName: place?.name || f.venueName,
                  area: place?.area || f.area,
                }))
              }}
            >
              <option value="">None</option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Date label</span>
            <input value={form.date} onChange={(e) => setField('date', e.target.value)} />
          </label>
          <label className="field">
            <span>Time label</span>
            <input value={form.time} onChange={(e) => setField('time', e.target.value)} />
          </label>
          <label className="field">
            <span>Price</span>
            <input value={form.price} onChange={(e) => setField('price', e.target.value)} />
          </label>
          <label className="field">
            <span>Image URL</span>
            <input value={form.image} onChange={(e) => setField('image', e.target.value)} required />
          </label>
        </div>
        <label className="field">
          <span>Description</span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
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
              <th>Title</th>
              <th>When</th>
              <th>Venue</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="admin-empty-inline">No events yet — create one above.</div>
                </td>
              </tr>
            ) : (
              rows.map((ev) => (
                <tr key={ev.id}>
                  <td>
                    <strong>{ev.title}</strong>
                    <div className="muted">{ev.type}</div>
                  </td>
                  <td>
                    {ev.date} · {ev.time}
                  </td>
                  <td>{ev.venueName}</td>
                  <td className="admin-row-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        setForm(ev)
                        setEditing(true)
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => onDelete(ev.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
