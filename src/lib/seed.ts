import { setNode, setDailyLog, setWeeklyLog, setFinance } from './firestore'
import type { LifeNode, DailyLog, WeeklyLog, Finance } from './types'

const now = Date.now()

const nodes: LifeNode[] = [
  // === DAILY TASKS ===
  {
    id: 'run',
    name: 'ריצה',
    type: 'metric',
    status: 'in-progress',
    dependencies: [],
    rhythm: 'daily',
    suggestedTime: '07:00',
    progressType: 'streak',
    priority: 1,
    streak: 3,
    category: 'health',
    createdAt: now,
  },
  {
    id: 'blood-tests',
    name: 'בדיקות דם',
    type: 'task',
    status: 'open',
    dependencies: [],
    rhythm: 'one-time',
    progressType: 'checkbox',
    priority: 2,
    category: 'health',
    createdAt: now,
  },
  {
    id: 'eye-doctor',
    name: 'רופאת עיניים + בדיקת ראייה',
    type: 'task',
    status: 'open',
    dependencies: [],
    rhythm: 'one-time',
    progressType: 'checkbox',
    priority: 3,
    category: 'health',
    createdAt: now,
  },
  {
    id: 'back-doctor',
    name: 'גב - רופא',
    type: 'task',
    status: 'open',
    dependencies: [],
    rhythm: 'one-time',
    progressType: 'checkbox',
    priority: 4,
    category: 'health',
    createdAt: now,
  },
  {
    id: 'dentist',
    name: 'שיננית',
    type: 'task',
    status: 'open',
    dependencies: [],
    rhythm: 'one-time',
    progressType: 'checkbox',
    priority: 5,
    category: 'health',
    createdAt: now,
  },
  {
    id: 'write-poems',
    name: 'לכתוב שירים',
    type: 'task',
    status: 'open',
    dependencies: [],
    rhythm: 'weekly',
    progressType: 'streak',
    priority: 6,
    streak: 0,
    category: 'personal',
    createdAt: now,
  },

  // === GOALS WITH DEPENDENCIES ===
  {
    id: 'learn-swim',
    name: 'ללמוד לשחות',
    type: 'dream',
    status: 'blocked',
    dependencies: [
      { nodeId: 'run', type: 'streak-threshold', threshold: 14 },
      { nodeId: 'talk-dad-swim', type: 'completion' },
    ],
    rhythm: 'one-time',
    progressType: 'checkbox',
    priority: 10,
    category: 'personal',
    createdAt: now,
  },
  {
    id: 'talk-dad-swim',
    name: 'שאבא ילמד אותי לשחות',
    type: 'task',
    status: 'open',
    dependencies: [],
    rhythm: 'one-time',
    progressType: 'checkbox',
    priority: 7,
    category: 'personal',
    createdAt: now,
  },

  // === PURCHASES ===
  {
    id: 'buy-birkenstock',
    name: 'בירקנשטוק',
    type: 'purchase',
    status: 'open',
    dependencies: [],
    rhythm: 'one-time',
    progressType: 'checkbox',
    moneyRequired: 350,
    priority: 20,
    category: 'shopping',
    createdAt: now,
  },
  {
    id: 'buy-cloud-shoes',
    name: 'Cloud On נעליים',
    type: 'purchase',
    status: 'open',
    dependencies: [],
    rhythm: 'one-time',
    progressType: 'checkbox',
    moneyRequired: 740,
    priority: 21,
    category: 'shopping',
    createdAt: now,
  },
  {
    id: 'buy-iphone-chargers',
    name: 'מטענים לאייפון',
    type: 'purchase',
    status: 'open',
    dependencies: [],
    rhythm: 'one-time',
    progressType: 'checkbox',
    moneyRequired: 120,
    priority: 15,
    category: 'shopping',
    createdAt: now,
  },
  {
    id: 'buy-rain-coat',
    name: 'מעיל גשם נייק',
    type: 'purchase',
    status: 'open',
    dependencies: [],
    rhythm: 'one-time',
    progressType: 'checkbox',
    moneyRequired: 400,
    priority: 22,
    category: 'shopping',
    createdAt: now,
  },
  {
    id: 'buy-lego-bugatti',
    name: 'לגו בוגאטי',
    type: 'purchase',
    status: 'blocked',
    dependencies: [
      { nodeId: 'savings', type: 'balance-threshold', threshold: 5000 },
    ],
    rhythm: 'one-time',
    progressType: 'checkbox',
    moneyRequired: 1500,
    priority: 30,
    category: 'shopping',
    createdAt: now,
  },
  {
    id: 'savings',
    name: 'חיסכון',
    type: 'metric',
    status: 'in-progress',
    dependencies: [],
    rhythm: 'daily',
    progressType: 'savings',
    priority: 0,
    category: 'finance',
    createdAt: now,
  },
  {
    id: 'fix-car-scratch',
    name: 'תיקון שריטות ברכב',
    type: 'task',
    status: 'open',
    dependencies: [],
    rhythm: 'one-time',
    progressType: 'checkbox',
    moneyRequired: 500,
    priority: 16,
    category: 'car',
    createdAt: now,
  },
  {
    id: 'car-alignment',
    name: 'כיוון פרונט + צמיגים + נוזל קירור',
    type: 'task',
    status: 'open',
    dependencies: [],
    rhythm: 'one-time',
    progressType: 'checkbox',
    priority: 8,
    category: 'car',
    createdAt: now,
  },
]

