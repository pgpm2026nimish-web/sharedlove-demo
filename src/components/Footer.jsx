import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

const COLUMNS = [
  {
    heading: 'SharedLove',
    links: [
      { to: '/about', label: 'About us' },
      { to: '/how-it-works', label: 'How it works' },
    ],
  },
  {
    heading: 'Buy & Sell',
    links: [
      { to: '/browse', label: 'Browse listings' },
      { to: '/sell', label: 'Start selling' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { to: '/how-it-works', label: 'Buyer protection' },
      { to: '/contact', label: 'Contact us' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 mt-8 pb-24 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide mb-2">{col.heading}</p>
            <ul className="space-y-1.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
          <Heart size={12} className="text-emerald-500" fill="currentColor" /> SharedLove, secondhand and verified
        </p>
        <p className="text-[11px] text-neutral-300 dark:text-neutral-600">© 2026 SharedLove. Prototype for a Service Operations Management course project.</p>
      </div>
    </footer>
  )
}
