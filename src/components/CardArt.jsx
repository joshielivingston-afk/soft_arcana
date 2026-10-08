import React from 'react'

const PALETTES = {
  Major: ['#eadfd8', '#cba9ac', '#6f5767', '#27222b', '#a9b49c'],
  Wands: ['#e8d5cb', '#c6907d', '#744a49', '#2a2528', '#b6a47c'],
  Cups: ['#e8e1df', '#b7b9c8', '#707e95', '#262733', '#c9a9b5'],
  Swords: ['#ece7e2', '#aeb8b9', '#687176', '#22262a', '#b59aa1'],
  Pentacles: ['#e8e0cf', '#b7b090', '#68725d', '#252922', '#c5a5a0'],
}

const HERO_ART = {
  'major-00': 0,
  'major-01': 1,
  'major-02': 2,
  'major-03': 3,
  'major-13': 4,
  'major-18': 5,
  'cups-01': 6,
  'swords-03': 7,
  'wands-06': 8,
  'pentacles-13': 9,
}
const MAJOR_SCENES = [
  ['cliff', 'white moth', 'tiny suitcase'],
  ['table', 'wand', 'four objects'],
  ['curtain', 'black pool', 'moon'],
  ['garden', 'pear tree', 'velvet chair'],
  ['stone chair', 'iron gate', 'ram horns'],
  ['book', 'two keys', 'empty hall'],
  ['two figures', 'rose arbor', 'split path'],
  ['carriage', 'black horse', 'white horse'],
  ['girl', 'lion', 'ribbon'],
  ['lantern', 'snow path', 'hooded figure'],
  ['wheel', 'ribbons', 'four corners'],
  ['scales', 'sword', 'red curtain'],
  ['hanging figure', 'willow', 'halo of moths'],
  ['black horse', 'white flowers', 'dawn'],
  ['two cups', 'stream', 'iris'],
  ['horned shadow', 'two dolls', 'chain'],
  ['tower', 'lightning', 'falling crown'],
  ['pool', 'eight-point star', 'white bird'],
  ['two towers', 'moon', 'dog and wolf'],
  ['sunflower', 'child', 'white horse'],
  ['rising figures', 'silver trumpet', 'fog'],
  ['wreath', 'dancer', 'four creatures'],
]

function seeded(id) {
  let x = 2166136261
  for (let i = 0; i < id.length; i++) x = Math.imul(x ^ id.charCodeAt(i), 16777619)
  return () => {
    x += x << 13; x ^= x >>> 7; x += x << 3; x ^= x >>> 17; x += x << 5
    return ((x >>> 0) % 10000) / 10000
  }
}

function Flower({ x, y, r = 5, fill = '#d8b6b8', dark = '#6e555f' }) {
  return <g transform={`translate(${x} ${y})`}>
    {[0,60,120,180,240,300].map((deg) => <ellipse key={deg} rx={r * .46} ry={r} fill={fill} opacity=".88" transform={`rotate(${deg}) translate(0 ${-r * .55})`} />)}
    <circle r={r * .32} fill={dark} />
  </g>
}

