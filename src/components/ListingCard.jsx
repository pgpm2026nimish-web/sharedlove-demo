import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Heart } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function ListingCard({ listing, className = '' }) {
  const { wishlist, toggleWishlist, currentUser } = useApp()
  const navigate = useNavigate()
  const saved = wishlist.includes(listing.id)
  const discountPct = Math.max(0, 100 - listing.grade.score)

  function handleWishlist(e) {
    e.preventDefault()
    if (!currentUser) {
      navigate('/login', { state: { from: `/listing/${listing.id}` } })
      return
    }
    toggleWishlist(listing.id)
  }

  return (
    <Link
      to={`/listing/${listing.id}`}
      className={`rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col ${className}`}
    >
      {/* Fixed pixel height, not aspect-ratio, so every card's photo is
          identically sized regardless of the source image's own dimensions
          — aspect-square alone let some photos render taller than others. */}
      <div className="relative w-full h-36 sm:h-40 md:h-44 lg:h-48 bg-neutral-100 dark:bg-neutral-800 shrink-0">
        <img src={listing.photos[0]} alt={listing.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        {/* Grade shown like Myntra's small rating badge, anchored on the image itself */}
        <span className="absolute bottom-1.5 left-1.5 bg-neutral-900/85 text-white text-[10px] font-semibold rounded px-1.5 py-0.5">
          {listing.grade.letter} · {listing.grade.score}
        </span>
        {listing.grade.letter === 'A' && (
          <span className="absolute top-1.5 left-1.5 bg-white/90 dark:bg-neutral-900/90 rounded-full p-1" title="Verified great condition">
            <ShieldCheck size={14} className="text-emerald-600" />
          </span>
        )}
        <button
          onClick={handleWishlist}
          className="absolute top-1.5 right-1.5 bg-white/90 dark:bg-neutral-900/90 rounded-full p-1.5"
          title={saved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={13} className={saved ? 'text-rose-500' : 'text-neutral-400'} fill={saved ? 'currentColor' : 'none'} />
        </button>
        {listing.status === 'sold' && (
          <div className="absolute inset-0 bg-white/70 dark:bg-neutral-900/70 flex items-center justify-center">
            <span className="bg-neutral-900 text-white text-[10px] font-semibold uppercase tracking-wide rounded px-2 py-1">Sold</span>
          </div>
        )}
      </div>
      {/* Fixed-height text block (2 title lines + seller + 2 price lines,
          all reserved even when empty) so every card in a grid row ends up
          the same total height, whether or not that listing has a
          discount. The product is the hero here, not the seller: title is
          bold and first, wraps to 2 lines instead of truncating; seller is
          small, unbolded, secondary info underneath it. */}
      <div className="p-2 flex flex-col gap-0.5">
        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2 h-10">{listing.title}</p>
        <p className="text-[11px] text-neutral-400 line-clamp-1 h-4">{listing.seller}</p>
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 h-5">₹{listing.grade.price}</p>
        <p className="text-xs h-4">
          {discountPct > 0 ? (
            <>
              <span className="text-neutral-400 line-through">₹{listing.basePrice}</span>{' '}
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{discountPct}% off</span>
            </>
          ) : (
            <span className="invisible">placeholder</span>
          )}
        </p>
      </div>
    </Link>
  )
}
