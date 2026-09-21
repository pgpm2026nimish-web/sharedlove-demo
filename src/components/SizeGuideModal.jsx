import { X } from 'lucide-react'
import { SIZE_GUIDE } from '../lib/sizes.js'

export default function SizeGuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Size guide</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-neutral-400">
          General reference measurements. Every seller's item is a unique secondhand piece, so
          actual fit can vary a little from the chart.
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-neutral-400">
              <th className="py-1">Size</th>
              <th className="py-1">Chest</th>
              <th className="py-1">Waist</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_GUIDE.map((row) => (
              <tr key={row.size} className="border-t border-neutral-100 dark:border-neutral-800">
                <td className="py-1.5 font-medium text-neutral-800 dark:text-neutral-200">{row.size}</td>
                <td className="py-1.5 text-neutral-600 dark:text-neutral-400">{row.chest}</td>
                <td className="py-1.5 text-neutral-600 dark:text-neutral-400">{row.waist}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
