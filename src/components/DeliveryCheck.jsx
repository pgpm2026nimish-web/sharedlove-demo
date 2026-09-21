import { useState } from 'react'
import { Truck } from 'lucide-react'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// No real logistics API behind this — estimates a plausible delivery window
// from the pincode's digits so it's deterministic, not random on every click.
function estimateDays(pincode) {
  const digitSum = pincode.split('').reduce((s, d) => s + (Number(d) || 0), 0)
  return 2 + (digitSum % 4) // 2-5 days
}

export default function DeliveryCheck() {
  const [pincode, setPincode] = useState('')
  const [result, setResult] = useState(null)

  function handleCheck(e) {
    e.preventDefault()
    if (!/^\d{6}$/.test(pincode)) {
      setResult({ error: true })
      return
    }
    const days = estimateDays(pincode)
    const date = new Date()
    date.setDate(date.getDate() + days)
    setResult({ error: false, days, label: `${DAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}` })
  }

  return (
    <div>
      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
        <Truck size={14} /> Check delivery date
      </p>
      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter pincode"
          inputMode="numeric"
          className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
        />
        <button type="submit" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 px-2">
          Check
        </button>
      </form>
      {result?.error && <p className="text-xs text-rose-500 mt-1">Enter a valid 6-digit pincode.</p>}
      {result && !result.error && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
          Estimated delivery by <span className="font-medium">{result.label}</span> ({result.days} days)
        </p>
      )}
    </div>
  )
}
