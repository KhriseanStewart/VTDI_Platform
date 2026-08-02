import { Navigate, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { cn, ui } from '../../lib/ui'

/** Auth gate only — shell/nav lives in Layout */
export default function AdminLayout() {
  const { loading, user, isAdmin } = useAuth()

  if (loading) return <p className={cn(ui.muted, 'py-12 text-center')}>Checking access…</p>
  if (!user) return <Navigate to="/auth?next=/admin" replace />
  if (!isAdmin) {
    return (
      <div className={ui.stackLg}>
        <h1 className={ui.display}>Admin only</h1>
        <p className={ui.lede}>
          Your account is signed in but not an admin. In Supabase SQL Editor run:
        </p>
        <pre className={ui.codeBlock}>{`update profiles set role = 'admin' where id = '${user.id}';`}</pre>
        <Link to="/" className={cn(ui.btn, ui.btnOutline)}>
          Back to Feed
        </Link>
      </div>
    )
  }

  return <Outlet />
}
