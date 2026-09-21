// Playful seller handles instead of real names, so the marketplace doesn't
// expose (or need) anyone's actual identity in the demo. Pick one at
// "publish" time based on the listing id, so it stays stable on refresh.
export const SELLER_HANDLES = [
  'Mad Hatter',
  'Velvet Fox',
  'Thrift Wizard',
  'Neon Raven',
  'Cloud Walker',
  'Sly Otter',
  'Paper Moon',
  'Rusty Compass',
  'Quiet Storm',
  'Lucky Magpie',
]

export function handleFor(id) {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % SELLER_HANDLES.length
  return SELLER_HANDLES[h]
}
