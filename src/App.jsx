import React, { useEffect, useMemo, useRef, useState } from 'react'
import { TAROT_CARDS } from './data/tarot.js'
import { FAIRY_MESSAGES, RITUAL_EXERCISES } from './data/ritual.js'
import { SOURCE_NOTE } from './data/learning.js'
import { storage } from './lib/storage.js'
import { startAmbient, stopAmbient } from './lib/ambient.js'
import CardArt, { MirrorBack } from './components/CardArt.jsx'

const uid = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
const rnd = (items) => items[Math.floor(Math.random() * items.length)]
const shuffle = (items) => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
const dateLabel = (iso) => new Intl.DateTimeFormat(undefined, {
  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
}).format(new Date(iso))

const MEMORY_FILTERS = [
  ['all', 'all cards'],
  ['major', 'major arcana'],
  ['minor', 'minor arcana'],
  ['cups', 'cups'],
  ['swords', 'swords'],
  ['wands', 'wands'],
  ['pentacles', 'pentacles'],
]

const DRAW_COUNTS = [1, 2, 3, 5, 10]

function memoryText(entry) {
  if (!entry) return ''
  if (entry.text) return entry.text
  return [
    entry.upright && 'Upright — ' + entry.upright,
    entry.reversed && 'Reversed — ' + entry.reversed,
    entry.associations && 'Associations — ' + entry.associations,
    entry.context && 'Encounter — ' + entry.context,
  ].filter(Boolean).join('\n\n')
}

function cardsForFilter(filter) {
  if (filter === 'major') return TAROT_CARDS.filter((card) => card.suit === 'Major')
  if (filter === 'minor') return TAROT_CARDS.filter((card) => card.suit !== 'Major')
  if (['cups', 'swords', 'wands', 'pentacles'].includes(filter)) {
    const suit = filter[0].toUpperCase() + filter.slice(1)
    return TAROT_CARDS.filter((card) => card.suit === suit)
  }
  return TAROT_CARDS
}

function MusicButton({ on, onToggle }) {
  return <button className="music-button" onClick={onToggle} aria-label="toggle atmosphere">
    {on ? '♫' : '♩'} <span>{on ? 'sound on' : 'sound off'}</span>
  </button>
}

function ReturnToBedroom({ onReturn, music, onMusic }) {
  return <header className="room-header">
    <button className="bedroom-return" onClick={onReturn}>← return to the bedroom</button>
    <MusicButton on={music} onToggle={onMusic} />
  </header>
}

function Threshold({ music, setMusic, onDone }) {
  const [step, setStep] = useState(0)
  const exercise = useMemo(() => rnd(RITUAL_EXERCISES), [])
  const message = useMemo(() => rnd(FAIRY_MESSAGES), [])

  const toggle = async () => {
    const next = !music
    setMusic(next)
    next ? await startAmbient() : stopAmbient()
  }

  const enter = async () => {
    if (music) await startAmbient()
    setStep(1)
  }

  if (step === 0) return <div className="threshold mirror-threshold">
    <div className="threshold-mirror threshold-mirror-a" />
    <div className="threshold-mirror threshold-mirror-b" />
    <section className="threshold-copy">
      <span className="ornament">❦</span>
      <h1>SOFT ARCANA</h1>
      <p>Leave the bright world at the door.</p>
      <button className="mirror-button primary" onClick={enter}>enter softly</button>
      <button className="text-button" onClick={onDone}>skip the threshold</button>
    </section>
    <MusicButton on={music} onToggle={toggle} />
  </div>

  if (step === 1) return <div className="threshold ritual-screen">
    <section className="ritual-card">
      <small>one small preparation</small>
      <div className="breathing-mirror" />
      <h2>{exercise.title}</h2>
      <p>{exercise.instruction}</p>
      {exercise.words && <div className="word-triptych">{exercise.words.map((word) => <span key={word}>{word}</span>)}</div>}
      <button className="mirror-button primary" onClick={() => setStep(2)}>continue</button>
      <button className="text-button" onClick={onDone}>skip the threshold</button>
    </section>
    <MusicButton on={music} onToggle={toggle} />
  </div>

  return <div className="threshold fairy-screen">
    <div className="fairy-wrap" aria-hidden="true">
      <div className="fairy">
        <div className="wing wing-left" />
        <div className="wing wing-right" />
        <div className="fairy-head" />
        <div className="fairy-body" />
        <i className="fairy-spark s1" />
        <i className="fairy-spark s2" />
        <i className="fairy-spark s3" />
        <i className="fairy-spark s4" />
      </div>
    </div>
    <section className="fairy-message">
      <small>something came through</small>
      <blockquote>{message}</blockquote>
      <button className="mirror-button primary" onClick={onDone}>say goodbye to the fairy</button>
    </section>
    <MusicButton on={music} onToggle={toggle} />
  </div>
}

