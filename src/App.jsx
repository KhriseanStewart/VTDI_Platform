import { Navigate, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomeFeed from './pages/HomeFeed'
import VenueDetail from './pages/VenueDetail'
import Favorites from './pages/Favorites'
import Planner from './pages/Planner'
import Profile from './pages/Profile'
import AuthPage from './pages/Auth'
import Events, { EventDetail } from './pages/Events'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPlaces from './pages/admin/AdminPlaces'
import AdminEvents from './pages/admin/AdminEvents'
import AdminPosts from './pages/admin/AdminPosts'

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
        <Route path="auth" element={<AuthPage />} />
      </Route>

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="places" element={<AdminPlaces />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="posts" element={<AdminPosts />} />
      </Route>
    </Routes>
  )
}
