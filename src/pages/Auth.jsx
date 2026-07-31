import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
      <div className="stack-lg auth-page">
        <h1 className="display">Auth unavailable</h1>
        <p className="lede">Add Supabase URL and anon key to your environment.</p>
        <Link to="/" className="btn btn-primary">
          Back home
        </Link>
      </div>
    )
  }

  return (
    <div className="stack-lg auth-page">
      <header>
        <p className="eyebrow">OutYah account</p>
        <h1 className="display">{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
      </header>

      <form className="auth-form card-panel stack" onSubmit={onSubmit}>
        {mode === 'signup' && (
          <label className="field">
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </label>
        )}
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-ok">{message}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>
      </form>

      <p className="muted">
        {mode === 'signin' ? (
          <>
            New here?{' '}
            <button type="button" className="text-link" onClick={() => setMode('signup')}>
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button type="button" className="text-link" onClick={() => setMode('signin')}>
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  )
}
