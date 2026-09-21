import { X } from 'lucide-react'

function CheckRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 py-1 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
      />
      {label}
    </label>
  )
}

// `sections` is [{ key, title, options: [{id, label}] }]. `selected` is
// { [key]: string[] }. Generic so adding a new filter dimension is just one
// more section object, not new markup.
function FilterBody({ sections, selected, onToggle }) {
  return (
    <div className="space-y-5">
      {sections.map((section, i) => (
        <div key={section.key} className={i > 0 ? 'border-t border-neutral-100 dark:border-neutral-800 pt-4' : ''}>
          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide mb-2">{section.title}</p>
          {section.options.length === 0 ? (
            <p className="text-xs text-neutral-400">None available</p>
          ) : (
            section.options.map((opt) => (
              <CheckRow
                key={opt.id}
                label={opt.label}
                checked={(selected[section.key] ?? []).includes(opt.id)}
                onChange={() => onToggle(section.key, opt.id)}
              />
            ))
          )}
        </div>
      ))}
    </div>
  )
}

// Myntra-style filters: a persistent left column on desktop, a slide-in
// left drawer on mobile (triggered by a "Filters" button elsewhere on the
// page). Multi-select checkboxes per section, not single-select chips.
export default function FilterSidebar({ mobileOpen, onCloseMobile, sections, selected, onToggle }) {
  return (
    <>
      <aside className="hidden md:block w-56 shrink-0">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Filters</p>
        <FilterBody sections={sections} selected={selected} onToggle={onToggle} />
      </aside>

      {mobileOpen && <div className="md:hidden fixed inset-0 z-40 bg-black/30" onClick={onCloseMobile} />}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 overflow-y-auto bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-4 space-y-5 transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Filters</p>
          <button onClick={onCloseMobile} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
            <X size={18} />
          </button>
        </div>
        <FilterBody sections={sections} selected={selected} onToggle={onToggle} />
        <button
          onClick={onCloseMobile}
          className="w-full bg-neutral-900 dark:bg-emerald-600 text-white font-semibold rounded-lg py-2.5 text-sm sticky bottom-0"
        >
          Show results
        </button>
      </aside>
    </>
  )
}
