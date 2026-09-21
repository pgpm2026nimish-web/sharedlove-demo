import { GRADING_PROMPT, questionnaireToText, extractJsonArray, sanitizeDefects } from './shared.js'

// Unified gateway to many hosted models (Meta Llama, Qwen, DeepSeek, and
// others) behind one OpenAI-compatible API and one key. `model` is an
// OpenRouter model id — check https://openrouter.ai/models?order=pricing-low-to-high
// for current free vision-capable models, since free-tier offerings change
// over time; the ids below are suggestions, not guarantees.
export const OPENROUTER_SUGGESTED_MODELS = [
  { id: 'meta-llama/llama-3.2-11b-vision-instruct:free', label: 'Meta Llama 3.2 Vision (free)' },
  { id: 'qwen/qwen2.5-vl-72b-instruct:free', label: 'Qwen2.5-VL (free)' },
  { id: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash via OpenRouter (free)' },
]

export async function gradeWithOpenRouter({ photos, questionnaire, apiKey, model }) {
  if (!apiKey) throw new Error('No OpenRouter API key configured')
  if (!model) throw new Error('No OpenRouter model selected')

  const imageContent = photos.map((p) => ({ type: 'image_url', image_url: { url: p } }))

  const body = {
    model,
    temperature: 0.2,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: `${GRADING_PROMPT}\n\nSeller questionnaire: ${questionnaireToText(questionnaire)}` },
          ...imageContent,
        ],
      },
    ],
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://sharedlove.app',
      'X-Title': 'SharedLove',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText)
    throw new Error(`OpenRouter error (${res.status}): ${errText}`)
  }

  const json = await res.json()
  const text = json?.choices?.[0]?.message?.content ?? ''
  const raw = extractJsonArray(text)
  return { defects: sanitizeDefects(raw, photos.length), source: `openrouter:${model}`, raw: json }
}
