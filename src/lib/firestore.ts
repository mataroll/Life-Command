import {
  collection, doc, getDocs, setDoc, onSnapshot,
  query, type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { LifeNode, DailyLog, WeeklyLog, Finance } from './types'

// Collection refs
const nodesCol = collection(db, 'nodes')
const dailyLogsCol = collection(db, 'dailyLogs')
const weeklyLogsCol = collection(db, 'weeklyLogs')
const financeCol = collection(db, 'finance')

// Normalize node data from Firestore (handles both field naming conventions)
function normalizeNode(id: string, data: Record<string, any>): LifeNode {
  return {
    id,
    name: data.name || '',
    type: data.type || 'task',
    status: data.status || 'open',
    dependencies: data.dependencies || data.entryConditions || [],
    rhythm: data.rhythm || 'one-time',
    suggestedTime: data.suggestedTime || undefined,
    progressType: data.progressType || 'checkbox',
    moneyRequired: data.moneyRequired || undefined,
    purchaseLink: data.purchaseLink || undefined,
    priority: data.priority ?? data.order ?? 99,
    streak: data.streak ?? data.currentStreak ?? undefined,
    category: data.category || undefined,
    attachments: data.attachments || undefined,
    createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
  }
}

// === NODES ===
export async function getAllNodes(): Promise<LifeNode[]> {
  const snap = await getDocs(query(nodesCol))
  return snap.docs
    .map(d => normalizeNode(d.id, d.data()))
    .sort((a, b) => a.priority - b.priority)
}

export function onNodesChange(cb: (nodes: LifeNode[]) => void): Unsubscribe {
  return onSnapshot(query(nodesCol), (snap) => {
    const nodes = snap.docs
      .map(d => normalizeNode(d.id, d.data()))
      .sort((a, b) => a.priority - b.priority)
    cb(nodes)
  })
}

export async function setNode(node: LifeNode): Promise<void> {
  const { id, ...data } = node
  await setDoc(doc(nodesCol, id), data)
}

// === DAILY LOGS ===
export function onDailyLogChange(dateId: string, cb: (log: DailyLog | null) => void): Unsubscribe {
  return onSnapshot(doc(dailyLogsCol, dateId), (snap) => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } as DailyLog : null)
  })
}

export async function setDailyLog(log: DailyLog): Promise<void> {
  const { id, ...data } = log
  await setDoc(doc(dailyLogsCol, id), data)
}

// === WEEKLY LOGS ===
export function onWeeklyLogChange(weekId: string, cb: (log: WeeklyLog | null) => void): Unsubscribe {
  return onSnapshot(doc(weeklyLogsCol, weekId), (snap) => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } as WeeklyLog : null)
  })
}

export async function setWeeklyLog(log: WeeklyLog): Promise<void> {
  const { id, ...data } = log
  await setDoc(doc(weeklyLogsCol, id), data)
}

// === FINANCE ===
export function onFinanceChange(cb: (finance: Finance | null) => void): Unsubscribe {
  return onSnapshot(doc(financeCol, 'current'), (snap) => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } as Finance : null)
  })
}

export async function setFinance(finance: Finance): Promise<void> {
  const { id, ...data } = finance
  await setDoc(doc(financeCol, id), data)
}
