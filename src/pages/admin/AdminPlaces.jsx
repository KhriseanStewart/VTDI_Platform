import { useEffect, useState } from 'react'
import { CATEGORY_LABELS, PARISHES, PRICE_MIN, PRICE_MAX, normalizePriceRange } from '../../data/outyahData'
import PlaceLocationPicker from '../../components/maps/PlaceLocationPicker'
import { mapPlace, placeToRow } from '../../lib/data'
import { supabase } from '../../lib/supabase'
import { uploadMedia } from '../../lib/upload'
import { useData } from '../../context/DataContext'
import { cn, ui } from '../../lib/ui'

const empty = {
  id: '',
  name: '',
  category: 'restaurant',
  neighborhood: '',
  area: 'Kingston',
  image: '',
  images: [],
  rating: 0,
  reviewCount: 0,
  priceRange: 2000,
  currency: 'JMD',
  tags: [],
  openUntil: '10:00 PM',
  openNow: true,
  description: '',
  amenities: [],
  address: '',
  phone: '',
  map: { lat: null, lng: null },
  hours: [],
  special: '',
  reviews: [],
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

function uniquePlaceSlug(name, area, existingIds) {
  const base = slugify(name)
  if (!base) return ''
  const taken = new Set(existingIds)
  if (!taken.has(base)) return base
  const withArea = slugify(`${name}-${area || 'place'}`)
  if (withArea && !taken.has(withArea)) return withArea
  let n = 2
  while (taken.has(`${withArea || base}-${n}`)) n += 1
  return `${withArea || base}-${n}`
}

export default function AdminPlaces() {
  const { refresh } = useData()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function load() {
    const { data, error: err } = await supabase.from('places').select('*').order('name')
    if (err) setError(err.message)
    else setRows((data || []).map(mapPlace))
  }

  useEffect(() => {
    load()
  }, [])

  function setField(key, value) {
    setForm((f) => {
      const next = { ...f, [key]: value }
      if (!editing && (key === 'name' || key === 'area')) {
        next.id = uniquePlaceSlug(
          key === 'name' ? value : next.name,
          key === 'area' ? value : next.area,
          rows.map((r) => r.id),
        )
      }
      return next
    })
  }

  function onLocationChange({ lat, lng, address }) {
    setForm((f) => ({
      ...f,
      address: address || f.address,
      map: { lat, lng },
    }))
  }

  async function onCoverUpload(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadMedia(file, `places/${form.id || 'draft'}`)
      setForm((f) => {
        const rest = (f.images || []).filter((x) => x !== f.image && x !== url)
        return { ...f, image: url, images: [url, ...rest] }
      })
    } catch (err) {
      setError(err.message || 'Cover upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function onGalleryUpload(e) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const urls = []
      for (const file of files) {
        urls.push(await uploadMedia(file, `places/${form.id || 'draft'}`))
      }
      setForm((f) => {
        const cover = f.image
        const merged = [...(f.images || []), ...urls].filter(Boolean)
        const unique = [...new Set(merged)]
        const ordered = cover
          ? [cover, ...unique.filter((u) => u !== cover)]
          : unique
        return {
          ...f,
          image: cover || ordered[0] || '',
          images: ordered,
        }
      })
    } catch (err) {
      setError(err.message || 'Gallery upload failed')
    } finally {
      setUploading(false)
    }
  }

  function removeImage(url) {
    setForm((f) => {
      const images = (f.images || []).filter((x) => x !== url)
      const image = f.image === url ? images[0] || '' : f.image
      const ordered = image ? [image, ...images.filter((x) => x !== image)] : images
      return { ...f, image, images: ordered }
    })
  }

  function setCover(url) {
    setForm((f) => {
      const rest = (f.images || []).filter((x) => x !== url)
      return { ...f, image: url, images: [url, ...rest] }
    })
  }

  async function onSave(e) {
    e.preventDefault()
    setError('')

    if (!form.image) {
      setError('Upload a cover image before saving.')
      return
    }
    if (!Number.isFinite(form.map?.lat) || !Number.isFinite(form.map?.lng)) {
      setError('Pick a location on the map before saving.')
      return
    }

    setBusy(true)
    const payload = {
      ...form,
      priceRange: normalizePriceRange(form.priceRange),
      currency: 'JMD',
      images: form.image
        ? [form.image, ...(form.images || []).filter((x) => x !== form.image)]
        : form.images,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : form.tags,
      amenities:
        typeof form.amenities === 'string'
          ? form.amenities.split(',').map((t) => t.trim()).filter(Boolean)
          : form.amenities,
    }

    if (!editing) {
      payload.rating = 0
      payload.reviewCount = 0
    }

    const row = placeToRow(payload)
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

  const gallery = form.images?.length
    ? form.images
    : form.image
      ? [form.image]
      : []

  return (
    <div className={ui.stackLg}>
      <header>
        <h1 className={ui.display}>Places</h1>
        <p className={ui.muted}>{rows.length} venues</p>
      </header>

      {error && <p className={ui.formError}>{error}</p>}

      <form className={cn(ui.cardPanel, ui.stack)} onSubmit={onSave}>
        <h2 className="mb-3.5 text-[1.05rem] font-semibold">{editing ? 'Edit place' : 'Add place'}</h2>
        <div className={ui.adminFormGrid}>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>ID (slug)</span>
            <input
              className={ui.fieldControl}
              value={form.id}
              onChange={(e) => setField('id', slugify(e.target.value))}
              required
              disabled={editing}
              placeholder="auto from name"
              title={
                editing
                  ? undefined
                  : 'Prefills from name; appends parish if that slug is already taken'
              }
            />
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Name</span>
            <input
              className={ui.fieldControl}
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              required
              autoComplete="off"
            />
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Category</span>
            <select
              className={ui.fieldControl}
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
            >
              {Object.keys(CATEGORY_LABELS).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Parish</span>
            <select
              className={ui.fieldControl}
              value={form.area}
              onChange={(e) => setField('area', e.target.value)}
              required
            >
              {PARISHES.map((parish) => (
                <option key={parish} value={parish}>
                  {parish}
                </option>
              ))}
            </select>
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Neighborhood</span>
            <input
              className={ui.fieldControl}
              value={form.neighborhood}
              onChange={(e) => setField('neighborhood', e.target.value)}
              placeholder="Half Way Tree, New Kingston…"
              autoComplete="off"
            />
          </label>
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Price range (JMD)</span>
            <input
              className={ui.fieldControl}
              type="number"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={100}
              value={form.priceRange}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === '') {
                  setField('priceRange', '')
                  return
                }
                setField('priceRange', Number(raw))
              }}
              onBlur={() => setField('priceRange', normalizePriceRange(form.priceRange))}
              required
            />
          </label>
        </div>

        <div className={cn(ui.stack, 'pt-1')}>
          <h3 className={ui.adminSubhead}>Photos</h3>
          <div className={ui.adminUploadRow}>
            <label className={cn(ui.btn, ui.btnOutline, ui.btnSm, ui.adminFileBtn)}>
              {uploading ? 'Uploading…' : 'Upload cover'}
              <input type="file" accept="image/*" hidden disabled={uploading} onChange={onCoverUpload} />
            </label>
            <label className={cn(ui.btn, ui.btnOutline, ui.btnSm, ui.adminFileBtn)}>
              Add gallery images
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                disabled={uploading}
                onChange={onGalleryUpload}
              />
            </label>
          </div>
          {gallery.length > 0 ? (
            <div className={ui.adminImageGrid}>
              {gallery.map((url) => (
                <div
                  key={url}
                  className={cn(ui.adminImageThumb, url === form.image && ui.adminImageThumbCover)}
                >
                  <img className={ui.adminImageThumbImg} src={url} alt="" />
                  <div className={ui.adminImageActions}>
                    {url !== form.image && (
                      <button
                        type="button"
                        className={cn(ui.btn, ui.btnSm, ui.btnOutline)}
                        onClick={() => setCover(url)}
                      >
                        Set cover
                      </button>
                    )}
                    {url === form.image && <span className={ui.adminCoverBadge}>Cover</span>}
                    <button
                      type="button"
                      className={cn(ui.btn, ui.btnSm, ui.btnOutline)}
                      onClick={() => removeImage(url)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={ui.muted}>No photos yet — cover image is required.</p>
          )}
        </div>

        <PlaceLocationPicker
          value={{
            lat: form.map?.lat,
            lng: form.map?.lng,
            address: form.address,
          }}
          onChange={onLocationChange}
        />

        <label className={ui.field}>
          <span className={ui.fieldLabel}>Description</span>
          <textarea
            className={ui.fieldControl}
            rows={3}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
          />
        </label>
        <label className={ui.field}>
          <span className={ui.fieldLabel}>Tags (comma-separated)</span>
          <input
            className={ui.fieldControl}
            value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
            onChange={(e) => setField('tags', e.target.value)}
          />
        </label>
        <label className={ui.field}>
          <span className={ui.fieldLabel}>Amenities (comma-separated)</span>
          <input
            className={ui.fieldControl}
            value={Array.isArray(form.amenities) ? form.amenities.join(', ') : form.amenities}
            onChange={(e) => setField('amenities', e.target.value)}
          />
        </label>
        <div className={ui.actionRow}>
          <button type="submit" className={cn(ui.btn, ui.btnPrimary)} disabled={busy || uploading}>
            {busy ? 'Saving…' : editing ? 'Update place' : 'Create place'}
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
              <th className={ui.adminTh}>Name</th>
              <th className={ui.adminTh}>Category</th>
              <th className={ui.adminTh}>Parish</th>
              <th className={ui.adminTh} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className={ui.adminTd} colSpan={4}>
                  <div className={ui.adminEmptyInline}>
                    No places yet — create the first venue above.
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id}>
                  <td className={ui.adminTd}>
                    <strong>{p.name}</strong>
                    <div className={ui.muted}>{p.id}</div>
                  </td>
                  <td className={ui.adminTd}>{p.category}</td>
                  <td className={ui.adminTd}>{p.area}</td>
                  <td className={cn(ui.adminTd, ui.adminRowActions)}>
                    <button
                      type="button"
                      className={cn(ui.btn, ui.btnSm, ui.btnOutline)}
                      onClick={() => {
                        setForm({
                          ...p,
                          priceRange: normalizePriceRange(p.priceRange),
                          tags: p.tags || [],
                          amenities: p.amenities || [],
                          map: p.map || { lat: null, lng: null },
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
    </div>
  )
}
