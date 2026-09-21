import { Link } from 'react-router-dom'
import { Leaf, Droplets, Factory, Award, TreePine } from 'lucide-react'
import { POINTS_PER_PURCHASE, POINTS_PER_SALE } from '../lib/impact.js'

export default function AboutUs() {
  return (
    <div className="p-4 md:p-8 md:max-w-3xl md:mx-auto space-y-5">
      <h1 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-neutral-50">About SharedLove</h1>
      <p className="text-sm text-neutral-700 dark:text-neutral-300">
        Fast fashion keeps getting more efficient to produce, and that efficiency keeps driving
        volume up, not down. The apparel industry accounts for an estimated 8-10% of global
        greenhouse gas emissions and uses roughly 93 billion cubic meters of freshwater a year.
        Secondhand isn't a lifestyle statement here; it's one of the few levers that acts directly
        on that volume, without waiting on regulation that moves far slower than the industry does.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat icon={Factory} value="8-10%" label="of global emissions from apparel" />
        <Stat icon={Droplets} value="93bn m³" label="freshwater used yearly by the industry" />
        <Stat icon={Leaf} value="2x" label="secondhand apparel is growing vs. new apparel" />
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Why people don't buy secondhand anyway</h2>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          A new garment carries an implicit quality guarantee. A secondhand one, until now,
          carried that guarantee from no one. You couldn't verify condition before paying, and if
          it arrived worse than described, there was rarely real recourse. That's the specific gap
          SharedLove is built to close, for anyone open to trying secondhand, whatever their
          reason for buying it.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">How we close it</h2>
        <ul className="text-sm text-neutral-700 dark:text-neutral-300 list-disc pl-5 space-y-1">
          <li>Every listing gets an AI condition grade with visible, disputable reasoning, not a black-box score.</li>
          <li>Grading happens peer-to-peer at listing time, not in a centralized warehouse.</li>
          <li>Buyers get an open-box check at delivery, with the courier present, before committing.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Rewarding every completed sale</h2>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          When a buyer accepts an item at open-box delivery, that's a real, verified secondhand
          transaction, and we treat it that way. Buyers earn {POINTS_PER_PURCHASE} points toward future
          purchases, sellers earn {POINTS_PER_SALE} points, both get a thank-you, and a tree is planted in
          both their names. Track your own points, trees, and badges on your profile.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 flex items-start gap-2">
            <Award className="text-emerald-600 shrink-0" size={18} />
            <p className="text-xs text-neutral-600 dark:text-neutral-300">Points and badges grow with every purchase and sale, from a first seed to a full-grown tree.</p>
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 flex items-start gap-2">
            <TreePine className="text-emerald-600 shrink-0" size={18} />
            <p className="text-xs text-neutral-600 dark:text-neutral-300">Badges can be shared directly from your profile, showing your own reduced-waste contribution.</p>
          </div>
        </div>
      </div>

      <Link to="/how-it-works" className="inline-block text-sm text-emerald-600 font-medium underline underline-offset-2">
        See how it works →
      </Link>
    </div>
  )
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 text-center">
      <Icon className="mx-auto text-emerald-600 mb-1" size={20} />
      <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{value}</p>
      <p className="text-[11px] text-neutral-400">{label}</p>
    </div>
  )
}