function Bedroom({ onEnter, music, onMusic }) {
  const entries = [
    ['look', 'look in the mirror', 'receive a reading', 'large one'],
    ['polish', 'polish the mirror', 'learn by seeing again', 'large two'],
    ['open', 'open the mirror', 'cards & remembered dreams', 'small three'],
    ['download', 'download the mirror', 'keep a copy outside the glass', 'small four'],
  ]

  return <main className="bedroom">
    <MusicButton on={music} onToggle={onMusic} />
    <header>
      <small>the bedroom</small>
      <h1>SOFT ARCANA</h1>
      <p>Four ways through the same glass.</p>
    </header>
    <section className="bedroom-menu">
      {entries.map(([id, title, subtitle, size]) => <button
        key={id}
        className={'bedroom-entry ' + size}
        onClick={() => onEnter(id)}
      >
        <span className="entry-glint" />
        <b>{title}</b>
        <small>{subtitle}</small>
      </button>)}
    </section>
  </main>
}

function PolishMirror({ interpretations, beneath, wear, onRemember, onLeave, onEncounter, onReturn, music, onMusic }) {
  const [filter, setFilter] = useState('all')
  const [card, setCard] = useState(null)
  const [draft, setDraft] = useState('')
  const [drawer, setDrawer] = useState(null)
  const [sealing, setSealing] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [clouding, setClouding] = useState(false)
  const queueRef = useRef([])

  const resetQueue = (nextFilter = filter) => {
    queueRef.current = shuffle(cardsForFilter(nextFilter))
  }

  useEffect(() => {
    setClouding(true)
    resetQueue(filter)
    setCard(null)
    setDraft('')
    setDrawer(null)
    const timer = window.setTimeout(() => setClouding(false), 650)
    return () => window.clearTimeout(timer)
  }, [filter])

  const draw = () => {
    if (sealing) return
    if (!queueRef.current.length) resetQueue()
    let next = queueRef.current.shift()
    if (card && next?.id === card.id && queueRef.current.length) {
      queueRef.current.push(next)
      next = queueRef.current.shift()
    }
    onEncounter(next)
    setCard(next)
    setDraft('')
    setDrawer(null)
  }

  const remember = () => {
    if (!card || !draft.trim() || sealing) return
    setSealing(true)
    window.setTimeout(() => {
      onRemember(card, draft.trim())
      setCard(null)
      setDraft('')
      setDrawer(null)
      setSealing(false)
    }, 3000)
  }

  const leaveBeneath = () => {
    if (!card || sealing || leaving) return
    setLeaving(true)
    window.setTimeout(() => {
      onLeave(card)
      setCard(null)
      setDraft('')
      setDrawer(null)
      setLeaving(false)
    }, 1200)
  }

  const history = card ? (interpretations[card.id] || []) : []

  return <div className="mirror-room polish-room">
    <ReturnToBedroom onReturn={onReturn} music={music} onMusic={onMusic} />
    <main className="room-content">
      <header className="room-title">
        <small>polish the mirror</small>
        <h1>See it again.</h1>
      </header>

      <div className="study-filter" aria-label="choose cards to study">
        {MEMORY_FILTERS.map(([id, label]) => <button
          key={id}
          className={filter === id ? 'active' : ''}
          onClick={() => setFilter(id)}
        >{label}</button>)}
      </div>

      <section className={'polish-stage ' + (sealing ? 'is-sealing ' : '') + (leaving ? 'is-leaving ' : '') + (clouding ? 'is-clouding' : '')}>
        {clouding && <div className="mirror-cloud" aria-hidden="true"><i /><i /><i /></div>}
        {!card ? <div className="deck-choice">
          <button className="deck-touch" onClick={draw} aria-label="flip the top card">
            <MirrorBack />
            <span>touch the deck</span>
          </button>
          <button className="keep-polishing" onClick={draw}>keep polishing</button>
        </div> : <div className="polish-encounter">
          <div className="polish-card-wrap"><CardArt card={card} wear={wear[card.id] || 0} /></div>
          <div className="memory-paper">
            <small>{card.name}</small>
            <h2>what do you see this time?</h2>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="write what the card means to you now"
            />
            <button className="remember-button" disabled={!draft.trim()} onClick={remember}>remember</button>

            <div className="dream-tabs">
              <button className={drawer === 'traditional' ? 'active' : ''} onClick={() => setDrawer(drawer === 'traditional' ? null : 'traditional')}>traditional dream</button>
              <button className={drawer === 'old' ? 'active' : ''} onClick={() => setDrawer(drawer === 'old' ? null : 'old')}>my old dreams</button>
            </div>

            {drawer && <div className="dream-drawer">
              {drawer === 'traditional' ? <article className="traditional-slip">
                <b>{card.keywords}</b>
                <p>{card.upright}</p>
                <small>reversed / shadow</small>
                <b>{card.reversedKeywords}</b>
                <p>{card.reversed}</p>
              </article> : <div className="old-dreams">
                {!history.length && <p className="empty-dream">Nothing remembered yet.</p>}
                {[...history].reverse().map((entry, index) => <details className="dream-slip" key={entry.id || index}>
                  <summary><b>dream {history.length - index}</b><time>{dateLabel(entry.createdAt)}</time></summary>
                  <div className="dream-slip-paper"><p>{memoryText(entry)}</p></div>
                </details>)}
              </div>}
            </div>}
          </div>

          <div className="polish-after-actions">
            <button className="beneath-button" onClick={leaveBeneath}>leave beneath the mirror</button>
            <button className="skip-polish" onClick={draw}>keep polishing</button>
          </div>

          {leaving && <div className="beneath-motion" aria-hidden="true"><span className="ribbon">silk</span></div>}
          {sealing && <div className="seal-bundle" aria-hidden="true">
            <div className="folding-paper">
              <i className="fold fold-left" />
              <i className="fold fold-right" />
              <i className="fold fold-top" />
              <span className="wax-seal">◉</span>
            </div>
          </div>}
        </div>}
      </section>
    </main>
  </div>
}

