import { GRADING_PROMPT, questionnaireToText, extractJsonArray, sanitizeDefects } from './shared.js'

const MODEL = 'gpt-4o-mini'

export async function gradeWithOpenAI({ photos, questionnaire, apiKey }) {
  if (!apiKey) throw new Error('No OpenAI API key configured')

  const imageContent = photos.map((p) => ({ type: 'image_url', image_url: { url: p } }))

  const body = {
    model: MODEL,
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

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText)
    throw new Error(`OpenAI API error (${res.status}): ${errText}`)
  }

  const json = await res.json()
  const text = json?.choices?.[0]?.message?.content ?? ''
  const raw = extractJsonArray(text)
  return { defects: sanitizeDefects(raw, photos.length), source: 'openai', raw: json }
}
