/** Review source metadata for badges and filters */
export const REVIEW_SOURCES = {
  outyah: {
    id: 'outyah',
    label: 'OutYah',
    color: '#1f6b4f',
    soft: 'rgba(31, 107, 79, 0.12)',
  },
  google: {
    id: 'google',
    label: 'Google',
    color: '#4285F4',
    soft: 'rgba(66, 133, 244, 0.12)',
  },
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    soft: 'rgba(225, 48, 108, 0.12)',
  },
  tripadvisor: {
    id: 'tripadvisor',
    label: 'Tripadvisor',
    color: '#34E0A1',
    soft: 'rgba(52, 224, 161, 0.14)',
  },
  yelp: {
    id: 'yelp',
    label: 'Yelp',
    color: '#D32323',
    soft: 'rgba(211, 35, 35, 0.12)',
  },
}

export function reviewSourceMeta(source) {
  return REVIEW_SOURCES[source] || REVIEW_SOURCES.outyah
}

export function formatReviewDate(isoOrLabel) {
  if (!isoOrLabel) return ''
  const d = new Date(isoOrLabel)
  if (Number.isNaN(d.getTime())) return String(isoOrLabel)
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return d.toLocaleDateString('en-JM', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function averageRating(reviews) {
  if (!reviews?.length) return 0
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export function mapReview(row) {
  if (!row) return null
  return {
    id: row.id,
    placeId: row.place_id,
    source: row.source || 'outyah',
    author: row.author,
    avatar: row.avatar,
    rating: Number(row.rating) || 0,
    text: row.body,
    businessReply: row.business_reply || null,
    date: row.posted_at,
    userId: row.user_id || null,
  }
}

export function reviewToRow(review) {
  return {
    id: review.id,
    place_id: review.placeId,
    source: review.source || 'outyah',
    author: review.author,
    avatar: review.avatar || null,
    rating: review.rating,
    body: review.text,
    business_reply: review.businessReply || null,
    posted_at: review.date || new Date().toISOString(),
    user_id: review.userId || null,
  }
}
