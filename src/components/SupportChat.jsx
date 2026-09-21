import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { runChatSupport } from '../lib/providers/index.js'
import { FAQS } from '../lib/faq.js'
import { Sprout, X, Send, AlertCircle, Loader2 } from 'lucide-react'

// "Sprout" ties into the badges/impact theme (Seed -> Sprout -> ... -> Full-
// Grown Tree) instead of reading as generic customer-support software, and
// is never called a bot in the UI so it feels like part of the app, not a
// tacked-on widget.
const GREETING = { role: 'assistant', content: "Hi, I'm Sprout! Ask me about grading, delivery, payments, or how to sell, or tap a question below." }
const SUGGESTED = FAQS.slice(0, 4)

export default function SupportChat() {
  const { settings } = useApp()
  const [open, setOpen] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [fellBack, setFellBack] = useState(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open, sending])

  // A floating icon alone isn't obviously clickable to a first-time
  // visitor, so a proactive speech bubble invites them in shortly after
  // they land, then quietly disappears if they don't take the hint.
  useEffect(() => {
    const showTimer = setTimeout(() => setShowPrompt(true), 2500)
    const hideTimer = setTimeout(() => setShowPrompt(false), 15000)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  function handleOpen() {
    setOpen(true)
    setShowPrompt(false)
  }

  async function send(text) {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    const history = messages.filter((m) => m !== GREETING)
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    setSending(true)
    setFellBack(null)
    try {
      const apiKey = settings.apiKeys?.[settings.providerId]
      const result = await runChatSupport({
        providerId: settings.providerId,
        apiKey,
        endpoint: settings.ollamaEndpoint,
        model: settings.providerId === 'ollama' ? settings.ollamaModel : settings.openrouterModel,
        message: trimmed,
        history,
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }])
      setFellBack(result.fellBack ? result.fallbackReason : null)
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    send(input)
  }

  return (
    // Bottom-left, not bottom-right: Netlify auto-injects its own badge
    // widget in the bottom-right corner of every deployed page, which was
    // sitting on top of Sprout's button there. Left side avoids the clash
    // entirely without depending on Netlify's dashboard settings.
    <div className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-20">
      {open && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-sm h-[28rem] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-600 text-white shrink-0">
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <Sprout size={16} /> Sprout
            </p>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </p>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <p className="bg-neutral-100 dark:bg-neutral-800 rounded-xl rounded-bl-sm px-3 py-2 text-sm text-neutral-400 flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin" /> Typing…
                </p>
              </div>
            )}
            {fellBack && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 px-1">
                <AlertCircle size={11} /> AI support unavailable, answered from the FAQ instead ({fellBack}).
              </p>
            )}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTED.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => send(f.question)}
                    className="text-[11px] rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 px-2.5 py-1 hover:border-emerald-400 hover:text-emerald-600"
                  >
                    {f.question}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2.5 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-emerald-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white rounded-lg p-2"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {showPrompt && !open && (
        <button
          onClick={handleOpen}
          className="mb-3 max-w-[210px] flex items-start gap-2 rounded-2xl rounded-bl-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg p-3 text-left"
        >
          <p className="text-xs text-neutral-700 dark:text-neutral-300 flex-1">
            Need a hand? I'm Sprout, ask me anything about SharedLove.
          </p>
          <span
            onClick={(e) => { e.stopPropagation(); setShowPrompt(false) }}
            className="text-neutral-300 hover:text-neutral-500 shrink-0"
            title="Dismiss"
          >
            <X size={12} />
          </span>
        </button>
      )}

      <button
        onClick={() => (open ? setOpen(false) : handleOpen())}
        // A warm "seed" tone instead of the site's own emerald green, since
        // an emerald circle kept blending into the app's own emerald-toned
        // sections. Amber reads as a distinct, unmistakably clickable
        // control against the rest of the (green/white/neutral) palette.
        className="w-12 h-12 rounded-full bg-amber-500 text-white shadow-lg ring-2 ring-white dark:ring-neutral-900 flex items-center justify-center hover:bg-amber-600"
        title="Chat with Sprout"
      >
        {open ? <X size={20} /> : <Sprout size={20} />}
      </button>
    </div>
  )
}
