// Rule-based support knowledge base. This is what Sprout's simulated
// engine matches against, and what any connected AI provider is grounded
// on (passed as context) so it doesn't invent policies that don't exist
// here. Keep answers consistent with what HowItWorks/OpenBox/AboutUs
// already tell users elsewhere in the app.
export const FAQS = [
  {
    id: 'grading',
    keywords: ['grade', 'grading', 'condition', 'score', 'letter', 'ai condition', 'defect'],
    question: 'How does the AI condition grade work?',
    answer: "Every listing gets graded from photos plus the seller's condition questionnaire and Trust & Provenance details (cleaning method, smoke/pet-free home, brand-tag photo). Detected defects (stains, tears, fading, pilling, loose stitching) are weighted by how confident the AI is, then subtracted from 100 to get the score. 80+ is Grade A, 55-79 is Grade B, below 55 is Grade C. The listing price is the base price scaled by that score, and every defect behind it is shown to buyers, never a hidden number.",
  },
  {
    id: 'open-box',
    keywords: ['open box', 'open-box', 'delivery', 'inspect', 'courier', 'accept', 'reject'],
    question: 'What is open-box delivery?',
    answer: "You inspect the item with the courier still present before committing. If it matches the listed grade, you accept it on the spot. If it doesn't, you can reject it right there and raise a dispute, no need to ship it back later and hope for a refund.",
  },
  {
    id: 'dispute',
    keywords: ['dispute', 'refund', 'return', 'wrong item', 'damaged', 'complaint'],
    question: 'What happens if I dispute an item?',
    answer: "If you reject an item at open-box delivery, both sides can see the original AI grading reasoning, so it's not a guessing game. Disputes resolve as a full refund + return, a partial refund with you keeping the item, or you keeping it with no refund, whichever fits. There's no separate after-the-fact return window outside of this open-box check, which is why the inspection-before-accepting step matters.",
  },
  {
    id: 'points',
    keywords: ['points', 'rewards', 'reward', 'earn', 'redeem'],
    question: 'How do points work?',
    answer: 'Buyers earn 100 points and sellers earn 10 points on every completed transaction (accepted at open-box delivery). Points are tracked on your Profile page alongside your total trees planted and waste reduced.',
  },
  {
    id: 'badges',
    keywords: ['badge', 'tree', 'seed', 'sapling', 'share badge'],
    question: 'How do badges work?',
    answer: 'Badges track your total completed transactions, growing from Seed through Sprout, Sapling, Young Tree, to Full-Grown Tree. Unearned badges show greyed out on your Profile with the milestone needed to unlock them, and you can share your current badge from there too.',
  },
  {
    id: 'payment',
    keywords: ['payment', 'pay', 'upi', 'card', 'checkout', 'cash on delivery', 'cod'],
    question: 'What payment methods can I use?',
    answer: 'At checkout you can pay by a saved UPI or card method, add a new one on the spot, or choose Cash on Delivery. Saved methods can be managed from your Profile page. This is a simulated prototype, no real payment is processed or stored in full.',
  },
  {
    id: 'payout',
    keywords: ['payout', 'seller payout', 'get paid', 'platform fee', 'commission'],
    question: 'How do sellers get paid?',
    answer: "Set your payout destination (UPI or bank account) the first time you list an item, it's then saved and auto-filled for every listing after, with a 'Change' option if you need to update it. SharedLove takes a 10% platform fee from the sale price; the rest is your payout. Shipping & packing fee is paid separately by the buyer and doesn't affect what you receive.",
  },
  {
    id: 'sell',
    keywords: ['sell', 'listing', 'list an item', 'how to sell', 'photos'],
    question: 'How do I list an item?',
    answer: "Go to Sell, add up to 4 photos, fill in the condition questionnaire and Trust & Provenance details, then get your AI condition grade (or use 'Suggest with AI' for a base price and 'Generate with AI' for a description first). Review the grade and payout breakdown, then publish. You'll need to be logged in to list an item.",
  },
  {
    id: 'account',
    keywords: ['account', 'login', 'log in', 'register', 'sign up', 'password'],
    question: 'Do I need an account?',
    answer: "You can browse freely without an account, but you'll be asked to log in or register the moment you like, add to cart, or start selling. You can change your password any time from the Profile page.",
  },
  {
    id: 'shipping',
    keywords: ['shipping', 'packing', 'delivery time', 'fee'],
    question: "What's the shipping fee?",
    answer: 'A flat shipping & packing fee is added per item at checkout, shown in the cart total before you place the order.',
  },
  {
    id: 'human',
    keywords: ['human', 'real person', 'talk to someone', 'contact', 'email'],
    question: 'Can I talk to a real person?',
    answer: "For anything Sprout can't resolve, use the Contact Us page to send a message, this is a student prototype so it routes to a demo form rather than a live support team.",
  },
]

// Very small keyword-overlap matcher, good enough for a scoped FAQ set.
// Picks the FAQ with the most keyword hits in the user's message; returns
// null if nothing scores above zero so the caller can show a generic
// "couldn't find that" reply instead of a wrong-topic answer.
export function matchFaq(message) {
  const text = message.toLowerCase()
  let best = null
  let bestScore = 0
  for (const faq of FAQS) {
    const score = faq.keywords.reduce((sum, kw) => (text.includes(kw) ? sum + 1 : sum), 0)
    if (score > bestScore) {
      best = faq
      bestScore = score
    }
  }
  return best
}
