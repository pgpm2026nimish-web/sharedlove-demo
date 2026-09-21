import { useState } from 'react'
import { Mail, MessageCircle } from 'lucide-react'

export default function ContactUs() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="p-4 md:p-8 md:max-w-lg md:mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Contact us</h1>
      <p className="text-sm text-neutral-400">
        Questions about a grade, a dispute, or the project itself? Reach out and we'll get back
        to you.
      </p>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex items-center gap-3">
        <Mail className="text-emerald-600" size={20} />
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Email</p>
          <p className="text-xs text-neutral-400">hello@sharedlove.example</p>
        </div>
      </div>

      {sent ? (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 p-4 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
          <MessageCircle size={18} /> Thanks. This is a demo form, but in production your message would land with the support team here.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Name</span>
            <input required className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Message</span>
            <textarea required rows={4} className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm" />
          </label>
          <button type="submit" className="w-full bg-emerald-600 text-white font-semibold rounded-lg py-2.5 text-sm">
            Send message
          </button>
        </form>
      )}
    </div>
  )
}
