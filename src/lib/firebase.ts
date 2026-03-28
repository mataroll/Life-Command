import { initializeApp } from 'firebase/app'
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDVUOqREqQGjXmZgqPQjcTTM6j-yIQLBtQ",
  authDomain: "life-center-985b5.firebaseapp.com",
  projectId: "life-center-985b5",
  storageBucket: "life-center-985b5.firebasestorage.app",
  messagingSenderId: "717007513454",
  appId: "1:717007513454:web:b4c51a3943097fb68d037f",
  measurementId: "G-CYLJWV889M",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Enable offline persistence
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  console.warn('Firestore persistence failed:', err.code)
})

export default app
