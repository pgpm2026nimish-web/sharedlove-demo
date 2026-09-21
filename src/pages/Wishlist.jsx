import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import ListingCard from '../components/ListingCard.jsx'
import { Heart } from 'lucide-react'

export default function Wishlist() {
  const { listings, wishlist } = useApp()
  const items = wishlist.map((id) => listings.find((l) => l.id === id)).filter(Boolean)

  if (items.length === 0) {
    return (
      <div className="p-4 md:p-8 md:max-w-lg md:mx-auto text-center py-16 space-y-3">
        <Heart className="mx-auto text-neutral-300" size={36} />
        <p className="text-sm text-neutral-400">Nothing saved yet. Tap the heart on any listing to save it here.</p>
        <Link to="/browse" className="inline-block text-sm text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-2">
          Browse listings
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-4">
      <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Your wishlist</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {items.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
    </div>
  )
}
