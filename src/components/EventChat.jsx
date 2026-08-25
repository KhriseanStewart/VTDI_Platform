import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, MessagesSquare, SendHorizontal, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEventChat } from '../hooks/useEventChat'
import { avatarFor, formatMessageTime, MAX_MESSAGE_LENGTH } from '../lib/eventChat'
import { btn, cn, ui } from '../lib/ui'

function Shell({ children, connected, count }) {
  return (
    <section className={ui.chatPanel} aria-label="Event chat">
      <header className={ui.chatHead}>
        <h2 className={ui.chatTitle}>
          <MessagesSquare size={16} className="text-primary" />
          Event chat
        </h2>
        {connected != null && (
          <span className={ui.chatLive}>
            <span className={connected ? ui.chatLiveDot : ui.chatLiveDotOff} aria-hidden />
            {connected ? 'Live' : 'Connecting…'}
            {count > 0 && <span className="text-subtle">· {count}</span>}
          </span>
        )}
      </header>
      {children}
    </section>
  )
}

/** event chat — locked until you rsvp (rls enforces it too) */
export default function EventChat({ eventId, joined, onJoin, joining }) {
  const { user } = useAuth()
  const { messages, loading, error, connected, send, remove } = useEventChat(eventId, { joined })
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const scrollRef = useRef(null)

  // stick to the bottom as new messages arrive
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  if (!user) {
    return (
      <Shell>
        <div className={ui.chatLocked}>
          <span className={ui.chatLockedIcon}>
            <Lock size={22} />
          </span>
          <div>
            <p className="font-display text-[1.05rem] font-bold">Sign in to join the chat</p>
            <p className={cn(ui.small, 'mt-1')}>
              Chat opens up once you RSVP — coordinate rides, meetups, and what time everyone
              is really showing up.
            </p>
          </div>
          <Link to={`/auth?next=/events/${eventId}`} className={btn(ui.btnPrimary)}>
            Sign in
          </Link>
        </div>
      </Shell>
    )
  }

  if (!joined) {
    return (
      <Shell>
        <div className={ui.chatLocked}>
          <span className={ui.chatLockedIcon}>
            <Lock size={22} />
          </span>
          <div>
            <p className="font-display text-[1.05rem] font-bold">RSVP to unlock the chat</p>
            <p className={cn(ui.small, 'mt-1')}>
              Only people going to this event can read and post here.
            </p>
          </div>
          <button
            type="button"
            className={btn(ui.btnPrimary)}
            onClick={onJoin}
            disabled={joining}
          >
            {joining ? 'One sec…' : 'I’m going'}
          </button>
        </div>
      </Shell>
    )
  }

  async function onSubmit(e) {
    e.preventDefault()
    const body = draft.trim()
    if (!body || sending) return

    setSending(true)
    setSendError('')
    try {
      await send(body)
      setDraft('')
    } catch (err) {
      setSendError(err.message || 'Message did not send')
    } finally {
      setSending(false)
    }
  }

  return (
    <Shell connected={connected} count={messages.length}>
      <div className={ui.chatScroll} ref={scrollRef} aria-live="polite" aria-busy={loading}>
        {loading ? (
          <div className="grid gap-3.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="skeleton h-8 w-8 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="skeleton h-3 w-24 rounded" />
                  <div className="skeleton mt-2 h-3 w-3/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className={cn(ui.chatEmpty, 'text-danger')}>{error}</p>
        ) : messages.length === 0 ? (
          <p className={ui.chatEmpty}>
            No messages yet — say what time you’re heading out.
          </p>
        ) : (
          messages.map((message) => (
            <article key={message.id} className={ui.chatRow}>
              <img src={avatarFor(message)} alt="" className={ui.chatAvatar} />
              <div className="min-w-0 flex-1">
                <div className={ui.chatMeta}>
                  <span className={ui.chatAuthor}>
                    {message.userId === user.id ? 'You' : message.author}
                  </span>
                  <span className={ui.chatTime}>{formatMessageTime(message.createdAt)}</span>
                </div>
                <p className={ui.chatBody}>{message.body}</p>
              </div>
              {message.userId === user.id && (
                <button
                  type="button"
                  className={ui.chatDelete}
                  onClick={() => remove(message.id)}
                  aria-label="Delete your message"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </article>
          ))
        )}
      </div>

      <form onSubmit={onSubmit} className={ui.chatForm}>
        <label className="sr-only" htmlFor={`chat-${eventId}`}>
          Message
        </label>
        <textarea
          id={`chat-${eventId}`}
          className={ui.chatInput}
          rows={1}
          value={draft}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="Message everyone going…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // enter sends, shift+enter = new line
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSubmit(e)
            }
          }}
        />
        <button
          type="submit"
          className={ui.chatSend}
          disabled={!draft.trim() || sending}
          aria-label="Send message"
        >
          <SendHorizontal size={17} />
        </button>
      </form>
      {sendError && <p className={cn(ui.formError, 'px-3 pb-3')}>{sendError}</p>}
    </Shell>
  )
}
