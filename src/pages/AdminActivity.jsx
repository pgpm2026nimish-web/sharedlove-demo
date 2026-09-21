import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { activityLogToCSV, downloadActivityLogCSV } from '../lib/activityLog.js'
import AdminLogin from './AdminLogin.jsx'
import { ChevronLeft, Download, Share2, Trash2, LogIn, ShoppingBag, Star, X } from 'lucide-react'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'login', label: 'Logins' },
  { id: 'purchase', label: 'Purchases' },
  { id: 'survey', label: 'Surveys' },
]

export default function AdminActivity() {
  const { isAdmin, activityLog, clearActivityLog, removeActivityEvent } = useApp()
  const [tab, setTab] = useState('all')
  const [shareStatus, setShareStatus] = useState(null)

  if (!isAdmin) return <AdminLogin />

  const rows = activityLog.filter((e) => tab === 'all' || e.type === tab).slice().reverse()
  const logins = activityLog.filter((e) => e.type === 'login')
  const purchases = activityLog.filter((e) => e.type === 'purchase')
  const surveys = activityLog.filter((e) => e.type === 'survey')
  const avgStars = surveys.length ? (surveys.reduce((sum, s) => sum + (s.stars || 0), 0) / surveys.length).toFixed(1) : null

  function handleClear() {
    if (window.confirm('Clear the entire activity log? This cannot be undone.')) clearActivityLog()
  }

  // Hands the CSV off to the device's native share sheet (email, WhatsApp,
  // AirDrop, etc.) so the report can go straight to a teammate without
  // needing a server. Falls back to the clipboard, then to a plain message,
  // on browsers/devices that don't support file sharing.
  async function handleShare() {
    const csv = activityLogToCSV(activityLog)
    const filename = `sharedlove-activity-${new Date().toISOString().slice(0, 10)}.csv`
    const file = new File([csv], filename, { type: 'text/csv' })

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'SharedLove activity report' })
      } catch {
        // user cancelled the share sheet — not an error
      }
      return
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: 'SharedLove activity report', text: csv })
        return
      } catch {
        return
      }
    }
    try {
      await navigator.clipboard.writeText(csv)
      setShareStatus('This browser can\'t open a share sheet, so the CSV was copied to your clipboard instead, paste it wherever you want to send it.')
    } catch {
      setShareStatus('Sharing isn\'t supported here. Use Download CSV instead and share that file manually.')
    }
    setTimeout(() => setShareStatus(null), 6000)
  }

  return (
    <div className="p-4 md:p-8 md:max-w-3xl md:mx-auto space-y-4">
      <Link to="/admin" className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
        <ChevronLeft size={14} /> Back to grading settings
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-50">Activity &amp; feedback</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            disabled={activityLog.length === 0}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg px-3 py-2 disabled:opacity-40"
          >
            <Share2 size={13} /> Share
          </button>
          <button
            onClick={() => downloadActivityLogCSV(activityLog)}
            disabled={activityLog.length === 0}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 disabled:opacity-40"
          >
            <Download size={13} /> Download CSV
          </button>
          <button
            onClick={handleClear}
            disabled={activityLog.length === 0}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-lg px-3 py-2 disabled:opacity-40"
          >
            <Trash2 size={13} /> Clear log
          </button>
        </div>
      </div>
      <p className="text-xs text-neutral-400">
        Every login, completed purchase, and exit survey response is logged here, stored in this
        browser's local storage (no real backend server, same as the rest of this prototype).
        Share or download the CSV for a report, or clear it to start fresh for a new demo session.
      </p>
      {shareStatus && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2 break-words">{shareStatus}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={LogIn} value={logins.length} label="Logins" />
        <Stat icon={ShoppingBag} value={purchases.length} label="Purchases" />
        <Stat icon={Star} value={surveys.length} label="Survey responses" />
        <Stat icon={Star} value={avgStars ?? 'N/A'} label="Avg. rating" />
      </div>

      <div className="flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-xs font-medium rounded-lg px-3 py-1.5 border ${
              tab === t.id
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
        {rows.length === 0 && <p className="p-4 text-sm text-neutral-400">Nothing logged yet.</p>}
        {rows.map((e) => (
          <div key={e.id} className="flex items-start justify-between gap-3 p-3">
            <div className="text-sm text-neutral-700 dark:text-neutral-300">
              <p className="text-[11px] text-neutral-400">{new Date(e.timestamp).toLocaleString()}</p>
              {e.type === 'login' && <p>Login: <span className="font-medium">{e.user}</span> ({e.email})</p>}
              {e.type === 'purchase' && (
                <p>
                  Purchase: <span className="font-medium">{e.buyer}</span> bought "{e.title}" from{' '}
                  <span className="font-medium">{e.seller}</span> for ₹{e.price}
                </p>
              )}
              {e.type === 'survey' && (
                <div>
                  <p className="flex items-center gap-1">
                    Survey: <span className="font-medium">{e.user}</span>
                    <span className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={i < e.stars ? 'currentColor' : 'none'} className={i < e.stars ? '' : 'text-neutral-300 dark:text-neutral-700'} />
                      ))}
                    </span>
                  </p>
                  {e.comment && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">"{e.comment}"</p>}
                </div>
              )}
            </div>
            <button onClick={() => removeActivityEvent(e.id)} className="text-neutral-300 hover:text-rose-500 shrink-0" title="Remove this entry">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 text-center">
      <Icon className="mx-auto text-emerald-600" size={18} />
      <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mt-1">{value}</p>
      <p className="text-[11px] text-neutral-400">{label}</p>
    </div>
  )
}
