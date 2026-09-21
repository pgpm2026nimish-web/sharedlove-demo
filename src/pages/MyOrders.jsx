import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { PackageSearch } from 'lucide-react'

const STATUS_LABEL = {
  'out-for-delivery': 'Out for delivery',
  inspecting: 'Open-box inspection',
  accepted: 'Accepted',
  disputed: 'Disputed',
}

const STATUS_COLOR = {
  'out-for-delivery': 'text-neutral-500 dark:text-neutral-400',
  inspecting: 'text-amber-600 dark:text-amber-400',
  accepted: 'text-emerald-600 dark:text-emerald-400',
  disputed: 'text-rose-600 dark:text-rose-400',
}

export default function MyOrders() {
  const { orders, listings } = useApp()

  if (orders.length === 0) {
    return (
      <div className="p-4 md:p-8 md:max-w-lg md:mx-auto text-center py-16 space-y-3">
        <PackageSearch className="mx-auto text-neutral-300" size={36} />
        <p className="text-sm text-neutral-400">No orders yet.</p>
        <Link to="/browse" className="inline-block text-sm text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-2">
          Browse listings
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 md:max-w-lg md:mx-auto space-y-4">
      <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">My orders</h1>
      <div className="space-y-2">
        {orders.map((o) => {
          const listing = listings.find((l) => l.id === o.listingId)
          if (!listing) return null
          return (
            <Link
              key={o.id}
              to={`/order/${o.id}`}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2"
            >
              <img src={listing.photos[0]} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 line-clamp-1">{listing.title}</p>
                <p className="text-xs text-neutral-400">₹{listing.grade.price} · {o.paymentMethod?.toUpperCase()}</p>
                <p className={`text-xs font-medium ${STATUS_COLOR[o.status]}`}>{STATUS_LABEL[o.status] ?? o.status}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
