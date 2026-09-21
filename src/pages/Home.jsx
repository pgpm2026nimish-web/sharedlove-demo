import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { pseudoLikes } from '../lib/fakeStats.js'
import ListingCard from '../components/ListingCard.jsx'
import { ArrowRight, ShieldCheck, PackageSearch, FileSearch, Users, TreePine, Award, Heart } from 'lucide-react'
import { POINTS_PER_PURCHASE, POINTS_PER_SALE } from '../lib/impact.js'

// Real, freely-licensed photos from Wikimedia Commons (verified by
// downloading and checking each one — hotlinking keyword-guess services
// like LoremFlickr returned irrelevant results). Swap for your own product
// photography before a public launch.
const BUYER_IMAGE = 'https://commons.wikimedia.org/wiki/Special:FilePath/ClothingReadyWear.jpg?width=700'
const SELLER_IMAGE =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Clothing%20donation%20boxes%20behind%20Springfield%20Town%20Center.jpg?width=700'
const MEN_IMAGE =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Boyes%20and%20Herd%20clothing%20store%20interior%20showing%20coat%20racks%20n.d.%20(3191726843).jpg?width=600'
const WOMEN_IMAGE =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Window%20display%20of%20prom%20dress%20shop.jpg?width=600'

// Illustrative placeholder testimonials for the demo, not real submitted
// reviews. Replace with real buyer/seller quotes once the prototype has
// real users.
const TESTIMONIALS = [
  {
    name: 'Ritika S.',
    role: 'Buyer',
    quote: "I've wanted to try thrifting for years but always worried about what would actually show up. Seeing the exact defects marked on the photo before I paid made the difference.",
  },
  {
    name: 'Karan V.',
    role: 'Buyer',
    quote: 'The open-box check at delivery is what sold me. I could inspect the jacket with the courier still there instead of hoping a return request would go smoothly later.',
  },
  {
    name: 'Anjali D.',
    role: 'Seller',
    quote: "The AI grade gave me a fair starting price without guessing, and buyers stopped haggling over condition since it's already documented.",
  },
  {
    name: 'Mad Hatter',
    role: 'Seller',
    quote: "Listing took a few minutes end to end. I liked that the grade explains itself instead of just handing me a number to argue with.",
  },
  {
    name: 'Devika R.',
    role: 'Buyer',
    quote: "Knowing a tree gets planted when a sale actually completes made the whole thing feel worth doing, not just cheaper.",
  },
]

const TRUST_POINTS = [
  { icon: ShieldCheck, label: 'AI condition grading', body: 'Every listing is graded with visible defects, not a hidden score.' },
  { icon: PackageSearch, label: 'Open-box delivery', body: 'Inspect the item with the courier present before you keep it.' },
  { icon: FileSearch, label: 'Transparent disputes', body: 'Both sides see the same grading reasoning if something looks off.' },
  { icon: Users, label: 'Peer-to-peer, no warehouse wait', body: 'Sellers list directly, so there is no shipping-to-warehouse delay.' },
]

