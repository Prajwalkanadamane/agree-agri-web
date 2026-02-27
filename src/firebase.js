import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // <-- 1. ADD THIS IMPORT

const firebaseConfig = {
  apiKey: "AIzaSyDP5UzJkbqLwvXO8cx6OInUUkJL6I_mRg8",
  authDomain: "agree-agri-d0af2.firebaseapp.com",
  projectId: "agree-agri-d0af2",
  storageBucket: "agree-agri-d0af2.firebasestorage.app",
  messagingSenderId: "988522029512",
  appId: "1:988522029512:web:29b565c0925897f8ab60fd",
  measurementId: "G-5YX9SN51F6"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // <-- 2. ADD THIS EXPORT