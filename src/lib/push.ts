import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'

const VAPID_PUBLIC_KEY = 'BAKjWMcfMVixCQyusygwsRIZA8dIGeFgnIomu2HoF6idkZvz5hxT7ZA15E_esXmk4zfhU-Jd0cJ2uR8VnTE40zE'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function registerPushSubscription(): Promise<'granted' | 'denied' | 'unsupported' | 'not-standalone'> {
  // Must be standalone (added to home screen) on iOS
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true

  if (!isStandalone) {
    return 'not-standalone'
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return 'unsupported'
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return 'denied'
  }

  // Register push service worker
  const registration = await navigator.serviceWorker.register('/push-sw.js')
  await navigator.serviceWorker.ready

  // Subscribe to push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })

  // Store subscription in Firestore so Cloud Function can use it
  const subJson = subscription.toJSON()
  await setDoc(doc(db, 'pushSubscriptions', 'main'), {
    endpoint: subJson.endpoint,
    keys: subJson.keys,
    createdAt: Date.now(),
  })

  // Send immediate test notification
  registration.showNotification('מרכז הפיקוד', {
    body: 'ההתראות הופעלו! תקבל עדכוני סטטוס על המשימות שלך.',
    icon: '/icons/icon-192.svg',
    dir: 'rtl',
    lang: 'he',
    tag: 'life-center-status',
  })

  return 'granted'
}

export async function unregisterPush(): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration('/push-sw.js')
  if (registration) {
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
    }
  }
  await deleteDoc(doc(db, 'pushSubscriptions', 'main'))
}

export async function getPushStatus(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission as 'granted' | 'denied' | 'default'
}

// Send a local "live activity" style notification (for when app is open)
export async function sendLocalStatusNotification(
  completed: number,
  total: number,
  streak: number,
  weeklyPercent: number,
): Promise<void> {
  const reg = await navigator.serviceWorker.ready

  const checkmarks = '✓'.repeat(completed) + '○'.repeat(total - completed)

  reg.showNotification('מרכז הפיקוד', {
    body: `משימות היום: ${checkmarks}  (${completed}/${total})\nרצף: ${streak} ימים  |  שבועי: ${weeklyPercent}%`,
    icon: '/icons/icon-192.svg',
    dir: 'rtl',
    lang: 'he',
    tag: 'life-center-status', // replaces previous
    renotify: false,           // silent replace
    silent: true,
  } as NotificationOptions)
}
