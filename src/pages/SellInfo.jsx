import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../lib/categories.js'
import {
  ArrowRight,
  Camera,
  ScanSearch,
  Wallet,
  Tag,
  ShieldCheck,
  TreePine,
  Users,
  ChevronDown,
  Check,
  X,
} from 'lucide-react'

const WHY_SELL = [
  { icon: Tag, title: 'Get a fair, explained price', body: 'The AI suggests a price from your questionnaire and photos, so you are not guessing what to charge.' },
  { icon: Users, title: 'No warehouse, no wait', body: 'You list directly. There is no shipping your item off to a warehouse before it goes live.' },
  { icon: ShieldCheck, title: 'Sell with confidence', body: 'Grading is disputable and transparent, so buyers trust the listing and you avoid bad-faith haggling.' },
  { icon: TreePine, title: 'Every sale plants a tree', body: 'When a buyer accepts your item, a tree is planted in both your names and you earn SharedLove points.' },
]

const STEPS = [
  { icon: Camera, title: 'Snap & answer a few questions', body: 'Upload up to 6 photos and a short condition questionnaire: stains, tears, fading, tags.' },
  { icon: ScanSearch, title: 'Get an AI condition grade', body: 'See the grade, every defect behind it, and the suggested price before you publish anything.' },
  { icon: Wallet, title: 'Publish and get paid', body: "Payment is held until the buyer accepts at delivery, then it's yours and points land in your account." },
]

const ACCEPTED = [
  'Clean, wearable condition (minor wear is fine and can still grade well)',
  'Photos taken in good light, from multiple angles',
  'Honest answers to the condition questionnaire',
]

const NOT_ACCEPTED = [
  'Items with odor, mold, or stains that cannot be shown clearly in photos',
  'Counterfeit or unbranded-as-branded items',
  'Anything you are not able to ship if a buyer completes the purchase',
]

const FAQS = [
  {
    q: 'How is my price calculated?',
    a: 'Every listing starts at a base price you set. The AI grade scores the item out of 100 based on your questionnaire answers and any defects found in photos, and the final price is your base price times that score. A Grade A item near 100 keeps close to full price; visible wear brings both the score and price down.',
  },
  {
    q: 'What happens if a buyer disputes the grade?',
    a: 'At open-box delivery, the buyer can accept or raise a dispute. If they dispute, both of you see the exact same grading reasoning; it is never a hidden decision. Resolution options include a full refund, a partial refund, or the buyer keeping the item as-is.',
  },
  {
    q: 'When do I actually get paid?',
    a: "Payment is collected and held at checkout, and released to you once the buyer accepts the item at open-box delivery. This protects both sides: you know the sale is real, and the buyer knows they aren't paying for something sight unseen.",
  },
  {
    q: 'Do I need to photograph the item myself?',
    a: 'Yes; up to 6 photos from your own camera or phone. Good lighting and multiple angles help the AI grade accurately and give buyers more confidence, which tends to mean fewer disputes.',
  },
]

export default function SellInfo() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="pb-4">
      <section className="bg-emerald-50 dark:bg-neutral-900 p-6 md:p-12 text-center md:text-left md:flex md:items-center md:justify-between md:gap-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-50">Turn your closet into cash</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-md">
            List in minutes, get an AI-suggested price backed by an explainable grade, and get paid once
            your buyer accepts the item.
          </p>
        </div>
        <Link
          to="/sell/list"
          className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-semibold rounded-lg px-5 py-3 text-sm mt-4 md:mt-0 shrink-0"
        >
          Start listing <ArrowRight size={16} />
        </Link>
      </section>

      <div className="p-4 md:p-8 space-y-10">
        <section>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Why sell with SharedLove</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {WHY_SELL.map((w) => (
              <div key={w.title} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-1.5">
                <w.icon className="text-emerald-600" size={20} />
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{w.title}</p>
                <p className="text-xs text-neutral-400">{w.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Selling made easy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-1.5">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">{i + 1}</span>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{s.title}</p>
                <p className="text-xs text-neutral-400">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">What you can sell</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((c) => (
              <span key={c} className="px-3 py-1.5 rounded-full text-xs border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">
                {c}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950 p-4 space-y-2">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Accepted</p>
              {ACCEPTED.map((a) => (
                <p key={a} className="text-sm text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" /> {a}
                </p>
              ))}
            </div>
            <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950 p-4 space-y-2">
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wide">Not accepted</p>
              {NOT_ACCEPTED.map((n) => (
                <p key={n} className="text-sm text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                  <X size={14} className="text-rose-500 shrink-0 mt-0.5" /> {n}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Frequently asked questions</h2>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
            {FAQS.map((f, i) => (
              <div key={f.q}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-2 p-4 text-left"
                >
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{f.q}</span>
                  <ChevronDown size={16} className={`text-neutral-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">{f.a}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-neutral-900 dark:bg-emerald-950 text-white p-6 md:p-10 text-center space-y-3">
          <h2 className="text-xl md:text-2xl font-bold">Ready to list your first item?</h2>
          <Link
            to="/sell/list"
            className="inline-flex items-center gap-1.5 bg-white text-neutral-900 font-semibold rounded-lg px-5 py-3 text-sm"
          >
            Start listing <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  )
}
