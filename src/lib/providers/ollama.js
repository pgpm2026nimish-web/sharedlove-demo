import { GRADING_PROMPT, questionnaireToText, dataUrlToBase64, extractJsonArray, sanitizeDefects } from './shared.js'

// Shown as a dropdown in Settings rather than free text, so a typo (or
// typing "Local" — the provider's own label — instead of an actual model
// name) can't silently produce a "model not found" error at grading time.
// Any of these must be pulled first: `ollama pull <name>`.
export const OLLAMA_SUGGESTED_MODELS = [
  { id: 'llava', label: 'LLaVA (7B, good default)' },
  { id: 'llava:13b', label: 'LLaVA 13B (slower, more accurate)' },
  { id: 'bakllava', label: 'BakLLaVA' },
  { id: 'moondream', label: 'Moondream (small, fast)' },
  { id: 'qwen2.5vl', label: 'Qwen2.5-VL' },
  { id: 'llama3.2-vision', label: 'Llama 3.2 Vision' },
]

// Local vision model via Ollama (e.g. llava, qwen2.5vl, moondream, bakllava).
// `endpoint` is the base URL of the machine running `ollama serve` — on a
// booth network this is the presenter's laptop's LOCAL IP (e.g.
// http://192.168.1.5:11434), not "localhost", because the request comes from
// a visitor's phone, not from the laptop itself. Ollama must be started with
// OLLAMA_ORIGINS=* so it accepts cross-origin requests from the hosted page.
export async function gradeWithOllama({ photos, questionnaire, endpoint, model }) {
  if (!endpoint) throw new Error('No Ollama endpoint configured')
  const base = endpoint.replace(/\/+$/, '')
  const modelName = model || 'llava'

  const body = {
    model: modelName,
    stream: false,
    messages: [
      {
        role: 'user',
        content: `${GRADING_PROMPT}\n\nSeller questionnaire: ${questionnaireToText(questionnaire)}`,
        images: photos.map(dataUrlToBase64),
      },
    ],
  }

  let res
  try {
    res = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (err) {
    throw new Error(`Could not reach Ollama at ${base} (${err.message}). Check it's running, on the same network, and started with OLLAMA_ORIGINS=*.`)
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText)
    throw new Error(`Ollama error (${res.status}): ${errText}`)
  }

  const json = await res.json()
  const text = json?.message?.content ?? ''
  const raw = extractJsonArray(text)
  return { defects: sanitizeDefects(raw, photos.length), source: `ollama:${modelName}`, raw: json }
}
