import { useEffect, useState } from 'react'
import { loadInstagramFeed } from '../lib/instagram'

export function useInstagramFeed() {
  const [posts, setPosts] = useState([])
  const [source, setSource] = useState('demo')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const result = await loadInstagramFeed()
      if (cancelled) return
      setPosts(result.posts)
      setSource(result.source)
      setError(result.error)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { posts, source, error, loading }
}