function LookMirror({ wear, onEncounter, onRememberReading, onReturn, music, onMusic }) {
  const [deck, setDeck] = useState(() => shuffle(TAROT_CARDS))
  const [cards, setCards] = useState([])
  const [phase, setPhase] = useState('ready')
  const [cutDeck, setCutDeck] = useState(null)
  const [note, setNote] = useState('')
  const [savedKey, setSavedKey] = useState('')

  const shuffleDeck = () => {
    if (cards.length) return
    setPhase('shuffling')
    const mixed = shuffle(TAROT_CARDS)
    window.setTimeout(() => {
      const midpoint = Math.floor(mixed.length / 2)
      setCutDeck([mixed.slice(0, midpoint), mixed.slice(midpoint)])
      setPhase('cut')
    }, 1000)
  }

  const chooseCut = (which) => {
    const [left, right] = cutDeck
    setDeck(which === 'left' ? [...left, ...right] : [...right, ...left])
    setCutDeck(null)
    setPhase('ready')
  }

  const draw = () => {
    if (phase !== 'ready' || cards.length >= 10) return
    let nextDeck = deck
    if (!nextDeck.length) nextDeck = shuffle(TAROT_CARDS)
    const next = nextDeck[0]
    onEncounter(next)
    setDeck(nextDeck.slice(1))
    setCards([...cards, { card: next, reversed: false }])
    setNote('')
    setSavedKey('')
  }

  const remember = () => {
    if (!note.trim() || !DRAW_COUNTS.includes(cards.length)) return
    const key = cards.map((item) => item.card.id).join('::') + '::' + cards.length
    onRememberReading({
      id: uid(),
      createdAt: new Date().toISOString(),
      cards,
      note: note.trim(),
      mirrorCount: cards.length,
      type: 'mirror-reading',
    })
    setSavedKey(key)
  }

  return <div className="mirror-room look-room">
    <ReturnToBedroom onReturn={onReturn} music={music} onMusic={onMusic} />
    <main className="room-content">
      <header className="room-title centered">
        <small>look in the mirror</small>
        <h1>speak your truth</h1>
      </header>

      {!cards.length && <section className="shuffle-zone">
        {phase === 'ready' && <>
          <button className="deck-touch draw-deck" onClick={draw}><MirrorBack /><span>touch the deck</span></button>
          <button className="shuffle-button" onClick={shuffleDeck}>shuffle & cut</button>
        </>}
        {phase === 'shuffling' && <div className="shuffle-animation"><div className="mirror-cloud shuffle-reflection" aria-hidden="true"><i /><i /><i /></div>
          <MirrorBack className="shuffle-card a" />
          <MirrorBack className="shuffle-card b" />
          <MirrorBack className="shuffle-card c" />
          <small>shuffling</small>
        </div>}
        {phase === 'cut' && <div className="cut-table">
          <p>Which half goes on top?</p>
          <div>
            <button onClick={() => chooseCut('left')}><MirrorBack /><span>this half</span></button>
            <button onClick={() => chooseCut('right')}><MirrorBack /><span>this half</span></button>
          </div>
        </div>}
      </section>}

      {!!cards.length && <>
        <section className="draw-carousel">
          {cards.map((item, index) => <article key={index} className="drawn-mirror-card">
            <CardArt card={item.card} wear={wear[item.card.id] || 0} />
            <small>{index + 1}</small>
          </article>)}
          {cards.length < 10 && <button className="draw-another" onClick={draw}>
            <MirrorBack />
            <span>draw another card</span>
          </button>}
        </section>

        {DRAW_COUNTS.includes(cards.length) ? <section className="reading-memory">
          <h2>what do you see?</h2>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} />
          <button className="remember-button" disabled={!note.trim()} onClick={remember}>
            {savedKey ? 'remembered' : 'remember'}
          </button>
        </section> : <p className="between-spreads">
          Keep drawing. The mirror can be remembered at 1, 2, 3, 5, or 10 cards.
        </p>}
      </>}
    </main>
  </div>
}

