import { useEffect, useState } from 'react'
import { CATEGORY_LABELS } from '../../data/outyahData'
import { mapPlace, placeToRow } from '../../lib/data'
import { supabase } from '../../lib/supabase'
import { useData } from '../../context/DataContext'

const empty = {
  id: '',
  name: '',
  category: 'restaurant',
  neighborhood: '',
  area: 'Kingston',
  image: '',
  images: [],
  rating: 4.5,
  reviewCount: 0,
  priceRange: 2,
  currency: 'JMD',
  tags: [],
  openUntil: '10:00 PM',
  openNow: true,
  description: '',
  amenities: [],
  address: '',
  phone: '',
  map: { lat: 18.0, lng: -76.8 },
  hours: [],
  special: '',
  reviews: [],
}

export default function AdminPlaces() {
  const { refresh } = useData()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const { data, error: err } = await supabase.from('places').select('*').order('name')
    if (err) setError(err.message)
    else setRows((data || []).map(mapPlace))
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
    const row = placeToRow({
      ...form,
      images: form.image ? [form.image, ...(form.images || []).filter((x) => x !== form.image)] : form.images,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : form.tags,
      amenities:
        typeof form.amenities === 'string'
          ? form.amenities.split(',').map((t) => t.trim()).filter(Boolean)
          : form.amenities,
    })
    const { error: err } = await supabase.from('places').upsert(row)
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
    if (!confirm(`Delete place ${id}?`)) return
    const { error: err } = await supabase.from('places').delete().eq('id', id)
    if (err) setError(err.message)
    else {
      await load()
      await refresh()
    }
  }

  return (
    <div className="stack-lg">
      <header>
        <h1 className="display">Places</h1>
        <p className="muted">{rows.length} venues</p>
      </header>

      {error && <p className="form-error">{error}</p>}

      <form className="card-panel stack admin-form" onSubmit={onSave}>
        <h2>{editing ? 'Edit place' : 'Add place'}</h2>
        <div className="admin-form-grid">
          <label className="field">
            <span>ID (slug)</span>
            <input
              value={form.id}
              onChange={(e) => setField('id', e.target.value)}
              required
              disabled={editing}
            />
          </label>
          <label className="field">
            <span>Name</span>
            <input value={form.name} onChange={(e) => setField('name', e.target.value)} required />
          </label>
          <label className="field">
            <span>Category</span>
            <select value={form.category} onChange={(e) => setField('category', e.target.value)}>
              {Object.keys(CATEGORY_LABELS).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Area</span>
            <input value={form.area} onChange={(e) => setField('area', e.target.value)} />
          </label>
          <label className="field">
            <span>Neighborhood</span>
            <input
              value={form.neighborhood}
              onChange={(e) => setField('neighborhood', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Image URL</span>
            <input value={form.image} onChange={(e) => setField('image', e.target.value)} required />
          </label>
          <label className="field">
            <span>Lat</span>
            <input
              type="number"
              step="any"
              value={form.map.lat}
              onChange={(e) => setField('map', { ...form.map, lat: Number(e.target.value) })}
            />
          </label>
          <label className="field">
            <span>Lng</span>
            <input
              type="number"
              step="any"
              value={form.map.lng}
              onChange={(e) => setField('map', { ...form.map, lng: Number(e.target.value) })}
            />
          </label>
          <label className="field">
            <span>Price range (1-4)</span>
            <input
              type="number"
              min="1"
              max="4"
              value={form.priceRange}
              onChange={(e) => setField('priceRange', Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Rating</span>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating}
              onChange={(e) => setField('rating', Number(e.target.value))}
            />
          </label>
        </div>
        <label className="field">
          <span>Address</span>
          <input value={form.address} onChange={(e) => setField('address', e.target.value)} />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
          />
        </label>
        <label className="field">
          <span>Tags (comma-separated)</span>
          <input
            value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
            onChange={(e) => setField('tags', e.target.value)}
          />
        </label>
        <label className="field">
          <span>Amenities (comma-separated)</span>
          <input
            value={Array.isArray(form.amenities) ? form.amenities.join(', ') : form.amenities}
            onChange={(e) => setField('amenities', e.target.value)}
          />
        </label>
        <div className="action-row">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Update place' : 'Create place'}
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
              <th>Name</th>
              <th>Category</th>
              <th>Area</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="admin-empty-inline">
                    No places yet — create the first venue above.
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <div className="muted">{p.id}</div>
                  </td>
                  <td>{p.category}</td>
                  <td>{p.area}</td>
                  <td className="admin-row-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        setForm({
                          ...p,
                          tags: p.tags || [],
                          amenities: p.amenities || [],
                        })
                        setEditing(true)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
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
    </div>
  )
}
