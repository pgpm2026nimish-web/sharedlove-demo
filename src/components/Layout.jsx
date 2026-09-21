import { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { Home, Search, LayoutGrid, PlusCircle, Heart, ShoppingBag, Sun, Moon, User, LogOut, Share2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import Footer from './Footer.jsx'
import SupportChat from './SupportChat.jsx'
import ExitSurveyModal from './ExitSurveyModal.jsx'
import ShareAppModal from './ShareAppModal.jsx'

// A short alias for the deployed GitHub Pages URL, since that URL has the
// GitHub username baked in (https://<username>.github.io/<repo>/) and
// there's no way to shorten a github.io URL itself. Update this if the
// live site's address ever changes.
const PUBLIC_SHORT_URL = 'https://tinyurl.com/2afww279'

// Public tabs only — Settings/grading-provider config is admin-only and
// reached via the small "Admin" link in the header, not the main nav, so
// booth visitors browsing/selling never see an invitation to change it.
const tabs = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/browse', label: 'Browse', icon: LayoutGrid },
  { to: '/sell', label: 'Sell', icon: PlusCircle },
  { to: '/cart', label: 'Cart', icon: ShoppingBag },
]

export default function Layout() {
  const { theme, toggleTheme, wishlist, cart, currentUser, logout, submitExitSurvey } = useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [showExitSurvey, setShowExitSurvey] = useState(false)
  const [showShareApp, setShowShareApp] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    navigate(query.trim() ? `/browse?q=${encodeURIComponent(query.trim())}` : '/browse')
  }

  function finishLogout() {
    setShowExitSurvey(false)
    logout()
    navigate('/')
  }

  function handleSurveySubmit(stars, comment) {
    submitExitSurvey(stars, comment)
    finishLogout()
  }

  return (
    <div className="min-h-svh flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-10 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 md:px-8 py-3 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Heart className="text-emerald-600" size={22} fill="currentColor" />
          <span className="hidden sm:inline font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">SharedLove</span>
        </Link>

        {/* Desktop top nav — the phone bottom-tab nav below is hidden at this width.
            Cart is left out here since it already has its own icon+badge on
            the right side of the header. */}
        <nav className="hidden md:flex items-center gap-1">
          {tabs.filter((t) => t.to !== '/cart').map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="ml-auto w-32 sm:w-48 md:w-64 shrink relative">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search listings"
            className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 pl-8 pr-3 py-1.5 text-sm"
          />
        </form>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/wishlist" className="relative text-neutral-400 hover:text-rose-500" title="Wishlist">
            <Heart size={18} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] leading-none rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative text-neutral-400 hover:text-emerald-600 hidden md:inline-flex" title="Cart">
            <ShoppingBag size={18} />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] leading-none rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>
          <button
            onClick={() => setShowShareApp(true)}
            className="text-neutral-400 hover:text-emerald-600"
            title="Share SharedLove with a friend"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={toggleTheme}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <Link to="/profile" className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-emerald-600" title="Your profile">
                <User size={14} /> <span className="hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
              </Link>
              <button onClick={() => setShowExitSurvey(true)} className="text-neutral-400 hover:text-rose-500" title="Log out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-emerald-600" title="Log in">
              <User size={16} /> <span className="hidden sm:inline">Log in</span>
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-md md:max-w-6xl mx-auto">
        <Outlet />
      </main>

      <Footer />

      <SupportChat />

      {showExitSurvey && <ExitSurveyModal onSubmit={handleSurveySubmit} onSkip={finishLogout} />}

      {showShareApp && (
        <ShareAppModal
          url={window.location.hostname.endsWith('github.io') ? PUBLIC_SHORT_URL : window.location.origin + window.location.pathname}
          onClose={() => setShowShareApp(false)}
        />
      )}

      {/* Phone-style bottom tab nav — only shown below the md breakpoint.
          Solid background + shadow so it reads as a distinct bar, and a
          filled pill on the active tab so state is obvious at a glance. */}
      <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] flex justify-around py-2 px-1">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                  : 'text-neutral-500 dark:text-neutral-300'
              }`
            }
          >
            <Icon size={20} />
            {label}
            {to === '/cart' && cart.length > 0 && (
              <span className="absolute top-0 right-1 bg-emerald-600 text-white text-[9px] leading-none rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
