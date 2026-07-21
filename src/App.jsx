import { Navigate, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomeFeed from './pages/HomeFeed'
import VenueDetail from './pages/VenueDetail'
import Favorites from './pages/Favorites'
import Planner from './pages/Planner'
import Profile from './pages/Profile'
import Events, { EventDetail } from './pages/Events'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeFeed />} />
        <Route path="explore" element={<Navigate to="/" replace />} />
        <Route path="place/:id" element={<VenueDetail />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="plan" element={<Planner />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}