function Moth({ x, y, s = 1, pale = '#eadfd8', dark = '#574752' }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`} opacity=".9">
    <path d="M0 1 C-9 -9 -18 -8 -17 1 C-16 9 -7 11 0 4 C7 11 16 9 17 1 C18 -8 9 -9 0 1Z" fill={pale} stroke={dark} strokeWidth=".8"/>
    <path d="M0 -1 L0 10" stroke={dark} strokeWidth="1"/>
  </g>
}

function Arch({ palette }) {
  return <path d="M38 205V78C38 34 62 13 90 13s52 21 52 65v127" fill="none" stroke={palette[3]} strokeOpacity=".52" strokeWidth="2" />
}

function MinorScene({ card, palette, rand }) {
  const rank = card.name.split(' ')[0]
  const count = Math.max(1, Math.min(10, card.number || 1))
  const court = ['Page','Knight','Queen','King'].includes(rank)
  const positions = Array.from({ length: count }, (_, i) => ({
    x: 40 + (i % 3) * 50 + rand() * 14,
    y: 60 + Math.floor(i / 3) * 38 + rand() * 14,
  }))

  if (court) {
    const crown = rank === 'King' || rank === 'Queen'
    return <>
      <ellipse cx="90" cy="103" rx="45" ry="57" fill={palette[1]} opacity=".24"/>
      <path d="M58 181 C62 140 65 127 90 124 C115 127 119 140 123 181Z" fill={palette[3]} opacity=".88"/>
      <circle cx="90" cy="95" r="20" fill={palette[0]} stroke={palette[3]} strokeWidth="1.4"/>
      <path d="M72 91 Q90 73 108 91" fill="none" stroke={palette[3]} strokeWidth="3"/>
      {crown && <path d="M73 75 L80 62 L89 72 L99 58 L108 75Z" fill={palette[4]} stroke={palette[3]} strokeWidth="1"/>}
      {rank === 'Knight' && <path d="M53 151 Q26 143 31 119 Q47 113 66 129" fill="none" stroke={palette[3]} strokeWidth="7" strokeLinecap="round"/>}
      {rank === 'Page' && <Moth x={90} y={49} s={1.1} pale={palette[0]} dark={palette[3]} />}
      {card.suit === 'Cups' && <path d="M80 145 H100 L96 159 H84Z" fill="none" stroke={palette[4]} strokeWidth="2"/>}
      {card.suit === 'Wands' && <path d="M105 165 L119 74" stroke={palette[4]} strokeWidth="4" strokeLinecap="round"/>}
      {card.suit === 'Swords' && <path d="M106 165 L119 69 M114 91 H125" stroke={palette[0]} strokeWidth="2"/>}
      {card.suit === 'Pentacles' && <circle cx="112" cy="139" r="11" fill="none" stroke={palette[4]} strokeWidth="2"/>}
    </>
  }

  return <>
    {positions.map((p, i) => {
      if (card.suit === 'Wands') return <g key={i} transform={`rotate(${(rand()-.5)*24} ${p.x} ${p.y})`}><path d={`M${p.x} ${p.y+19} Q${p.x-5} ${p.y} ${p.x+2} ${p.y-19}`} stroke={palette[3]} strokeWidth="3" strokeLinecap="round"/><path d={`M${p.x} ${p.y-5} q10 -8 14 -1`} fill="none" stroke={palette[4]} strokeWidth="1.4"/></g>
      if (card.suit === 'Cups') return <g key={i}><path d={`M${p.x-10} ${p.y-12} Q${p.x} ${p.y-5} ${p.x+10} ${p.y-12} L${p.x+6} ${p.y+5} Q${p.x} ${p.y+10} ${p.x-6} ${p.y+5}Z`} fill={palette[0]} fillOpacity=".34" stroke={palette[3]} strokeWidth="1.3"/><path d={`M${p.x} ${p.y+6} V${p.y+16} M${p.x-6} ${p.y+17} H${p.x+6}`} stroke={palette[3]} strokeWidth="1.3"/></g>
      if (card.suit === 'Swords') return <g key={i} transform={`rotate(${(rand()-.5)*38} ${p.x} ${p.y})`}><path d={`M${p.x} ${p.y+18} L${p.x} ${p.y-17}`} stroke={palette[0]} strokeWidth="2.1"/><path d={`M${p.x-6} ${p.y+8} H${p.x+6}`} stroke={palette[3]} strokeWidth="2"/><path d={`M${p.x} ${p.y-20} l-3 6 h6Z`} fill={palette[0]}/></g>
      return <g key={i}><circle cx={p.x} cy={p.y} r="11" fill={palette[4]} fillOpacity=".3" stroke={palette[3]} strokeWidth="1.3"/><path d={`M${p.x} ${p.y-7} L${p.x+6.6} ${p.y+2.1} L${p.x-4.1} ${p.y-5.7} L${p.x+4.1} ${p.y-5.7} L${p.x-6.6} ${p.y+2.1} Z`} fill="none" stroke={palette[3]} strokeWidth=".8"/></g>
    })}
    {Array.from({ length: 4 }, (_, i) => <Flower key={`f${i}`} x={25 + i * 43 + rand()*9} y={190 - rand()*20} r={3.2 + rand()*2.4} fill={palette[1]} dark={palette[3]} />)}
  </>
}

function MajorScene({ card, palette, rand }) {
  const scene = MAJOR_SCENES[card.number] || MAJOR_SCENES[0]
  const n = card.number
  const central = [
    <path key="0" d="M50 173 Q88 132 130 173 Q108 163 90 117 Q73 160 50 173Z" fill={palette[3]} opacity=".86"/>,
    <g key="1"><circle cx="90" cy="105" r="26" fill={palette[0]} fillOpacity=".24" stroke={palette[3]}/><path d="M90 44V167M52 105H128" stroke={palette[3]} strokeWidth="2"/><circle cx="90" cy="105" r="8" fill={palette[4]}/></g>,
    <g key="2"><path d="M55 44 Q90 70 125 44 V170 Q90 142 55 170Z" fill={palette[3]} opacity=".6"/><circle cx="90" cy="105" r="19" fill={palette[0]} opacity=".72"/></g>,
    <g key="3"><path d="M54 167 Q55 107 90 83 Q125 107 126 167Z" fill={palette[1]} opacity=".44"/><path d="M47 180 Q90 158 133 180" fill="none" stroke={palette[3]} strokeWidth="4"/>{[58,76,95,116].map((x,i)=><Flower key={i} x={x} y={156-i%2*12} r="5" fill={palette[0]} dark={palette[3]}/>)}</g>,
    <g key="4"><rect x="59" y="76" width="62" height="86" rx="5" fill={palette[3]} opacity=".72"/><path d="M55 80 L68 53 L77 76 L91 45 L102 76 L115 56 L125 80Z" fill={palette[4]} opacity=".8"/></g>,
    <g key="5"><rect x="49" y="66" width="82" height="105" rx="4" fill={palette[0]} opacity=".22" stroke={palette[3]}/><path d="M90 66V171M49 86H131" stroke={palette[3]} opacity=".8"/><circle cx="70" cy="126" r="7" fill={palette[4]}/><circle cx="110" cy="126" r="7" fill={palette[4]}/></g>,
    <g key="6"><path d="M62 164 Q62 119 78 102 Q90 119 90 164Z" fill={palette[3]} opacity=".82"/><path d="M90 164 Q90 119 103 96 Q121 121 121 164Z" fill={palette[1]} opacity=".7"/><path d="M77 91 Q90 74 103 91" fill="none" stroke={palette[4]} strokeWidth="2"/></g>,
    <g key="7"><path d="M47 151 Q90 126 133 151 L125 174 H55Z" fill={palette[3]} opacity=".82"/><circle cx="64" cy="174" r="9" fill={palette[4]}/><circle cx="116" cy="174" r="9" fill={palette[4]}/><path d="M51 149 Q34 118 23 143M129 149 Q146 118 157 143" fill="none" stroke={palette[3]} strokeWidth="5"/></g>,
    <g key="8"><circle cx="112" cy="121" r="29" fill={palette[3]} opacity=".72"/><path d="M101 105 Q112 88 123 105" fill="none" stroke={palette[0]} strokeWidth="2"/><path d="M53 172 Q60 118 80 105 Q96 122 94 172Z" fill={palette[1]} opacity=".62"/><path d="M82 118 Q98 113 108 120" fill="none" stroke={palette[0]} strokeWidth="2"/></g>,
    <g key="9"><path d="M61 171 Q62 109 87 94 Q111 115 116 171Z" fill={palette[3]} opacity=".82"/><circle cx="105" cy="70" r="13" fill={palette[0]} fillOpacity=".25" stroke={palette[4]} strokeWidth="2"/><path d="M105 83 L93 123" stroke={palette[4]} strokeWidth="2"/></g>,
    <g key="10"><circle cx="90" cy="108" r="47" fill="none" stroke={palette[3]} strokeWidth="4"/><circle cx="90" cy="108" r="27" fill="none" stroke={palette[4]} strokeWidth="2"/><path d="M90 61V155M43 108H137M57 75L123 141M123 75L57 141" stroke={palette[3]} strokeWidth="1.3"/></g>,
    <g key="11"><path d="M90 52V161M74 72H106" stroke={palette[0]} strokeWidth="2.3"/><path d="M51 105H129M60 105L48 128H72ZM120 105L108 128H132Z" fill="none" stroke={palette[4]} strokeWidth="2"/></g>,
    <g key="12"><path d="M91 43V91M91 43Q77 50 65 44" stroke={palette[3]} strokeWidth="3"/><path d="M91 89 Q63 110 74 150 Q91 165 108 150 Q116 112 91 89Z" fill={palette[1]} opacity=".63"/><circle cx="91" cy="162" r="13" fill={palette[0]} opacity=".25"/></g>,
    <g key="13"><path d="M42 154 Q90 104 138 154" fill={palette[3]} opacity=".82"/><circle cx="91" cy="90" r="25" fill={palette[0]} opacity=".72"/><path d="M82 87H86M96 87H100M85 100Q91 104 97 100" stroke={palette[3]} strokeWidth="1.5" fill="none"/>{[51,70,111,131].map((x,i)=><Flower key={i} x={x} y={171-i%2*8} r="5" fill={palette[0]} dark={palette[3]}/>)}</g>,
    <g key="14"><path d="M57 77 Q70 68 82 77 L78 112 Q69 121 61 112Z" fill="none" stroke={palette[3]} strokeWidth="2"/><path d="M98 112 Q110 103 122 112 L118 147 Q109 156 101 147Z" fill="none" stroke={palette[3]} strokeWidth="2"/><path d="M80 108 Q90 118 100 116" stroke={palette[4]} strokeWidth="2" fill="none"/></g>,
    <g key="15"><path d="M90 56 Q58 70 59 117 Q61 159 90 168 Q120 159 121 117 Q123 70 90 56Z" fill={palette[3]} opacity=".78"/><path d="M69 69L56 48M111 69L124 48" stroke={palette[3]} strokeWidth="5" strokeLinecap="round"/><circle cx="76" cy="115" r="7" fill={palette[1]}/><circle cx="104" cy="115" r="7" fill={palette[1]}/></g>,
    <g key="16"><path d="M61 163V62H119V163Z" fill={palette[3]} opacity=".72"/><path d="M53 62H127L117 45H64Z" fill={palette[4]} opacity=".62"/><path d="M131 35L95 95L116 92L82 145" stroke={palette[0]} strokeWidth="4" fill="none"/></g>,
    <g key="17"><circle cx="90" cy="57" r="15" fill={palette[0]} opacity=".72"/><path d="M90 33V81M66 57H114M73 40L107 74M107 40L73 74" stroke={palette[4]} strokeWidth="1.8"/><path d="M53 171 Q80 138 90 110 Q101 140 127 171" fill={palette[1]} opacity=".38"/></g>,
    <g key="18"><circle cx="90" cy="63" r="25" fill={palette[0]} opacity=".38"/><path d="M50 169V102H70V169M110 169V102H130V169" fill={palette[3]} opacity=".78"/><path d="M70 165 Q90 137 110 165" fill="none" stroke={palette[4]} strokeWidth="2"/></g>,
    <g key="19"><circle cx="90" cy="64" r="30" fill={palette[4]} opacity=".55"/><path d="M90 24V104M50 64H130M62 36L118 92M118 36L62 92" stroke={palette[0]} strokeWidth="2"/>{[58,76,98,119].map((x,i)=><Flower key={i} x={x} y={160-i%2*10} r="7" fill={palette[1]} dark={palette[3]}/>)}</g>,
    <g key="20"><path d="M48 167 Q63 122 78 167M76 167 Q90 112 104 167M102 167 Q117 124 132 167" fill={palette[1]} opacity=".5"/><path d="M52 66 Q90 42 128 66" stroke={palette[4]} strokeWidth="3" fill="none"/><circle cx="90" cy="57" r="11" fill={palette[0]} opacity=".42"/></g>,
    <g key="21"><ellipse cx="90" cy="109" rx="43" ry="60" fill="none" stroke={palette[4]} strokeWidth="6" opacity=".7"/><path d="M82 160 Q68 118 88 95 Q102 77 110 54" stroke={palette[3]} strokeWidth="8" fill="none" strokeLinecap="round"/><Moth x={49} y={54} s={.8} pale={palette[0]} dark={palette[3]}/><Moth x={130} y={54} s={.8} pale={palette[0]} dark={palette[3]}/></g>,
  ]
  return <>
    {central[n]}
    <text x="90" y="200" textAnchor="middle" fill={palette[3]} opacity=".7" fontSize="5" fontFamily="serif">{scene.join(' · ')}</text>
    {Array.from({ length: 3 }, (_, i) => <Moth key={i} x={22 + rand()*136} y={35 + rand()*130} s={.45 + rand()*.35} pale={palette[0]} dark={palette[3]} />)}
  </>
}

export default function CardArt({ card, reversed = false, small = false, reveal = true, className = '' }) {
  const palette = PALETTES[card.suit] || PALETTES.Major
  const rand = seeded(card.id)
  const label = String(card.number).padStart(2, '0')
  const heroIndex = HERO_ART[card.id]
  const hasHero = heroIndex !== undefined

  return <div className={`morute-card ${hasHero ? 'has-hero-art' : 'has-fallback-art'} ${reversed ? 'is-reversed' : ''} ${small ? 'is-small' : ''} ${reveal ? 'is-revealed' : ''} ${className}`}>
    <div className="morute-card-inner">
      <div className="morute-card-back">
        <div className="back-lace"/>
        <div className="back-oval"><Moth x={90} y={110} s={2.15} pale="#efe5de" dark="#4a3947"/></div>
        <span>SOFT ARCANA</span>
      </div>
      <div className="morute-card-front">
        {hasHero ? <>
          <div className="hero-card-image" role="img" aria-label={`${card.name} illustrated tarot card`} style={{ '--hero-index': heroIndex }}/>
          <div className="hero-card-glaze"/>
        </> : <>
          <svg viewBox="0 0 180 260" role="img" aria-label={`${card.name} tarot card illustration`}>
            <defs>
              <linearGradient id={`paper-${card.id}`} x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor={palette[0]}/>
                <stop offset=".55" stopColor={palette[1]}/>
                <stop offset="1" stopColor={palette[2]}/>
              </linearGradient>
              <filter id={`blur-${card.id}`}><feGaussianBlur stdDeviation="8"/></filter>
            </defs>
            <rect width="180" height="260" rx="8" fill={`url(#paper-${card.id})`}/>
            <circle cx={25 + rand()*120} cy={45 + rand()*120} r="40" fill={palette[0]} opacity=".24" filter={`url(#blur-${card.id})`}/>
            <rect x="9" y="9" width="162" height="242" rx="7" fill="none" stroke={palette[3]} strokeOpacity=".45"/>
            <rect x="14" y="14" width="152" height="232" rx="5" fill="none" stroke={palette[0]} strokeOpacity=".42"/>
            <Arch palette={palette}/>
            {card.suit === 'Major' ? <MajorScene card={card} palette={palette} rand={rand}/> : <MinorScene card={card} palette={palette} rand={rand}/>} 
            <path d="M20 216 Q90 204 160 216" fill="none" stroke={palette[3]} strokeOpacity=".38"/>
            <text x="20" y="232" fill={palette[3]} fontFamily="Georgia, serif" fontSize="6.5" letterSpacing="1.1">{label} · {card.suit.toUpperCase()}</text>
            <text x="90" y="244" textAnchor="middle" fill={palette[3]} fontFamily="Georgia, serif" fontWeight="700" fontSize="9.4" letterSpacing="1.1">{card.name.toUpperCase()}</text>
          </svg>
          <div className="card-grain"/>
        </>}
      </div>
    </div>
  </div>
}
