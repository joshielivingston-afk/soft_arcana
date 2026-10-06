import React, { useEffect, useMemo, useRef, useState } from 'react'
import { TAROT_CARDS } from './data/tarot.js'
import { SPREADS } from './data/spreads.js'
import { storage } from './lib/storage.js'

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
const comboKey = (cards) => cards.map((x) => x.card.id).sort().join('::')
const dateLabel = (iso) => new Intl.DateTimeFormat(undefined, {
  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
}).format(new Date(iso))
const randomItem = (items) => items[Math.floor(Math.random() * items.length)]

const PROTOCOLS = [
  'LIMINAL MIRROR',
  'ORBITAL HEARTLINE',
  'DEEP CHANNEL',
  'NIGHT TRANSIT',
  'SOFT PROPHECY',
  'VEIL SCANNER',
]

const BOOT_LINES = [
  'SOFT//ARCANA DIVINATION SYSTEM',
  'build 2.001 / private domestic edition',
  'loading card lattice . . . done',
  'attuning symbolic receiver . . . done',
  'warning: interpretation drift is expected',
]

function cardOrientationText(item) {
  return item.reversed ? item.card.reversedKeywords.toLowerCase() : item.card.keywords.toLowerCase()
}

function buildSignalMeta(reading, question) {
  const majors = reading.cards.filter((x) => x.card.suit === 'Major').length
  const suitCounts = reading.cards.reduce((acc, item) => {
    acc[item.card.suit] = (acc[item.card.suit] || 0) + 1
    return acc
  }, {})
  const dominantSuit = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mixed'
  const reversedCount = reading.cards.filter((x) => x.reversed).length
  const protocol = randomItem(PROTOCOLS)
  const anomaly = randomItem([
    'A pattern repeated in dream-language. Do not force clarity too soon.',
    'The system detects a soft contradiction. That is where the meaning lives.',
    'A threshold card is active. What feels small may actually be the hinge.',
    'This spread reads like weather more than fate. Stay close to mood and sequence.',
    'There is signal in the side-story. Notice what the cards imply rather than announce.',
    'Outcome is less fixed than the emotional texture moving beneath it.',
  ])
  const tone = majors >= 2
    ? 'Major Arcana pressure is high. The reading points to a larger cycle, not just a passing mood.'
    : dominantSuit === 'Cups'
      ? 'The spread leans emotional, receptive, and memory-soaked. Meaning may arrive through feeling before logic.'
      : dominantSuit === 'Swords'
        ? 'The spread leans mental and clarifying. There is a blade in it: discernment, tension, or a necessary cut.'
        : dominantSuit === 'Wands'
          ? 'The spread leans kinetic. Desire, movement, and ignition are louder than passivity here.'
          : dominantSuit === 'Pentacles'
            ? 'The spread leans practical and embodied. What happens in the material world matters.'
            : 'No single suit dominates. This is a mixed-field reading.'

  const summary = question?.trim()
    ? `Query locked: “${question.trim()}”`
    : 'No explicit query entered. Interpret the spread as ambient guidance.'

  return {
    protocol,
    anomaly,
    majors,
    dominantSuit,
    reversedCount,
    summary,
    sessionId: `ARC-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${reading.cards.length}${majors}`,
    noiseIndex: `${10 + Math.floor(Math.random() * 79)}.${Math.floor(Math.random() * 10)}%`,
    tone,
  }
}

function CardArt({ card, reversed = false, compact = false }) {
  const romanMajors = ['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI']
  const label = card.suit === 'Major' ? romanMajors[card.number] : String(card.number).padStart(2, '0')
  return (
    <div className={`tarot-art suit-${card.suit.toLowerCase()} ${reversed ? 'is-reversed' : ''} ${compact ? 'compact' : ''}`}>
      <div className="art-grid" />
      <div className="art-noise" />
      <div className="art-orbit orbit-a" />
      <div className="art-orbit orbit-b" />
      <div className="art-scan">ARC_{card.id.toUpperCase()}</div>
      <div className="art-number">{label}</div>
      <div className="art-symbol">{card.symbol}</div>
      <div className="art-horizon"><span/><span/><span/></div>
      <div className="art-title">{card.name}</div>
      <div className="art-meta">{card.element?.toUpperCase()} // {card.suit.toUpperCase()}</div>
    </div>
  )
}

