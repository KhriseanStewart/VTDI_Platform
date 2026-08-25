import { isSupabaseConfigured, supabase } from './supabase'

// rsvp + chat for events. rls blocks non-rsvpers — empty room, not an error.

const MESSAGE_LIMIT = 200
export const MAX_MESSAGE_LENGTH = 1000

function ensureClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured')
  }
}

export function mapMessage(row) {
  if (!row) return null
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    author: row.author || 'Guest',
    avatar: row.avatar || null,
    body: row.body || '',
    createdAt: row.created_at,
  }
}

export function avatarFor(message) {
  if (message?.avatar) return message.avatar
  const seed = encodeURIComponent(message?.author || message?.userId || 'guest')
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
}

/** going / interested counts + your own status if signed in */
export async function fetchRsvpSummary(eventId, userId = null) {
  ensureClient()
  const { data, error } = await supabase
    .from('event_rsvps')
    .select('user_id, status')
    .eq('event_id', eventId)
  if (error) throw error

  const rows = data || []
  return {
    going: rows.filter((r) => r.status === 'going').length,
    interested: rows.filter((r) => r.status === 'interested').length,
    mine: userId ? (rows.find((r) => r.user_id === userId)?.status ?? null) : null,
  }
}

/** create or flip rsvp status */
export async function saveRsvp({ eventId, userId, status }) {
  ensureClient()
  const { error } = await supabase
    .from('event_rsvps')
    .upsert({ event_id: eventId, user_id: userId, status }, { onConflict: 'event_id,user_id' })
  if (error) throw error
}

export async function removeRsvp({ eventId, userId }) {
  ensureClient()
  const { error } = await supabase
    .from('event_rsvps')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId)
  if (error) throw error
}

/** newest first from db, flipped so the chat reads top → bottom */
export async function fetchMessages(eventId) {
  ensureClient()
  const { data, error } = await supabase
    .from('event_messages')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(MESSAGE_LIMIT)
  if (error) throw error
  return (data || []).map(mapMessage).reverse()
}

/** author/avatar come from a db trigger — don't send them from here */
export async function sendMessage({ eventId, userId, body }) {
  ensureClient()
  const trimmed = body.trim().slice(0, MAX_MESSAGE_LENGTH)
  if (!trimmed) return null

  const { data, error } = await supabase
    .from('event_messages')
    .insert({ event_id: eventId, user_id: userId, body: trimmed })
    .select('*')
    .single()
  if (error) throw error
  return mapMessage(data)
}

export async function deleteMessage(id) {
  ensureClient()
  const { error } = await supabase.from('event_messages').delete().eq('id', id)
  if (error) throw error
}

/** live inserts for this event; deletes just give us the id */
export function subscribeToRoom(eventId, { onInsert, onDelete, onStatus } = {}) {
  if (!isSupabaseConfigured || !supabase) return () => {}

  const channel = supabase
    .channel(`event-chat:${eventId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'event_messages',
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => onInsert?.(mapMessage(payload.new)),
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'event_messages' },
      (payload) => {
        if (payload.old?.id) onDelete?.(payload.old.id)
      },
    )
    .subscribe((status) => onStatus?.(status))

  return () => {
    supabase.removeChannel(channel)
  }
}

/** "now" / "4m" / "3h" / "Aug 24" */
export function formatMessageTime(iso) {
  if (!iso) return ''
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return ''

  const mins = Math.floor((Date.now() - then.getTime()) / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return then.toLocaleDateString('en-JM', { month: 'short', day: 'numeric' })
}
