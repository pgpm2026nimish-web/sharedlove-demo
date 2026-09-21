// Confidence-weighted condition-grading algorithm.
// Mirrors the logic described in the project notes: defect penalties are
// scaled by the AI's own confidence, and the questionnaire contributes
// directly regardless of which grading provider supplied the defects.

const QUESTIONNAIRE_PENALTIES = {
  stains: { none: 0, light: 8, heavy: 20 },
  tears: { none: 0, minor: 10, major: 25 },
  fading: { none: 0, slight: 5, noticeable: 12 },
  // Loose stitching is usually repairable, so it's penalized lighter than a
  // tear; pilling is cosmetic only, lighter still.
  stitching: { none: 0, loose: 6, 'coming apart': 16 },
  pilling: { none: 0, light: 4, heavy: 10 },
  tagsAttached: { yes: 0, no: 3 },
}

// Trust & Provenance signals also move the score, not just the questionnaire
// and photos — these are things a photo can't show (hygiene, authenticity
// risk) but that measurably affect whether a buyer trusts the listing, per
// the project's own consumer-psychology research (contamination/hygiene
// stigma, peer-to-peer authenticity risk). `sellReason` is left out
// deliberately: it's context for the buyer, not a condition or trust signal.
const PROVENANCE_PENALTIES = {
  cleaningMethod: { 'Not cleaned': 5, 'Hand washed': 0, 'Machine washed': 0, 'Dry cleaned': 0 },
  tagPhotoMissing: 3, // no brand-tag/logo close-up provided
  notSmokeFreeHome: 4,
  notPetFreeHome: 4,
}

const SEVERITY_BASE_PENALTY = {
  minor: 5,
  moderate: 12,
  major: 22,
}

export function confidenceWeight(confidence) {
  if (confidence > 0.75) return 1
  if (confidence >= 0.4) return 0.5
  return 0
}

function computeProvenanceBreakdown(provenance) {
  if (!provenance) return []
  const rows = []
  const cleaningPenalty = PROVENANCE_PENALTIES.cleaningMethod[provenance.cleaningMethod] ?? 0
  rows.push({ key: 'cleaningMethod', value: provenance.cleaningMethod, penalty: cleaningPenalty })
  rows.push({ key: 'tagPhoto', value: provenance.tagPhoto ? 'provided' : 'not provided', penalty: provenance.tagPhoto ? 0 : PROVENANCE_PENALTIES.tagPhotoMissing })
  rows.push({ key: 'smokeFreeHome', value: provenance.smokeFreeHome ? 'yes' : 'no', penalty: provenance.smokeFreeHome ? 0 : PROVENANCE_PENALTIES.notSmokeFreeHome })
  rows.push({ key: 'petFreeHome', value: provenance.petFreeHome ? 'yes' : 'no', penalty: provenance.petFreeHome ? 0 : PROVENANCE_PENALTIES.notPetFreeHome })
  return rows
}

export function computeGrade({ basePrice, questionnaire, defects, provenance }) {
  const questionnaireBreakdown = Object.entries(questionnaire).map(([key, value]) => ({
    key,
    value,
    penalty: QUESTIONNAIRE_PENALTIES[key]?.[value] ?? 0,
  }))

  const provenanceBreakdown = computeProvenanceBreakdown(provenance)

  const defectBreakdown = defects.map((d) => {
    const base = SEVERITY_BASE_PENALTY[d.severity] ?? 8
    const weight = confidenceWeight(d.confidence)
    return { ...d, basePenalty: base, weight, penalty: Math.round(base * weight) }
  })

  const totalPenalty =
    questionnaireBreakdown.reduce((s, q) => s + q.penalty, 0) +
    provenanceBreakdown.reduce((s, p) => s + p.penalty, 0) +
    defectBreakdown.reduce((s, d) => s + d.penalty, 0)

  const score = Math.max(0, Math.min(100, Math.round(100 - totalPenalty)))
  const letter = score >= 80 ? 'A' : score >= 55 ? 'B' : 'C'
  const price = Math.round((basePrice * score) / 100)

  return { score, letter, price, questionnaireBreakdown, provenanceBreakdown, defectBreakdown }
}