function ChromeButton({ children, className = '', ...props }) {
  return <button className={`chrome-button ${className}`} {...props}>{children}</button>
}

function BootScreen({ onEnter }) {
  return (
    <div className="boot-screen">
      <div className="boot-panel">
        <div className="boot-window-bar">
          <span />
          <b>DIVINATION.exe</b>
          <i>personal edition</i>
        </div>
        <div className="boot-body">
          <div className="boot-sigil">◌</div>
          <div className="boot-lines">
            {BOOT_LINES.map((line) => <p key={line}>{line}</p>)}
          </div>
          <div className="boot-copy">
            An uncanny domestic oracle interface for your wife. Traditional meanings underneath. Her private mythology over the top.
          </div>
          <ChromeButton onClick={onEnter}>ENTER THE PROGRAM</ChromeButton>
        </div>
      </div>
    </div>
  )
}

function CardDetail({ card, note, onSave, onClose }) {
  const [draft, setDraft] = useState(note || { upright: '', reversed: '', freeform: '' })

  useEffect(() => {
    setDraft(note || { upright: '', reversed: '', freeform: '' })
  }, [card, note])

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="modal-panel" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="detail-hero">
          <CardArt card={card} />
          <div className="detail-copy">
            <div className="eyebrow">{card.arcana} // {card.element}</div>
            <h2>{card.name}</h2>
            <div className="meaning-block">
              <span>UPRIGHT</span>
              <b>{card.keywords}</b>
              <p>{card.upright}</p>
            </div>
            <div className="meaning-block reversed-copy">
              <span>REVERSED</span>
              <b>{card.reversedKeywords}</b>
              <p>{card.reversed}</p>
            </div>
          </div>
        </div>
        <div className="personal-panel">
          <div className="panel-label"><span>PERSONAL LAYER</span><i>saved on this device</i></div>
          <label>Your upright meaning<textarea value={draft.upright || ''} onChange={(e) => setDraft({ ...draft, upright: e.target.value })} placeholder="What does this card mean to you when it arrives upright?" /></label>
          <label>Your reversed meaning<textarea value={draft.reversed || ''} onChange={(e) => setDraft({ ...draft, reversed: e.target.value })} placeholder="What changes, blocks, or turns inward when it is reversed?" /></label>
          <label>Symbols / memories / private associations<textarea value={draft.freeform || ''} onChange={(e) => setDraft({ ...draft, freeform: e.target.value })} placeholder="Dreams, people, places, colors, recurring situations…" /></label>
          <ChromeButton onClick={() => { onSave(draft); onClose() }}>SAVE INTERPRETATION</ChromeButton>
        </div>
      </section>
    </div>
  )
}

