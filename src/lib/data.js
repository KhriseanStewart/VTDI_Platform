import { isSupabaseConfigured, supabase } from './supabase'

export function mapPlace(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    neighborhood: row.neighborhood,
    area: row.area,
    image: row.image,
    images: row.images || [],
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count ?? 0,
    priceRange: row.price_range ?? 1,
    currency: row.currency || 'JMD',
    tags: row.tags || [],
    openUntil: row.open_until,
    openNow: row.open_now,
    description: row.description,
    amenities: row.amenities || [],
    address: row.address,
    phone: row.phone,
    map: { lat: row.lat, lng: row.lng },
    hours: row.hours || [],
    special: row.special,
    reviews: row.reviews || [],
    slots: row.slots || undefined,
    slotLabel: row.slot_label || undefined,
  }
}

export function mapEvent(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    date: row.date_label,
    time: row.time_label,
    venueName: row.venue_name,
    placeId: row.place_id,
    area: row.area,
    image: row.image,
    description: row.description,
    going: row.going ?? 0,
    interested: row.interested ?? 0,
    price: row.price,
    attendees: row.attendees || [],
    startsAt: row.starts_at || null,
    endsAt: row.ends_at || null,
    recurring: Boolean(row.recurring),
    recurrenceNote: row.recurrence_note || '',
  }
}

export function mapPost(row, comments = []) {
  if (!row) return null
  return {
    id: row.id,
    placeId: row.place_id,
    username: row.username,
    userAvatar: row.user_avatar,
    caption: row.caption,
    mediaUrl: row.media_url,
    mediaType: row.media_type || 'IMAGE',
    permalink: row.permalink,
    timestamp: row.posted_at,
    likeCount: row.like_count ?? 0,
    commentsCount: row.comments_count ?? comments.length,
    comments: comments.map((c) => ({
      id: c.id,
      username: c.username,
      text: c.body,
      timestamp: c.posted_at,
    })),
    source: 'supabase',
  }
}

export function placeToRow(place) {
  return {
    id: place.id,
    name: place.name,
    category: place.category,
    neighborhood: place.neighborhood,
    area: place.area,
    image: place.image,
    images: place.images || [],
    rating: place.rating,
    review_count: place.reviewCount,
    price_range: place.priceRange,
    currency: place.currency || 'JMD',
    tags: place.tags || [],
    open_until: place.openUntil,
    open_now: place.openNow ?? true,
    description: place.description,
    amenities: place.amenities || [],
    address: place.address,
    phone: place.phone,
    lat: place.map?.lat ?? place.lat,
    lng: place.map?.lng ?? place.lng,
    hours: place.hours || [],
    special: place.special || null,
    reviews: place.reviews || [],
    slots: place.slots || null,
    slot_label: place.slotLabel || null,
    updated_at: new Date().toISOString(),
  }
}

export function eventToRow(event) {
  return {
    id: event.id,
    title: event.title,
    type: event.type,
    date_label: event.date,
    time_label: event.time,
    venue_name: event.venueName,
    place_id: event.placeId || null,
    area: event.area,
    image: event.image,
    description: event.description,
    going: event.going ?? 0,
    interested: event.interested ?? 0,
    price: event.price,
    attendees: event.attendees || [],
    starts_at: event.startsAt || null,
    ends_at: event.endsAt || null,
    recurring: Boolean(event.recurring),
    recurrence_note: event.recurrenceNote || null,
    updated_at: new Date().toISOString(),
  }
}

export function postToRow(post) {
  return {
    id: post.id,
    place_id: post.placeId || null,
    username: post.username,
    user_avatar: post.userAvatar,
    caption: post.caption,
    media_url: post.mediaUrl,
    media_type: post.mediaType || 'IMAGE',
    permalink: post.permalink || null,
    posted_at: post.timestamp || new Date().toISOString(),
    like_count: post.likeCount ?? 0,
    comments_count: post.commentsCount ?? 0,
    updated_at: new Date().toISOString(),
  }
}

function ensureClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured')
  }
}

export async function fetchPlaces() {
  ensureClient()
  const { data, error } = await supabase.from('places').select('*').order('name')
  if (error) throw error
  return (data || []).map(mapPlace)
}

export async function fetchPlace(id) {
  ensureClient()
  const { data, error } = await supabase.from('places').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return mapPlace(data)
}

export async function fetchEvents() {
  ensureClient()
  const { data, error } = await supabase.from('events').select('*').order('title')
  if (error) throw error
  return (data || []).map(mapEvent)
}

export async function fetchEvent(id) {
  ensureClient()
  const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return mapEvent(data)
}

export async function fetchPosts() {
  ensureClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('posted_at', { ascending: false })
  if (error) throw error
  if (!data?.length) return []

  const ids = data.map((p) => p.id)
  const { data: comments, error: cErr } = await supabase
    .from('post_comments')
    .select('*')
    .in('post_id', ids)
    .order('posted_at', { ascending: true })
  if (cErr) throw cErr

  const byPost = {}
  for (const c of comments || []) {
    ;(byPost[c.post_id] ||= []).push(c)
  }
  return data.map((row) => mapPost(row, byPost[row.id] || []))
}

export async function fetchPostsForPlace(placeId) {
  const all = await fetchPosts()
  return all.filter((p) => p.placeId === placeId)
}