// Today's date for daily log
function getTodayId(): string {
  const d = new Date()
  // 8am boundary: if before 8am, it's still "yesterday"
  if (d.getHours() < 8) d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function getWeekId(): string {
  const d = new Date()
  const oneJan = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

function getWeekStart(): string {
  const d = new Date()
  const day = d.getDay() // 0=Sun
  d.setDate(d.getDate() - day)
  return d.toISOString().split('T')[0]
}

const dailyLog: DailyLog = {
  id: getTodayId(),
  date: getTodayId(),
  tasks: [
    { nodeId: 'run', name: 'ריצה', checked: true, checkedAt: now },
    { nodeId: 'blood-tests', name: 'בדיקות דם', checked: false },
    { nodeId: 'eye-doctor', name: 'רופאת עיניים', checked: false },
    { nodeId: 'dentist', name: 'שיננית', checked: false },
    { nodeId: 'car-alignment', name: 'כיוון פרונט', checked: true, checkedAt: now },
    { nodeId: 'write-poems', name: 'לכתוב שירים', checked: false },
  ],
  score: 33, // 2/6
  createdAt: now,
}

const weeklyLog: WeeklyLog = {
  id: getWeekId(),
  weekStart: getWeekStart(),
  weeklyTasks: [
    { nodeId: 'talk-dad-swim', name: 'לדבר עם אבא על שחייה', checked: false },
    { nodeId: 'buy-iphone-chargers', name: 'להזמין מטענים', checked: false },
    { nodeId: 'back-doctor', name: 'לקבוע תור לגב', checked: true, checkedAt: now },
  ],
  dailyScores: [
    { date: getWeekStart(), score: 50 },
  ],
  score: 33,
  createdAt: now,
}

const finance: Finance = {
  id: 'current',
  balance: 3200,
  safetyBuffer: 1500,
  lastUpdated: now,
}

export async function seedAll() {
  console.log('Seeding nodes...')
  for (const node of nodes) {
    await setNode(node)
  }
  console.log(`Seeded ${nodes.length} nodes`)

  console.log('Seeding daily log...')
  await setDailyLog(dailyLog)

  console.log('Seeding weekly log...')
  await setWeeklyLog(weeklyLog)

  console.log('Seeding finance...')
  await setFinance(finance)

  console.log('Seed complete!')
}
