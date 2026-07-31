import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AppContext = createContext(null)
const GUEST_FAV_KEY = 'outyah_favorites'
const GUEST_PLAN_KEY = 'outyah_plan'

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState(() => readLocal(GUEST_FAV_KEY))
  const [plan, setPlan] = useState(() => readLocal(GUEST_PLAN_KEY))
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!isSupabaseConfigured || !user) {
        if (!cancelled) {
          setFavorites(readLocal(GUEST_FAV_KEY))
          setPlan(readLocal(GUEST_PLAN_KEY))
          setReady(true)
        }
        return
      }

      const [{ data: favs }, { data: stops }] = await Promise.all([
        supabase.from('favorites').select('place_id').eq('user_id', user.id),
        supabase
          .from('plan_stops')
          .select('place_id, position')
          .eq('user_id', user.id)
          .order('position'),
      ])
      if (cancelled) return
      setFavorites((favs || []).map((f) => f.place_id))
      setPlan((stops || []).map((s) => s.place_id))
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (user || !ready) return
    writeLocal(GUEST_FAV_KEY, favorites)
  }, [favorites, user, ready])

  useEffect(() => {
    if (user || !ready) return
    writeLocal(GUEST_PLAN_KEY, plan)
  }, [plan, user, ready])

  const value = useMemo(() => {
    async function syncFavorite(id, nextHas) {
      if (!isSupabaseConfigured || !user) return
      if (nextHas) {
        await supabase.from('favorites').upsert({ user_id: user.id, place_id: id })
      } else {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('place_id', id)
      }
    }

    async function syncPlan(nextPlan) {
      if (!isSupabaseConfigured || !user) return
      await supabase.from('plan_stops').delete().eq('user_id', user.id)
      if (!nextPlan.length) return
      await supabase.from('plan_stops').insert(
        nextPlan.map((place_id, position) => ({
          user_id: user.id,
          place_id,
          position,
        })),
      )
    }

    return {
      favorites,
      plan,
      ready,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite: (id) => {
        setFavorites((prev) => {
          const nextHas = !prev.includes(id)
          const next = nextHas ? [...prev, id] : prev.filter((x) => x !== id)
          syncFavorite(id, nextHas)
          return next
        })
      },
      isInPlan: (id) => plan.includes(id),
      addToPlan: (id) => {
        setPlan((prev) => {
          if (prev.includes(id)) return prev
          const next = [...prev, id]
          syncPlan(next)
          return next
        })
      },
      removeFromPlan: (id) => {
        setPlan((prev) => {
          const next = prev.filter((x) => x !== id)
          syncPlan(next)
          return next
        })
      },
      togglePlan: (id) => {
        setPlan((prev) => {
          const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
          syncPlan(next)
          return next
        })
      },
      clearPlan: () => {
        setPlan([])
        syncPlan([])
      },
    }
  }, [favorites, plan, ready, user])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
