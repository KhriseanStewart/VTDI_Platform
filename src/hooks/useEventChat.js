import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  deleteMessage,
  fetchMessages,
  fetchRsvpSummary,
  removeRsvp,
  saveRsvp,
  sendMessage,
  subscribeToRoom,
} from '../lib/eventChat'

// keyed by event+user so stale fetches can't land in the wrong room

function byOldestFirst(a, b) {
  const diff = new Date(a.createdAt) - new Date(b.createdAt)
  return diff !== 0 ? diff : String(a.id).localeCompare(String(b.id))
}

/** dedupe by id, keep oldest → newest */
function mergeMessages(...lists) {
  const byId = new Map()
  for (const list of lists) {
    for (const message of list) {
      if (message?.id) byId.set(message.id, message)
    }
  }
  return [...byId.values()].sort(byOldestFirst)
}

/** your rsvp + public going/interested counts */
export function useEventRsvp(eventId) {
  const { user } = useAuth()
  const [state, setState] = useState({ key: null, going: 0, interested: 0, mine: null })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const userId = user?.id ?? null
  const key = eventId && isSupabaseConfigured ? `${eventId}:${userId ?? 'anon'}` : null

  const load = useCallback(async () => {
    if (!eventId) return null
    const summary = await fetchRsvpSummary(eventId, userId)
    return summary
  }, [eventId, userId])

  useEffect(() => {
    if (!key) return undefined
    let cancelled = false

    load()
      .then((summary) => {
        if (!cancelled && summary) setState({ key, ...summary })
      })
      .catch(() => {
        // count failed — just show zeros
        if (!cancelled) setState({ key, going: 0, interested: 0, mine: null })
      })

    return () => {
      cancelled = true
    }
  }, [key, load])

  const ready = state.key === key

  const change = useCallback(
    async (status) => {
      if (!userId || !eventId) return
      setBusy(true)
      setError('')
      try {
        if (status === null) {
          await removeRsvp({ eventId, userId })
        } else {
          await saveRsvp({ eventId, userId, status })
        }
        const summary = await load()
        if (summary) setState({ key: `${eventId}:${userId}`, ...summary })
      } catch (err) {
        setError(err.message || 'Could not update your RSVP')
      } finally {
        setBusy(false)
      }
    },
    [eventId, userId, load],
  )

  const mine = ready ? state.mine : null

  return {
    going: ready ? state.going : 0,
    interested: ready ? state.interested : 0,
    mine,
    // any rsvp unlocks chat
    joined: Boolean(mine),
    loading: Boolean(key) && !ready,
    busy,
    error,
    // tap again to clear
    toggle: (status) => change(mine === status ? null : status),
  }
}

/** live chat — only subscribe once you've rsvp'd */
export function useEventChat(eventId, { joined }) {
  const { user } = useAuth()
  const [room, setRoom] = useState({ key: null, messages: [], error: '' })
  const [channel, setChannel] = useState({ key: null, subscribed: false })

  const userId = user?.id ?? null
  const active = Boolean(joined && eventId && userId && isSupabaseConfigured)
  const key = active ? `${eventId}:${userId}` : null

  useEffect(() => {
    if (!key) return undefined
    let cancelled = false

    fetchMessages(eventId)
      .then((fetched) => {
        if (cancelled) return
        // merge so a realtime insert that beat the fetch doesn't get dropped
        setRoom((prev) => ({
          key,
          messages: mergeMessages(fetched, prev.key === key ? prev.messages : []),
          error: '',
        }))
      })
      .catch((err) => {
        if (!cancelled) {
          setRoom({ key, messages: [], error: err.message || 'Could not load the chat' })
        }
      })

    const unsubscribe = subscribeToRoom(eventId, {
      onInsert: (message) => {
        if (cancelled) return
        setRoom((prev) => ({
          key,
          messages: mergeMessages(prev.key === key ? prev.messages : [], [message]),
          error: prev.key === key ? prev.error : '',
        }))
      },
      onDelete: (id) => {
        if (cancelled) return
        setRoom((prev) =>
          prev.key === key
            ? { ...prev, messages: prev.messages.filter((m) => m.id !== id) }
            : prev,
        )
      },
      onStatus: (status) => {
        if (!cancelled) setChannel({ key, subscribed: status === 'SUBSCRIBED' })
      },
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [key, eventId])

  const ready = room.key === key

  const send = useCallback(
    async (body) => {
      if (!active) return
      // merge from the insert response so it shows even if realtime is down
      const message = await sendMessage({ eventId, userId, body })
      if (!message) return
      setRoom((prev) => ({
        key,
        messages: mergeMessages(prev.key === key ? prev.messages : [], [message]),
        error: '',
      }))
    },
    [active, eventId, userId, key],
  )

  const remove = useCallback(async (id) => {
    await deleteMessage(id)
    setRoom((prev) => ({ ...prev, messages: prev.messages.filter((m) => m.id !== id) }))
  }, [])

  return {
    messages: ready ? room.messages : [],
    loading: Boolean(key) && !ready,
    error: ready ? room.error : '',
    connected: channel.key === key && channel.subscribed,
    send,
    remove,
  }
}
