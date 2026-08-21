import { useEffect, useId, useState } from 'react'
import { Check, Copy, Link2, Share2, X } from 'lucide-react'
import { copyText, createSharedPlan, nativeShare } from '../lib/sharePlan'
import { useAuth } from '../context/AuthContext'
import { btn, cn, ui } from '../lib/ui'

/**
 * Meta-style share sheet: create link, copy, or system share.
 */
export default function SharePlanSheet({ open, onClose, placeIds, planTitle }) {
  const { user } = useAuth()
  const titleId = useId()
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setBusy(true)
    setError('')
    setCopied(false)
    setUrl('')
    ;(async () => {
      try {
        const result = await createSharedPlan({
          placeIds,
          title: planTitle,
          userId: user?.id || null,
        })
        if (!cancelled) setUrl(result.url)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not create share link')
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, placeIds, planTitle, user?.id])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  async function onCopy() {
    if (!url) return
    const ok = await copyText(url)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  async function onNativeShare() {
    if (!url) return
    try {
      const shared = await nativeShare({
        url,
        title: planTitle || 'OutYah outing plan',
        text: 'Check out this outing plan on OutYah',
      })
      if (!shared) await onCopy()
    } catch {
      await onCopy()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-fg/40 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md animate-[fade-up_0.25s_ease-out] rounded-t-[1.35rem] border border-border bg-card p-5 shadow-lg sm:rounded-[1.35rem]"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className={ui.eyebrow}>Share</p>
            <h2 id={titleId} className="font-display text-xl font-extrabold">
              Send this plan
            </h2>
            <p className={cn(ui.muted, 'mt-1 text-sm')}>
              Friends open the link to see your stops — no account required to view.
            </p>
          </div>
          <button type="button" className={ui.iconBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {error && <p className={ui.formError}>{error}</p>}

        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-bg px-3 py-3">
          <Link2 size={18} className="shrink-0 text-primary" />
          <input
            readOnly
            value={busy ? 'Creating link…' : url}
            className="min-w-0 flex-1 border-none bg-transparent text-sm font-medium text-fg outline-none"
            aria-label="Share link"
            onFocus={(e) => e.target.select()}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className={btn(ui.btnPrimary, 'flex-1')}
            disabled={busy || !url}
            onClick={onCopy}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <button
            type="button"
            className={btn(ui.btnOutline, 'flex-1')}
            disabled={busy || !url}
            onClick={onNativeShare}
          >
            <Share2 size={18} />
            Share…
          </button>
        </div>
      </div>
    </div>
  )
}