function CardDreamSheet({ card, history, wear = 0, onClose }) {
  const [drawer, setDrawer] = useState('old')
  return <div className="modal" onMouseDown={onClose}>
    <section className="dream-sheet" onMouseDown={(event) => event.stopPropagation()}>
      <button className="close" onClick={onClose}>×</button>
      <div className="sheet-top">
        <CardArt card={card} wear={wear} />
        <div>
          <small>{card.suit}</small>
          <h2>{card.name}</h2>
          <div className="dream-tabs">
            <button className={drawer === 'traditional' ? 'active' : ''} onClick={() => setDrawer('traditional')}>traditional dream</button>
            <button className={drawer === 'old' ? 'active' : ''} onClick={() => setDrawer('old')}>my old dreams</button>
          </div>
        </div>
      </div>
      <div className="dream-drawer sheet-drawer">
        {drawer === 'traditional' ? <article className="traditional-slip"><b>{card.keywords}</b><p>{card.upright}</p><small>reversed / shadow</small><b>{card.reversedKeywords}</b><p>{card.reversed}</p></article> : <div className="old-dreams">
          {[...history].reverse().map((entry, index) => <details className="dream-slip" key={entry.id || index}><summary><b>dream {history.length - index}</b><time>{dateLabel(entry.createdAt)}</time></summary><div className="dream-slip-paper"><p>{memoryText(entry)}</p></div></details>)}
        </div>}
      </div>
    </section>
  </div>
}

