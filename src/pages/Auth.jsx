import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { btn, cn, ui } from '../lib/ui'

const COPY = {
  signin: {
    heading: 'Welcome back',
    lede: 'Sign in to sync your favorites, plans, and reviews across devices.',
    action: 'Sign in',
    pending: 'Signing in…',
  },
  signup: {
    heading: 'Create your account',
    lede: 'One account keeps your island shortlist and outing plans in sync.',
    action: 'Create account',
    pending: 'Creating account…',
  },
}

export default function AuthPage() {
  const { configured, signIn, signUp, user, loading } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/profile'

  useEffect(() => {
    if (!loading && user) navigate(next, { replace: true })
  }, [user, loading, navigate, next])

  function switchMode(nextMode) {
    if (nextMode === mode) return
    setMode(nextMode)
    // Don't carry a failure from the other form across.
    setError('')
    setMessage('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
        navigate(next, { replace: true })
      } else {
        await signUp(email, password, { name })
        setMessage(
          'Account created. If email confirmation is on, check your inbox — otherwise sign in below.',
        )
        setMode('signin')
        setPassword('')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  if (!configured) {
    return (
      <div className="mx-auto flex min-h-[70dvh] w-full max-w-108 flex-col justify-center gap-4 text-center">
        <div className="flex justify-center">
          <Logo showWordmark={false} size="lg" />
        </div>
        <h1 className={ui.display}>Sign-in unavailable</h1>
        <p className={cn(ui.lede, 'mx-auto')}>
          This environment has no Supabase credentials, so accounts are switched off. Browsing,
          favorites, and plans still work on this device.
        </p>
        <Link to="/explore" className={cn(btn(ui.btnPrimary), 'mx-auto')}>
          Keep exploring
        </Link>
      </div>
    )
  }

  // Avoid flashing the form to someone who already has a session.
  if (loading || user) {
    return (
      <div className="grid min-h-[70dvh] place-items-center" aria-busy="true">
        <Loader2 size={22} className="animate-spin text-muted" />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  const copy = COPY[mode]
  const isSignup = mode === 'signup'

  return (
    <div className="relative mx-auto flex min-h-[74dvh] w-full max-w-108 flex-col justify-center gap-5 py-6">
      {/* Soft glow so the card reads as placed, not stranded in whitespace. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-104 w-104 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-primary)_11%,transparent),transparent_70%)] blur-2xl"
      />

      <header className="text-center">
        <div className="mb-4 flex justify-center">
          <Logo showWordmark={false} size="lg" />
        </div>
        <h1 className={ui.display}>{copy.heading}</h1>
        <p className={cn(ui.lede, 'mx-auto mt-2 text-[0.92rem]')}>{copy.lede}</p>
      </header>

      <div className={ui.segmented} role="group" aria-label="Sign in or create an account">
        <button
          type="button"
          className={cn(ui.segmentedItem, !isSignup && ui.segmentedItemActive)}
          onClick={() => switchMode('signin')}
          aria-pressed={!isSignup}
        >
          Sign in
        </button>
        <button
          type="button"
          className={cn(ui.segmentedItem, isSignup && ui.segmentedItemActive)}
          onClick={() => switchMode('signup')}
          aria-pressed={isSignup}
        >
          Create account
        </button>
      </div>

      <form className={cn(ui.cardPanel, ui.stack, 'gap-3.5')} onSubmit={onSubmit}>
        {isSignup && (
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Name</span>
            <span className={ui.fieldGroup}>
              <User size={16} className={ui.fieldIcon} />
              <input
                className={cn(ui.fieldControl, ui.fieldControlIcon)}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should we greet you?"
                autoComplete="name"
                required
              />
            </span>
          </label>
        )}

        <label className={ui.field}>
          <span className={ui.fieldLabel}>Email</span>
          <span className={ui.fieldGroup}>
            <Mail size={16} className={ui.fieldIcon} />
            <input
              className={cn(ui.fieldControl, ui.fieldControlIcon)}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              inputMode="email"
              autoFocus={!isSignup}
            />
          </span>
        </label>

        <label className={ui.field}>
          <span className={ui.fieldLabel}>Password</span>
          <span className={ui.fieldGroup}>
            <Lock size={16} className={ui.fieldIcon} />
            <input
              className={cn(ui.fieldControl, ui.fieldControlIcon, ui.fieldControlAction)}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? 'At least 6 characters' : '••••••••'}
              required
              minLength={isSignup ? 6 : undefined}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />
            <button
              type="button"
              className={ui.fieldAction}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>

        {error && (
          <p className={ui.formError}>
            <AlertCircle size={15} className="mt-px shrink-0" />
            {error}
          </p>
        )}
        {message && (
          <p className={ui.formOk}>
            <CheckCircle2 size={15} className="mt-px shrink-0" />
            {message}
          </p>
        )}

        <button
          type="submit"
          className={cn(btn(ui.btnPrimary), ui.btnBlock, ui.btnLg, 'mt-1')}
          disabled={busy}
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? copy.pending : copy.action}
        </button>
      </form>

      <p className={cn(ui.fieldHint, 'text-center')}>
        We use your email for sign-in and to sync your plans. Nothing gets posted without you.
      </p>
    </div>
  )
}
