import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "key",
  authDomain: "naem",
  projectId: "name",
  storageBucket: "name",
  messagingSenderId: "naem",
  appId: "AppID",
  measurementId: "G-ID"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Set persistence to session (tab-specific)
setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default app;