function OpenMirror({ interpretations, readings, beneath, wear, onReturn, music, onMusic }) {
  const [archiveFilter, setArchiveFilter] = useState('all')
  const [mode, setMode] = useState('cards')
  const [selected, setSelected] = useState(null)

  const cards = archiveFilter === 'remembered'
    ? TAROT_CARDS.filter((card) => (interpretations[card.id] || []).length)
    : archiveFilter === 'beneath'
      ? TAROT_CARDS.filter((card) => beneath[card.id])
      : TAROT_CARDS
  const mirrorReadings = readings.filter((reading) => reading.note && DRAW_COUNTS.includes(reading.cards?.length || reading.mirrorCount))

  return <div className="mirror-room open-room">
    <ReturnToBedroom onReturn={onReturn} music={music} onMusic={onMusic} />
    <main className="room-content">
      <header className="room-title">
        <small>open the mirror</small>
        <h1>What the glass kept.</h1>
      </header>

      <div className="open-switches">
        <button className={mode === 'cards' ? 'active' : ''} onClick={() => setMode('cards')}>cards</button>
        <button className={mode === 'combinations' ? 'active' : ''} onClick={() => setMode('combinations')}>combinations</button>
      </div>

      {mode === 'cards' ? <>
        <div className="archive-filters">
          <button className={archiveFilter === 'all' ? 'active' : ''} onClick={() => setArchiveFilter('all')}>all</button>
          <button className={archiveFilter === 'remembered' ? 'active' : ''} onClick={() => setArchiveFilter('remembered')}>remembered</button>
          <button className={archiveFilter === 'beneath' ? 'active' : ''} onClick={() => setArchiveFilter('beneath')}>beneath the mirror</button>
        </div>

        <section className="card-carousel">
          {cards.map((card) => {
            const history = interpretations[card.id] || []
            const remembered = history.length > 0
            const waiting = Boolean(beneath[card.id])
            return <button
              key={card.id}
              className={'archive-card-tile ' + (waiting ? 'is-beneath' : remembered ? 'is-remembered' : 'is-unremembered')}
              onClick={() => remembered && setSelected(card)}
            >
              <div className="archive-card-object">
                {waiting && <span className="beneath-ribbon" aria-hidden="true" />}
                {waiting || !remembered ? <MirrorBack /> : <CardArt card={card} wear={wear[card.id] || 0} />}
              </div>
              <b>{waiting ? card.name : remembered ? card.name : 'unremembered'}</b>
              <small>{waiting ? 'waiting beneath the mirror' : remembered ? history.length + ' dream' + (history.length === 1 ? '' : 's') : 'still behind the glass'}</small>
            </button>
          })}
        </section>
      </> : <section className="combination-archive">
        {DRAW_COUNTS.map((count) => {
          const group = mirrorReadings.filter((reading) => (reading.cards?.length || reading.mirrorCount) === count)
          return <section className="combination-group" key={count}>
            <header><h2>{count === 1 ? 'single draws' : count + ' cards'}</h2><small>{group.length} remembered</small></header>
            {!group.length ? <p className="empty-combination">Nothing has been kept here yet.</p> : <div className="combination-carousel">
              {group.map((reading) => <article key={reading.id}>
                <div className="mini-card-run">
                  {reading.cards.map((item, index) => <div key={index}><CardArt card={item.card} small /></div>)}
                </div>
                <time>{dateLabel(reading.createdAt)}</time>
                <p>{reading.note}</p>
              </article>)}
            </div>}
          </section>
        })}
      </section>}

      {selected && <CardDreamSheet card={selected} history={interpretations[selected.id] || []} wear={wear[selected.id] || 0} onClose={() => setSelected(null)} />}
    </main>
  </div>
}

