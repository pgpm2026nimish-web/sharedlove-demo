import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { userImpactStats } from '../lib/impact.js'
import { BADGE_TIERS, currentBadge, shareMessage } from '../lib/badges.js'
import { PAYMENT_TYPES, paymentMethodLabel, payoutMethodLabel } from '../lib/payments.js'
import { Award, TreePine, Recycle, ShoppingBag, Tag, Share2, LogIn, Check, Plus, Trash2, Wallet } from 'lucide-react'

function PaymentMethodsCard() {
  const { currentUser, addPaymentMethod, removePaymentMethod } = useApp()
  const [adding, setAdding] = useState(false)
  const [type, setType] = useState('upi')
  const [upiId, setUpiId] = useState('')
  const [cardNumber, setCardNumber] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (type === 'upi') {
      if (!upiId.trim()) return
      addPaymentMethod({ type: 'upi', upiId: upiId.trim() })
    } else {
      const digits = cardNumber.replace(/\D/g, '')
      if (digits.length < 4) return
      addPaymentMethod({ type: 'card', last4: digits.slice(-4) })
    }
    setUpiId('')
    setCardNumber('')
    setAdding(false)
  }

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
          <Wallet size={15} /> Payment methods
        </p>
        {!adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Plus size={13} /> Add
          </button>
        )}
      </div>
      <p className="text-[11px] text-neutral-400 -mt-2">Simulated for this prototype, used at checkout. No real payment is processed or stored in full.</p>

      {(currentUser.paymentMethods ?? []).length === 0 && !adding && (
        <p className="text-xs text-neutral-400">No saved payment methods yet.</p>
      )}

      {(currentUser.paymentMethods ?? []).map((m) => (
        <div key={m.id} className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300">
          {paymentMethodLabel(m)}
          <button onClick={() => removePaymentMethod(m.id)} className="text-neutral-300 hover:text-rose-500">
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {adding && (
        <form onSubmit={handleAdd} className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 p-3 space-y-2">
          <div className="flex gap-2">
            {PAYMENT_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`flex-1 text-xs font-medium rounded-lg py-1.5 border ${
                  type === t.id ? 'bg-emerald-600 text-white border-emerald-600' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {type === 'upi' ? (
            <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@bank" className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm" />
          ) : (
            <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="Card number (simulated)" inputMode="numeric" className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm" />
          )}
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-emerald-600 text-white font-semibold rounded-lg py-2 text-xs">Save method</button>
            <button type="button" onClick={() => setAdding(false)} className="text-xs text-neutral-400 px-2">Cancel</button>
          </div>
        </form>
      )}

      {currentUser.payoutMethod && (
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-[11px] text-neutral-400">Seller payout destination: <span className="text-neutral-600 dark:text-neutral-300 font-medium">{payoutMethodLabel(currentUser.payoutMethod)}</span>. Change this from the listing form.</p>
        </div>
      )}
    </div>
  )
}

function ChangePasswordForm() {
  const { changePassword } = useApp()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (next !== confirm) {
      setMessage({ ok: false, text: 'New passwords do not match.' })
      return
    }
    const result = changePassword(current, next)
    if (result.ok) {
      setMessage({ ok: true, text: 'Password updated.' })
      setCurrent('')
      setNext('')
      setConfirm('')
    } else {
      setMessage({ ok: false, text: result.error })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Change password</p>
      <label className="block">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Current password</span>
        <input
          type="password"
          required
          value={current}
          onChange={(e) => { setCurrent(e.target.value); setMessage(null) }}
          className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">New password</span>
        <input
          type="password"
          required
          minLength={4}
          value={next}
          onChange={(e) => { setNext(e.target.value); setMessage(null) }}
          className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Confirm new password</span>
        <input
          type="password"
          required
          minLength={4}
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setMessage(null) }}
          className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
        />
      </label>
      {message && <p className={`text-xs ${message.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>{message.text}</p>}
      <button type="submit" className="w-full bg-emerald-600 text-white font-semibold rounded-lg py-2.5 text-sm">
        Update password
      </button>
    </form>
  )
}

export default function Profile() {
  const { currentUser, impactEvents, points } = useApp()
  const [shareStatus, setShareStatus] = useState(null)

  if (!currentUser) {
    return (
      <div className="p-4 md:p-8 md:max-w-sm md:mx-auto text-center py-16 space-y-3">
        <LogIn className="mx-auto text-neutral-300" size={36} />
        <p className="text-sm text-neutral-400">Log in to see your profile.</p>
        <Link to="/login" state={{ from: '/profile' }} className="inline-block bg-emerald-600 text-white font-semibold rounded-lg px-5 py-2.5 text-sm">
          Log in
        </Link>
      </div>
    )
  }

  const stats = userImpactStats(currentUser.name, { impactEvents, points })
  const badge = currentBadge(stats.totalTransactions)

  async function handleShare() {
    const text = shareMessage({ name: currentUser.name, wasteReducedKg: stats.wasteReducedKg, treesPlanted: stats.treesPlanted })
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        // user cancelled the share sheet — not an error
      }
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      setShareStatus('Copied to clipboard')
    } catch {
      setShareStatus(text)
    }
    setTimeout(() => setShareStatus(null), 4000)
  }

  return (
    <div className="p-4 md:p-8 md:max-w-2xl md:mx-auto space-y-5">
      <div>
        <h1 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-50">{currentUser.name}</h1>
        <p className="text-xs text-neutral-400">{currentUser.realName} · {currentUser.email}</p>
      </div>

      {/* Impact summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 text-center">
          <Award className="mx-auto text-emerald-600" size={20} />
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mt-1">{stats.points}</p>
          <p className="text-[11px] text-neutral-400">Points</p>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 text-center">
          <TreePine className="mx-auto text-emerald-600" size={20} />
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mt-1">{stats.treesPlanted}</p>
          <p className="text-[11px] text-neutral-400">Trees planted</p>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 text-center">
          <Recycle className="mx-auto text-emerald-600" size={20} />
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mt-1">{stats.wasteReducedKg}kg</p>
          <p className="text-[11px] text-neutral-400">Waste reduced</p>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 text-center">
          <ShoppingBag className="mx-auto text-emerald-600" size={20} />
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mt-1">{stats.purchases}</p>
          <p className="text-[11px] text-neutral-400">Bought</p>
        </div>
      </div>
      <p className="text-[11px] text-neutral-400 -mt-3">
        Waste-reduced figure is an illustrative estimate ({stats.totalTransactions} transaction{stats.totalTransactions === 1 ? '' : 's'} x ~0.5kg), not a measured number.
        Also sold {stats.sales} item{stats.sales === 1 ? '' : 's'} as a seller.
      </p>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Your badge: {badge.label}</h2>
          <button onClick={handleShare} className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Share2 size={13} /> Share
          </button>
        </div>
        {shareStatus && (
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2 mb-2 break-words">{shareStatus}</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {BADGE_TIERS.map((tier) => {
            const earned = stats.totalTransactions >= tier.minTransactions
            return (
              <div
                key={tier.id}
                className={`rounded-xl border p-3 text-center space-y-1 ${
                  earned
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 opacity-50 grayscale'
                }`}
              >
                <tier.icon className={earned ? 'mx-auto text-emerald-600' : 'mx-auto text-neutral-400'} size={22} />
                <p className={`text-xs font-semibold flex items-center justify-center gap-1 ${earned ? 'text-emerald-800 dark:text-emerald-300' : 'text-neutral-500'}`}>
                  {tier.label} {earned && <Check size={11} />}
                </p>
                <p className="text-[10px] text-neutral-400">{tier.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent activity */}
      {(stats.purchases > 0 || stats.sales > 0) && (
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Recent activity</h2>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
            {impactEvents
              .filter((e) => e.buyer === currentUser.name || e.seller === currentUser.name)
              .slice()
              .reverse()
              .map((e) => (
                <div key={e.orderId} className="flex items-center gap-2 p-3 text-xs text-neutral-600 dark:text-neutral-300">
                  <Tag size={13} className="text-emerald-600 shrink-0" />
                  {e.buyer === currentUser.name
                    ? `You bought from ${e.seller}, a tree was planted and you earned points.`
                    : `You sold to ${e.buyer}, a tree was planted and you earned points.`}
                </div>
              ))}
          </div>
        </div>
      )}

      <PaymentMethodsCard />
      <ChangePasswordForm />
    </div>
  )
}
