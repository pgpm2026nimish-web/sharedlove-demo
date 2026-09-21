// Simulated grading "provider". No network call, no API key, no rate limit —
// this is what the demo runs on by default so the presentation never depends
// on a live quota. Produces a realistic defect list shaped exactly like the
// real providers would (label, severity, confidence, photo location), derived
// from the seller's own questionnaire answers so the result still feels tied
// to what was actually reported.

const DEFECT_LIBRARY = {
  stains: { light: ['Light stain near hem', 'Faint mark on sleeve'], heavy: ['Visible stain on front panel', 'Large discoloration patch'] },
  tears: { minor: ['Small seam fray', 'Minor thread pull'], major: ['Tear near seam', 'Hole in fabric body'] },
  fading: { slight: ['Slight color fade on shoulders', 'Mild fading at fold lines'], noticeable: ['Noticeable fading across panel', 'Uneven color fade'] },
  stitching: { loose: ['Loose stitching at seam'], 'coming apart': ['Seam coming apart at cuff', 'Stitching unraveling at hem']},
  pilling: { light: ['Light pilling on sleeves'], heavy: ['Heavy pilling across body'] },
}

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export async function gradeWithSimulated({ photos, questionnaire }) {
  await new Promise((r) => setTimeout(r, 1400)) // feels like a real inference call

  const seed = photos.length * 17 + Object.values(questionnaire).join('').length + 1
  const rand = seededRandom(seed)
  const defects = []
  let imageIndex = 0

  for (const [field, options] of Object.entries(DEFECT_LIBRARY)) {
    const answer = questionnaire[field]
    if (answer && options[answer]) {
      const pool = options[answer]
      const label = pool[Math.floor(rand() * pool.length)]
      const severity = field === 'tears' ? (answer === 'major' ? 'major' : 'minor')
        : field === 'stains' ? (answer === 'heavy' ? 'major' : 'moderate')
        : field === 'stitching' ? (answer === 'coming apart' ? 'major' : 'minor')
        : field === 'pilling' ? (answer === 'heavy' ? 'moderate' : 'minor')
        : 'moderate'
      defects.push({
        id: `${field}-${Math.floor(rand() * 1e6)}`,
        label,
        severity,
        confidence: Math.round((0.55 + rand() * 0.4) * 100) / 100,
        imageIndex: photos.length ? imageIndex % photos.length : 0,
        xPct: Math.round(15 + rand() * 70),
        yPct: Math.round(15 + rand() * 70),
      })
      imageIndex++
    }
  }

  return { defects, source: 'simulated', raw: null }
}
