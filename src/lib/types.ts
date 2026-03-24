// === NODES ===
// Every goal, task, dream, purchase is a node
export type NodeType = 'task' | 'dream' | 'purchase' | 'metric'
export type NodeStatus = 'blocked' | 'open' | 'in-progress' | 'done'
export type ProgressType = 'checkbox' | 'streak' | 'savings'
export type Rhythm = 'daily' | 'weekly' | 'one-time'

export interface DependencyCondition {
  nodeId: string
  type: 'completion' | 'streak-threshold' | 'balance-threshold'
  threshold?: number  // e.g. streak >= 7, balance >= 5000
}

export interface LifeNode {
  id: string
  name: string
  type: NodeType
  status: NodeStatus
  dependencies: DependencyCondition[]
  rhythm: Rhythm
  suggestedTime?: string        // e.g. "07:00", "20:00"
  progressType: ProgressType
  moneyRequired?: number        // in ₪
  purchaseLink?: string
  priority: number              // lower = higher priority
  streak?: number               // current streak count
  category?: string             // e.g. "health", "finance", "home"
  createdAt: number             // timestamp
}

// === DAILY LOGS ===
// One per day (8am-8am boundary)
export interface DailyTask {
  nodeId: string
  name: string
  checked: boolean
  checkedAt?: number
}

export interface DailyLog {
  id: string           // format: "2026-03-24"
  date: string         // same as id
  tasks: DailyTask[]
  score: number        // percentage 0-100
  createdAt: number
}

// === WEEKLY LOGS ===
export interface WeeklyLog {
  id: string           // format: "2026-W13"
  weekStart: string    // "2026-03-23" (Sunday)
  weeklyTasks: DailyTask[]
  dailyScores: { date: string; score: number }[]
  score: number        // weekly percentage
  createdAt: number
}

// === FINANCE ===
export interface Finance {
  id: string            // "current"
  balance: number       // current balance in ₪
  safetyBuffer: number  // minimum to keep
  lastUpdated: number
}
