import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with LOCAL persistence
// This ensures auth state persists across browser sessions and page refreshes
export const auth = getAuth(app);

// Set persistence to LOCAL (survives browser close and page refresh)
// This is done synchronously before any auth operations
let persistenceReady = false;
export const authReady = setPersistence(auth, browserLocalPersistence)
  .then(() => {
    persistenceReady = true;
    return true;
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
    persistenceReady = true; // Still mark as ready to allow app to function
    return false;
  });

export const isPersistenceReady = () => persistenceReady;

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
export const initAnalytics = async () => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
