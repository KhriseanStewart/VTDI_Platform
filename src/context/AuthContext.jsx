import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId) {
    if (!supabase || !userId) {
      setProfile(null)
      return null
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) {
      console.warn('profile load', error.message)
      setProfile(null)
      return null
    }

    if (data?.banned_at) {
      setProfile(null)
      await supabase.auth.signOut()
      return { banned: true, reason: data.ban_reason }
    }

    setProfile(data)
    return data
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return undefined
    }

    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      if (data.session?.user) loadProfile(data.session.user.id).finally(() => setLoading(false))
      else setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (next?.user) loadProfile(next.user.id)
      else setProfile(null)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => {
    const user = session?.user ?? null
    return {
      configured: isSupabaseConfigured,
      loading,
      session,
      user,
      profile,
      isAdmin: profile?.role === 'admin' && !profile?.banned_at,
      isBanned: Boolean(profile?.banned_at),
      async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        const loaded = await loadProfile(data.user?.id)
        if (loaded?.banned) {
          sessionStorage.setItem('outyah_ban', loaded.reason || '1')
          throw new Error('This account has been banned from OutYah.')
        }
        return data
      },
      async signUp(email, password, meta = {}) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: meta.name || email.split('@')[0],
              handle: meta.handle || `@${email.split('@')[0]}`,
            },
          },
        })
        if (error) throw error
        return data
      },
      async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setProfile(null)
      },
      refreshProfile: () => (user ? loadProfile(user.id) : Promise.resolve(null)),
    }
  }, [session, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
