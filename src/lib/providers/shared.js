export const GRADING_PROMPT = `You are a secondhand-clothing condition inspector. Look at these photos of one garment and the seller's questionnaire answers below. Identify visible defects only (stains, tears, fading, pilling, loose or coming-apart stitching/seams, missing/attached tags). For each defect return: a short label, severity (minor/moderate/major), a confidence score between 0 and 1, and its location as the photo index (0-based) plus xPct/yPct (0-100, position within that photo). Respond with ONLY a JSON array, no prose, in this exact shape:
[{"label": "string", "severity": "minor|moderate|major", "confidence": 0.0, "imageIndex": 0, "xPct": 0, "yPct": 0}]
If you see no defects, return an empty array [].`

export const DESCRIPTION_PROMPT = `You are writing a short secondhand-clothing listing description from these photos. Mention the garment type, apparent color/pattern, and general style. Keep it factual and inviting, 2-3 sentences, no exaggerated claims, no emojis, no markdown. Do not invent a brand or condition detail you can't see in the photos. Respond with ONLY the description text, nothing else.`

export function priceSuggestionPrompt({ category, gender, size }) {
  return `You are suggesting a fair resale base price in Indian Rupees (INR) for a secondhand ${gender ?? ''} ${category} in size ${size ?? 'unspecified'}, based on these photos. This is the BEFORE-condition-discount price (a "like new" reference price for this kind of garment), not the final listing price. Consider apparent fabric quality, style, and brand cues visible in the photos, but do not assume a luxury brand unless a logo is clearly visible. Respond with ONLY a single integer number, no currency symbol, no text, no explanation.`
}

export function questionnaireToText(questionnaire) {
  return Object.entries(questionnaire)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')
}

export function dataUrlToBase64(dataUrl) {
  const comma = dataUrl.indexOf(',')
  return comma === -1 ? dataUrl : dataUrl.slice(comma + 1)
}

export function dataUrlMimeType(dataUrl) {
  const match = /^data:([^;]+);/.exec(dataUrl)
  return match ? match[1] : 'image/jpeg'
}

// Pull the first top-level JSON array out of a model's text response, in case
// it wraps the array in prose or a code fence despite instructions.
export function extractJsonArray(text) {
  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start === -1 || end === -1 || end < start) throw new Error('No JSON array found in model response')
  return JSON.parse(text.slice(start, end + 1))
}

// Models sometimes wrap a plain-text answer in quotes or a code fence
// despite instructions not to; strip that off rather than showing it as-is.
export function cleanPlainText(text) {
  return text
    .trim()
    .replace(/^```[a-z]*\n?/i, '')
    .replace(/```$/, '')
    .replace(/^"(.*)"$/s, '$1')
    .trim()
}

// Pulls the first plausible price out of a model's response, in case it
// adds a currency symbol or a stray sentence despite instructions. Clamped
// to a sane range so a malformed response can't produce a ₹0 or absurd
// listing price.
export function extractPriceNumber(text) {
  const match = text.replace(/,/g, '').match(/\d+(\.\d+)?/)
  if (!match) throw new Error('No number found in model response')
  const value = Math.round(Number(match[0]))
  return Math.max(200, Math.min(20000, value))
}

export function sanitizeDefects(raw, photoCount) {
  if (!Array.isArray(raw)) throw new Error('Model response was not an array')
  return raw.map((d, i) => ({
    id: `ai-${i}-${Math.random().toString(36).slice(2, 8)}`,
    label: String(d.label ?? 'Unlabeled defect'),
    severity: ['minor', 'moderate', 'major'].includes(d.severity) ? d.severity : 'moderate',
    confidence: Math.max(0, Math.min(1, Number(d.confidence) || 0)),
    imageIndex: Math.max(0, Math.min(photoCount - 1, Number(d.imageIndex) || 0)),
    xPct: Math.max(0, Math.min(100, Number(d.xPct) || 50)),
    yPct: Math.max(0, Math.min(100, Number(d.yPct) || 50)),
  }))
}
