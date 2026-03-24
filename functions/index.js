const { onSchedule } = require('firebase-functions/v2/scheduler')
const { onDocumentWritten } = require('firebase-functions/v2/firestore')
const admin = require('firebase-admin')
const webpush = require('web-push')

admin.initializeApp()
const db = admin.firestore()

// VAPID keys for web push
const VAPID_PUBLIC_KEY = 'BAKjWMcfMVixCQyusygwsRIZA8dIGeFgnIomu2HoF6idkZvz5hxT7ZA15E_esXmk4zfhU-Jd0cJ2uR8VnTE40zE'
const VAPID_PRIVATE_KEY = 'UpW0bwCJte6eZ1YSsMohmWZTA0Z93llT-aOzocrucAg'

webpush.setVapidDetails(
  'mailto:life-center@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

// Helper: get today's date ID (8am boundary)
function getTodayId() {
  const d = new Date()
  // Shift to Israel time (UTC+2 or UTC+3)
  const israelOffset = 3 // IST (summer)
  d.setHours(d.getUTCHours() + israelOffset)
  if (d.getHours() < 8) d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

// Helper: send push notification
async function sendPushNotification(payload) {
  const subDoc = await db.collection('pushSubscriptions').doc('main').get()
  if (!subDoc.exists) {
    console.log('No push subscription found')
    return
  }

  const sub = subDoc.data()
  const pushSubscription = {
    endpoint: sub.endpoint,
    keys: sub.keys,
  }

  try {
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload))
    console.log('Push sent successfully')
  } catch (err) {
    console.error('Push failed:', err.statusCode, err.body)
    // If subscription expired, clean up
    if (err.statusCode === 410 || err.statusCode === 404) {
      await db.collection('pushSubscriptions').doc('main').delete()
      console.log('Removed expired subscription')
    }
  }
}

// Helper: build status notification payload
async function buildStatusPayload() {
  const todayId = getTodayId()
  const dailyDoc = await db.collection('dailyLogs').doc(todayId).get()

  if (!dailyDoc.exists) {
    return {
      title: 'מרכז הפיקוד',
      body: 'אין משימות להיום עדיין',
    }
  }

  const daily = dailyDoc.data()
  const tasks = daily.tasks || []
  const completed = tasks.filter(t => t.checked).length
  const total = tasks.length
  const checkmarks = '✓'.repeat(completed) + '○'.repeat(total - completed)

  // Get streak from running node
  const runDoc = await db.collection('nodes').doc('run').get()
  const streak = runDoc.exists ? (runDoc.data().streak || 0) : 0

  return {
    title: `משימות היום: ${completed}/${total}`,
    body: `${checkmarks}\nרצף ריצה: ${streak} ימים  |  יומי: ${daily.score || 0}%`,
    url: '/',
  }
}

// === SCHEDULED: Send status update every hour from 8am-10pm Israel time ===
exports.sendHourlyStatus = onSchedule({
  schedule: '0 8-22 * * *',   // Every hour from 8am to 10pm
  timeZone: 'Asia/Jerusalem',
  region: 'europe-west1',
}, async () => {
  const payload = await buildStatusPayload()
  await sendPushNotification(payload)
})

// === TRIGGER: Send update when daily log changes (task checked off) ===
exports.onDailyLogUpdate = onDocumentWritten({
  document: 'dailyLogs/{dateId}',
  region: 'europe-west1',
}, async (event) => {
  // Only send if this is today's log
  const todayId = getTodayId()
  if (event.params.dateId !== todayId) return

  const payload = await buildStatusPayload()
  await sendPushNotification(payload)
})

// === TRIGGER: Morning summary at 8am ===
exports.sendMorningSummary = onSchedule({
  schedule: '0 8 * * *',
  timeZone: 'Asia/Jerusalem',
  region: 'europe-west1',
}, async () => {
  // Get yesterday's final score
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayId = yesterday.toISOString().split('T')[0]
  const yesterdayDoc = await db.collection('dailyLogs').doc(yesterdayId).get()

  let body = 'בוקר טוב! יום חדש מתחיל.'
  if (yesterdayDoc.exists) {
    const score = yesterdayDoc.data().score || 0
    body = `בוקר טוב! אתמול סיימת עם ${score}%. בוא נעשה יותר טוב היום!`
  }

  await sendPushNotification({
    title: 'מרכז הפיקוד — בוקר טוב',
    body,
    url: '/',
  })
})
