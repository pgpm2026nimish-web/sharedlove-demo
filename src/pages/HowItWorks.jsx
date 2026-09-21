import { Link } from 'react-router-dom'
import { Camera, ScanSearch, Wallet, PackageSearch, ShieldCheck, RotateCcw } from 'lucide-react'

const SELLING_STEPS = [
  { icon: Camera, title: 'Snap & answer a few questions', body: 'Upload up to 6 photos and answer a short condition questionnaire: stains, tears, fading, tags.' },
  { icon: ScanSearch, title: 'Get an AI condition grade', body: "The grade and every defect behind it are shown to you before you publish. It's never a hidden number." },
  { icon: Wallet, title: 'List it and keep selling', body: 'Your price is suggested from the grade, but the listing is yours to publish and manage.' },
]

const BUYING_STEPS = [
  { icon: PackageSearch, title: 'See the grade, not just photos', body: "Every listing shows its grade, the exact defects found, and where they are on the photo." },
  { icon: ShieldCheck, title: 'Inspect before you commit', body: 'At delivery, open the box with the courier still there. Accept it, or flag an issue on the spot.' },
  { icon: RotateCcw, title: 'Dispute with visible reasoning', body: "If something's off, both sides see the same grading reasoning, so resolution isn't a guessing game." },
]

export default function HowItWorks() {
  return (
    <div className="p-4 md:p-8 md:max-w-4xl md:mx-auto space-y-8">
      <h1 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-neutral-50">How SharedLove works</h1>

      <section>
        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-3">Selling is simple</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SELLING_STEPS.map((s) => <StepCard key={s.title} {...s} />)}
        </div>
        <Link to="/sell" className="inline-block mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-2">
          Start selling →
        </Link>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-3">Buy with confidence</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BUYING_STEPS.map((s) => <StepCard key={s.title} {...s} />)}
        </div>
        <Link to="/browse" className="inline-block mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-2">
          Browse listings →
        </Link>
      </section>
    </div>
  )
}

function StepCard({ icon: Icon, title, body }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-1.5">
      <Icon className="text-emerald-600" size={22} />
      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{title}</p>
      <p className="text-xs text-neutral-400">{body}</p>
    </div>
  )
}
