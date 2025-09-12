import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBltVLRbb_YMtVjOMQmbHmCMWSaJBDgpzE",
  authDomain: "stage-timer-f54f3.firebaseapp.com",
  projectId: "stage-timer-f54f3",
  storageBucket: "stage-timer-f54f3.firebasestorage.app",
  messagingSenderId: "534417692167",
  appId: "1:534417692167:web:e2713008bfa575493e7ca2",
  measurementId: "G-YJE80XGJG1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;