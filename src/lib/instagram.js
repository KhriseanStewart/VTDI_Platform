import { MOCK_INSTAGRAM_POSTS } from '../data/instagramFeed'
import { places } from '../data/outyahData'

const TOKEN = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN
const USER_ID = import.meta.env.VITE_INSTAGRAM_USER_ID

export function hasInstagramCredentials() {
  return Boolean(TOKEN && USER_ID)
}

function relativeTime(iso) {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(1, mins)}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(iso).toLocaleDateString()
}

function matchPlaceId(caption = '') {
  const lower = caption.toLowerCase()
  const hit = places.find(
    (p) =>
      lower.includes(p.name.toLowerCase()) ||
      lower.includes(p.neighborhood.toLowerCase()) ||
      lower.includes(p.area.toLowerCase()),
  )
  return hit?.id ?? places[0]?.id
}

async function fetchComments(mediaId) {
  const fields = 'text,username,timestamp,id'
  const url = `/api/instagram/${mediaId}/comments?fields=${fields}&access_token=${TOKEN}`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  return (data.data || []).map((c) => ({
    id: c.id,
    username: c.username || 'user',
    text: c.text || '',
    timestamp: c.timestamp,
  }))
}

/**
 * Live Instagram Graph API media for a Business/Creator account.
 * Proxied via Vite to avoid browser CORS issues.
 */
async function fetchLiveInstagramFeed() {
  const fields = [
    'id',
    'caption',
    'media_type',
    'media_url',
    'permalink',
    'thumbnail_url',
    'timestamp',
    'like_count',
    'comments_count',
    'username',
  ].join(',')

  const url = `/api/instagram/${USER_ID}/media?fields=${fields}&access_token=${TOKEN}&limit=24`
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Instagram API ${res.status}: ${err}`)
  }

  const data = await res.json()
  const posts = await Promise.all(
    (data.data || [])
      .filter((m) => m.media_type === 'IMAGE' || m.media_type === 'CAROUSEL_ALBUM')
      .map(async (m) => {
        const comments = await fetchComments(m.id)
        return {
          id: m.id,
          placeId: matchPlaceId(m.caption),
          username: m.username || 'instagram',
          userAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.username || 'ig')}`,
          caption: m.caption || '',
          mediaUrl: m.media_url || m.thumbnail_url,
          mediaType: m.media_type,
          permalink: m.permalink,
          timestamp: m.timestamp,
          likeCount: m.like_count ?? 0,
          commentsCount: m.comments_count ?? comments.length,
          comments,
          source: 'instagram',
        }
      }),
  )

  return posts
}

export async function loadInstagramFeed() {
  if (hasInstagramCredentials()) {
    try {
      const live = await fetchLiveInstagramFeed()
      if (live.length) return { posts: live, source: 'instagram', error: null }
    } catch (error) {
      console.warn('Instagram live fetch failed, using curated feed.', error)
      return {
        posts: MOCK_INSTAGRAM_POSTS.map((p) => ({ ...p, source: 'demo' })),
        source: 'demo',
        error: error.message,
      }
    }
  }

  return {
    posts: MOCK_INSTAGRAM_POSTS.map((p) => ({ ...p, source: 'demo' })),
    source: 'demo',
    error: null,
  }
}

export function formatInstagramTime(iso) {
  return relativeTime(iso)
}