export default function Home() {
  const { listings, impactEvents, currentUser } = useApp()
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  const trending = [...listings].sort((a, b) => pseudoLikes(b.id) - pseudoLikes(a.id)).slice(0, 6)
  const newArrivals = [...listings].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6)

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % TESTIMONIALS.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-8 md:space-y-10 pb-4">
      {/* Split hero: left = buyer story, right = seller story */}
      <section className="md:flex">
        <div className="flex-1 bg-emerald-50 dark:bg-neutral-900 p-6 md:p-10 flex flex-col gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Buy secondhand, verified
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm">
            Every listing shows its AI condition grade with visible reasoning. Inspect it again at
            delivery before you commit. No guesswork, no "hope it's fine."
          </p>
          <img
            src={BUYER_IMAGE}
            alt="Browsing secondhand clothing"
            className="w-full h-48 md:h-56 object-cover rounded-2xl"
            loading="lazy"
          />
          <Link
            to="/browse"
            className="inline-flex w-fit items-center gap-1.5 bg-emerald-600 text-white font-semibold rounded-lg px-4 py-2.5 text-sm"
          >
            Browse listings <ArrowRight size={16} />
          </Link>
        </div>

        <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 p-6 md:p-10 flex flex-col gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Turn your closet into cash
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm">
            Snap a few photos, answer a short condition questionnaire, and get an AI-suggested
            grade and price in minutes, before you publish anything.
          </p>
          <img
            src={SELLER_IMAGE}
            alt="Clothing donation bins for textile recycling"
            className="w-full h-48 md:h-56 object-cover rounded-2xl"
            loading="lazy"
          />
          <Link
            to="/sell"
            className="inline-flex w-fit items-center gap-1.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold rounded-lg px-4 py-2.5 text-sm"
          >
            Start selling <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <div className="px-4 md:px-8 space-y-8 md:space-y-10">
        {/* Shop for him / for her, Myntra-style gender split tiles.
            Category-level filters (shirts, trousers, etc.) live on the
            Browse page, not here. */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Shop For Him & Her</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/browse?gender=Men" className="relative rounded-xl overflow-hidden h-40 md:h-56 group">
              <img src={MEN_IMAGE} alt="Menswear" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 flex items-end p-3">
                <span className="text-white font-semibold">For Him</span>
              </div>
            </Link>
            <Link to="/browse?gender=Women" className="relative rounded-xl overflow-hidden h-40 md:h-56 group">
              <img src={WOMEN_IMAGE} alt="Womenswear" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 flex items-end p-3">
                <span className="text-white font-semibold">For Her</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Trending now */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Trending Now</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {trending.map((l) => (
              <ListingCard key={l.id} listing={l} className="w-36 shrink-0" />
            ))}
          </div>
        </section>

        {/* New arrivals */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">New Arrivals</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {newArrivals.map((l) => (
              <ListingCard key={l.id} listing={l} className="w-36 shrink-0" />
            ))}
          </div>
        </section>

        {/* Rewards program */}
        <section className="rounded-2xl bg-emerald-50 dark:bg-neutral-900 p-5 md:p-8">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Every transaction gives back</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 max-w-md">
            When a buyer accepts an item at open-box delivery, the sale is real: both sides are
            thanked, earn points, and a tree is planted in both their names.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-white dark:bg-neutral-800 p-3 space-y-1">
              <Award className="text-emerald-600" size={20} />
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Buyers earn {POINTS_PER_PURCHASE} points</p>
              <p className="text-[11px] text-neutral-400">Redeemable on future purchases, credited the moment you accept your item.</p>
            </div>
            <div className="rounded-xl bg-white dark:bg-neutral-800 p-3 space-y-1">
              <Award className="text-emerald-600" size={20} />
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Sellers earn {POINTS_PER_SALE} points</p>
              <p className="text-[11px] text-neutral-400">For every item a buyer keeps, credited to your account automatically.</p>
            </div>
            <div className="rounded-xl bg-white dark:bg-neutral-800 p-3 space-y-1">
              <TreePine className="text-emerald-600" size={20} />
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">A tree, planted for both</p>
              <p className="text-[11px] text-neutral-400">One tree per completed sale, in the name of the buyer and the seller alike.</p>
            </div>
          </div>
          <Link
            to={currentUser ? '/profile' : '/register'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-4"
          >
            <Heart size={13} fill="currentColor" /> {currentUser ? 'See your impact and badges' : 'Create an account to start earning'} <ArrowRight size={13} />
          </Link>
        </section>

        {/* Customer reviews / testimonials — auto-rotating, buyers and sellers mixed */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">What Our Buyers &amp; Sellers Say</h2>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 min-h-[128px] flex flex-col justify-between">
            <div>
              <span
                key={TESTIMONIALS[testimonialIndex].role}
                className="inline-block text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-2"
              >
                {TESTIMONIALS[testimonialIndex].role}
              </span>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">"{TESTIMONIALS[testimonialIndex].quote}"</p>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-2">{TESTIMONIALS[testimonialIndex].name}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => setTestimonialIndex(i)}
                  aria-label={`Show testimonial from ${t.name}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === testimonialIndex ? 'w-5 bg-emerald-600' : 'w-1.5 bg-neutral-200 dark:bg-neutral-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Trust and confidence */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Why Buyers Trust SharedLove</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TRUST_POINTS.map((p) => (
              <div key={p.label} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 space-y-1.5">
                <p.icon className="text-emerald-600" size={20} />
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{p.label}</p>
                <p className="text-[11px] text-neutral-400">{p.body}</p>
              </div>
            ))}
          </div>
          {impactEvents.length > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
              <TreePine size={14} /> {impactEvents.length} tree{impactEvents.length === 1 ? '' : 's'} planted so far from completed, verified purchases.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
