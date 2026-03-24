import { useState, useEffect } from 'react'
import ActivityRings from '../components/ActivityRings'
import { onDailyLogChange, onWeeklyLogChange, setDailyLog } from '../lib/firestore'
import { registerPushSubscription, sendLocalStatusNotification, getPushStatus } from '../lib/push'
import type { DailyLog, WeeklyLog } from '../lib/types'

type NotifStatus = 'idle' | 'granted' | 'denied' | 'unsupported' | 'not-standalone' | 'loading'

function getTodayId(): string {
  const d = new Date()
  if (d.getHours() < 8) d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function getWeekId(): string {
  const d = new Date()
  const oneJan = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

export default function Home() {
  const [dailyLog, setDailyLogState] = useState<DailyLog | null>(null)
  const [weeklyLog, setWeeklyLogState] = useState<WeeklyLog | null>(null)
  const [notifStatus, setNotifStatus] = useState<NotifStatus>('idle')

  useEffect(() => {
    const unsub1 = onDailyLogChange(getTodayId(), setDailyLogState)
    const unsub2 = onWeeklyLogChange(getWeekId(), setWeeklyLogState)

    // Check existing notification permission
    getPushStatus().then(s => {
      if (s === 'granted') setNotifStatus('granted')
    })

    return () => { unsub1(); unsub2() }
  }, [])

  const completed = dailyLog?.tasks.filter(t => t.checked).length ?? 0
  const total = dailyLog?.tasks.length ?? 0
  const dailyPercent = total > 0 ? Math.round((completed / total) * 100) : 0
  const weeklyPercent = weeklyLog?.score ?? 0

  async function handleCheckTask(index: number) {
    if (!dailyLog) return
    const updated = { ...dailyLog, tasks: [...dailyLog.tasks] }
    updated.tasks[index] = {
      ...updated.tasks[index],
      checked: !updated.tasks[index].checked,
      checkedAt: !updated.tasks[index].checked ? Date.now() : undefined,
    }
    const newCompleted = updated.tasks.filter(t => t.checked).length
    updated.score = Math.round((newCompleted / updated.tasks.length) * 100)
    await setDailyLog(updated)

    // Update the "live activity" notification
    if (Notification.permission === 'granted') {
      sendLocalStatusNotification(newCompleted, updated.tasks.length, 3, weeklyPercent)
    }
  }

  async function handleEnableNotifications() {
    setNotifStatus('loading')
    const result = await registerPushSubscription()
    setNotifStatus(result)
  }

  return (
    <div className="page">
      <h2 className="page-title">שלום!</h2>
      <p className="page-subtitle">הנה הסיכום שלך להיום</p>

      <div className="home-rings">
        <ActivityRings daily={dailyPercent} weekly={weeklyPercent} size={220} />
      </div>

      <div className="ring-labels">
        <div className="ring-label">
          <span className="ring-dot daily" />
          יומי — {dailyPercent}%
        </div>
        <div className="ring-label">
          <span className="ring-dot weekly" />
          שבועי — {weeklyPercent}%
        </div>
      </div>

      {/* Task checklist */}
      {dailyLog && (
        <div className="task-list">
          <h3 className="section-title">משימות היום</h3>
          {dailyLog.tasks.map((task, i) => (
            <button
              key={task.nodeId}
              className={`task-item ${task.checked ? 'checked' : ''}`}
              onClick={() => handleCheckTask(i)}
            >
              <span className="task-check">{task.checked ? '✓' : '○'}</span>
              <span className="task-name">{task.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Weekly tasks */}
      {weeklyLog && (
        <div className="task-list" style={{ marginTop: 24 }}>
          <h3 className="section-title">משימות שבועיות</h3>
          {weeklyLog.weeklyTasks.map((task) => (
            <div key={task.nodeId} className={`task-item ${task.checked ? 'checked' : ''}`}>
              <span className="task-check">{task.checked ? '✓' : '○'}</span>
              <span className="task-name">{task.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Notification button */}
      <div className="notif-section">
        {notifStatus !== 'granted' ? (
          <button
            className="notif-btn"
            onClick={handleEnableNotifications}
            disabled={notifStatus === 'loading'}
          >
            {notifStatus === 'loading' ? 'מפעיל...' : 'הפעל התראות חיות'}
          </button>
        ) : (
          <p className="notif-msg success">התראות חיות פעילות</p>
        )}
        {notifStatus === 'denied' && (
          <p className="notif-msg error">ההרשאה נדחתה. שנה בהגדרות.</p>
        )}
        {notifStatus === 'unsupported' && (
          <p className="notif-msg error">הדפדפן לא תומך בהתראות.</p>
        )}
        {notifStatus === 'not-standalone' && (
          <p className="notif-msg error">יש להוסיף למסך הבית קודם! Share → Add to Home Screen</p>
        )}
      </div>
    </div>
  )
}
