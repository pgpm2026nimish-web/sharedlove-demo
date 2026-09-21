import { useState } from 'react'
import { X, Copy, Check, Send, AlertCircle } from 'lucide-react'

const SHARE_TEXT = "I've been using SharedLove for secondhand clothes with AI condition grading and open-box delivery. Check it out:"

export default function ShareAppModal({ url, onClose }) {
  const [copied, setCopied] = useState(false)
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`
  // A QR built from "localhost" is unopenable on any other device, that
  // hostname means "this device" to whoever scans it, not your laptop, so
  // warn instead of handing out a code that can never work.
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(url)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // clipboard blocked — the link is still shown/selectable on screen
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title: 'SharedLove', text: SHARE_TEXT, url })
      onClose()
    } catch {
      // user cancelled the share sheet — not an error, leave the modal open
    }
  }

  return (
    <div className="fixed inset-0 z-30 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Share SharedLove</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200" title="Close">
            <X size={18} />
          </button>
        </div>

        {isLocalhost ? (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 p-3">
            <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              This page is open at "localhost", so a QR code or link built from it can't work on
              any other device, that address only means "this device" to a phone. Close this,
              open the site using your computer's network address instead (the "Network:" line
              in the terminal, or your network IP if deployed online), then share from there.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <img src={qrSrc} alt="QR code linking to SharedLove" className="w-40 h-40 rounded-lg border border-neutral-100 dark:border-neutral-800" />
            <p className="text-xs text-neutral-400">Have a friend scan this to open the app directly</p>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2">
          <p className="flex-1 text-xs text-neutral-600 dark:text-neutral-300 truncate">{url}</p>
          <button onClick={handleCopy} className="shrink-0 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 text-white font-semibold rounded-lg py-2.5 text-sm"
          >
            <Send size={15} /> Share via...
          </button>
        )}
      </div>
    </div>
  )
}
