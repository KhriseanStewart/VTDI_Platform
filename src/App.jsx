import './App.css';
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomeFeed from './pages/HomeFeed'
import Search from './pages/Search'
import VenueDetail from './pages/VenueDetail'
import Favorites from './pages/Favorites'
import Planner from './pages/Planner'
import Profile from './pages/Profile'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeFeed />} />
        <Route path="search" element={<Search />} />
        <Route path="venue/:id" element={<VenueDetail />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="plan" element={<Planner />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App
