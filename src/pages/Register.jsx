import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { UserPlus } from 'lucide-react'

export default function Register() {
  const { register } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [realName, setRealName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const redirectTo = location.state?.from ?? '/'

  function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    const result = register(realName, displayName, email, password)
    if (result.ok) {
      navigate(redirectTo, { replace: true })
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="p-4 md:p-8 md:max-w-sm md:mx-auto">
      <form onSubmit={handleSubmit} className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 space-y-3 mt-6">
        <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
          <UserPlus size={18} />
          <h1 className="font-semibold">Create an account</h1>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Real name</span>
          <input
            required
            value={realName}
            onChange={(e) => { setRealName(e.target.value); setError('') }}
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
          />
          <span className="text-[11px] text-neutral-400">Private: only ever shown back to you on your own profile.</span>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Display name</span>
          <input
            required
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); setError('') }}
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
          />
          <span className="text-[11px] text-neutral-400">Public: this is what buyers and sellers see on listings and orders.</span>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Password</span>
          <input
            type="password"
            required
            minLength={4}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Confirm password</span>
          <input
            type="password"
            required
            minLength={4}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
          />
        </label>

        {error && <p className="text-xs text-rose-500">{error}</p>}

        <button type="submit" className="w-full bg-emerald-600 text-white font-semibold rounded-lg py-2.5 text-sm">
          Create account
        </button>

        <p className="text-xs text-neutral-400">
          Already have an account? <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-2">Log in</Link>
        </p>
      </form>
    </div>
  )
}
