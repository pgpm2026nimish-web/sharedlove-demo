import { GRADING_PROMPT, questionnaireToText, dataUrlToBase64, dataUrlMimeType, extractJsonArray, sanitizeDefects } from './shared.js'

const MODEL = 'gemini-2.0-flash'

export async function gradeWithGemini({ photos, questionnaire, apiKey }) {
  if (!apiKey) throw new Error('No Gemini API key configured')

  const imageParts = photos.map((p) => ({
    inlineData: { mimeType: dataUrlMimeType(p), data: dataUrlToBase64(p) },
  }))

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${GRADING_PROMPT}\n\nSeller questionnaire: ${questionnaireToText(questionnaire)}` },
          ...imageParts,
        ],
      },
    ],
    generationConfig: { temperature: 0.2 },
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
  )

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText)
    throw new Error(`Gemini API error (${res.status}): ${errText}`)
  }

  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''
  const raw = extractJsonArray(text)
  return { defects: sanitizeDefects(raw, photos.length), source: 'gemini', raw: json }
}
