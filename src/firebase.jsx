import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAps6Ad9zbgAYtO1fNlsSoyht3sN4HlmUg",
  authDomain: "martico-6878c.firebaseapp.com",
  projectId: "martico-6878c",
  storageBucket: "martico-6878c.firebasestorage.app",
  messagingSenderId: "129872618555",
  appId: "1:129872618555:web:7ecfa2153ed9ef0607e81e",
  measurementId: "G-BHJ08NH2RS"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
