import { startTransition, useEffect, useMemo, useState } from 'react'
import { PARISHES } from '../../data/outyahData'
import { eventToRow, mapEvent } from '../../lib/data'
import {
  defaultEndSchedule,
  eventStatus,
  eventStatusLabel,
  formatEventDateLabel,
  formatEventTimeLabel,
  joinSchedule,
  labelsFromSchedule,
  splitSchedule,
} from '../../lib/events'
import { supabase } from '../../lib/supabase'
import { uploadMedia } from '../../lib/upload'
import { useData } from '../../context/DataContext'
import { cn, ui } from '../../lib/ui'

const empty = {
  id: '',
  title: '',
  type: 'Live Music',
  venueName: '',
  placeId: '',
  area: 'Kingston',
  image: '',
  description: '',
  going: 0,
  interested: 0,
  price: 'Free',
  attendees: [],
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  recurring: false,
  recurrenceNote: '',
}

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function uniqueEventSlug(title, existingIds) {
  const base = slugify(title)
  if (!base) return ''
  const taken = new Set(existingIds)
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}

export default function AdminEvents() {
  const { refresh, places } = useData()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

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

  const preview = useMemo(() => {
    const startsAt = joinSchedule(form.startDate, form.startTime)
    if (!startsAt) return null
    const endDate = form.endDate || form.startDate
    const endsAt = form.endTime ? joinSchedule(endDate, form.endTime) : null
    return labelsFromSchedule(startsAt, endsAt)
  }, [form.startDate, form.startTime, form.endDate, form.endTime])

  function setField(key, value) {
    setForm((f) => {
      const next = { ...f, [key]: value }
      if (!editing && key === 'title') {
        next.id = uniqueEventSlug(value, rows.map((r) => r.id))
      }
      return next
    })
  }

  function setSchedule(patch) {
    setForm((f) => {
      const next = { ...f, ...patch }
      const startChanged = 'startDate' in patch || 'startTime' in patch
      const endEmpty = !next.endDate && !next.endTime

      if (startChanged && endEmpty && next.startDate && next.startTime) {
        const end = defaultEndSchedule(next.startDate, next.startTime)
        next.endDate = end.endDate
        next.endTime = end.endTime
      }

      return next
    })
  }

  async function onImageUpload(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadMedia(file, `events/${form.id || 'draft'}`)
      setField('image', url)
    } catch (err) {
      setError(err.message || 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function onSave(e) {
    e.preventDefault()
    setError('')

    if (!form.image) {
      setError('Upload an event image before saving.')
      return
    }

    const startsAt = joinSchedule(form.startDate, form.startTime)
    if (!startsAt) {
      setError('Pick a start date and time.')
      return
    }

    const endDate = form.endDate || form.startDate
    const endsAt = form.endTime ? joinSchedule(endDate, form.endTime) : null
    if (endsAt && new Date(endsAt) <= new Date(startsAt)) {
      setError('End time must be after the start.')
      return
    }

    const { date, time } = labelsFromSchedule(startsAt, endsAt)

    setBusy(true)
    const payload = {
      ...form,
      date,
      time,
      startsAt,
      endsAt,
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

  function loadForEdit(ev) {
    const start = splitSchedule(ev.startsAt)
    const end = splitSchedule(ev.endsAt)
    setForm({
      ...ev,
      startDate: start.date,
      startTime: start.time,
      endDate: end.date,
      endTime: end.time,
      recurrenceNote: ev.recurrenceNote || '',
    })
    setEditing(true)
  }

  return (
    <div className={ui.stackLg}>
      <header>
        <h1 className={ui.display}>Events</h1>
        <p className={cn(ui.lede, 'mt-2')}>Schedule times in Jamaica local (UTC−5). Labels on the site are generated automatically.</p>
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
              placeholder="auto-from-title"
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
              placeholder="Live Music, Festival…"
            />
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Price</span>
            <input
              className={ui.fieldControl}
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
              placeholder="Free, J$2,000…"
            />
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Venue</span>
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
              <option value="">No linked place</option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Venue name</span>
            <input
              className={ui.fieldControl}
              value={form.venueName}
              onChange={(e) => setField('venueName', e.target.value)}
              placeholder="Shown when no place is linked"
              required
            />
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Parish</span>
            <select
              className={ui.fieldControl}
              value={form.area}
              onChange={(e) => setField('area', e.target.value)}
              required
            >
              {PARISHES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={cn(ui.stack, 'rounded-2xl border border-border bg-bg/50 p-4')}>
          <h3 className={ui.adminSubhead}>When</h3>
          <p className={cn(ui.small, '-mt-1')}>All times are Jamaica local. End is optional but helps Pulse and live status.</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className={ui.field}>
              <span className={ui.fieldLabel}>Start date</span>
              <input
                className={ui.fieldControl}
                type="date"
                value={form.startDate}
                onChange={(e) => setSchedule({ startDate: e.target.value })}
                required
              />
            </label>
            <label className={ui.field}>
              <span className={ui.fieldLabel}>Start time</span>
              <input
                className={ui.fieldControl}
                type="time"
                value={form.startTime}
                onChange={(e) => setSchedule({ startTime: e.target.value })}
                required
              />
            </label>
            <label className={ui.field}>
              <span className={ui.fieldLabel}>End date</span>
              <input
                className={ui.fieldControl}
                type="date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(e) => setSchedule({ endDate: e.target.value })}
              />
            </label>
            <label className={ui.field}>
              <span className={ui.fieldLabel}>End time</span>
              <input
                className={ui.fieldControl}
                type="time"
                value={form.endTime}
                onChange={(e) => setSchedule({ endTime: e.target.value })}
              />
            </label>
          </div>

          {preview?.date && (
            <p className={cn(ui.note, 'mt-1')}>
              On the site: <strong className="text-fg">{preview.date}</strong>
              {preview.time && (
                <>
                  {' '}
                  · <strong className="text-fg">{preview.time}</strong>
                </>
              )}
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className={cn(ui.field, 'flex-row items-center gap-2.5 rounded-xl border border-border bg-bg/50 px-3 py-3')}>
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
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
              placeholder="Every Friday night"
              disabled={!form.recurring}
            />
          </label>
        </div>

        <div className={cn(ui.stack, 'pt-1')}>
          <h3 className={ui.adminSubhead}>Event image</h3>
          <div className={ui.adminUploadRow}>
            <label className={cn(ui.btn, ui.btnOutline, ui.btnSm, ui.adminFileBtn)}>
              {uploading ? 'Uploading…' : form.image ? 'Replace image' : 'Upload image'}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploading}
                onChange={onImageUpload}
              />
            </label>
            {form.image && (
              <button
                type="button"
                className={cn(ui.btn, ui.btnOutline, ui.btnSm)}
                onClick={() => setField('image', '')}
                disabled={uploading}
              >
                Remove
              </button>
            )}
          </div>
          {form.image ? (
            <div className={cn(ui.adminImageThumb, ui.adminImageThumbCover, 'max-w-40')}>
              <img className={ui.adminImageThumbImg} src={form.image} alt="" />
            </div>
          ) : (
            <p className={ui.muted}>No image yet — pick a photo for the event card and detail page.</p>
          )}
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
          <button type="submit" className={cn(ui.btn, ui.btnPrimary)} disabled={busy || uploading}>
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
                const when =
                  ev.startsAt && formatEventDateLabel(ev.startsAt)
                    ? `${formatEventDateLabel(ev.startsAt)} · ${formatEventTimeLabel(ev.startsAt, ev.endsAt)}`
                    : [ev.date, ev.time].filter(Boolean).join(' · ')
                return (
                  <tr key={ev.id}>
                    <td className={ui.adminTd}>
                      <strong>{ev.title}</strong>
                      <div className={ui.muted}>
                        {ev.type}
                        {ev.recurring ? ' · Recurring' : ''}
                      </div>
                    </td>
                    <td className={ui.adminTd}>{when || '—'}</td>
                    <td className={ui.adminTd}>{eventStatusLabel(status)}</td>
                    <td className={ui.adminTd}>{ev.venueName}</td>
                    <td className={cn(ui.adminTd, ui.adminRowActions)}>
                      <button
                        type="button"
                        className={cn(ui.btn, ui.btnSm, ui.btnOutline)}
                        onClick={() => loadForEdit(ev)}
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
