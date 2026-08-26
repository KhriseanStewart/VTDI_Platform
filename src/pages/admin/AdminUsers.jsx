import { startTransition, useEffect, useMemo, useState } from 'react'
import { Shield, ShieldOff, UserCog } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { cn, ui, btn } from '../../lib/ui'

function formatWhen(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-JM', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function AdminUsers() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  async function load() {
    const { data, error: err } = await supabase
      .from('profiles')
      .select('id, name, handle, role, banned_at, ban_reason, created_at')
      .order('created_at', { ascending: false })

    if (err) setError(err.message)
    else setRows(data || [])
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, name, handle, role, banned_at, ban_reason, created_at')
        .order('created_at', { ascending: false })

      if (cancelled) return
      startTransition(() => {
        if (err) setError(err.message)
        else setRows(data || [])
      })
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(needle) ||
        r.handle?.toLowerCase().includes(needle) ||
        r.id.toLowerCase().includes(needle),
    )
  }, [rows, query])

  async function updateProfile(id, patch) {
    setBusyId(id)
    setError('')
    const { error: err } = await supabase.from('profiles').update(patch).eq('id', id)
    setBusyId('')
    if (err) {
      setError(err.message)
      return
    }
    await load()
  }

  async function setRole(row, role) {
    if (row.id === user?.id && role !== 'admin') {
      setError('You cannot demote your own admin account here.')
      return
    }
    if (row.role === role) return
    await updateProfile(row.id, { role })
  }

  async function banUser(row) {
    if (row.id === user?.id) {
      setError('You cannot ban your own account.')
      return
    }
    const reason = window.prompt('Reason for ban (optional):') ?? ''
    await updateProfile(row.id, {
      banned_at: new Date().toISOString(),
      ban_reason: reason.trim() || null,
      banned_by: user.id,
    })
  }

  async function unbanUser(row) {
    await updateProfile(row.id, {
      banned_at: null,
      ban_reason: null,
      banned_by: null,
    })
  }

  return (
    <div className={ui.stackLg}>
      <header>
        <h1 className={ui.display}>Users</h1>
        <p className={cn(ui.lede, 'mt-2')}>
          Promote members to admin or ban accounts. Bans are enforced in the database — not just the
          UI.
        </p>
      </header>

      {error && <p className={ui.formError}>{error}</p>}

      <label className={ui.field}>
        <span className={ui.fieldLabel}>Search users</span>
        <input
          className={ui.fieldControl}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, handle, or user id"
        />
      </label>

      <div className={ui.adminTableWrap}>
        <table className={ui.adminTable}>
          <thead>
            <tr>
              <th className={ui.adminTh}>User</th>
              <th className={ui.adminTh}>Role</th>
              <th className={ui.adminTh}>Status</th>
              <th className={ui.adminTh}>Joined</th>
              <th className={ui.adminTh} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className={ui.adminTd} colSpan={5}>
                  <div className={ui.adminEmptyInline}>No users match that search.</div>
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const banned = Boolean(row.banned_at)
                const isSelf = row.id === user?.id
                const saving = busyId === row.id

                return (
                  <tr key={row.id}>
                    <td className={ui.adminTd}>
                      <strong>{row.name || 'Unnamed user'}</strong>
                      <div className={ui.muted}>{row.handle || row.id}</div>
                      {banned && row.ban_reason && (
                        <div className={cn(ui.small, 'mt-1 text-danger')}>{row.ban_reason}</div>
                      )}
                    </td>
                    <td className={ui.adminTd}>
                      <label className="inline-flex items-center gap-2">
                        <UserCog size={15} className="text-muted" aria-hidden />
                        <select
                          className={ui.fieldControl}
                          value={row.role}
                          disabled={saving || isSelf}
                          onChange={(e) => setRole(row, e.target.value)}
                          aria-label={`Role for ${row.name || row.handle}`}
                        >
                          <option value="user">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </label>
                    </td>
                    <td className={ui.adminTd}>
                      {banned ? (
                        <span className={cn(ui.pillMuted, 'border-danger/30 bg-danger/10 text-danger')}>
                          Banned
                        </span>
                      ) : (
                        <span className={ui.pillMuted}>Active</span>
                      )}
                    </td>
                    <td className={ui.adminTd}>{formatWhen(row.created_at)}</td>
                    <td className={cn(ui.adminTd, ui.adminRowActions)}>
                      {banned ? (
                        <button
                          type="button"
                          className={cn(ui.btn, ui.btnSm, ui.btnOutline)}
                          disabled={saving}
                          onClick={() => unbanUser(row)}
                        >
                          <ShieldOff size={14} />
                          Unban
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={cn(ui.btn, ui.btnSm, ui.btnOutline)}
                          disabled={saving || isSelf}
                          onClick={() => banUser(row)}
                        >
                          <Shield size={14} />
                          Ban
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
