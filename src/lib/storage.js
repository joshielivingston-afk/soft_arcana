const KEYS = {
  interpretations: 'soft-arcana.interpretations.v3',
  combinationHistory: 'soft-arcana.combinations.v3',
  readings: 'soft-arcana.readings.v3',
  study: 'soft-arcana.study.v3',
  preferences: 'soft-arcana.preferences.v3',
  legacyNotes: 'soft-arcana.card-notes.v1',
  legacyCombos: 'soft-arcana.combo-notes.v1',
  legacyReadings: 'soft-arcana.readings.v1',
}

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))

function migrateLegacy() {
  const existing = read(KEYS.interpretations, null)
  if (existing) return

  const oldNotes = read(KEYS.legacyNotes, {})
  const migrated = {}
  Object.entries(oldNotes).forEach(([cardId, note]) => {
    if (!note || !Object.values(note).some(Boolean)) return
    migrated[cardId] = [{
      id: `legacy-${cardId}`,
      createdAt: new Date().toISOString(),
      upright: note.upright || '',
      reversed: note.reversed || '',
      associations: note.freeform || '',
      context: 'Imported from an earlier Soft Arcana version.',
    }]
  })
  write(KEYS.interpretations, migrated)

  const oldCombos = read(KEYS.legacyCombos, {})
  const migratedCombos = {}
  Object.entries(oldCombos).forEach(([key, text]) => {
    if (!text) return
    migratedCombos[key] = [{ id: `legacy-${key}`, createdAt: new Date().toISOString(), text }]
  })
  write(KEYS.combinationHistory, migratedCombos)

  const oldReadings = read(KEYS.legacyReadings, [])
  if (oldReadings.length) write(KEYS.readings, oldReadings)
}

migrateLegacy()

export const storage = {
  getInterpretations: () => read(KEYS.interpretations, {}),
  setInterpretations: (value) => write(KEYS.interpretations, value),
  getCombinationHistory: () => read(KEYS.combinationHistory, {}),
  setCombinationHistory: (value) => write(KEYS.combinationHistory, value),
  getReadings: () => read(KEYS.readings, []),
  setReadings: (value) => write(KEYS.readings, value),
  getStudy: () => read(KEYS.study, {}),
  setStudy: (value) => write(KEYS.study, value),
  getPreferences: () => read(KEYS.preferences, { music: true }),
  setPreferences: (value) => write(KEYS.preferences, value),
  exportAll: () => ({
    version: 4,
    app: 'Soft Arcana',
    exportedAt: new Date().toISOString(),
    interpretations: read(KEYS.interpretations, {}),
    combinationHistory: read(KEYS.combinationHistory, {}),
    readings: read(KEYS.readings, []),
    study: read(KEYS.study, {}),
    preferences: read(KEYS.preferences, { music: true }),
  }),
  importAll: (payload) => {
    if (!payload || typeof payload !== 'object') throw new Error('Invalid Soft Arcana backup')
    if (payload.interpretations) write(KEYS.interpretations, payload.interpretations)
    if (payload.combinationHistory) write(KEYS.combinationHistory, payload.combinationHistory)
    if (payload.readings) write(KEYS.readings, payload.readings)
    if (payload.study) write(KEYS.study, payload.study)
    if (payload.preferences) write(KEYS.preferences, payload.preferences)
  },
}
