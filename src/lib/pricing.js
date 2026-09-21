// Previously undisclosed: the grade price shown everywhere else in the app
// is the sale price only — it said nothing about what the seller actually
// keeps or what a buyer pays beyond that. These are simple, clearly-labeled
// placeholder numbers (not a validated business model), so the demo has an
// honest answer instead of silence.
export const PLATFORM_FEE_RATE = 0.10 // 10% of sale price, kept by SharedLove
export const SHIPPING_PACKING_FEE = 49 // flat ₹ per item, paid by the buyer

export function sellerPayout(salePrice) {
  return Math.round(salePrice * (1 - PLATFORM_FEE_RATE))
}

export function platformFee(salePrice) {
  return salePrice - sellerPayout(salePrice)
}
