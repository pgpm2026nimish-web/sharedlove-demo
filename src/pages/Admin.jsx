import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { PROVIDERS, OPENROUTER_SUGGESTED_MODELS, OLLAMA_SUGGESTED_MODELS, runGrading } from '../lib/providers/index.js'
import { Loader2, CheckCircle2, XCircle, LogOut, RotateCcw, ClipboardList, Laptop } from 'lucide-react'
import AdminLogin from './AdminLogin.jsx'

export default function Admin() {
  const { isAdmin, logoutAdmin, settings, setSettings, resetDemoData } = useApp()
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [resetDone, setResetDone] = useState(false)

  function handleReset() {
    resetDemoData()
    setResetDone(true)
    setTimeout(() => setResetDone(false), 3000)
  }

  if (!isAdmin) return <AdminLogin />

  function setProvider(id) {
    setSettings((s) => ({ ...s, providerId: id }))
    setTestResult(null)
  }

  // The big obvious on/off switch for the live demo: ON routes every AI
  // call (grading, descriptions, price suggestions, Sprout) through your
  // laptop's Ollama at the endpoint below; OFF puts it straight back to
  // Simulated. The same fallback contract also does this automatically,
  // per call, if Ollama stops answering, so leaving this ON is safe even
  // if the tunnel drops mid-demo.
  const localLlmOn = settings.providerId === 'ollama'
  function toggleLocalLlm() {
    setProvider(localLlmOn ? 'simulated' : 'ollama')
  }

  function setKey(id, value) {
    setSettings((s) => ({ ...s, apiKeys: { ...s.apiKeys, [id]: value } }))
    setTestResult(null)
  }

  function setField(field, value) {
    setSettings((s) => ({ ...s, [field]: value }))
    setTestResult(null)
  }

  async function testConnection() {
    setTesting(true)
    setTestResult(null)
    try {
      const tinyPixel =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
      const res = await runGrading({
        providerId: settings.providerId,
        apiKey: settings.apiKeys?.[settings.providerId],
        endpoint: settings.ollamaEndpoint,
        model: settings.providerId === 'ollama' ? settings.ollamaModel : settings.openrouterModel,
        photos: [tinyPixel],
        questionnaire: { stains: 'none', tears: 'none', fading: 'none', tagsAttached: 'yes' },
        basePrice: 1000,
      })
      setTestResult(res.fellBack ? { ok: false, message: res.fallbackReason } : { ok: true, message: `Live call succeeded (${res.source}).` })
    } catch (err) {
      setTestResult({ ok: false, message: err.message })
    } finally {
      setTesting(false)
    }
  }

  const provider = PROVIDERS[settings.providerId]
  const inputCls = 'mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm'

  return (
    <div className="p-4 md:p-8 md:max-w-2xl md:mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-50">Grading settings</h1>
        <button onClick={logoutAdmin} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
          <LogOut size={14} /> Log out
        </button>
      </div>
      <p className="text-xs text-neutral-400">
        Choose which AI provider grades condition photos, writes listing descriptions, suggests
        prices, and answers as Sprout in the support chat. Keys/endpoints are stored only in this browser's
        local storage and sent directly to that provider. Fine for a demo, not for production.
      </p>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Laptop size={20} className={localLlmOn ? 'text-emerald-600' : 'text-neutral-400'} />
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Local LLM connection</p>
            <p className="text-xs text-neutral-400">
              {localLlmOn
                ? 'ON: grading, descriptions, prices, and Sprout use your laptop.'
                : 'OFF: using Simulated (no setup, works everywhere).'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleLocalLlm}
          role="switch"
          aria-checked={localLlmOn}
          title={localLlmOn ? 'Turn off, switch to Simulated' : 'Turn on, use local LLM'}
          className={`shrink-0 w-12 h-7 rounded-full p-1 transition-colors ${localLlmOn ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'}`}
        >
          <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${localLlmOn ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="space-y-2">
        {Object.entries(PROVIDERS).map(([id, p]) => (
          <button
            key={id}
            onClick={() => setProvider(id)}
            className={`w-full text-left rounded-xl border p-3 ${
              settings.providerId === id
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
            }`}
          >
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{p.label}</p>
            {p.configKind === null && <p className="text-xs text-neutral-400">No setup needed. Used as the reliable fallback everywhere.</p>}
            {id === 'ollama' && (
              <p className="text-xs text-neutral-400">
                Runs on your laptop for free. Reachable directly on the same wifi/hotspot, or from
                anywhere if the endpoint below is a public tunnel URL.
              </p>
            )}
          </button>
        ))}
      </div>

      {provider?.configKind === 'key' && (
        <label className="block">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{provider.label} API key</span>
          <input
            type="password"
            value={settings.apiKeys?.[settings.providerId] ?? ''}
            onChange={(e) => setKey(settings.providerId, e.target.value)}
            placeholder="Paste API key"
            className={inputCls}
          />
        </label>
      )}

      {provider?.configKind === 'endpoint' && (
        <div className="space-y-2">
          <label className="block">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Ollama endpoint URL</span>
            <input
              value={settings.ollamaEndpoint ?? ''}
              onChange={(e) => setField('ollamaEndpoint', e.target.value)}
              placeholder="http://192.168.1.5:11434 or https://xxxx.trycloudflare.com"
              className={inputCls}
            />
            <span className="text-[11px] text-neutral-400">
              Same wifi as visitors: use your laptop's local network IP, not "localhost" (find it
              with <code>ipconfig</code>). Site hosted online: paste the public tunnel URL printed
              by "Start Local LLM (Public).bat" instead.
            </span>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Model</span>
            <select
              value={settings.ollamaModel ?? ''}
              onChange={(e) => setField('ollamaModel', e.target.value)}
              className={inputCls}
            >
              {OLLAMA_SUGGESTED_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <span className="text-[11px] text-neutral-400">
              Must already be pulled on that machine: <code>ollama pull {settings.ollamaModel || 'llava'}</code>
            </span>
          </label>
        </div>
      )}

      {provider?.configKind === 'key+model' && (
        <div className="space-y-2">
          <label className="block">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">OpenRouter API key</span>
            <input
              type="password"
              value={settings.apiKeys?.openrouter ?? ''}
              onChange={(e) => setKey('openrouter', e.target.value)}
              placeholder="Paste API key"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Model</span>
            <select
              value={settings.openrouterModel ?? ''}
              onChange={(e) => setField('openrouterModel', e.target.value)}
              className={inputCls}
            >
              {OPENROUTER_SUGGESTED_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <span className="text-[11px] text-neutral-400">
              Free-tier model availability changes, so check openrouter.ai/models for current options.
            </span>
          </label>
        </div>
      )}

      <button
        onClick={testConnection}
        disabled={testing}
        className="w-full bg-neutral-900 dark:bg-emerald-600 text-white font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2"
      >
        {testing && <Loader2 size={16} className="animate-spin" />}
        Test connection
      </button>

      {testResult && (
        <p className={`text-sm flex items-center gap-1.5 ${testResult.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {testResult.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {testResult.message}
        </p>
      )}

      <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
        <p className="font-medium text-neutral-700 dark:text-neutral-300">Why this matters for the demo</p>
        <p>
          Every grading call falls back to the simulated engine automatically if the selected
          provider fails or has no key/endpoint, so switching providers here never breaks the
          live walkthrough, it only changes whether real AI vision is doing the grading, and
          which one.
        </p>
      </div>

      <Link
        to="/admin/activity"
        className="flex items-center justify-between rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          <ClipboardList size={16} /> Activity &amp; feedback
        </span>
        <span className="text-xs text-neutral-400">Logins, purchases, exit surveys, CSV export</span>
      </Link>

      <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Reset demo data</p>
        <p className="text-xs text-neutral-400">
          Marks every listing back to "listed" (undoes anything sold during a walkthrough) and
          clears orders, cart, wishlist, points, and impact history. Doesn't touch accounts,
          passwords, or these provider settings.
        </p>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2"
        >
          <RotateCcw size={13} /> Reset demo data
        </button>
        {resetDone && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={13} /> Demo data reset. All listings are available again.
          </p>
        )}
      </div>
    </div>
  )
}
