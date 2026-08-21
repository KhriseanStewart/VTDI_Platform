import { isSupabaseConfigured, supabase } from './supabase'

function shortId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 10)
  }
  return Math.random().toString(36).slice(2, 12)
}

/** Build absolute share URL for a plan id (or stops query fallback). */
export function planShareUrl(idOrQuery) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  if (idOrQuery.startsWith('?') || idOrQuery.includes('=')) {
    return `${origin}/plan/share${idOrQuery.startsWith('?') ? idOrQuery : `?${idOrQuery}`}`
  }
  return `${origin}/plan/share/${idOrQuery}`
}

/** Compact query fallback when DB share insert isn't available. */
export function encodeStopsQuery(placeIds) {
  return `?stops=${encodeURIComponent(placeIds.join(','))}`
}

export function decodeStopsQuery(searchParams) {
  const raw = searchParams.get('stops') || ''
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30)
}

/**
 * Persist a shareable plan. Falls back to query-string link if Supabase is down.
 * @returns {{ id: string|null, url: string, mode: 'db'|'query' }}
 */
export async function createSharedPlan({ placeIds, title = null, userId = null }) {
  const ids = [...new Set((placeIds || []).filter(Boolean))].slice(0, 30)
  if (!ids.length) throw new Error('Add at least one stop before sharing')

  if (isSupabaseConfigured) {
    const id = shortId()
    const { error } = await supabase.from('shared_plans').insert({
      id,
      title: title || null,
      place_ids: ids,
      created_by: userId || null,
    })
    if (!error) {
      return { id, url: planShareUrl(id), mode: 'db' }
    }
    // Table missing / RLS — fall through to query link
    console.warn('shared_plans insert failed, using query link:', error.message)
  }

  const q = encodeStopsQuery(ids)
  return { id: null, url: planShareUrl(q), mode: 'query' }
}

export async function fetchSharedPlan(id) {
  if (!isSupabaseConfigured || !id) return null
  const { data, error } = await supabase
    .from('shared_plans')
    .select('id, title, place_ids, created_at')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    id: data.id,
    title: data.title,
    placeIds: Array.isArray(data.place_ids) ? data.place_ids : [],
    createdAt: data.created_at,
  }
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }
  const el = document.createElement('textarea')
  el.value = text
  el.setAttribute('readonly', '')
  el.style.position = 'fixed'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  el.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(el)
  return ok
}

export async function nativeShare({ url, title, text }) {
  if (!navigator.share) return false
  try {
    await navigator.share({ url, title, text })
    return true
  } catch (err) {
    if (err?.name === 'AbortError') return false
    throw err
  }
}
