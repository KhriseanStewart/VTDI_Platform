import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { btn, ui } from '../lib/ui'

export default function NotFound() {
  return (
    <EmptyState
      icon={Compass}
      eyebrow="404"
      title="This page took a wrong turn"
      description="The link may be out of date. Head back to the feed and pick up where you left off."
      action={
        <div className={ui.actionRow}>
          <Link to="/explore" className={btn(ui.btnPrimary)}>
            Back to explore
          </Link>
          <Link to="/events" className={btn(ui.btnOutline)}>
            Browse events
          </Link>
        </div>
      }
    />
  )
}
