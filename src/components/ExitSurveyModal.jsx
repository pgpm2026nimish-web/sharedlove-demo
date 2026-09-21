import { useState } from 'react'
import { Star, X } from 'lucide-react'

export default function ExitSurveyModal({ onSubmit, onSkip }) {
  const [stars, setStars] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')

  return (
    <div className="fixed inset-0 z-30 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Before you go</h2>
          <button onClick={onSkip} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200" title="Skip">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">How was your experience with SharedLove today?</p>

        <div className="flex items-center justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStars(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="p-0.5"
              title={`${n} star${n === 1 ? '' : 's'}`}
            >
              <Star
                size={28}
                className={(hover || stars) >= n ? 'text-amber-400' : 'text-neutral-300 dark:text-neutral-700'}
                fill={(hover || stars) >= n ? 'currentColor' : 'none'}
              />
            </button>
          ))}
        </div>

        <label className="block">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">How can we improve? (optional)</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Tell us anything..."
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
          />
        </label>

        <div className="flex gap-2">
          <button onClick={onSkip} className="flex-1 text-sm font-medium text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2.5">
            Skip
          </button>
          <button
            onClick={() => onSubmit(stars, comment)}
            disabled={stars === 0}
            className="flex-1 bg-emerald-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white font-semibold rounded-lg py-2.5 text-sm"
          >
            Submit &amp; log out
          </button>
        </div>
      </div>
    </div>
  )
}
