// Simulated "backend" for admin-visible activity: logins, purchases, and
// exit surveys. There's no real server here, same as the rest of the app,
// so this persists to localStorage instead (survives refresh on this
// browser/device, not shared across devices) rather than being lost like
// listings/orders/cart, which is what makes it usable as a report.
const LOG_KEY = 'sharedlove.activityLog.v1'

export function loadActivityLog() {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveActivityLog(log) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(log))
  } catch {
    // ignore — private browsing / blocked storage
  }
}

const CSV_COLUMNS = ['id', 'type', 'timestamp', 'user', 'email', 'buyer', 'seller', 'title', 'price', 'orderId', 'stars', 'comment']

function csvEscape(value) {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function activityLogToCSV(log) {
  const header = CSV_COLUMNS.join(',')
  const rows = log.map((e) =>
    CSV_COLUMNS.map((c) => csvEscape(c === 'timestamp' ? new Date(e.timestamp).toISOString() : e[c])).join(','),
  )
  return [header, ...rows].join('\n')
}

export function downloadActivityLogCSV(log) {
  const csv = activityLogToCSV(log)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sharedlove-activity-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
