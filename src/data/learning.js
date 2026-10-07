export const SUIT_LESSONS = {
  Major: {
    domain: 'archetype, life chapter, inner development',
    lesson: 'Major Arcana cards tend to point toward larger patterns, thresholds, and lessons rather than a small passing detail.',
  },
  Wands: {
    domain: 'energy, will, creativity, action',
    lesson: 'Wands are fire: desire, initiative, ambition, movement, creative force, and what happens when energy has too much or too little direction.',
  },
  Cups: {
    domain: 'emotion, intuition, relationships, imagination',
    lesson: 'Cups are water: feeling, connection, memory, intimacy, fantasy, and the inner world. They ask what is being felt and what is being received.',
  },
  Swords: {
    domain: 'thought, truth, conflict, communication',
    lesson: 'Swords are air: intellect, language, decisions, tension, clarity, and the double edge of thought. They often reveal what the mind is doing to a situation.',
  },
  Pentacles: {
    domain: 'body, material life, work, stability',
    lesson: 'Pentacles are earth: resources, health, work, home, money, craft, patience, and whatever must become real enough to touch.',
  },
}

const NUMBER_LESSONS = {
  1: 'Aces are seeds: the raw potential of the suit before it has taken a stable form.',
  2: 'Twos introduce polarity, choice, balance, pairing, or the need to hold two forces at once.',
  3: 'Threes develop the idea through growth, collaboration, expression, or the first visible result.',
  4: 'Fours stabilize. They can mean structure and safety, or the point where stability becomes stuckness.',
  5: 'Fives disturb the structure. They often bring friction, loss, challenge, change, or instability.',
  6: 'Sixes move toward adjustment, exchange, recovery, harmony, or a new equilibrium after disruption.',
  7: 'Sevens test commitment. They often involve assessment, defense, strategy, temptation, or choosing a direction.',
  8: 'Eights intensify movement and mastery: repetition, speed, constraint, skill, or momentum.',
  9: 'Nines approach completion and often show maturity, independence, endurance, or the cost of getting this far.',
  10: 'Tens complete and overflow the suit: fulfillment, culmination, excess, legacy, burden, or the end of a cycle.',
}

const COURT_LESSONS = {
  Page: 'Pages are students and messengers. Read them as curiosity, a new relationship with the suit, or news arriving through its element.',
  Knight: 'Knights put the suit into motion. They show pursuit, style of action, and what happens when the suit becomes a mission.',
  Queen: 'Queens internalize and embody the suit. They show mature relationship, stewardship, and an inward command of its element.',
  King: 'Kings direct and externalize the suit. They show mastery, authority, responsibility, and the way the element is expressed into the world.',
}

export function learningFor(card) {
  const suit = SUIT_LESSONS[card.suit] || SUIT_LESSONS.Major
  const court = Object.keys(COURT_LESSONS).find((rank) => card.name.startsWith(rank))
  const numberLesson = card.suit === 'Major' ? '' : (court ? COURT_LESSONS[court] : NUMBER_LESSONS[card.number] || '')
  const anchor = card.suit === 'Major'
    ? `Treat ${card.name} as an archetypal scene. First notice the emotional weather, then connect it to the traditional keywords.`
    : `Start with ${card.suit.toLowerCase()} as ${suit.domain}, then let the number or court rank narrow the meaning.`

  return { ...suit, numberLesson, anchor }
}

export const SOURCE_NOTE = 'Traditional reference is Rider–Waite–Smith-based and informed by Labyrinthos card keywords and suit structure.'
