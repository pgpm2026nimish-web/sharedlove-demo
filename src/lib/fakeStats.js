// Deterministic pseudo social-proof numbers — no backend to track real
// likes/sales history, but they shouldn't jump around on every re-render.
function hash(str, mod) {
  let h = 0
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) % mod
  return h
}

export function pseudoLikes(id) {
  return hash(id, 97)
}

export function sellerStats(name) {
  const h = hash(name, 89)
  const itemsSold = (h % 30) + 2
  // Rating scales loosely with items sold (more sales, tighter/higher
  // rating), same idea as real marketplace seller ratings, still
  // deterministic per name rather than random on every render.
  const rating = Math.min(5, 3.8 + (h % 13) / 10)
  const ratingCount = Math.max(itemsSold - (h % 4), 1)
  return { itemsSold, shipsInDays: (h % 3) + 1, rating: Math.round(rating * 10) / 10, ratingCount }
}
