import React, { useMemo, useRef, useState } from 'react'
import { TAROT_CARDS } from './data/tarot.js'
import { SPREADS } from './data/spreads.js'
import { FAIRY_MESSAGES, FLOATING_WORDS, RITUAL_EXERCISES } from './data/ritual.js'
import { learningFor, SOURCE_NOTE } from './data/learning.js'
import { storage } from './lib/storage.js'
import { startAmbient, stopAmbient } from './lib/ambient.js'
import CardArt from './components/CardArt.jsx'

const uid=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`
const rnd=a=>a[Math.floor(Math.random()*a.length)]
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
const dateLabel=iso=>new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(iso))
const comboKey=cards=>cards.map(x=>x.card.id).sort().join('::')

function Button({children,variant='ink',...props}){return <button className={`ink-button ${variant}`} {...props}>{children}</button>}
function MusicButton({on,onToggle}){return <button className="music-button" onClick={onToggle}>{on?'♫':'♩'} <span>{on?'sound on':'sound off'}</span></button>}

function Threshold({music,setMusic,onDone}){
  const [step,setStep]=useState(0)
  const exercises=useMemo(()=>shuffle(RITUAL_EXERCISES).slice(0,2),[])
  const message=useMemo(()=>rnd(FAIRY_MESSAGES),[])
  const words=useMemo(()=>shuffle(FLOATING_WORDS).slice(0,14),[])
  const toggle=async()=>{const n=!music;setMusic(n);n?await startAmbient():stopAmbient()}
  const begin=async()=>{if(music)await startAmbient();setStep(1)}
  if(step===0)return <div className="threshold threshold-home">
    <div className="ghosts"><img src="./cards/major-18.webp"/><img src="./cards/major-02.webp"/><img src="./cards/cups-01.webp"/></div>
    {words.map((w,i)=><i className="floating-word" key={w} style={{left:`${6+(i*17)%88}%`,top:`${7+(i*29)%82}%`,animationDelay:`${-i*.55}s`}}>{w}</i>)}
    <section className="threshold-copy"><span>❦</span><h1>SOFT ARCANA</h1><p>Leave the useful world at the door for a minute.</p><Button onClick={begin}>enter slowly</Button><button className="ghost-link" onClick={onDone}>skip the threshold</button></section>
    <MusicButton on={music} onToggle={toggle}/>
  </div>
  if(step<3){const ex=exercises[step-1];return <div className="threshold exercise"><section><small>{step} / 2</small><div className="breathing-orb"/><h2>{ex.title}</h2><p>{ex.instruction}</p>{ex.words&&<div className="word-triptych">{ex.words.map(w=><span key={w}>{w}</span>)}</div>}<Button onClick={()=>setStep(step+1)}>continue</Button><button className="ghost-link" onClick={onDone}>skip the threshold</button></section><MusicButton on={music} onToggle={toggle}/></div>}
  return <div className="threshold fairy-screen"><div className="fairy"><div className="wing left"/><div className="wing right"/><div className="fairy-head"/><div className="fairy-body"/></div><section className="fairy-message"><small>something came through</small><blockquote>{message}</blockquote><Button onClick={onDone}>take it with you</Button></section><MusicButton on={music} onToggle={toggle}/></div>
}

function Composer({history,onSave}){
  const latest=history.at(-1)||{}
  const [d,setD]=useState({upright:latest.upright||'',reversed:latest.reversed||'',associations:latest.associations||'',context:''})
  return <div className="composer"><h3>your next layer</h3><small>saving creates a new version; earlier versions remain</small>
    <label>Upright<textarea value={d.upright} onChange={e=>setD({...d,upright:e.target.value})}/></label>
    <label>Reversed<textarea value={d.reversed} onChange={e=>setD({...d,reversed:e.target.value})}/></label>
    <label>Images, memories, dreams<textarea value={d.associations} onChange={e=>setD({...d,associations:e.target.value})}/></label>
    <label>This encounter<textarea value={d.context} onChange={e=>setD({...d,context:e.target.value})}/></label>
    <Button onClick={()=>onSave(d)}>archive this iteration</Button>
  </div>
}

function CardModal({card,history,onSave,onClose}){
  const l=learningFor(card)
  return <div className="modal" onMouseDown={onClose}><section className="codex" onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={onClose}>×</button><div className="codex-top"><CardArt card={card}/><div><small>{card.arcana} · {card.element}</small><h2>{card.name}</h2><h4>upright</h4><b>{card.keywords}</b><p>{card.upright}</p><h4>reversed</h4><b>{card.reversedKeywords}</b><p>{card.reversed}</p></div></div><div className="teaching"><b>how to learn this card</b><p>{l.lesson}</p>{l.numberLesson&&<p>{l.numberLesson}</p>}<p>{l.anchor}</p></div><Composer history={history} onSave={onSave}/><h3>interpretation history</h3>{!history.length?<p className="empty">No personal layer yet.</p>:[...history].reverse().map((x,i)=><article className="history" key={x.id}><header><b>version {history.length-i}</b><time>{dateLabel(x.createdAt)}</time></header>{x.upright&&<p><span>upright</span>{x.upright}</p>}{x.reversed&&<p><span>reversed</span>{x.reversed}</p>}{x.associations&&<p><span>associations</span>{x.associations}</p>}{x.context&&<p><span>encounter</span>{x.context}</p>}</article>)}</section></div>
}

function DrawView({interpretations,combos,setCombos,onCard,onArchive}){
  const [spreadId,setSpreadId]=useState('past-present-future'),[question,setQuestion]=useState(''),[rev,setRev]=useState(true),[reading,setReading]=useState(null),[revealed,setRevealed]=useState(0),[note,setNote]=useState(''),[combo,setCombo]=useState('')
  const spread=SPREADS.find(s=>s.id===spreadId)
  const draw=()=>{const cards=shuffle(TAROT_CARDS).slice(0,spread.count).map((card,i)=>({card,position:spread.positions[i],reversed:rev&&Math.random()<.28}));const r={id:uid(),createdAt:new Date().toISOString(),question:question.trim(),spread,cards};setReading(r);setRevealed(0);setNote('');setCombo((combos[comboKey(cards)]||[]).at(-1)?.text||'');cards.forEach((_,i)=>setTimeout(()=>setRevealed(i+1),420*(i+1)))}
  const saveCombo=()=>{if(!reading||![2,3].includes(reading.cards.length)||!combo.trim())return;const k=comboKey(reading.cards),next={...combos,[k]:[...(combos[k]||[]),{id:uid(),createdAt:new Date().toISOString(),text:combo.trim()}]};setCombos(next);storage.setCombinationHistory(next)}
  return <main className="view"><header className="page-intro"><small>the reading room</small><h1>Ask less. Notice more.</h1><p>Traditional meanings are the floor; your own repeated encounters build the room.</p></header><section className="paper-panel controls"><label>Question<textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="What is asking for attention?"/></label><div className="spread-row">{SPREADS.map(s=><button className={s.id===spreadId?'active':''} onClick={()=>setSpreadId(s.id)} key={s.id}>{s.name}</button>)}</div><div className="draw-row"><label><input type="checkbox" checked={rev} onChange={e=>setRev(e.target.checked)}/> allow reversals</label><Button onClick={draw}>draw the cards</Button></div></section>{!reading?<div className="waiting"><div className="deck-back">❦<span>SOFT ARCANA</span></div></div>:<><section className={`reading-grid count-${Math.min(reading.cards.length,5)}`}>{reading.cards.map((x,i)=><article key={i} className={`reading-card ${i<revealed?'revealed':''}`}><button onClick={()=>onCard(x.card)}><CardArt card={x.card} reversed={x.reversed} reveal={i<revealed}/></button><small>{x.position}</small><h3>{x.card.name}{x.reversed?' ↧':''}</h3><p>{x.reversed?x.card.reversed:x.card.upright}</p>{(interpretations[x.card.id]||[]).at(-1)&&<aside><b>latest personal layer</b>{(interpretations[x.card.id]||[]).at(-1)[x.reversed?'reversed':'upright']}</aside>}</article>)}</section>{[2,3].includes(reading.cards.length)&&<section className="paper-panel combo"><h3>this combination</h3><textarea value={combo} onChange={e=>setCombo(e.target.value)} placeholder="What do these cards mean together?"/><Button onClick={saveCombo}>archive combination layer</Button></section>}<section className="paper-panel combo"><h3>reading journal</h3><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="What landed? What changed afterward?"/><Button onClick={()=>onArchive({...reading,note})}>keep this reading</Button></section></>}</main>
}

function StudyView({interpretations,study,setStudy,onCard}){
  const [card,setCard]=useState(()=>rnd(TAROT_CARDS)),[reversed,setReversed]=useState(()=>Math.random()<.35),[show,setShow]=useState(false)
  const next=()=>{setCard(rnd(TAROT_CARDS));setReversed(Math.random()<.35);setShow(false)}
  const rate=known=>{const s={...study,[card.id]:{known:(study[card.id]?.known||0)+(known?1:0),missed:(study[card.id]?.missed||0)+(known?0:1)}};setStudy(s);storage.setStudy(s);next()}
  const l=learningFor(card),mine=(interpretations[card.id]||[]).at(-1)
  return <main className="view"><header className="page-intro"><small>the study room</small><h1>Learn the cards by meeting them.</h1><p>Recall first. Reveal second. Add your own understanding whenever it becomes more precise.</p></header><section className="flash-stage"><div className="flash-card"><CardArt card={card} reversed={reversed}/></div><div className="flash-copy"><small>{reversed?'reversed':'upright'} · {(study[card.id]?.known||0)} known / {(study[card.id]?.missed||0)} again</small><h2>{card.name}</h2>{!show?<><p>Before revealing, say the meaning aloud or hold it in mind.</p><Button onClick={()=>setShow(true)}>reveal meaning</Button></>:<><b>{reversed?card.reversedKeywords:card.keywords}</b><p>{reversed?card.reversed:card.upright}</p><div className="teaching"><p>{l.lesson}</p>{l.numberLesson&&<p>{l.numberLesson}</p>}<p>{l.anchor}</p></div>{mine&&<aside><b>your latest language</b><p>{mine[reversed?'reversed':'upright']||mine.associations}</p></aside>}<div className="study-actions"><Button variant="pale" onClick={()=>rate(false)}>again</Button><Button onClick={()=>rate(true)}>I knew it</Button></div></>}<button className="ghost-link" onClick={()=>onCard(card)}>study / add interpretation</button></div></section></main>
}

function CardsView({interpretations,onCard}){
  const [q,setQ]=useState(''),[filter,setFilter]=useState('All');const filters=['All','Major','Wands','Cups','Swords','Pentacles','Personalized'];const cards=TAROT_CARDS.filter(c=>`${c.name} ${c.keywords} ${c.reversedKeywords}`.toLowerCase().includes(q.toLowerCase())&&(filter==='All'||c.suit===filter||(filter==='Personalized'&&(interpretations[c.id]||[]).length)))
  return <main className="view"><header className="page-intro"><small>the card cabinet · 78</small><h1>Every card is a room.</h1><p>Browse the traditional reference and watch your personal understanding change version by version.</p></header><div className="library-tools"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="search names or meanings"/><div>{filters.map(f=><button className={f===filter?'active':''} onClick={()=>setFilter(f)} key={f}>{f}</button>)}</div></div><section className="card-grid">{cards.map(c=><button className="library-tile" onClick={()=>onCard(c)} key={c.id}><CardArt card={c} small/><div><small>{c.suit}</small><b>{c.name}</b><span>{c.keywords}</span><em>{(interpretations[c.id]||[]).length?`${(interpretations[c.id]||[]).length} personal layers`:'unwritten'}</em></div></button>)}</section></main>
}

const download=(text,name,type)=>{const b=new Blob([text],{type}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;a.click();URL.revokeObjectURL(u)}
function MemoryView({interpretations,combos,readings,study,onDelete,onImport}){
  const input=useRef(null)
  const exportObj=()=>({version:4,app:'Soft Arcana',exportedAt:new Date().toISOString(),sourceNote:SOURCE_NOTE,cards:TAROT_CARDS.map(c=>({id:c.id,name:c.name,arcana:c.arcana,suit:c.suit,traditional:{uprightKeywords:c.keywords,uprightMeaning:c.upright,reversedKeywords:c.reversedKeywords,reversedMeaning:c.reversed,learning:learningFor(c)},personalInterpretationHistory:interpretations[c.id]||[],study:study[c.id]||{known:0,missed:0}})),combinationHistory:combos,readings,study})
  const exportJson=()=>download(JSON.stringify(exportObj(),null,2),`soft-arcana-complete-${new Date().toISOString().slice(0,10)}.json`,'application/json')
  const exportMd=()=>{const d=exportObj(),l=['# Soft Arcana — Complete Card Notebook','',d.sourceNote,''];d.cards.forEach(c=>{l.push(`## ${c.name}`,'',`**Upright:** ${c.traditional.uprightKeywords}`,'',c.traditional.uprightMeaning,'',`**Reversed:** ${c.traditional.reversedKeywords}`,'',c.traditional.reversedMeaning,'','### Personal interpretation history','');if(!c.personalInterpretationHistory.length)l.push('_No personal interpretations yet._','');c.personalInterpretationHistory.forEach((x,i)=>l.push(`#### Version ${i+1} — ${x.createdAt}`,'',x.upright?`- Upright: ${x.upright}`:'',x.reversed?`- Reversed: ${x.reversed}`:'',x.associations?`- Associations: ${x.associations}`:'',x.context?`- Context: ${x.context}`:'',''))});download(l.join('\n'),`soft-arcana-notebook-${new Date().toISOString().slice(0,10)}.md`,'text/markdown')}
  const importFile=async f=>{if(!f)return;const p=JSON.parse(await f.text());if(p.cards){const rebuilt={};p.cards.forEach(c=>rebuilt[c.id]=c.personalInterpretationHistory||[]);storage.setInterpretations(rebuilt);storage.setCombinationHistory(p.combinationHistory||{});storage.setReadings(p.readings||[]);storage.setStudy(p.study||{})}else storage.importAll(p);onImport()}
  return <main className="view"><header className="page-intro"><small>the archive</small><h1>Nothing has to disappear.</h1><p>Every personal interpretation is append-only. Export the whole evolving notebook whenever you want a permanent copy.</p></header><section className="paper-panel export-panel"><h3>All 78 cards + traditional meanings + every personal iteration.</h3><div><Button onClick={exportJson}>export JSON</Button><Button variant="pale" onClick={exportMd}>export readable notebook</Button><Button variant="pale" onClick={()=>input.current.click()}>restore backup</Button><input ref={input} hidden type="file" accept="application/json" onChange={e=>importFile(e.target.files?.[0])}/></div></section><section className="retention"><b>about memory</b><p>This version saves locally on this browser and device. Closing the app or returning weeks later should keep it. Clearing site data, private browsing, or changing devices can erase local storage; exports are the permanent copy.</p></section><h3>saved readings · {readings.length}</h3>{readings.map(r=><article className="archive-reading" key={r.id}><header><b>{r.spread.name}</b><time>{dateLabel(r.createdAt)}</time></header>{r.question&&<blockquote>{r.question}</blockquote>}<div className="archive-strip">{r.cards.map((x,i)=><div key={i}><CardArt card={x.card} reversed={x.reversed} small/><small>{x.position}</small></div>)}</div>{r.note&&<p>{r.note}</p>}<button onClick={()=>onDelete(r.id)}>remove reading</button></article>)}</main>
}

