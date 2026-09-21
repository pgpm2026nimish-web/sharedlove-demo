import { gradeWithSimulated } from './simulated.js'
import { gradeWithGemini } from './gemini.js'
import { gradeWithOpenAI } from './openai.js'
import { gradeWithClaude } from './claude.js'
import { gradeWithOllama } from './ollama.js'
import { gradeWithOpenRouter } from './openrouter.js'
import { computeGrade } from '../scoring.js'

export { OPENROUTER_SUGGESTED_MODELS } from './openrouter.js'
export { OLLAMA_SUGGESTED_MODELS } from './ollama.js'
export { runDescription } from './describe.js'
export { runPriceSuggestion } from './suggestPrice.js'
export { runChatSupport } from './chat.js'

// `configKind` tells the Admin UI what inputs to show:
//   'key'      — a single API key field
//   'endpoint' — a local endpoint URL + model name (Ollama)
//   'key+model'— an API key + a model id (OpenRouter)
//   null       — nothing to configure (Simulated)
export const PROVIDERS = {
  simulated: { label: 'Simulated (no setup, never fails)', configKind: null, run: gradeWithSimulated },
  ollama: { label: 'Local vision model (Ollama)', configKind: 'endpoint', run: gradeWithOllama },
  gemini: { label: 'Google Gemini', configKind: 'key', run: gradeWithGemini },
  openai: { label: 'OpenAI (GPT-4o mini)', configKind: 'key', run: gradeWithOpenAI },
  claude: { label: 'Anthropic Claude', configKind: 'key', run: gradeWithClaude },
  openrouter: { label: 'OpenRouter (Meta / Qwen / DeepSeek / other free models)', configKind: 'key+model', run: gradeWithOpenRouter },
}

// Runs the selected provider, always falls back to the simulated engine on
// any failure (missing key/endpoint, offline, rate limit, malformed
// response) so a live demo never dead-ends. Admin can also manually switch
// providers at any time (e.g. local Ollama drops at the booth -> switch to
// an online provider) without code changes.
export async function runGrading({ providerId, apiKey, endpoint, model, photos, questionnaire, provenance, basePrice }) {
  const provider = PROVIDERS[providerId] ?? PROVIDERS.simulated
  let result
  let fellBack = false
  let fallbackReason = null

  try {
    if (provider.configKind === 'key' && !apiKey) throw new Error(`No API key configured for ${provider.label}`)
    if (provider.configKind === 'key+model' && (!apiKey || !model)) throw new Error(`API key and model must both be set for ${provider.label}`)
    if (provider.configKind === 'endpoint' && !endpoint) throw new Error(`No endpoint configured for ${provider.label}`)
    result = await provider.run({ photos, questionnaire, apiKey, endpoint, model })
  } catch (err) {
    fellBack = true
    fallbackReason = err.message
    result = await gradeWithSimulated({ photos, questionnaire })
  }

  const grade = computeGrade({ basePrice, questionnaire, provenance, defects: result.defects })

  return { ...grade, defects: result.defects, source: result.source, fellBack, fallbackReason }
}
