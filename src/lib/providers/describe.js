// Description generation shares the same provider/config as grading (same
// Settings page, same API keys, same Ollama endpoint) but asks for a short
// plain-text description instead of a defect JSON array. The generated text
// always lands in the seller's editable textarea, never publishes on its
// own, so the seller reviews and can change or discard it before listing.
import {
  DESCRIPTION_PROMPT,
  questionnaireToText,
  dataUrlToBase64,
  dataUrlMimeType,
  cleanPlainText,
} from './shared.js'

function templateFromQuestionnaire({ category, title, questionnaire = {} }) {
  const safeCategory = category || 'item'
  const bits = []
  if (questionnaire.stains && questionnaire.stains !== 'none') bits.push(`light wear (${questionnaire.stains} staining noted)`)
  if (questionnaire.tears && questionnaire.tears !== 'none') bits.push(`minor wear at the seams`)
  if (questionnaire.fading && questionnaire.fading !== 'none') bits.push('a touch of fading')
  const conditionNote = bits.length ? `Has ${bits.join(' and ')}, fully disclosed in the grade breakdown.` : 'No notable wear reported.'
  return `${title || safeCategory}. A pre-loved ${safeCategory.toLowerCase()} in good everyday condition. ${conditionNote}`
}

async function describeWithSimulated({ category, title, questionnaire }) {
  await new Promise((r) => setTimeout(r, 900))
  return { description: templateFromQuestionnaire({ category, title, questionnaire }), source: 'simulated' }
}

async function describeWithGemini({ photos, questionnaire, apiKey }) {
  if (!apiKey) throw new Error('No Gemini API key configured')
  const imageParts = photos.map((p) => ({ inlineData: { mimeType: dataUrlMimeType(p), data: dataUrlToBase64(p) } }))
  const body = {
    contents: [{ role: 'user', parts: [{ text: `${DESCRIPTION_PROMPT}\n\nSeller questionnaire: ${questionnaireToText(questionnaire)}` }, ...imageParts] }],
    generationConfig: { temperature: 0.4 },
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
  )
  if (!res.ok) throw new Error(`Gemini API error (${res.status}): ${await res.text().catch(() => res.statusText)}`)
  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''
  return { description: cleanPlainText(text), source: 'gemini' }
}

async function describeWithOpenAI({ photos, questionnaire, apiKey }) {
  if (!apiKey) throw new Error('No OpenAI API key configured')
  const imageContent = photos.map((p) => ({ type: 'image_url', image_url: { url: p } }))
  const body = {
    model: 'gpt-4o-mini',
    temperature: 0.4,
    messages: [{ role: 'user', content: [{ type: 'text', text: `${DESCRIPTION_PROMPT}\n\nSeller questionnaire: ${questionnaireToText(questionnaire)}` }, ...imageContent] }],
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`OpenAI API error (${res.status}): ${await res.text().catch(() => res.statusText)}`)
  const json = await res.json()
  return { description: cleanPlainText(json?.choices?.[0]?.message?.content ?? ''), source: 'openai' }
}

async function describeWithClaude({ photos, questionnaire, apiKey }) {
  if (!apiKey) throw new Error('No Claude API key configured')
  const imageContent = photos.map((p) => ({ type: 'image', source: { type: 'base64', media_type: dataUrlMimeType(p), data: dataUrlToBase64(p) } }))
  const body = {
    model: 'claude-sonnet-5',
    max_tokens: 300,
    messages: [{ role: 'user', content: [{ type: 'text', text: `${DESCRIPTION_PROMPT}\n\nSeller questionnaire: ${questionnaireToText(questionnaire)}` }, ...imageContent] }],
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
  if (!res.ok) throw new Error(`Claude API error (${res.status}): ${await res.text().catch(() => res.statusText)}`)
  const json = await res.json()
  return { description: cleanPlainText(json?.content?.map((c) => c.text).join('') ?? ''), source: 'claude' }
}

async function describeWithOllama({ photos, questionnaire, endpoint, model }) {
  if (!endpoint) throw new Error('No Ollama endpoint configured')
  const base = endpoint.replace(/\/+$/, '')
  const modelName = model || 'llava'
  const body = {
    model: modelName,
    stream: false,
    messages: [{ role: 'user', content: `${DESCRIPTION_PROMPT}\n\nSeller questionnaire: ${questionnaireToText(questionnaire)}`, images: photos.map(dataUrlToBase64) }],
  }
  let res
  try {
    res = await fetch(`${base}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  } catch (err) {
    throw new Error(`Could not reach Ollama at ${base} (${err.message}).`)
  }
  if (!res.ok) throw new Error(`Ollama error (${res.status}): ${await res.text().catch(() => res.statusText)}`)
  const json = await res.json()
  return { description: cleanPlainText(json?.message?.content ?? ''), source: `ollama:${modelName}` }
}

async function describeWithOpenRouter({ photos, questionnaire, apiKey, model }) {
  if (!apiKey) throw new Error('No OpenRouter API key configured')
  if (!model) throw new Error('No OpenRouter model selected')
  const imageContent = photos.map((p) => ({ type: 'image_url', image_url: { url: p } }))
  const body = {
    model,
    temperature: 0.4,
    messages: [{ role: 'user', content: [{ type: 'text', text: `${DESCRIPTION_PROMPT}\n\nSeller questionnaire: ${questionnaireToText(questionnaire)}` }, ...imageContent] }],
  }
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`, 'HTTP-Referer': 'https://sharedlove.app', 'X-Title': 'SharedLove' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`OpenRouter error (${res.status}): ${await res.text().catch(() => res.statusText)}`)
  const json = await res.json()
  return { description: cleanPlainText(json?.choices?.[0]?.message?.content ?? ''), source: `openrouter:${model}` }
}

const DESCRIBERS = {
  simulated: describeWithSimulated,
  gemini: describeWithGemini,
  openai: describeWithOpenAI,
  claude: describeWithClaude,
  ollama: describeWithOllama,
  openrouter: describeWithOpenRouter,
}

// Same fallback contract as runGrading: any failure (no key, offline,
// malformed response) falls back to a template description rather than
// leaving the seller with an error and a blank field.
export async function runDescription({ providerId, apiKey, endpoint, model, photos, category, title, questionnaire }) {
  const describe = DESCRIBERS[providerId] ?? describeWithSimulated
  try {
    if (photos.length === 0) throw new Error('Add at least one photo first')
    const result = await describe({ photos, questionnaire, apiKey, endpoint, model, category, title })
    return { ...result, fellBack: false, fallbackReason: null }
  } catch (err) {
    const fallback = await describeWithSimulated({ category, title, questionnaire })
    return { ...fallback, fellBack: true, fallbackReason: err.message }
  }
}
