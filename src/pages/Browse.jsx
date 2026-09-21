import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { GENDERS, CATEGORIES } from '../lib/categories.js'
import { COLORS, LOCATIONS, PRICE_BUCKETS, DISCOUNT_BUCKETS, GRADES } from '../lib/attributes.js'
import { pseudoLikes } from '../lib/fakeStats.js'
import ListingCard from '../components/ListingCard.jsx'
import FilterSidebar from '../components/FilterSidebar.jsx'
import { SlidersHorizontal, X } from 'lucide-react'

const FILTER_KEYS = ['gender', 'category', 'grade', 'price', 'discount', 'seller', 'color', 'location']

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'popularity', label: 'Popularity' },
  { id: 'newest', label: 'Latest styles' },
  { id: 'grade', label: 'Grade' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
]

function sortListings(listings, sort) {
  const sorted = [...listings]
  if (sort === 'popularity') return sorted.sort((a, b) => pseudoLikes(b.id) - pseudoLikes(a.id))
  if (sort === 'newest') return sorted.sort((a, b) => b.createdAt - a.createdAt)
  if (sort === 'grade') return sorted.sort((a, b) => b.grade.score - a.grade.score)
  if (sort === 'price-low') return sorted.sort((a, b) => a.grade.price - b.grade.price)
  if (sort === 'price-high') return sorted.sort((a, b) => b.grade.price - a.grade.price)
  return sorted // relevance: keep insertion order (already newest-first-ish from context)
}

export default function Browse() {
  const { listings } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const selected = Object.fromEntries(
    FILTER_KEYS.map((key) => [key, searchParams.get(key)?.split(',').filter(Boolean) ?? []]),
  )
  const q = searchParams.get('q') ?? ''
  const sort = searchParams.get('sort') ?? 'relevance'

  const sellerOptions = [...new Set(listings.map((l) => l.seller))].sort()

  const sections = [
    { key: 'gender', title: 'Gender', options: GENDERS.map((g) => ({ id: g, label: g })) },
    { key: 'category', title: 'Category', options: CATEGORIES.map((c) => ({ id: c, label: c })) },
    { key: 'grade', title: 'Grade', options: GRADES.map((g) => ({ id: g, label: `Grade ${g}` })) },
    { key: 'price', title: 'Price', options: PRICE_BUCKETS.map((b) => ({ id: b.id, label: b.label })) },
    { key: 'discount', title: 'Discount', options: DISCOUNT_BUCKETS.map((b) => ({ id: b.id, label: b.label })) },
    { key: 'seller', title: 'Brand / Seller', options: sellerOptions.map((s) => ({ id: s, label: s })) },
    { key: 'color', title: 'Colour', options: COLORS.map((c) => ({ id: c, label: c })) },
    { key: 'location', title: 'Location', options: LOCATIONS.map((l) => ({ id: l, label: l })) },
  ]

  function setListParam(key, list) {
    const next = new URLSearchParams(searchParams)
    if (list.length) next.set(key, list.join(','))
    else next.delete(key)
    setSearchParams(next)
  }

  function toggleFilter(key, id) {
    const current = selected[key]
    setListParam(key, current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }

  function setSort(value) {
    const next = new URLSearchParams(searchParams)
    if (value && value !== 'relevance') next.set('sort', value)
    else next.delete('sort')
    setSearchParams(next)
  }

  function clearOne(key, value) {
    if (key === 'q') {
      const next = new URLSearchParams(searchParams)
      next.delete('q')
      setSearchParams(next)
    } else {
      toggleFilter(key, value)
    }
  }

  const priceBucketMatch = (price) => selected.price.length === 0 || PRICE_BUCKETS.filter((b) => selected.price.includes(b.id)).some((b) => b.test(price))
  const discountBucketMatch = (pct) => selected.discount.length === 0 || DISCOUNT_BUCKETS.filter((b) => selected.discount.includes(b.id)).some((b) => b.test(pct))

  const filtered = sortListings(
    listings.filter((l) => {
      const discountPct = Math.max(0, 100 - l.grade.score)
      return (
        (selected.gender.length === 0 || selected.gender.includes(l.gender)) &&
        (selected.category.length === 0 || selected.category.includes(l.category)) &&
        (selected.grade.length === 0 || selected.grade.includes(l.grade.letter)) &&
        (selected.seller.length === 0 || selected.seller.includes(l.seller)) &&
        (selected.color.length === 0 || selected.color.includes(l.color)) &&
        (selected.location.length === 0 || selected.location.includes(l.location)) &&
        priceBucketMatch(l.grade.price) &&
        discountBucketMatch(discountPct) &&
        (!q || l.title.toLowerCase().includes(q.toLowerCase()))
      )
    }),
    sort,
  )

  const activeChips = [
    ...FILTER_KEYS.flatMap((key) => selected[key].map((v) => ({ key, value: v, label: sections.find((s) => s.key === key)?.options.find((o) => o.id === v)?.label ?? v }))),
    q && { key: 'q', label: `"${q}"` },
  ].filter(Boolean)

  const hasActive = activeChips.length > 0

  return (
    <div className="p-4 md:p-8 md:flex md:gap-8">
      <FilterSidebar
        mobileOpen={mobileFiltersOpen}
        onCloseMobile={() => setMobileFiltersOpen(false)}
        sections={sections}
        selected={selected}
        onToggle={toggleFilter}
      />

      <div className="flex-1 space-y-4 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Browse listings</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              {filtered.length === listings.length
                ? `${listings.length} product${listings.length === 1 ? '' : 's'}`
                : `${filtered.length} of ${listings.length} products`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-1.5 text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg px-3 py-1.5"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-2 py-1.5 text-xs"
            >
              {SORT_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {hasActive && (
          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip, i) => (
              <button
                key={`${chip.key}-${chip.value ?? i}`}
                onClick={() => clearOne(chip.key, chip.value)}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
              >
                {chip.label} <X size={12} />
              </button>
            ))}
            <button
              onClick={() => setSearchParams({})}
              className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 px-2 py-1"
            >
              Clear all
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="text-sm text-neutral-400 py-8 text-center">No listings match these filters.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>
    </div>
  )
}