function DrawView({ cardNotes, comboNotes, setComboNotes, onOpenCard, onSaveReading }) {
  const [spreadId, setSpreadId] = useState('past-present-future')
  const [reading, setReading] = useState(null)
  const [allowReversed, setAllowReversed] = useState(true)
  const [comboDraft, setComboDraft] = useState('')
  const [readingDraft, setReadingDraft] = useState('')
  const [questionDraft, setQuestionDraft] = useState('')
  const [signalMeta, setSignalMeta] = useState(null)
  const [drawLog, setDrawLog] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const timerRef = useRef([])
  const spread = SPREADS.find((x) => x.id === spreadId)

  useEffect(() => () => timerRef.current.forEach((t) => window.clearTimeout(t)), [])

  const standardSynthesis = useMemo(() => {
    if (!reading) return ''
    const c = reading.cards
    if (c.length === 1) return c[0].reversed ? c[0].card.reversed : c[0].card.upright
    if (c.length === 2) {
      return `${c[0].card.name} establishes the field through ${cardOrientationText(c[0])}. ${c[1].card.name} answers it through ${cardOrientationText(c[1])}. Read the pair as a relationship: where do these two forces reinforce, interrupt, or correct one another?`
    }
    if (c.length === 3) {
      return `${c[0].card.name} opens the sequence with ${cardOrientationText(c[0])}; ${c[1].card.name} becomes the central pressure through ${cardOrientationText(c[1])}; ${c[2].card.name} points toward ${cardOrientationText(c[2])}. The movement between them matters as much as any one card.`
    }
    return `Read the spread position by position, then look for repeated elements, court cards, Major Arcana, and the movement from the opening card toward ${c[c.length - 1].card.name}. Your personal reading can be saved below as one complete interpretation.`
  }, [reading])

  const initiateDraw = () => {
    if (isDrawing) return
    timerRef.current.forEach((t) => window.clearTimeout(t))
    timerRef.current = []
    setReading(null)
    setSignalMeta(null)
    setComboDraft('')
    setReadingDraft('')
    setIsDrawing(true)
    setDrawLog([])

    const lines = [
      'opening symbolic channel . . .',
      `loading spread matrix: ${spread.name.toUpperCase()}`,
      allowReversed ? 'reversal axis enabled' : 'reversal axis disabled',
      questionDraft.trim() ? 'query imprint detected' : 'no query imprint detected',
      'shuffling card lattice . . .',
      'reading signal turbulence . . .',
      'extracting image-cluster . . .',
      'materializing draw . . .',
    ]

    lines.forEach((line, index) => {
      const t = window.setTimeout(() => setDrawLog((prev) => [...prev, line]), 260 * (index + 1))
      timerRef.current.push(t)
    })

    const finalTimer = window.setTimeout(() => {
      const deck = [...TAROT_CARDS]
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[deck[i], deck[j]] = [deck[j], deck[i]]
      }
      const cards = deck.slice(0, spread.count).map((card, index) => ({
        card,
        position: spread.positions[index],
        reversed: allowReversed ? Math.random() < 0.28 : false,
      }))
      const next = {
        id: uid(),
        spread,
        cards,
        createdAt: new Date().toISOString(),
        question: questionDraft.trim(),
      }
      setReading(next)
      setComboDraft((cards.length === 2 || cards.length === 3) ? (comboNotes[comboKey(cards)] || '') : '')
      setSignalMeta(buildSignalMeta(next, questionDraft))
      setDrawLog((prev) => [...prev, 'signal locked'])
      setIsDrawing(false)
    }, 260 * (lines.length + 1) + 180)

    timerRef.current.push(finalTimer)
  }

  const saveCombo = () => {
    if (!reading || ![2, 3].includes(reading.cards.length)) return
    const next = { ...comboNotes, [comboKey(reading.cards)]: comboDraft }
    setComboNotes(next)
    storage.setComboNotes(next)
  }

  return (
    <main className="view draw-view">
      <section className="signal-head">
        <div>
          <div className="eyebrow">DIVINATION INTERFACE // 02 // LATE-NIGHT HOME SYSTEM</div>
          <h1>Draw a signal.</h1>
          <p>Make it feel like some strange little oracle program from 2001: half spiritual tool, half forgotten desktop software.</p>
        </div>
        <div className="orb"><div/><span>LIVE<br/>ARCANA</span></div>
      </section>

      <section className="protocol-grid">
        <section className="glass-panel prompt-panel">
          <div className="panel-label"><span>QUERY INPUT</span><i>optional but good for targeting the signal</i></div>
          <label className="question-field">
            <span>What are you asking?</span>
            <textarea
              value={questionDraft}
              onChange={(e) => setQuestionDraft(e.target.value)}
              placeholder="What do I need to understand about this relationship / decision / feeling / recurring dream?"
            />
          </label>
        </section>

        <section className="glass-panel protocol-panel">
          <div className="panel-label"><span>READING PROTOCOL</span><i>{spread.count} card{spread.count > 1 ? 's' : ''}</i></div>
          <div className="spread-scroll">
            {SPREADS.map((s) => (
              <button key={s.id} className={spreadId === s.id ? 'active' : ''} onClick={() => { setSpreadId(s.id); setReading(null); setSignalMeta(null) }}>
                <b>{s.name}</b>
                <small>{s.note}</small>
              </button>
            ))}
          </div>
          <div className="draw-controls">
            <label className="toggle"><input type="checkbox" checked={allowReversed} onChange={(e) => setAllowReversed(e.target.checked)} /><span/><em>allow reversals</em></label>
            <ChromeButton onClick={initiateDraw}>{isDrawing ? 'SCANNING . . .' : 'INITIATE SHUFFLE'}</ChromeButton>
          </div>
        </section>
      </section>

      {!reading && !isDrawing && (
        <section className="idle-deck">
          <div className="deck-card back-1"/>
          <div className="deck-card back-2"/>
          <div className="deck-card back-3"><span>SOFT<br/>ARCANA</span></div>
          <p>SELECT A PROTOCOL // OPEN THE CHANNEL WHEN READY</p>
        </section>
      )}

      {isDrawing && (
        <section className="glass-panel console-panel">
          <div className="panel-label"><span>ACTIVE SCAN</span><i>please wait while the signal stabilizes</i></div>
          <div className="console-shell">
            {drawLog.map((line, index) => <p key={`${line}-${index}`}>{'>'} {line}</p>)}
            <p className="console-cursor">&gt; _</p>
          </div>
        </section>
      )}

      {reading && signalMeta && (
        <>
          <section className="glass-panel signal-summary">
            <div className="panel-label"><span>SESSION REPORT</span><i>{signalMeta.sessionId}</i></div>
            <div className="meta-grid">
              <div><span>Protocol</span><b>{signalMeta.protocol}</b></div>
              <div><span>Dominant suit</span><b>{signalMeta.dominantSuit}</b></div>
              <div><span>Major arcana</span><b>{signalMeta.majors}</b></div>
              <div><span>Reversals</span><b>{signalMeta.reversedCount}</b></div>
              <div><span>Noise index</span><b>{signalMeta.noiseIndex}</b></div>
              <div><span>Query state</span><b>{questionDraft.trim() ? 'LOCKED' : 'AMBIENT'}</b></div>
            </div>
            <div className="signal-callout">
              <p><b>{signalMeta.summary}</b></p>
              <p>{signalMeta.tone}</p>
              <p className="anomaly">ANOMALY NOTE // {signalMeta.anomaly}</p>
            </div>
          </section>

          <section className={`reading-grid count-${Math.min(reading.cards.length, 5)}`}>
            {reading.cards.map((item, i) => {
              const personal = cardNotes[item.card.id]
              return (
                <article className="drawn-card" key={`${item.card.id}-${i}`}>
                  <button className="card-button" onClick={() => onOpenCard(item.card)}>
                    <CardArt card={item.card} reversed={item.reversed} compact={reading.cards.length > 3} />
                  </button>
                  <div className="position-tag">{String(i + 1).padStart(2, '0')} // {item.position}</div>
                  <h3>{item.card.name} {item.reversed && <span>↧</span>}</h3>
                  <p className="standard-mini">{item.reversed ? item.card.reversed : item.card.upright}</p>
                  {personal?.[item.reversed ? 'reversed' : 'upright'] && <div className="wife-note"><span>HER NOTE</span>{personal[item.reversed ? 'reversed' : 'upright']}</div>}
                </article>
              )
            })}
          </section>

          <section className="synthesis glass-panel">
            <div className="panel-label"><span>STANDARD SYNTHESIS</span><i>generated from traditional card meanings</i></div>
            <p>{standardSynthesis}</p>
          </section>

          {[2,3].includes(reading.cards.length) && (
            <section className="personal-panel combo-panel">
              <div className="panel-label"><span>HER COMBINATION</span><i>stored for this exact pair / trio</i></div>
              <div className="combo-id">{reading.cards.map((x) => x.card.name).join(' + ')}</div>
              <textarea value={comboDraft} onChange={(e) => setComboDraft(e.target.value)} placeholder="When these cards show up together, what do they mean to you? This note will reappear whenever this exact combination is drawn again." />
              <ChromeButton onClick={saveCombo}>SAVE COMBINATION</ChromeButton>
            </section>
          )}

          <section className="personal-panel reading-note-panel">
            <div className="panel-label"><span>THIS READING</span><i>journal layer</i></div>
            <textarea value={readingDraft} onChange={(e) => setReadingDraft(e.target.value)} placeholder="What was the question? What landed? What happened afterward?" />
            <ChromeButton onClick={() => onSaveReading({ ...reading, note: readingDraft, query: questionDraft.trim(), signalMeta })}>ARCHIVE READING</ChromeButton>
          </section>
        </>
      )}
    </main>
  )
}

