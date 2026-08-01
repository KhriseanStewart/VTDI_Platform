import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { btn, cn, ui } from '../lib/ui'

export default function AuthPage() {
  const { configured, signIn, signUp, user, loading } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/profile'

  useEffect(() => {
    if (!loading && user) navigate(next, { replace: true })
  }, [user, loading, navigate, next])

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
        setMessage('Account created. If email confirmation is on, check your inbox; otherwise sign in.')
        setMode('signin')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  if (!configured) {
    return (
      <div className={ui.stackLg}>
        <h1 className={ui.display}>Auth unavailable</h1>
        <p className={ui.lede}>Add Supabase URL and anon key to your environment.</p>
        <Link to="/" className={btn(ui.btnPrimary)}>
          Back home
        </Link>
      </div>
    )
  }

  return (
    <div className={ui.stackLg}>
      <header>
        <p className={ui.eyebrow}>OutYah account</p>
        <h1 className={ui.display}>{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
      </header>

      <form className={cn(ui.cardPanel, ui.stack, 'gap-3.5')} onSubmit={onSubmit}>
        {mode === 'signup' && (
          <label className={ui.field}>
            <span className={ui.fieldLabel}>Name</span>
            <input
              className={ui.fieldControl}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </label>
        )}
        <label className={ui.field}>
          <span className={ui.fieldLabel}>Email</span>
          <input
            className={ui.fieldControl}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className={ui.field}>
          <span className={ui.fieldLabel}>Password</span>
          <input
            className={ui.fieldControl}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
        </label>
        {error && <p className={ui.formError}>{error}</p>}
        {message && <p className={ui.formOk}>{message}</p>}
        <button type="submit" className={btn(ui.btnPrimary)} disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>
      </form>

      <p className={ui.muted}>
        {mode === 'signin' ? (
          <>
            New here?{' '}
            <button
              type="button"
              className={cn('cursor-pointer border-none bg-transparent p-0', ui.textLink)}
              onClick={() => setMode('signup')}
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              className={cn('cursor-pointer border-none bg-transparent p-0', ui.textLink)}
              onClick={() => setMode('signin')}
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  )
}