const download = (text, name, type) => {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

function DownloadMirror({ interpretations, combos, readings, study, beneath, wear, onImport, onReturn, music, onMusic }) {
  const input = useRef(null)
  const remembered = Object.values(interpretations).filter((items) => items?.length).length

  const exportObject = () => ({
    version: 5,
    app: 'Soft Arcana',
    exportedAt: new Date().toISOString(),
    sourceNote: SOURCE_NOTE,
    cards: TAROT_CARDS.map((card) => ({
      id: card.id,
      name: card.name,
      suit: card.suit,
      traditional: {
        uprightKeywords: card.keywords,
        uprightMeaning: card.upright,
        reversedKeywords: card.reversedKeywords,
        reversedMeaning: card.reversed,
      },
      memories: interpretations[card.id] || [],
    })),
    interpretations,
    combinationHistory: combos,
    readings,
    study,
    beneath,
    wear,
  })

  const exportJson = () => download(
    JSON.stringify(exportObject(), null, 2),
    'soft-arcana-v0.5-' + new Date().toISOString().slice(0, 10) + '.json',
    'application/json'
  )

  const exportNotebook = () => {
    const lines = ['# Soft Arcana — Mirror Notebook', '', SOURCE_NOTE, '']
    TAROT_CARDS.forEach((card) => {
      lines.push('## ' + card.name, '', '**Traditional dream:** ' + card.keywords, '', card.upright, '', '### My old dreams', '')
      const history = interpretations[card.id] || []
      if (!history.length) lines.push('_Not yet remembered._', '')
      history.forEach((entry, index) => lines.push('#### Dream ' + (index + 1) + ' — ' + entry.createdAt, '', memoryText(entry), ''))
    })
    lines.push('# Remembered combinations', '')
    readings.filter((reading) => reading.note).forEach((reading) => {
      lines.push('## ' + reading.cards.length + ' cards — ' + reading.createdAt, '', reading.cards.map((item) => item.card.name).join(' · '), '', reading.note, '')
    })
    download(lines.join('\n'), 'soft-arcana-mirror-notebook.md', 'text/markdown')
  }

  const importFile = async (file) => {
    if (!file) return
    const payload = JSON.parse(await file.text())
    if (payload.cards && !payload.interpretations) {
      const rebuilt = {}
      payload.cards.forEach((card) => { rebuilt[card.id] = card.memories || card.personalInterpretationHistory || [] })
      storage.setInterpretations(rebuilt)
      storage.setCombinationHistory(payload.combinationHistory || {})
      storage.setReadings(payload.readings || [])
      storage.setStudy(payload.study || {})
    } else {
      storage.importAll(payload)
    }
    onImport()
  }

  return <div className="mirror-room download-room">
    <ReturnToBedroom onReturn={onReturn} music={music} onMusic={onMusic} />
    <main className="room-content download-content">
      <header className="room-title">
        <small>download the mirror</small>
        <h1>Carry the reflection out.</h1>
      </header>
      <section className="download-panel">
        <div className="download-mirror"><span>{remembered}</span><small>of 78 cards remembered</small></div>
        <p>Your mirror lives in this browser. A download is the copy that cannot disappear when browser storage is cleared.</p>
        <button className="mirror-button primary" onClick={exportJson}>download everything</button>
        <button className="mirror-button secondary" onClick={exportNotebook}>download readable notebook</button>
        <button className="text-button" onClick={() => input.current?.click()}>restore an old mirror</button>
        <input ref={input} hidden type="file" accept="application/json" onChange={(event) => importFile(event.target.files?.[0])} />
      </section>
    </main>
  </div>
}

export default function App() {
  const [screen, setScreen] = useState('bedroom')
  const [ritual, setRitual] = useState(true)
  const [interpretations, setInterpretations] = useState(() => storage.getInterpretations())
  const [combos, setCombos] = useState(() => storage.getCombinationHistory())
  const [readings, setReadings] = useState(() => storage.getReadings())
  const [study, setStudy] = useState(() => storage.getStudy())
  const [beneath, setBeneath] = useState(() => storage.getBeneath())
  const [wear, setWear] = useState(() => storage.getWear())
  const [prefs, setPrefs] = useState(() => storage.getPreferences())
  const [toast, setToast] = useState('')

  const flash = (text) => {
    setToast(text)
    window.setTimeout(() => setToast(''), 1800)
  }

  const setMusic = (music) => {
    const next = { ...prefs, music }
    setPrefs(next)
    storage.setPreferences(next)
  }

  const toggleMusic = async () => {
    const next = !prefs.music
    setMusic(next)
    next ? await startAmbient() : stopAmbient()
  }

  const rememberCard = (card, text) => {
    const memory = { id: uid(), createdAt: new Date().toISOString(), text }
    const next = {
      ...interpretations,
      [card.id]: [...(interpretations[card.id] || []), memory],
    }
    setInterpretations(next)
    storage.setInterpretations(next)
    if (beneath[card.id]) {
      const nextBeneath = { ...beneath }
      delete nextBeneath[card.id]
      setBeneath(nextBeneath)
      storage.setBeneath(nextBeneath)
    }
    flash('SEALED IN THE MIRROR')
  }

  const encounterCard = (card) => {
    if (!card) return
    const next = { ...wear, [card.id]: (wear[card.id] || 0) + 1 }
    setWear(next)
    storage.setWear(next)
  }

  const leaveBeneath = (card) => {
    const next = { ...beneath, [card.id]: { createdAt: new Date().toISOString() } }
    setBeneath(next)
    storage.setBeneath(next)
    flash('LEFT BENEATH THE MIRROR')
  }

  const rememberReading = (reading) => {
    const next = [reading, ...readings]
    setReadings(next)
    storage.setReadings(next)
    flash('THE MIRROR KEPT IT')
  }

  const reload = () => {
    setInterpretations(storage.getInterpretations())
    setCombos(storage.getCombinationHistory())
    setReadings(storage.getReadings())
    setStudy(storage.getStudy())
    setBeneath(storage.getBeneath())
    setWear(storage.getWear())
    flash('THE OLD MIRROR OPENED')
  }

  const returnToBedroom = () => setScreen('bedroom')

  return <div className="app-shell">
    {screen === 'bedroom' && <Bedroom onEnter={setScreen} music={prefs.music} onMusic={toggleMusic} />}
    {screen === 'look' && <LookMirror wear={wear} onEncounter={encounterCard} onRememberReading={rememberReading} onReturn={returnToBedroom} music={prefs.music} onMusic={toggleMusic} />}
    {screen === 'polish' && <PolishMirror interpretations={interpretations} beneath={beneath} wear={wear} onRemember={rememberCard} onLeave={leaveBeneath} onEncounter={encounterCard} onReturn={returnToBedroom} music={prefs.music} onMusic={toggleMusic} />}
    {screen === 'open' && <OpenMirror interpretations={interpretations} readings={readings} beneath={beneath} wear={wear} onReturn={returnToBedroom} music={prefs.music} onMusic={toggleMusic} />}
    {screen === 'download' && <DownloadMirror interpretations={interpretations} combos={combos} readings={readings} study={study} beneath={beneath} wear={wear} onImport={reload} onReturn={returnToBedroom} music={prefs.music} onMusic={toggleMusic} />}
    {ritual && <Threshold music={prefs.music} setMusic={setMusic} onDone={() => setRitual(false)} />}
    {toast && <div className="toast">{toast}</div>}
  </div>
}