function LibraryView({ notes, onOpenCard }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'Major', 'Wands', 'Cups', 'Swords', 'Pentacles', 'Personalized']
  const cards = TAROT_CARDS.filter((card) => {
    const text = `${card.name} ${card.keywords} ${card.reversedKeywords}`.toLowerCase()
    const q = text.includes(query.toLowerCase())
    const f = filter === 'All' || card.suit === filter || (filter === 'Personalized' && notes[card.id] && Object.values(notes[card.id]).some(Boolean))
    return q && f
  })

  return (
    <main className="view library-view">
      <section className="page-head">
        <div className="eyebrow">CARD DATABASE // 78 OBJECTS</div>
        <h1>Card library.</h1>
        <p>Traditional references plus a private interpretation layer. Click any card to open the deeper file.</p>
      </section>
      <div className="search-shell"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search card or keyword"/></div>
      <div className="filter-row">{filters.map((x) => <button className={filter === x ? 'active' : ''} onClick={() => setFilter(x)} key={x}>{x}</button>)}</div>
      <section className="library-grid">
        {cards.map((card) => {
          const personalized = notes[card.id] && Object.values(notes[card.id]).some(Boolean)
          return (
            <button className="library-card" key={card.id} onClick={() => onOpenCard(card)}>
              <CardArt card={card} compact />
              <div><span>{card.suit}</span><b>{card.name}</b><small>{card.keywords}</small>{personalized && <em>● PERSONAL LAYER</em>}</div>
            </button>
          )
        })}
      </section>
    </main>
  )
}

