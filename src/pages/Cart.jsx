import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { X, ShoppingBag, Plus } from 'lucide-react'
import { SHIPPING_PACKING_FEE } from '../lib/pricing.js'
import { PAYMENT_TYPES, paymentMethodLabel } from '../lib/payments.js'

const COD = { id: 'cod', label: 'Cash on delivery' }

export default function Cart() {
  const { listings, cart, removeFromCart, checkout, currentUser, addPaymentMethod } = useApp()
  const navigate = useNavigate()
  const savedMethods = currentUser?.paymentMethods ?? []
  const [selectedId, setSelectedId] = useState(savedMethods[0]?.id ?? 'cod')
  const [addingNew, setAddingNew] = useState(savedMethods.length === 0)
  const [newType, setNewType] = useState('upi')
  const [upiId, setUpiId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [saveMethod, setSaveMethod] = useState(true)
  const [placing, setPlacing] = useState(false)

  const items = cart.map((id) => listings.find((l) => l.id === id)).filter(Boolean)
  const subtotal = items.reduce((sum, l) => sum + l.grade.price, 0)
  const shipping = items.length * SHIPPING_PACKING_FEE
  const total = subtotal + shipping

  function buildNewMethod() {
    if (newType === 'upi') {
      if (!upiId.trim()) return null
      return { type: 'upi', upiId: upiId.trim() }
    }
    const digits = cardNumber.replace(/\D/g, '')
    if (digits.length < 4) return null
    return { type: 'card', last4: digits.slice(-4) }
  }

  async function handlePlaceOrder() {
    if (!currentUser) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    let paymentMethod = selectedId
    if (addingNew) {
      const method = buildNewMethod()
      if (!method) return
      paymentMethod = saveMethod ? addPaymentMethod(method) : `${method.type}:one-time`
    }
    setPlacing(true)
    checkout(paymentMethod)
    navigate('/orders')
  }

  if (items.length === 0) {
    return (
      <div className="p-4 md:p-8 md:max-w-lg md:mx-auto text-center py-16 space-y-3">
        <ShoppingBag className="mx-auto text-neutral-300" size={36} />
        <p className="text-sm text-neutral-400">Your cart is empty.</p>
        <Link to="/browse" className="inline-block text-sm text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-2">
          Browse listings
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 md:max-w-lg md:mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Your cart</h1>
        <Link to="/orders" className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">My orders</Link>
      </div>

      <div className="space-y-2">
        {items.map((l) => (
          <div key={l.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2">
            <img src={l.photos[0]} className="w-14 h-14 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 line-clamp-1">{l.title}</p>
              <p className="text-xs text-neutral-400">Size {l.size} · Sold by {l.seller}</p>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">₹{l.grade.price}</p>
            </div>
            <button onClick={() => removeFromCart(l.id)} className="text-neutral-300 hover:text-rose-500 p-1">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Payment method</p>
        <div className="space-y-1.5">
          {savedMethods.map((m) => (
            <label
              key={m.id}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${
                !addingNew && selectedId === m.id
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={!addingNew && selectedId === m.id}
                onChange={() => { setSelectedId(m.id); setAddingNew(false) }}
                className="accent-emerald-600"
              />
              {paymentMethodLabel(m)}
            </label>
          ))}

          <label
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${
              !addingNew && selectedId === 'cod'
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            <input
              type="radio"
              name="payment"
              checked={!addingNew && selectedId === 'cod'}
              onChange={() => { setSelectedId('cod'); setAddingNew(false) }}
              className="accent-emerald-600"
            />
            {COD.label}
          </label>

          {addingNew ? (
            <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 p-3 space-y-2">
              <div className="flex gap-2">
                {PAYMENT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setNewType(t.id)}
                    className={`flex-1 text-xs font-medium rounded-lg py-1.5 border ${
                      newType === t.id
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {newType === 'upi' ? (
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@bank"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
                />
              ) : (
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Card number (simulated, not stored in full)"
                  inputMode="numeric"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
                />
              )}
              <label className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <input type="checkbox" checked={saveMethod} onChange={(e) => setSaveMethod(e.target.checked)} className="w-3.5 h-3.5 accent-emerald-600" />
                Save this method for future orders
              </label>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setAddingNew(true); setSelectedId('new') }}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
            >
              <Plus size={13} /> Add a payment method
            </button>
          )}
          <p className="text-[10px] text-neutral-400">Simulated for this prototype, no real payment is processed or stored in full.</p>
        </div>

        <div className="space-y-1 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-sm">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span>Subtotal ({items.length} item{items.length === 1 ? '' : 's'})</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span>Shipping &amp; packing</span>
            <span>₹{shipping}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-neutral-500 dark:text-neutral-400">Total</span>
            <span className="font-bold text-neutral-900 dark:text-neutral-50">₹{total}</span>
          </div>
        </div>

        <p className="text-[11px] text-neutral-400">
          Payment is held until you accept the item at open-box delivery. If you reject or
          dispute it, the hold protects your refund.
        </p>

        <button
          onClick={handlePlaceOrder}
          disabled={placing}
          className="w-full bg-emerald-600 text-white font-semibold rounded-xl py-2.5 text-sm"
        >
          {currentUser ? 'Place order and hold payment' : 'Log in to place order'}
        </button>
      </div>
    </div>
  )
}
