import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { Truck, PackageCheck, CheckCircle2, AlertTriangle, TreePine, Heart } from 'lucide-react'
import { POINTS_PER_PURCHASE, POINTS_PER_SALE } from '../lib/impact.js'

const REASONS = [
  "Doesn't match the stated grade",
  'Damaged in transit',
  'Wrong item received',
  'Other',
]

export default function OpenBox() {
  const { id } = useParams()
  const { orders, listings, updateOrder, completeOrder, points, currentUser } = useApp()
  const [rejectReason, setRejectReason] = useState(null)
  const [resolution, setResolution] = useState(null)

  const order = orders.find((o) => o.id === id)
  const listing = order && listings.find((l) => l.id === order.listingId)

  if (!order || !listing) return <p className="p-4 text-sm text-neutral-400">Order not found.</p>

  function advanceToInspection() {
    updateOrder(order.id, { status: 'inspecting' })
  }

  function accept() {
    completeOrder(order.id, listing)
  }

  function reject(reason) {
    setRejectReason(reason)
    updateOrder(order.id, { status: 'disputed', dispute: { reason, resolvedAs: null } })
  }

  function resolve(choice) {
    setResolution(choice)
    updateOrder(order.id, { dispute: { ...order.dispute, resolvedAs: choice } })
  }

  return (
    <div className="p-4 md:p-8 md:max-w-xl md:mx-auto space-y-4">
      <h1 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-50">{listing.title}</h1>
      <img src={listing.photos[0]} className="w-full h-48 object-cover rounded-xl" />

      <Stepper status={order.status} />

      {order.status === 'out-for-delivery' && (
        <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 text-center space-y-3">
          <Truck className="mx-auto text-emerald-500" size={32} />
          <p className="text-sm text-neutral-700 dark:text-neutral-300">Courier is on the way with your open-box delivery.</p>
          <button onClick={advanceToInspection} className="w-full bg-emerald-600 text-white font-semibold rounded-xl py-2.5">
            Simulate: courier has arrived
          </button>
        </div>
      )}

      {order.status === 'inspecting' && (
        <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
          <PackageCheck className="mx-auto text-emerald-500" size={32} />
          <p className="text-sm text-neutral-700 dark:text-neutral-300 text-center">
            Courier is present. Inspect the item against the listed grade before accepting.
          </p>
          <p className="text-xs text-neutral-400 text-center">
            Listed as Grade {listing.grade.letter}, {listing.grade.defectBreakdown.length} defect(s) disclosed.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={accept} className="bg-emerald-600 text-white text-sm font-semibold rounded-lg py-2.5">
              Accept
            </button>
            <select
              onChange={(e) => e.target.value && reject(e.target.value)}
              defaultValue=""
              className="border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 rounded-lg text-sm px-2"
            >
              <option value="" disabled>Reject: reason…</option>
              {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      )}

      {order.status === 'accepted' && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 p-4 text-center space-y-3">
          <CheckCircle2 className="mx-auto text-emerald-600 dark:text-emerald-400" size={32} />
          <div>
            <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium flex items-center justify-center gap-1.5">
              <Heart size={14} className="text-rose-500" fill="currentColor" /> Thank you, {currentUser?.name ?? 'buyer'}!
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
              You earned {POINTS_PER_PURCHASE} points (balance: {points[currentUser?.name] ?? 0}), redeemable on future purchases.
            </p>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 pt-1 border-t border-emerald-100 dark:border-emerald-900">
            <TreePine size={14} />
            <span>
              A tree is being planted in honor of you and {listing.seller}. Thank you to {listing.seller} too:
              they just earned {POINTS_PER_SALE} points (balance: {points[listing.seller] ?? 0}).
            </span>
          </div>
        </div>
      )}

      {order.status === 'disputed' && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-600 dark:text-amber-400" size={22} />
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Dispute raised: {rejectReason ?? order.dispute?.reason}</p>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Both sides can see the original grading reasoning below. Nothing is a black box.
          </p>
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-2 text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
            {listing.grade.defectBreakdown.length === 0 && <p className="text-neutral-400">No defects were disclosed at listing.</p>}
            {listing.grade.defectBreakdown.map((d) => (
              <p key={d.id}>• {d.label}: {d.severity}, {Math.round(d.confidence * 100)}% confidence</p>
            ))}
          </div>

          {!resolution ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Resolve as:</p>
              <div className="grid grid-cols-1 gap-1.5">
                <button onClick={() => resolve('full-refund')} className="bg-emerald-600 text-white text-sm rounded-lg py-2">Full refund + return</button>
                <button onClick={() => resolve('partial-refund')} className="bg-emerald-500 text-white text-sm rounded-lg py-2">Partial refund, buyer keeps item</button>
                <button onClick={() => resolve('keep-as-is')} className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm rounded-lg py-2">Buyer keeps item, no refund</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Resolved: {resolution.replace('-', ' ')}.</p>
          )}
        </div>
      )}

      <Link to="/browse" className="block text-center text-xs text-neutral-400">Back to browsing</Link>
    </div>
  )
}

const STEPS = ['out-for-delivery', 'inspecting', 'accepted']

function Stepper({ status }) {
  const idx = status === 'disputed' ? 1 : STEPS.indexOf(status)
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((s, i) => (
        <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= idx ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-800'}`} />
      ))}
    </div>
  )
}
