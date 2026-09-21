import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { runGrading, runDescription, runPriceSuggestion, PROVIDERS } from '../lib/providers/index.js'
import { CATEGORIES, GENDERS } from '../lib/categories.js'
import { SIZES } from '../lib/sizes.js'
import { CLEANING_METHODS, SELL_REASONS } from '../lib/provenance.js'
import { COLORS, LOCATIONS } from '../lib/attributes.js'
import { PLATFORM_FEE_RATE, SHIPPING_PACKING_FEE, sellerPayout, platformFee } from '../lib/pricing.js'
import { PAYOUT_TYPES, payoutMethodLabel } from '../lib/payments.js'
import GradeBadge from '../components/GradeBadge.jsx'
import { Upload, Loader2, AlertCircle, ChevronLeft, Tag, LogIn, Sparkles, Wallet, Pencil } from 'lucide-react'

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Sell() {
  const { addListing, settings, currentUser, setPayoutMethod } = useApp()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [gender, setGender] = useState(GENDERS[0])
  const [category, setCategory] = useState(CATEGORIES[0])
  const [size, setSize] = useState(SIZES[2])
  const [color, setColor] = useState(COLORS[0])
  const [location, setLocation] = useState(LOCATIONS[0])
  const [basePrice, setBasePrice] = useState(1000)
  const [photos, setPhotos] = useState([])
  const [questionnaire, setQuestionnaire] = useState({
    stains: 'none',
    tears: 'none',
    fading: 'none',
    stitching: 'none',
    pilling: 'none',
    tagsAttached: 'yes',
  })
  const [cleaningMethod, setCleaningMethod] = useState(CLEANING_METHODS[0])
  const [sellReason, setSellReason] = useState(SELL_REASONS[0])
  const [tagPhoto, setTagPhoto] = useState(null)
  const [smokeFreeHome, setSmokeFreeHome] = useState(true)
  const [petFreeHome, setPetFreeHome] = useState(true)
  const [grading, setGrading] = useState(false)
  const [result, setResult] = useState(null)
  const [generatingDescription, setGeneratingDescription] = useState(false)
  const [descriptionFellBack, setDescriptionFellBack] = useState(null)
  const [suggestingPrice, setSuggestingPrice] = useState(false)
  const [priceSuggestionFellBack, setPriceSuggestionFellBack] = useState(null)

  // Payout destination — first-time sellers fill it in, after that it's
  // shown auto-filled from their account with a "Change" option, same
  // pattern as a real marketplace's saved-payout-method screen.
  const savedPayout = currentUser?.payoutMethod ?? null
  const [editingPayout, setEditingPayout] = useState(!savedPayout)
  const [payoutType, setPayoutType] = useState(savedPayout?.type ?? 'upi')
  const [payoutUpiId, setPayoutUpiId] = useState(savedPayout?.upiId ?? '')
  const [payoutAccountHolder, setPayoutAccountHolder] = useState(savedPayout?.accountHolder ?? '')
  const [payoutAccountNumber, setPayoutAccountNumber] = useState(savedPayout?.accountNumber ?? '')
  const [payoutIfsc, setPayoutIfsc] = useState(savedPayout?.ifsc ?? '')

  function buildPayoutMethod() {
    if (payoutType === 'upi') {
      if (!payoutUpiId.trim()) return null
      return { type: 'upi', upiId: payoutUpiId.trim() }
    }
    if (!payoutAccountHolder.trim() || payoutAccountNumber.trim().length < 4 || payoutIfsc.trim().length < 4) return null
    return { type: 'bank', accountHolder: payoutAccountHolder.trim(), accountNumber: payoutAccountNumber.trim(), ifsc: payoutIfsc.trim().toUpperCase() }
  }

  const payoutReady = !editingPayout || buildPayoutMethod() !== null

  async function handlePhotos(e) {
    const files = Array.from(e.target.files ?? []).slice(0, 4)
    const dataUrls = await Promise.all(files.map(fileToDataUrl))
    setPhotos(dataUrls)
    setResult(null)
  }

  async function handleTagPhoto(e) {
    const file = e.target.files?.[0]
    if (file) {
      setTagPhoto(await fileToDataUrl(file))
      setResult(null)
    }
  }

  function updateQ(field, value) {
    setQuestionnaire((q) => ({ ...q, [field]: value }))
    setResult(null)
  }

  async function handleGrade() {
    if (photos.length === 0) return
    setGrading(true)
    try {
      const apiKey = settings.apiKeys?.[settings.providerId]
      const graded = await runGrading({
        providerId: settings.providerId,
        apiKey,
        endpoint: settings.ollamaEndpoint,
        model: settings.providerId === 'ollama' ? settings.ollamaModel : settings.openrouterModel,
        photos,
        questionnaire,
        provenance: { cleaningMethod, sellReason, tagPhoto, smokeFreeHome, petFreeHome },
        basePrice: Number(basePrice) || 0,
      })
      setResult(graded)
    } finally {
      setGrading(false)
    }
  }

  async function handleGenerateDescription() {
    if (photos.length === 0) return
    setGeneratingDescription(true)
    setDescriptionFellBack(null)
    try {
      const apiKey = settings.apiKeys?.[settings.providerId]
      const generated = await runDescription({
        providerId: settings.providerId,
        apiKey,
        endpoint: settings.ollamaEndpoint,
        model: settings.providerId === 'ollama' ? settings.ollamaModel : settings.openrouterModel,
        photos,
        category,
        title,
        questionnaire,
      })
      // Lands in the editable textarea, not published directly — the seller
      // reviews and can edit or discard it before "Publish listing".
      setDescription(generated.description)
      setDescriptionFellBack(generated.fellBack ? generated.fallbackReason : null)
    } finally {
      setGeneratingDescription(false)
    }
  }

  async function handleSuggestPrice() {
    if (photos.length === 0) return
    setSuggestingPrice(true)
    setPriceSuggestionFellBack(null)
    try {
      const apiKey = settings.apiKeys?.[settings.providerId]
      const suggested = await runPriceSuggestion({
        providerId: settings.providerId,
        apiKey,
        endpoint: settings.ollamaEndpoint,
        model: settings.providerId === 'ollama' ? settings.ollamaModel : settings.openrouterModel,
        photos,
        category,
        gender,
        size,
      })
      // Fills the base-price field, doesn't lock it — the seller can still
      // type over it before grading.
      setBasePrice(suggested.price)
      setResult(null)
      setPriceSuggestionFellBack(suggested.fellBack ? suggested.fallbackReason : null)
    } finally {
      setSuggestingPrice(false)
    }
  }

  function handlePublish() {
    if (editingPayout) {
      const method = buildPayoutMethod()
      if (!method) return
      setPayoutMethod(method)
    }
    const listing = {
      id: `l-${Date.now()}`,
      title: title || `${category} item`,
      description,
      category,
      gender,
      size,
      color,
      location,
      basePrice: Number(basePrice) || 0,
      seller: currentUser.name,
      photos,
      questionnaire,
      provenance: { cleaningMethod, sellReason, tagPhoto, smokeFreeHome, petFreeHome },
      grade: result,
      status: 'listed',
      createdAt: Date.now(),
    }
    addListing(listing)
    navigate(`/listing/${listing.id}`)
  }

  if (!currentUser) {
    return (
      <div className="p-4 md:p-8 md:max-w-sm md:mx-auto text-center py-16 space-y-3">
        <LogIn className="mx-auto text-neutral-300" size={36} />
        <p className="text-sm text-neutral-400">Log in to list an item for sale.</p>
        <Link
          to="/login"
          state={{ from: '/sell/list' }}
          className="inline-block bg-emerald-600 text-white font-semibold rounded-lg px-5 py-2.5 text-sm"
        >
          Log in
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 md:max-w-xl md:mx-auto space-y-4">
      <Link to="/sell" className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
        <ChevronLeft size={14} /> Back to selling info
      </Link>
      <h1 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-50">List an item</h1>

      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Denim Jacket, Classic Blue"
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Description</span>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={photos.length === 0 || generatingDescription}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 disabled:text-neutral-300 dark:disabled:text-neutral-700"
            >
              {generatingDescription ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Generate with AI
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="A few lines about the item: fit, fabric, why you're letting it go..."
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
          />
          {descriptionFellBack ? (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle size={12} /> {PROVIDERS[settings.providerId]?.label} unavailable, used a template instead ({descriptionFellBack}).
            </span>
          ) : (
            <span className="text-[11px] text-neutral-400">
              {photos.length === 0
                ? 'Add photos first, then generate a description from them, or write your own.'
                : 'Generated from your photos and questionnaire. Review and edit before publishing.'}
            </span>
          )}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Gender</span>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm">
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Size</span>
            <select value={size} onChange={(e) => setSize(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm">
              {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Colour</span>
            <select value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm">
              {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Your location (for delivery estimates)</span>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm">
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>

        <label className="block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Base price (₹, before condition discount)</span>
            <button
              type="button"
              onClick={handleSuggestPrice}
              disabled={photos.length === 0 || suggestingPrice}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 disabled:text-neutral-300 dark:disabled:text-neutral-700"
            >
              {suggestingPrice ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Suggest with AI
            </button>
          </div>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => { setBasePrice(e.target.value); setResult(null) }}
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
          />
          {priceSuggestionFellBack ? (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle size={12} /> {PROVIDERS[settings.providerId]?.label} unavailable, used a category estimate instead ({priceSuggestionFellBack}).
            </span>
          ) : (
            <span className="text-[11px] text-neutral-400">
              {photos.length === 0
                ? 'Add photos first to get an AI price suggestion, or set your own.'
                : 'This is the "like new" reference price. Your final listing price is this, discounted by the condition grade below.'}
            </span>
          )}
        </label>

        <label className="block">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Photos (1 required, up to 4 helps grading accuracy)</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <img key={i} src={p} className="w-16 h-16 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700" />
            ))}
            <label className="w-16 h-16 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-400 cursor-pointer">
              <Upload size={18} />
              <input type="file" accept="image/*" multiple capture="environment" onChange={handlePhotos} className="hidden" />
            </label>
          </div>
        </label>

        <div className="space-y-2">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Condition questionnaire</p>
          <QField label="Stains" field="stains" value={questionnaire.stains} options={['none', 'light', 'heavy']} onChange={updateQ} />
          <QField label="Tears" field="tears" value={questionnaire.tears} options={['none', 'minor', 'major']} onChange={updateQ} />
          <QField label="Fading" field="fading" value={questionnaire.fading} options={['none', 'slight', 'noticeable']} onChange={updateQ} />
          <QField label="Stitching / seams" field="stitching" value={questionnaire.stitching} options={['none', 'loose', 'coming apart']} onChange={updateQ} />
          <QField label="Pilling" field="pilling" value={questionnaire.pilling} options={['none', 'light', 'heavy']} onChange={updateQ} />
          <QField label="Original tags attached" field="tagsAttached" value={questionnaire.tagsAttached} options={['yes', 'no']} onChange={updateQ} />
        </div>

        <div className="space-y-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Trust &amp; provenance</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Seller-attested details the AI can't see from photos alone, shown to buyers alongside the grade.
            </p>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Cleaning method</span>
            <select
              value={cleaningMethod}
              onChange={(e) => { setCleaningMethod(e.target.value); setResult(null) }}
              className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
            >
              {CLEANING_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Reason for selling</span>
            <select
              value={sellReason}
              onChange={(e) => setSellReason(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
            >
              {SELL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Brand tag / logo close-up (optional)</span>
            <div className="mt-1 flex items-center gap-2">
              {tagPhoto ? (
                <img src={tagPhoto} className="w-16 h-16 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700" />
              ) : (
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-400 cursor-pointer">
                  <Tag size={16} />
                  <input type="file" accept="image/*" capture="environment" onChange={handleTagPhoto} className="hidden" />
                </label>
              )}
              <p className="text-[11px] text-neutral-400">Helps buyers verify authenticity on peer-to-peer listings.</p>
            </div>
          </label>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input type="checkbox" checked={smokeFreeHome} onChange={(e) => { setSmokeFreeHome(e.target.checked); setResult(null) }} className="w-4 h-4 accent-emerald-600" />
              Smoke-free home
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input type="checkbox" checked={petFreeHome} onChange={(e) => { setPetFreeHome(e.target.checked); setResult(null) }} className="w-4 h-4 accent-emerald-600" />
              Pet-free home
            </label>
          </div>
        </div>

        <p className="text-xs text-neutral-400">
          Grading provider: <span className="font-medium text-neutral-600 dark:text-neutral-300">{PROVIDERS[settings.providerId]?.label}</span>. Change this in Settings.
        </p>

        <button
          onClick={handleGrade}
          disabled={photos.length === 0 || grading}
          className="w-full bg-emerald-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2"
        >
          {grading && <Loader2 size={16} className="animate-spin" />}
          {grading ? 'Grading…' : 'Get AI condition grade'}
        </button>

        {result && (
          <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <GradeBadge letter={result.letter} score={result.score} size="lg" />
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">₹{result.price}</p>
            </div>
            {result.fellBack && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle size={14} /> {PROVIDERS[settings.providerId]?.label} unavailable, used
                simulated fallback ({result.fallbackReason}).
              </p>
            )}
            {result.defectBreakdown.length > 0 ? (
              <ul className="text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
                {result.defectBreakdown.map((d) => (
                  <li key={d.id}>• {d.label} ({d.severity}, {Math.round(d.confidence * 100)}% confidence)</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-400">No defects detected.</p>
            )}

            <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800 p-2.5 text-xs text-neutral-600 dark:text-neutral-300 space-y-1">
              <div className="flex items-center justify-between">
                <span>Sale price</span>
                <span>₹{result.price}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Platform fee ({Math.round(PLATFORM_FEE_RATE * 100)}%)</span>
                <span>−₹{platformFee(result.price)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-neutral-900 dark:text-neutral-100 pt-1 border-t border-neutral-200 dark:border-neutral-700">
                <span>You receive</span>
                <span>₹{sellerPayout(result.price)}</span>
              </div>
              <p className="text-[11px] text-neutral-400 pt-0.5">
                Buyer separately pays ₹{SHIPPING_PACKING_FEE} shipping &amp; packing at checkout;
                that doesn't affect your payout.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Wallet size={14} /> Payout destination
                </p>
                {!editingPayout && (
                  <button type="button" onClick={() => setEditingPayout(true)} className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <Pencil size={12} /> Change
                  </button>
                )}
              </div>

              {!editingPayout ? (
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{payoutMethodLabel(savedPayout)}</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {PAYOUT_TYPES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setPayoutType(t.id)}
                        className={`flex-1 text-xs font-medium rounded-lg py-1.5 border ${
                          payoutType === t.id ? 'bg-emerald-600 text-white border-emerald-600' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {payoutType === 'upi' ? (
                    <input
                      value={payoutUpiId}
                      onChange={(e) => setPayoutUpiId(e.target.value)}
                      placeholder="yourname@bank"
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
                    />
                  ) : (
                    <div className="space-y-2">
                      <input
                        value={payoutAccountHolder}
                        onChange={(e) => setPayoutAccountHolder(e.target.value)}
                        placeholder="Account holder name"
                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
                      />
                      <input
                        value={payoutAccountNumber}
                        onChange={(e) => setPayoutAccountNumber(e.target.value)}
                        placeholder="Account number"
                        inputMode="numeric"
                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
                      />
                      <input
                        value={payoutIfsc}
                        onChange={(e) => setPayoutIfsc(e.target.value)}
                        placeholder="IFSC code"
                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                  {savedPayout && (
                    <button type="button" onClick={() => setEditingPayout(false)} className="text-xs text-neutral-400">Cancel, keep current details</button>
                  )}
                </div>
              )}
              <p className="text-[11px] text-neutral-400">Simulated for this prototype. {savedPayout ? 'Saved to your account, reused for future listings.' : "Saved to your account once you publish, so it's auto-filled next time."}</p>
            </div>

            <button
              onClick={handlePublish}
              disabled={!payoutReady}
              className="w-full bg-neutral-900 dark:bg-emerald-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white font-semibold rounded-xl py-2.5 mt-1"
            >
              Publish listing
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function QField({ label, field, value, options, onChange }) {
  return (
    <div>
      <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-1">{label}</p>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(field, opt)}
            className={`px-3 py-1.5 rounded-lg text-xs border ${
              value === opt
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
