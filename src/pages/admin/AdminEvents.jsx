import { startTransition, useEffect, useState } from 'react'
import { eventToRow, mapEvent } from '../../lib/data'
import { eventStatus, eventStatusLabel } from '../../lib/events'
import { supabase } from '../../lib/supabase'
import { useData } from '../../context/DataContext'
import { cn, ui } from '../../lib/ui'

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
  startsAt: '',
  endsAt: '',
  recurring: false,
  recurrenceNote: '',
}

function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInput(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export default function AdminEvents() {
  const { refresh, places } = useData()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const { data, error: err } = await supabase.from('events').select('*').order('starts_at', {
      ascending: true,
      nullsFirst: false,
    })
    if (err) setError(err.message)
    else setRows((data || []).map(mapEvent))
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data, error: err } = await supabase.from('events').select('*').order('starts_at', {
        ascending: true,
        nullsFirst: false,
      })
      if (cancelled) return
      startTransition(() => {
        if (err) setError(err.message)
        else setRows((data || []).map(mapEvent))
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
      startsAt: fromLocalInput(form.startsAt),
      endsAt: fromLocalInput(form.endsAt),
    }
    const { error: err } = await supabase.from('events').upsert(eventToRow(payload))
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
    <div className={ui.stackLg}>
      <header>
        <h1 className={ui.display}>Events</h1>
      </header>
      {error && <p className={ui.formError}>{error}</p>}

      <form className={cn(ui.cardPanel, ui.stack)} onSubmit={onSave}>
        <h2 className="mb-3.5 text-[1.05rem] font-semibold">{editing ? 'Edit event' : 'Add event'}</h2>
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
            <span className={ui.fieldLabel}>Title</span>
            <input
              className={ui.fieldControl}
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              required
            />
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Type</span>
            <input
              className={ui.fieldControl}
              value={form.type}
              onChange={(e) => setField('type', e.target.value)}
            />
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Place</span>
            <select
              className={ui.fieldControl}
              value={form.placeId}
              onChange={(e) => {
                const place = places.find((p) => p.id === e.target.value)
                setForm((f) => ({
                  ...f,
                  placeId: e.target.value,
                  venueName: place?.name || f.venueName,
                  area: place?.area || f.area,
                  image: f.image || place?.image || '',
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
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Date label</span>
            <input
              className={ui.fieldControl}
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              placeholder="Sat, Aug 2"
            />
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Time label</span>
            <input
              className={ui.fieldControl}
              value={form.time}
              onChange={(e) => setField('time', e.target.value)}
              placeholder="10:00 PM"
            />
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Starts</span>
            <input
              className={ui.fieldControl}
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setField('startsAt', e.target.value)}
            />
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Ends</span>
            <input
              className={ui.fieldControl}
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => setField('endsAt', e.target.value)}
            />
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Price</span>
            <input
              className={ui.fieldControl}
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
            />
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Image URL</span>
            <input
              className={ui.fieldControl}
              value={form.image}
              onChange={(e) => setField('image', e.target.value)}
              required
            />
          </label>
          <label className={cn(ui.field, 'flex-row items-center gap-2 pt-6')}>
            <input
              type="checkbox"
              checked={form.recurring}
              onChange={(e) => setField('recurring', e.target.checked)}
            />
            <span className={ui.fieldLabel}>Recurring event</span>
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Recurrence note</span>
            <input
              className={ui.fieldControl}
              value={form.recurrenceNote}
              onChange={(e) => setField('recurrenceNote', e.target.value)}
              placeholder="Annual every Independence Day"
              disabled={!form.recurring}
            />
          </label>
        </div>
        <label className={ui.field}>
          <span className={ui.fieldLabel}>Description</span>
          <textarea
            className={ui.fieldControl}
            rows={3}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
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
              <th className={ui.adminTh}>Title</th>
              <th className={ui.adminTh}>When</th>
              <th className={ui.adminTh}>Status</th>
              <th className={ui.adminTh}>Venue</th>
              <th className={ui.adminTh} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className={ui.adminTd} colSpan={5}>
                  <div className={ui.adminEmptyInline}>No events yet — create one above.</div>
                </td>
              </tr>
            ) : (
              rows.map((ev) => {
                const status = eventStatus(ev)
                return (
                  <tr key={ev.id}>
                    <td className={ui.adminTd}>
                      <strong>{ev.title}</strong>
                      <div className={ui.muted}>
                        {ev.type}
                        {ev.recurring ? ' · Recurring' : ''}
                      </div>
                    </td>
                    <td className={ui.adminTd}>
                      {ev.date} · {ev.time}
                    </td>
                    <td className={ui.adminTd}>{eventStatusLabel(status)}</td>
                    <td className={ui.adminTd}>{ev.venueName}</td>
                    <td className={cn(ui.adminTd, ui.adminRowActions)}>
                      <button
                        type="button"
                        className={cn(ui.btn, ui.btnSm, ui.btnOutline)}
                        onClick={() => {
                          setForm({
                            ...ev,
                            startsAt: toLocalInput(ev.startsAt),
                            endsAt: toLocalInput(ev.endsAt),
                            recurrenceNote: ev.recurrenceNote || '',
                          })
                          setEditing(true)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={cn(ui.btn, ui.btnSm, ui.btnOutline)}
                        onClick={() => onDelete(ev.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
