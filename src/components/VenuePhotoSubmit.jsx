import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { submitVenuePhoto } from '../lib/data'
import { uploadMedia } from '../lib/upload'
import { btn, cn, ui } from '../lib/ui'

export default function VenuePhotoSubmit({ placeId, placeName }) {
  const { user, profile } = useAuth()
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  if (!user) {
    return (
      <p className={cn(ui.muted, 'text-sm')}>
        <Link to={`/auth?next=/place/${placeId}`} className={ui.textLink}>
          Sign in
        </Link>{' '}
        to submit a photo of {placeName} for the feed (admin approval required).
      </p>
    )
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!file) {
      setError('Choose a photo first')
      return
    }
    setBusy(true)
    setError('')
    try {
      const mediaUrl = await uploadMedia(file, 'submissions')
      await submitVenuePhoto({
        placeId,
        mediaUrl,
        caption: caption.trim(),
        userId: user.id,
        username: profile?.handle || profile?.name || user.email?.split('@')[0] || 'OutYah user',
        userAvatar: profile?.avatar_url,
      })
      setDone(true)
      setFile(null)
      setCaption('')
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <p className={cn(ui.formOk, 'inline-flex items-center gap-1.5')}>
        <Check size={16} /> Photo submitted — an admin will review it before it goes live.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className={cn(ui.cardPanel, ui.stack)}>
      <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
        <Camera size={16} /> Submit a photo
      </p>
      <p className={cn(ui.muted, 'text-sm')}>
        Images stay private until an admin approves them for the public feed.
      </p>
      <label className={ui.field}>
        <span className={ui.fieldLabel}>Photo</span>
        <input
          type="file"
          accept="image/*"
          className={ui.fieldControl}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>
      <label className={ui.field}>
        <span className={ui.fieldLabel}>Caption (optional)</span>
        <input
          className={ui.fieldControl}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's the vibe?"
          maxLength={200}
        />
      </label>
      {error && <p className={ui.formError}>{error}</p>}
      <button type="submit" className={btn(ui.btnPrimary)} disabled={busy}>
        {busy ? 'Uploading…' : 'Submit for approval'}
      </button>
    </form>
  )
}
