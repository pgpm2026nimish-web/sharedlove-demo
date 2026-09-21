import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { LogIn } from 'lucide-react'

export default function Login() {
  const { login, loginAdmin } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const redirectTo = location.state?.from ?? '/'

  function handleSubmit(e) {
    e.preventDefault()
    // "admin" isn't a real account, it's the unmarked door into grading
    // settings, same password gate as before, just reached from the
    // regular login form instead of a visible nav link.
    if (identifier.trim().toLowerCase() === 'admin') {
      if (loginAdmin(password)) {
        navigate('/admin', { replace: true })
      } else {
        setError('Incorrect email/name or password.')
      }
      return
    }
    if (login(identifier, password)) {
      navigate(redirectTo, { replace: true })
    } else {
      setError('Incorrect email/name or password.')
    }
  }

  return (
    <div className="p-4 md:p-8 md:max-w-sm md:mx-auto">
      <form onSubmit={handleSubmit} className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 space-y-3 mt-6">
        <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
          <LogIn size={18} />
          <h1 className="font-semibold">Log in</h1>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Email or display name</span>
          <input
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            required
            value={identifier}
            onChange={(e) => { setIdentifier(e.target.value); setError('') }}
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
          />
        </label>

        {error && <p className="text-xs text-rose-500">{error}</p>}

        <button type="submit" className="w-full bg-emerald-600 text-white font-semibold rounded-lg py-2.5 text-sm">
          Log in
        </button>

        <p className="text-xs text-neutral-400">
          New here? <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-2">Create an account</Link>
        </p>

        <div className="text-[11px] text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-2 space-y-0.5">
          <p className="font-medium text-neutral-500 dark:text-neutral-400">Demo accounts</p>
          <p>Buyer: buyer@demo.com or User1 / 1111</p>
          <p>Seller: seller@demo.com or User2 / 2222</p>
        </div>
      </form>
    </div>
  )
}
