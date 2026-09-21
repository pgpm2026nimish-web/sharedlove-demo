import { useState, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { sellerStats } from '../lib/fakeStats.js'
import { SIZES } from '../lib/sizes.js'
import { SHIPPING_PACKING_FEE } from '../lib/pricing.js'
import SizeGuideModal from '../components/SizeGuideModal.jsx'
import ListingCard from '../components/ListingCard.jsx'
import DeliveryCheck from '../components/DeliveryCheck.jsx'
import {
  ChevronLeft,
  AlertCircle,
  ShieldCheck,
  Heart,
  Ruler,
  PackageSearch,
  FileSearch,
  Users,
  RotateCcw,
  Lock,
  Award,
  Star,
  Truck,
  Package,
} from 'lucide-react'

const TRUST_BULLETS = [
  { icon: ShieldCheck, text: 'AI condition grading with visible defects, not a hidden score' },
  { icon: PackageSearch, text: 'Try & Buy: inspect at open-box delivery before you keep it' },
  { icon: FileSearch, text: 'Disputable grading: both sides see the same reasoning' },
  { icon: Users, text: 'Peer-to-peer seller, no warehouse shipping delay' },
  { icon: Lock, text: 'Payment held securely until you accept the item' },
]

// "stains" -> "Stains", "tagsAttached" -> "Tags Attached", "cleaningMethod"
// -> "Cleaning Method": the raw camelCase field names read poorly as-is.
function humanizeKey(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
}

function SellerStars({ rating, size = 13 }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = rating - i >= 0.75
        const half = !filled && rating - i >= 0.25
        return (
          <Star
            key={i}
            size={size}
            className={filled || half ? 'text-amber-500' : 'text-neutral-300 dark:text-neutral-700'}
            fill={filled ? 'currentColor' : 'none'}
          />
        )
      })}
    </span>
  )
}

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { listings, addToCart, wishlist, toggleWishlist, points: allPoints, currentUser } = useApp()
  const [showReasoning, setShowReasoning] = useState(false)
  const [activePhoto, setActivePhoto] = useState(0)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const reasoningRef = useRef(null)

  const listing = listings.find((l) => l.id === id)
  if (!listing) return <p className="p-4 text-sm text-neutral-400">Listing not found.</p>

  const { grade } = listing
  const photoDefects = grade.defects.filter((d) => d.imageIndex === activePhoto)
  const stats = sellerStats(listing.seller)
  const saved = wishlist.includes(listing.id)
  const discountPct = Math.max(0, 100 - grade.score)
  const similar = listings.filter((l) => l.category === listing.category && l.id !== listing.id).slice(0, 4)
  const complementary = listings
    .filter((l) => l.gender === listing.gender && l.category !== listing.category && l.id !== listing.id)
    .slice(0, 4)
  const points = allPoints[listing.seller] ?? 0

  function requireLogin() {
    navigate('/login', { state: { from: `/listing/${listing.id}` } })
  }

  function handleBuy() {
    if (!currentUser) return requireLogin()
    addToCart(listing.id)
    navigate('/cart')
  }

  function handleWishlist() {
    if (!currentUser) return requireLogin()
    toggleWishlist(listing.id)
  }

  function jumpToReasoning() {
    setShowReasoning(true)
    // Open first, then scroll on the next tick so the panel actually
    // exists in the DOM for scrollIntoView to find.
    setTimeout(() => reasoningRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  return (
    <div className="pb-4 md:p-8 md:max-w-5xl md:mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 text-sm p-3 md:p-0 md:mb-4">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="md:flex md:gap-10">
        <div className="md:w-1/2 md:shrink-0">
          <div className="relative mx-3 md:mx-0 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <img src={listing.photos[activePhoto]} alt={listing.title} className="w-full h-72 md:h-[420px] object-cover" />
            {grade.letter === 'A' && (
              <span
                className="absolute top-2 left-2 bg-white/90 dark:bg-neutral-900/90 rounded-full p-1.5 flex items-center gap-1 px-2"
                title="Grade A: the AI condition check found no more than light, disclosed wear"
              >
                <ShieldCheck size={14} className="text-emerald-600" />
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Verified: Grade A</span>
              </span>
            )}
            {photoDefects.map((d) => (
              <button
                key={d.id}
                onClick={jumpToReasoning}
                className="absolute w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow"
                style={{ left: `${d.xPct}%`, top: `${d.yPct}%`, transform: 'translate(-50%,-50%)' }}
                title={`${d.label}, tap for the full grading reasoning`}
              />
            ))}
          </div>

          {photoDefects.length > 0 && (
            <p className="text-[11px] text-neutral-400 px-3 md:px-0 mt-1.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 border border-white shrink-0" />
              Orange dots mark exactly where the AI found a defect, tap one for details
            </p>
          )}

          {listing.photos.length > 1 && (
            <div className="flex gap-2 px-3 md:px-0 mt-2">
              {listing.photos.map((p, i) => (
                <button key={i} onClick={() => setActivePhoto(i)} className={`w-12 h-12 rounded-md overflow-hidden border-2 ${i === activePhoto ? 'border-emerald-500' : 'border-transparent'}`}>
                  <img src={p} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-3 md:px-0 mt-3 md:mt-0 md:w-1/2 space-y-3">
          <div>
            <p className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-50">{listing.title}</p>
          </div>

          {/* Seller trust block, right under the title so it's one of the
              first things a buyer sees, not a footnote in small grey text
              at the bottom of the page. Rating + sales history + shipping
              speed are the specific signals that build confidence in a
              peer-to-peer seller with no warehouse behind them. */}
          <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Sold by {listing.seller}</p>
              {points > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Award size={13} /> {points} pts
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <SellerStars rating={stats.rating} />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{stats.rating}</span>
              <span className="text-xs text-neutral-400">({stats.ratingCount} ratings)</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 pt-0.5">
              <span className="flex items-center gap-1"><Package size={13} /> {stats.itemsSold} items sold</span>
              <span className="flex items-center gap-1"><Truck size={13} /> ships in {stats.shipsInDays}d</span>
            </div>
          </div>

          <button
            onClick={jumpToReasoning}
            className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-semibold rounded px-1.5 py-0.5 hover:bg-emerald-700"
            title="See the full grading reasoning"
          >
            {grade.letter} <span className="opacity-80 font-normal">· {grade.score}/100</span>
          </button>

          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">₹{grade.price}</p>
              {discountPct > 0 && (
                <>
                  <p className="text-sm text-neutral-400 line-through">₹{listing.basePrice}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">({discountPct}% off for condition)</p>
                </>
              )}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Price reflects the AI condition grade above</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Shipping &amp; packing (₹{SHIPPING_PACKING_FEE}) added at checkout, not included above
            </p>
          </div>

          {listing.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{listing.description}</p>
          )}

          {grade.fellBack && (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle size={14} /> AI grading unavailable at listing time, fell back to
              questionnaire-only score ({grade.fallbackReason}).
            </p>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Size</p>
              <button onClick={() => setShowSizeGuide(true)} className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 underline underline-offset-2">
                <Ruler size={12} /> Size guide
              </button>
            </div>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <span
                  key={s}
                  className={`w-9 h-9 flex items-center justify-center rounded-full border text-xs font-medium ${
                    s === listing.size
                      ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-300 dark:text-neutral-700'
                  }`}
                  title={s === listing.size ? 'This item’s size' : 'Not this item’s size. Every listing is one unique piece.'}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <DeliveryCheck />

          {listing.status === 'sold' ? (
            <p className="text-center text-sm text-neutral-400 py-3">This item has been sold.</p>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleBuy} className="flex-1 bg-emerald-600 text-white font-semibold rounded-xl py-3">
                Add to cart
              </button>
              <button
                onClick={handleWishlist}
                className="shrink-0 flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300"
              >
                <Heart size={16} className={saved ? 'text-rose-500' : ''} fill={saved ? 'currentColor' : 'none'} />
                Wishlist
              </button>
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 space-y-2">
            {TRUST_BULLETS.map((b) => (
              <div key={b.text} className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                <b.icon size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                {b.text}
              </div>
            ))}
          </div>

          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
            <RotateCcw size={14} className="shrink-0 mt-0.5" />
            No returns once you accept at open-box delivery. Inspect the item against the grade
            before confirming; disputes are only possible at that step, not after.
          </p>

          {listing.provenance && (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Seller-attested, not AI-graded</p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">Cleaning: {listing.provenance.cleaningMethod}</p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">Reason for selling: {listing.provenance.sellReason}</p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                Brand tag verified:
                {listing.provenance.tagPhoto ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Yes, photo provided</span>
                ) : (
                  <span className="text-neutral-400">Not provided</span>
                )}
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {listing.provenance.smokeFreeHome ? 'Smoke-free home' : 'Not a smoke-free home'} ·{' '}
                {listing.provenance.petFreeHome ? 'Pet-free home' : 'Not a pet-free home'}
              </p>
            </div>
          )}

          <div ref={reasoningRef}>
            <button
              onClick={() => setShowReasoning((s) => !s)}
              className="text-sm text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-2"
            >
              {showReasoning ? 'Hide product details' : 'Product details: why this grade?'}
            </button>

            {showReasoning && (
              <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 text-sm mt-2 space-y-5">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Seller questionnaire</p>
                  <div className="space-y-1.5">
                    {grade.questionnaireBreakdown.map((q) => (
                      <div key={q.key} className="flex items-center justify-between gap-3">
                        <span className="text-neutral-500 dark:text-neutral-400">{humanizeKey(q.key)}</span>
                        <span className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">{String(q.value)}</span>
                          {q.penalty > 0 && <span className="text-[11px] text-rose-500">-{q.penalty}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {grade.provenanceBreakdown?.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide pt-3">Trust &amp; provenance</p>
                    <div className="space-y-1.5">
                      {grade.provenanceBreakdown.map((p) => (
                        <div key={p.key} className="flex items-center justify-between gap-3">
                          <span className="text-neutral-500 dark:text-neutral-400">{humanizeKey(p.key)}</span>
                          <span className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">{String(p.value)}</span>
                            {p.penalty > 0 && <span className="text-[11px] text-rose-500">-{p.penalty}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide pt-3">AI-detected defects ({grade.source})</p>
                  {grade.defectBreakdown.length === 0 ? (
                    <p className="text-neutral-400">No defects detected.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {grade.defectBreakdown.map((d) => (
                        <div key={d.id} className="flex justify-between items-start gap-3">
                          <div>
                            <p className="text-neutral-900 dark:text-neutral-100 font-medium">{d.label}</p>
                            <p className="text-xs text-neutral-400 mt-0.5">
                              {d.severity}, confidence {Math.round(d.confidence * 100)}%, photo {d.imageIndex + 1}
                            </p>
                          </div>
                          <span className="text-rose-500 text-xs font-medium shrink-0">-{d.penalty}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Link to="/browse" className="block text-center text-xs text-neutral-400 mt-1">Back to browsing</Link>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="px-3 md:px-0 mt-8">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Similar products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {similar.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </div>
      )}

      {complementary.length > 0 && (
        <div className="px-3 md:px-0 mt-8">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Complete the look</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {complementary.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </div>
      )}

      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}
    </div>
  )
}
