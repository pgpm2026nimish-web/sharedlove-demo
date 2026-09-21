import { GRADING_PROMPT, questionnaireToText, dataUrlToBase64, dataUrlMimeType, extractJsonArray, sanitizeDefects } from './shared.js'

const MODEL = 'claude-sonnet-5'

// Note: calling the Anthropic API directly from a browser requires the
// anthropic-dangerous-direct-browser-access header and exposes the API key
// client-side. Fine for a classroom demo; not for production.
export async function gradeWithClaude({ photos, questionnaire, apiKey }) {
  if (!apiKey) throw new Error('No Claude API key configured')

  const imageContent = photos.map((p) => ({
    type: 'image',
    source: { type: 'base64', media_type: dataUrlMimeType(p), data: dataUrlToBase64(p) },
  }))

  const body = {
    model: MODEL,
    max_tokens: 1024,
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

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText)
    throw new Error(`Claude API error (${res.status}): ${errText}`)
  }

  const json = await res.json()
  const text = json?.content?.map((c) => c.text).join('') ?? ''
  const raw = extractJsonArray(text)
  return { defects: sanitizeDefects(raw, photos.length), source: 'claude', raw: json }
}