export default function App(){
  const [tab,setTab]=useState('draw'),[selected,setSelected]=useState(null),[interpretations,setInterpretations]=useState(()=>storage.getInterpretations()),[combos,setCombos]=useState(()=>storage.getCombinationHistory()),[readings,setReadings]=useState(()=>storage.getReadings()),[study,setStudy]=useState(()=>storage.getStudy()),[prefs,setPrefs]=useState(()=>storage.getPreferences()),[ritual,setRitual]=useState(true),[toast,setToast]=useState('')
  const flash=t=>{setToast(t);setTimeout(()=>setToast(''),1800)}
  const setMusic=music=>{const p={...prefs,music};setPrefs(p);storage.setPreferences(p)}
  const saveIteration=d=>{const e={id:uid(),createdAt:new Date().toISOString(),...d},n={...interpretations,[selected.id]:[...(interpretations[selected.id]||[]),e]};setInterpretations(n);storage.setInterpretations(n);flash('A NEW LAYER WAS ARCHIVED')}
  const archive=r=>{const n=[r,...readings];setReadings(n);storage.setReadings(n);flash('READING KEPT')}
  const reload=()=>{setInterpretations(storage.getInterpretations());setCombos(storage.getCombinationHistory());setReadings(storage.getReadings());setStudy(storage.getStudy());flash('THE NOTEBOOK RETURNED')}
  const toggleMusic=async()=>{const n=!prefs.music;setMusic(n);n?await startAmbient():stopAmbient()}
  return <div className="app-shell"><header className="app-header"><button className="brand" onClick={()=>setRitual(true)}>❦ <span><b>SOFT ARCANA</b><small>a private card notebook</small></span></button><MusicButton on={prefs.music} onToggle={toggleMusic}/></header>{tab==='draw'&&<DrawView interpretations={interpretations} combos={combos} setCombos={setCombos} onCard={setSelected} onArchive={archive}/>} {tab==='study'&&<StudyView interpretations={interpretations} study={study} setStudy={setStudy} onCard={setSelected}/>} {tab==='cards'&&<CardsView interpretations={interpretations} onCard={setSelected}/>} {tab==='memory'&&<MemoryView interpretations={interpretations} combos={combos} readings={readings} study={study} onDelete={id=>{const n=readings.filter(r=>r.id!==id);setReadings(n);storage.setReadings(n)}} onImport={reload}/>}<nav className="bottom-nav"><button className={tab==='draw'?'active':''} onClick={()=>setTab('draw')}>☽<b>draw</b></button><button className={tab==='study'?'active':''} onClick={()=>setTab('study')}>✽<b>learn</b></button><button className={tab==='cards'?'active':''} onClick={()=>setTab('cards')}>❧<b>cards</b></button><button className={tab==='memory'?'active':''} onClick={()=>setTab('memory')}>⌂<b>memory</b></button></nav>{selected&&<CardModal card={selected} history={interpretations[selected.id]||[]} onSave={saveIteration} onClose={()=>setSelected(null)}/>} {ritual&&<Threshold music={prefs.music} setMusic={setMusic} onDone={()=>setRitual(false)}/>} {toast&&<div className="toast">{toast}</div>}</div>
}
