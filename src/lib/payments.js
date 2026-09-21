// Simulated payment/payout methods — no real card or bank processing, this
// only stores display-safe strings the way a real gateway's tokenized
// reference would look (never a full card number or bank account).
export const PAYMENT_TYPES = [
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Card' },
]

export const PAYOUT_TYPES = [
  { id: 'upi', label: 'UPI' },
  { id: 'bank', label: 'Bank account' },
]

export function paymentMethodLabel(method) {
  if (!method) return ''
  if (method.type === 'upi') return `UPI · ${method.upiId}`
  if (method.type === 'card') return `Card ending ${method.last4}`
  return 'Payment method'
}

export function payoutMethodLabel(method) {
  if (!method) return ''
  if (method.type === 'upi') return `UPI · ${method.upiId}`
  if (method.type === 'bank') return `Bank · ${method.accountHolder}, A/C ending ${String(method.accountNumber).slice(-4)}`
  return ''
}
