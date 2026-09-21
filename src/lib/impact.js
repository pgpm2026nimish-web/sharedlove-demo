// Reward economics for a completed, buyer-accepted transaction. Same spirit
// as the platform-fee/shipping numbers in pricing.js: clearly-labeled
// placeholder figures for the demo, not a validated program.
export const POINTS_PER_PURCHASE = 100 // credited to the buyer
export const POINTS_PER_SALE = 10 // credited to the seller
export const WASTE_KG_PER_TRANSACTION = 0.5 // illustrative estimate of textile waste diverted per item

// Points and impact are both tracked by display name (not user id), because
// the marketplace's seed sellers only ever existed as names, never full
// accounts — keeping one identity scheme avoids two parallel systems.
export function userImpactStats(name, { impactEvents, points }) {
  const asBuyer = impactEvents.filter((e) => e.buyer === name)
  const asSeller = impactEvents.filter((e) => e.seller === name)
  const totalTransactions = asBuyer.length + asSeller.length

  return {
    points: points[name] ?? 0,
    purchases: asBuyer.length,
    sales: asSeller.length,
    totalTransactions,
    treesPlanted: totalTransactions, // one tree logged per transaction, credited to both sides
    wasteReducedKg: Math.round(totalTransactions * WASTE_KG_PER_TRANSACTION * 10) / 10,
  }
}
