const COLORS = {
  A: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
  B: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
  C: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800',
}

// Plain-English label next to the letter grade, so the grade means something
// at a glance without reading the breakdown (borrowed from how Vinted labels
// condition: "Very good" / "Good" / "Satisfactory" rather than a bare score).
const PLAIN_LABEL = {
  A: 'Great condition',
  B: 'Good condition',
  C: 'Fair condition',
}

export default function GradeBadge({ letter, score, size = 'md', showPlainLabel = false }) {
  const sizeCls = size === 'lg' ? 'text-xl px-4 py-2' : size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-sm px-2.5 py-1'
  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${COLORS[letter] ?? COLORS.B} ${sizeCls}`}>
        {size === 'sm' ? letter : `Grade ${letter}`}
        <span className="opacity-70 font-normal">· {score}</span>
      </span>
      {showPlainLabel && <span className="text-xs text-neutral-500 dark:text-neutral-400">{PLAIN_LABEL[letter] ?? PLAIN_LABEL.B}</span>}
    </span>
  )
}
