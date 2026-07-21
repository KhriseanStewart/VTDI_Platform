import { createContext, useContext, useMemo, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [favorites, setFavorites] = useState([])
  const [plan, setPlan] = useState([])

  const value = useMemo(
    () => ({
      favorites,
      plan,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite: (id) =>
        setFavorites((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        ),
      isInPlan: (id) => plan.includes(id),
      addToPlan: (id) =>
        setPlan((prev) => (prev.includes(id) ? prev : [...prev, id])),
      removeFromPlan: (id) => setPlan((prev) => prev.filter((x) => x !== id)),
      togglePlan: (id) =>
        setPlan((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        ),
      clearPlan: () => setPlan([]),
    }),
    [favorites, plan],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
