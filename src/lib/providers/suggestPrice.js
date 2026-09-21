// Suggests a base ("like new" reference) price from category + photos,
// using the same provider/config as grading and description generation.
// This fills the Base price field but never locks it — the seller can
// always override before grading, same review-before-trust pattern as the
// AI-generated description.
import { priceSuggestionPrompt, dataUrlToBase64, dataUrlMimeType, extractPriceNumber } from './shared.js'

// Rough category defaults for the simulated/fallback path, based on the
// seed listings' own base prices — not a market study, just a plausible
// starting point so the demo never returns something absurd.
const CATEGORY_BASE_PRICE = {
  Shirts: 900,
  Trousers: 1100,
  Pyjamas: 700,
  'One Piece': 1300,
  Jackets: 1800,
  Sweaters: 1400,
  Dresses: 1600,
}

async function suggestWithSimulated({ category }) {
  await new Promise((r) => setTimeout(r, 700))
  return { price: CATEGORY_BASE_PRICE[category] ?? 1000, source: 'simulated' }
}

async function suggestWithGemini({ photos, category, gender, size, apiKey }) {
  if (!apiKey) throw new Error('No Gemini API key configured')
  const imageParts = photos.map((p) => ({ inlineData: { mimeType: dataUrlMimeType(p), data: dataUrlToBase64(p) } }))
  const body = {
    contents: [{ role: 'user', parts: [{ text: priceSuggestionPrompt({ category, gender, size }) }, ...imageParts] }],
    generationConfig: { temperature: 0.2 },
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
  )
  if (!res.ok) throw new Error(`Gemini API error (${res.status}): ${await res.text().catch(() => res.statusText)}`)
  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''
  return { price: extractPriceNumber(text), source: 'gemini' }
}

async function suggestWithOpenAI({ photos, category, gender, size, apiKey }) {
  if (!apiKey) throw new Error('No OpenAI API key configured')
  const imageContent = photos.map((p) => ({ type: 'image_url', image_url: { url: p } }))
  const body = {
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [{ role: 'user', content: [{ type: 'text', text: priceSuggestionPrompt({ category, gender, size }) }, ...imageContent] }],
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`OpenAI API error (${res.status}): ${await res.text().catch(() => res.statusText)}`)
  const json = await res.json()
  return { price: extractPriceNumber(json?.choices?.[0]?.message?.content ?? ''), source: 'openai' }
}

async function suggestWithClaude({ photos, category, gender, size, apiKey }) {
  if (!apiKey) throw new Error('No Claude API key configured')
  const imageContent = photos.map((p) => ({ type: 'image', source: { type: 'base64', media_type: dataUrlMimeType(p), data: dataUrlToBase64(p) } }))
  const body = {
    model: 'claude-sonnet-5',
    max_tokens: 50,
    messages: [{ role: 'user', content: [{ type: 'text', text: priceSuggestionPrompt({ category, gender, size }) }, ...imageContent] }],
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
  return { price: extractPriceNumber(json?.content?.map((c) => c.text).join('') ?? ''), source: 'claude' }
}

async function suggestWithOllama({ photos, category, gender, size, endpoint, model }) {
  if (!endpoint) throw new Error('No Ollama endpoint configured')
  const base = endpoint.replace(/\/+$/, '')
  const modelName = model || 'llava'
  const body = {
    model: modelName,
    stream: false,
    messages: [{ role: 'user', content: priceSuggestionPrompt({ category, gender, size }), images: photos.map(dataUrlToBase64) }],
  }
  let res
  try {
    res = await fetch(`${base}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  } catch (err) {
    throw new Error(`Could not reach Ollama at ${base} (${err.message}).`)
  }
  if (!res.ok) throw new Error(`Ollama error (${res.status}): ${await res.text().catch(() => res.statusText)}`)
  const json = await res.json()
  return { price: extractPriceNumber(json?.message?.content ?? ''), source: `ollama:${modelName}` }
}

async function suggestWithOpenRouter({ photos, category, gender, size, apiKey, model }) {
  if (!apiKey) throw new Error('No OpenRouter API key configured')
  if (!model) throw new Error('No OpenRouter model selected')
  const imageContent = photos.map((p) => ({ type: 'image_url', image_url: { url: p } }))
  const body = {
    model,
    temperature: 0.2,
    messages: [{ role: 'user', content: [{ type: 'text', text: priceSuggestionPrompt({ category, gender, size }) }, ...imageContent] }],
  }
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`, 'HTTP-Referer': 'https://sharedlove.app', 'X-Title': 'SharedLove' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`OpenRouter error (${res.status}): ${await res.text().catch(() => res.statusText)}`)
  const json = await res.json()
  return { price: extractPriceNumber(json?.choices?.[0]?.message?.content ?? ''), source: `openrouter:${model}` }
}

const SUGGESTERS = {
  simulated: suggestWithSimulated,
  gemini: suggestWithGemini,
  openai: suggestWithOpenAI,
  claude: suggestWithClaude,
  ollama: suggestWithOllama,
  openrouter: suggestWithOpenRouter,
}

export async function runPriceSuggestion({ providerId, apiKey, endpoint, model, photos, category, gender, size }) {
  const suggest = SUGGESTERS[providerId] ?? suggestWithSimulated
  try {
    if (photos.length === 0) throw new Error('Add at least one photo first')
    const result = await suggest({ photos, category, gender, size, apiKey, endpoint, model })
    return { ...result, fellBack: false, fallbackReason: null }
  } catch (err) {
    const fallback = await suggestWithSimulated({ category })
    return { ...fallback, fellBack: true, fallbackReason: err.message }
  }
}