function ArchiveView({ readings, onDelete, onImportComplete }) {
  const fileRef = useRef(null)

  const exportData = () => {
    const blob = new Blob([JSON.stringify(storage.exportAll(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `soft-arcana-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = async (file) => {
    if (!file) return
    const text = await file.text()
    const payload = JSON.parse(text)
    storage.importAll(payload)
    onImportComplete()
  }

  return (
    <main className="view archive-view">
      <section className="page-head">
        <div className="eyebrow">LOCAL MEMORY // PRIVATE</div>
        <h1>Reading archive.</h1>
        <p>The notebook survives refreshes. Export it before changing phones, because domestic prophecy deserves backups too.</p>
      </section>
      <section className="backup-bar glass-panel">
        <div><b>PORTABLE MEMORY</b><small>Download or restore every personal card note, combination, and archived reading.</small></div>
        <div>
          <ChromeButton onClick={exportData}>EXPORT JSON</ChromeButton>
          <ChromeButton className="ghost" onClick={() => fileRef.current?.click()}>IMPORT</ChromeButton>
          <input ref={fileRef} hidden type="file" accept="application/json" onChange={(e) => importData(e.target.files?.[0])}/>
        </div>
      </section>
      {readings.length === 0 ? (
        <div className="empty-archive"><span>NO SAVED SIGNALS</span><p>Archive a reading and it will appear here.</p></div>
      ) : (
        <section className="reading-list">
          {readings.map((r) => (
            <article className="archive-card" key={r.id}>
              <div className="archive-meta"><span>{r.spread.name}</span><time>{dateLabel(r.createdAt)}</time></div>
              {r.query && <div className="archive-query">Q // {r.query}</div>}
              <div className="archive-cards">{r.cards.map((x, i) => <div key={i}><CardArt card={x.card} reversed={x.reversed} compact /><small>{x.position}</small></div>)}</div>
              {r.note && <p>{r.note}</p>}
              <button className="text-button danger" onClick={() => onDelete(r.id)}>delete reading</button>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default function App() {
  const [tab, setTab] = useState('draw')
  const [selectedCard, setSelectedCard] = useState(null)
  const [cardNotes, setCardNotes] = useState(() => storage.getCardNotes())
  const [comboNotes, setComboNotes] = useState(() => storage.getComboNotes())
  const [readings, setReadings] = useState(() => storage.getReadings())
  const [toast, setToast] = useState('')
  const [booted, setBooted] = useState(false)

  const showToast = (text) => {
    setToast(text)
    window.setTimeout(() => setToast(''), 1800)
  }

  const saveCardNote = (card, note) => {
    const next = { ...cardNotes, [card.id]: note }
    setCardNotes(next)
    storage.setCardNotes(next)
    showToast('PERSONAL MEANING SAVED')
  }

  const saveReading = (reading) => {
    const next = [reading, ...readings]
    setReadings(next)
    storage.setReadings(next)
    showToast('READING ARCHIVED')
  }

  const deleteReading = (id) => {
    const next = readings.filter((x) => x.id !== id)
    setReadings(next)
    storage.setReadings(next)
  }

  const reloadFromStorage = () => {
    setCardNotes(storage.getCardNotes())
    setComboNotes(storage.getComboNotes())
    setReadings(storage.getReadings())
    showToast('MEMORY RESTORED')
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-a"/>
      <div className="ambient ambient-b"/>
      <div className="scanlines"/>
      <div className="ticker">SOFT//ARCANA ::: PRIVATE DIVINATION PROGRAM ::: DOMESTIC ORACLE ACTIVE ::: TRUST THE SYMBOLIC SIDE-CHANNEL</div>
      <header className="topbar">
        <div className="brand"><i/><b>SOFT//ARCANA</b><span>PERSONAL TAROT SYSTEM // 2001ish</span></div>
        <div className="status"><span>78</span> CARDS ONLINE</div>
      </header>
      {tab === 'draw' && <DrawView cardNotes={cardNotes} comboNotes={comboNotes} setComboNotes={setComboNotes} onOpenCard={setSelectedCard} onSaveReading={saveReading}/>} 
      {tab === 'library' && <LibraryView notes={cardNotes} onOpenCard={setSelectedCard}/>} 
      {tab === 'archive' && <ArchiveView readings={readings} onDelete={deleteReading} onImportComplete={reloadFromStorage}/>} 
      <nav className="bottom-nav">
        <button className={tab === 'draw' ? 'active' : ''} onClick={() => setTab('draw')}><span>✦</span><b>DRAW</b></button>
        <button className={tab === 'library' ? 'active' : ''} onClick={() => setTab('library')}><span>▦</span><b>CARDS</b></button>
        <button className={tab === 'archive' ? 'active' : ''} onClick={() => setTab('archive')}><span>◌</span><b>ARCHIVE</b></button>
      </nav>
      {selectedCard && <CardDetail card={selectedCard} note={cardNotes[selectedCard.id]} onSave={(note) => saveCardNote(selectedCard, note)} onClose={() => setSelectedCard(null)}/>} 
      {toast && <div className="toast">{toast}</div>}
      {!booted && <BootScreen onEnter={() => setBooted(true)} />}
    </div>
  )
}
