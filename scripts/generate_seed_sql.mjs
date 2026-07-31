import { writeFileSync } from 'fs'
import { places, events } from '../src/data/outyahData.js'
import { MOCK_INSTAGRAM_POSTS } from '../src/data/instagramFeed.js'

function esc(s) {
  if (s == null) return 'null'
  return `'${String(s).replace(/'/g, "''")}'`
}

function j(v) {
  return esc(JSON.stringify(v))
}

const sql = []
sql.push('-- Seed data generated from src/data')
sql.push(
  'truncate post_comments, posts, events, plan_stops, favorites, places restart identity cascade;',
)

for (const p of places) {
  sql.push(`insert into places (
  id, name, category, neighborhood, area, image, images, rating, review_count,
  price_range, currency, tags, open_until, open_now, description, amenities,
  address, phone, lat, lng, hours, special, reviews, slots, slot_label
) values (
  ${esc(p.id)}, ${esc(p.name)}, ${esc(p.category)}, ${esc(p.neighborhood)}, ${esc(p.area)},
  ${esc(p.image)}, ${j(p.images)}, ${p.rating}, ${p.reviewCount}, ${p.priceRange}, ${esc(p.currency)},
  ${j(p.tags)}, ${esc(p.openUntil)}, ${p.openNow}, ${esc(p.description)}, ${j(p.amenities)},
  ${esc(p.address)}, ${esc(p.phone)}, ${p.map.lat}, ${p.map.lng}, ${j(p.hours)},
  ${p.special ? esc(p.special) : 'null'},
  ${j(p.reviews || [])}, ${p.slots ? j(p.slots) : 'null'}, ${p.slotLabel ? esc(p.slotLabel) : 'null'}
);`)
}

for (const e of events) {
  sql.push(`insert into events (
  id, title, type, date_label, time_label, venue_name, place_id, area, image,
  description, going, interested, price, attendees
) values (
  ${esc(e.id)}, ${esc(e.title)}, ${esc(e.type)}, ${esc(e.date)}, ${esc(e.time)}, ${esc(e.venueName)},
  ${esc(e.placeId)}, ${esc(e.area)}, ${esc(e.image)}, ${esc(e.description)}, ${e.going}, ${e.interested},
  ${esc(e.price)}, ${j(e.attendees)}
);`)
}

for (const post of MOCK_INSTAGRAM_POSTS) {
  sql.push(`insert into posts (
  id, place_id, username, user_avatar, caption, media_url, media_type, permalink,
  posted_at, like_count, comments_count
) values (
  ${esc(post.id)}, ${esc(post.placeId)}, ${esc(post.username)}, ${esc(post.userAvatar)}, ${esc(post.caption)},
  ${esc(post.mediaUrl)}, ${esc(post.mediaType)}, ${esc(post.permalink)}, ${esc(post.timestamp)},
  ${post.likeCount}, ${post.commentsCount}
);`)
  for (const c of post.comments || []) {
    sql.push(`insert into post_comments (id, post_id, username, body, posted_at) values (
  ${esc(`${post.id}-${c.id}`)}, ${esc(post.id)}, ${esc(c.username)}, ${esc(c.text)}, ${esc(c.timestamp)}
);`)
  }
}

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), `${sql.join('\n\n')}\n`)
console.log(
  `Wrote seed: ${places.length} places, ${events.length} events, ${MOCK_INSTAGRAM_POSTS.length} posts`,
)
