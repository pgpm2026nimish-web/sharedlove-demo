import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Lock } from 'lucide-react'

export default function AdminLogin() {
  const { loginAdmin } = useApp()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!loginAdmin(password)) {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="p-4 md:p-8 md:max-w-sm md:mx-auto">
      <form onSubmit={handleSubmit} className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 space-y-3 mt-6">
        <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
          <Lock size={18} />
          <h1 className="font-semibold">Admin access</h1>
        </div>
        <p className="text-xs text-neutral-400">
          Grading-provider settings are admin-only so booth visitors can browse and sell without
          touching API keys or endpoints.
        </p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError(false)
          }}
          placeholder="Admin password"
          className={`w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100 ${error ? 'border-rose-400' : 'border-neutral-200 dark:border-neutral-700'}`}
        />
        {error && <p className="text-xs text-rose-500">Incorrect password.</p>}
        <button type="submit" className="w-full bg-emerald-600 text-white font-semibold rounded-lg py-2.5 text-sm">
          Unlock
        </button>
      </form>
    </div>
  )
}
