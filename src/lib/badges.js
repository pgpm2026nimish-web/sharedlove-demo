import { Circle, Sprout, TreeDeciduous, TreePine } from 'lucide-react'

// A person always "holds" exactly one of these, growing with total
// completed transactions (buying + selling combined). Tier 0 is the
// default for everyone: an unplanted seed, not an unearned badge — there's
// always something to show, it just hasn't grown yet.
export const BADGE_TIERS = [
  { id: 'seed', label: 'Seed', minTransactions: 0, icon: Circle, description: 'Everyone starts here. Complete your first purchase or sale to plant it.' },
  { id: 'sprout', label: 'Sprout', minTransactions: 1, icon: Sprout, description: 'Complete 1 transaction (buy or sell) to sprout your seed.' },
  { id: 'sapling', label: 'Sapling', minTransactions: 3, icon: TreeDeciduous, description: 'Reach 3 completed transactions.' },
  { id: 'young-tree', label: 'Young Tree', minTransactions: 6, icon: TreeDeciduous, description: 'Reach 6 completed transactions.' },
  { id: 'full-tree', label: 'Full-Grown Tree', minTransactions: 10, icon: TreePine, description: 'Reach 10 completed transactions, the highest tier.' },
]

export function currentBadge(totalTransactions) {
  return [...BADGE_TIERS].reverse().find((b) => totalTransactions >= b.minTransactions) ?? BADGE_TIERS[0]
}

export function shareMessage({ name, wasteReducedKg, treesPlanted }) {
  return `I'm ${name} on SharedLove: I've helped reduce ${wasteReducedKg}kg of textile waste and contributed to ${treesPlanted} tree${treesPlanted === 1 ? '' : 's'} planted by buying and selling secondhand. Join me at SharedLove.`
}
