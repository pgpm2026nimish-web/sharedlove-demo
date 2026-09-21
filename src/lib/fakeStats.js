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
  return { itemsSold: (h % 30) + 2, shipsInDays: (h % 3) + 1 }
}
