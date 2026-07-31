import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchEvents, fetchPlaces, fetchPosts } from '../lib/data'
import { isSupabaseConfigured } from '../lib/supabase'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [places, setPlaces] = useState([])
  const [events, setEvents] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function refresh() {
    setLoading(true)
    setError(null)

    if (!isSupabaseConfigured) {
      setPlaces([])
      setEvents([])
      setPosts([])
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      setLoading(false)
      return
    }

    try {
      const [p, e, postsData] = await Promise.all([
        fetchPlaces(),
        fetchEvents(),
        fetchPosts(),
      ])
      setPlaces(p)
      setEvents(e)
      setPosts(postsData)
    } catch (err) {
      console.error(err)
      setPlaces([])
      setEvents([])
      setPosts([])
      setError(err.message || 'Could not load data from Supabase')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const value = useMemo(
    () => ({
      places,
      events,
      posts,
      loading,
      error,
      refresh,
      getPlace: (id) => places.find((p) => p.id === id),
      getEvent: (id) => events.find((e) => e.id === id),
    }),
    [places, events, posts, loading, error],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
