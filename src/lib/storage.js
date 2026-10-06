const KEYS = {
  cardNotes: 'soft-arcana.card-notes.v1',
  comboNotes: 'soft-arcana.combo-notes.v1',
  readings: 'soft-arcana.readings.v1',
}

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))

export const storage = {
  getCardNotes: () => read(KEYS.cardNotes, {}),
  setCardNotes: (value) => write(KEYS.cardNotes, value),
  getComboNotes: () => read(KEYS.comboNotes, {}),
  setComboNotes: (value) => write(KEYS.comboNotes, value),
  getReadings: () => read(KEYS.readings, []),
  setReadings: (value) => write(KEYS.readings, value),
  exportAll: () => ({
    version: 1,
    exportedAt: new Date().toISOString(),
    cardNotes: read(KEYS.cardNotes, {}),
    comboNotes: read(KEYS.comboNotes, {}),
    readings: read(KEYS.readings, []),
  }),
  importAll: (payload) => {
    if (!payload || typeof payload !== 'object') throw new Error('Invalid backup file')
    if (payload.cardNotes) write(KEYS.cardNotes, payload.cardNotes)
    if (payload.comboNotes) write(KEYS.comboNotes, payload.comboNotes)
    if (payload.readings) write(KEYS.readings, payload.readings)
  },
}
